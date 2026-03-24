import { patientStore, doctorStore } from "../store/index.js";
import { auditService, AuditEvents } from "./auditService.js";
import { Errors } from "../utils/AppError.js";

const assignmentLock = new Set();

export const queueService = {
  registerPatient: async (data, logger) => {
    const patient = await patientStore.create({
      name: data.name,
      age: data.age,
      complaint: data.complaint,
      severity: data.severity,
      status: "waiting",
      checked_in: false,
    });

    const queue = await patientStore.getWaiting();

    logger.info(
      {
        patientId: patient.id,
        severity: patient.severity,
        queueLength: queue.length,
      },
      "Patient registered",
    );

    await auditService.log(AuditEvents.PATIENT_REGISTERED, {
      patientId: patient.id,
      metadata: { name: patient.name, severity: patient.severity },
      logger,
    });

    return {
      ...patient,
      estimatedWaitMinutes: _estimateWait(patient.severity, queue.length),
    };
  },

  checkin: async (patientId, logger) => {
    const patient = await patientStore.findById(patientId);
    if (!patient) throw Errors.notFound("Patient");

    if (patient.checked_in) {
      logger.warn(
        { patientId },
        "Duplicate check-in attempt — returning existing record",
      );

      await auditService.log(AuditEvents.PATIENT_DUPLICATE_CHECKIN, {
        patientId,
        metadata: { checkedInAt: patient.checked_in_at },
        logger,
      });

      return { patient, duplicate: true };
    }

    const updated = await patientStore.update(patientId, {
      checked_in: true,
      checked_in_at: new Date(),
    });

    const queue = await patientStore.getWaiting();
    logger.info({ patientId, queueLength: queue.length }, "Patient checked in");

    await auditService.log(AuditEvents.PATIENT_CHECKED_IN, {
      patientId,
      metadata: { severity: patient.severity },
      logger,
    });

    return { patient: updated, duplicate: false };
  },

  dequeueNext: async (logger) => {
    const queue = await patientStore.getWaiting();

    if (queue.length === 0) {
      logger.warn("Dequeue called on empty queue");
      throw Errors.serviceUnavailable("Queue is currently empty");
    }

    const next = queue[0];

    if (assignmentLock.has(next.id)) {
      logger.warn(
        { patientId: next.id },
        "Patient mid-assignment — queue contention detected",
      );
      throw Errors.conflict(
        "Patient is currently being assigned, try again shortly",
      );
    }

    assignmentLock.add(next.id);

    try {
      const updated = await patientStore.update(next.id, {
        status: "assigned",
      });
      logger.debug(
        { patientId: next.id, queueLength: queue.length - 1 },
        "Patient dequeued",
      );
      return updated;
    } finally {
      assignmentLock.delete(next.id);
    }
  },

  assignToDoctor: async (doctorId, logger) => {
    const doctor = await doctorStore.findById(doctorId);
    if (!doctor) throw Errors.notFound("Doctor");

    const queue = await patientStore.getWaiting();
    if (queue.length === 0) {
      logger.info({ doctorId }, "Doctor available but queue is empty");
      await auditService.log(AuditEvents.QUEUE_EMPTY, { doctorId, logger });
      return null;
    }

    const next = queue[0];

    if (assignmentLock.has(next.id)) {
      logger.warn(
        { patientId: next.id, doctorId },
        "Assignment lock active — skipping",
      );
      return null;
    }

    assignmentLock.add(next.id);

    try {
      const [updatedPatient] = await Promise.all([
        patientStore.update(next.id, {
          status: "assigned",
          assigned_doctor_id: doctorId,
          assigned_at: new Date(),
        }),
        doctorStore.update(doctorId, { current_patient_id: next.id }),
      ]);

      const remainingQueue = await patientStore.getWaiting();
      logger.info(
        { doctorId, patientId: next.id, queueLength: remainingQueue.length },
        "Patient assigned to doctor",
      );

      await auditService.log(AuditEvents.PATIENT_ASSIGNED, {
        patientId: next.id,
        doctorId,
        metadata: {
          patientName: next.name,
          doctorName: doctor.name,
          severity: next.severity,
          remainingQueue: remainingQueue.length,
        },
        logger,
      });

      return updatedPatient;
    } finally {
      assignmentLock.delete(next.id);
    }
  },

  floodTest: async (logger) => {
    const patients = Array.from({ length: 50 }, (_, i) => ({
      name: `Flood Patient ${i + 1}`,
      age: 20 + (i % 50),
      complaint: `Flood test complaint ${i + 1}`,
      severity: (i % 5) + 1,
    }));

    logger.warn({ count: patients.length }, "Flood test initiated");

    const results = await Promise.all(
      patients.map((p) =>
        patientStore.create({ ...p, status: "waiting", checked_in: true }),
      ),
    );

    const queue = await patientStore.getWaiting();

    logger.info(
      { queued: results.length, queueLength: queue.length },
      "Flood test complete",
    );

    await auditService.log(AuditEvents.QUEUE_FLOOD, {
      metadata: { seeded: results.length, queueLength: queue.length },
      logger,
    });

    return results;
  },
};

function _estimateWait(severity, queueLength) {
  const baseMinutesPerPerson = [0, 5, 8, 12, 16, 20];
  const base = baseMinutesPerPerson[severity] ?? 10;
  return Math.round(base + queueLength * 5);
}

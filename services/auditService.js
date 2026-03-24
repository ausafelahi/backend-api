import { auditStore } from "../store/index.js";

export const AuditEvents = {
  PATIENT_REGISTERED: "patient.registered",
  PATIENT_CHECKED_IN: "patient.checked_in",
  PATIENT_ASSIGNED: "patient.assigned",
  PATIENT_DUPLICATE_CHECKIN: "patient.duplicate_checkin",
  DOCTOR_AVAILABLE: "doctor.available",
  DOCTOR_UNAVAILABLE: "doctor.unavailable",
  QUEUE_EMPTY: "queue.empty",
  QUEUE_FLOOD: "queue.flood",
};

export const auditService = {
  log: async (
    event,
    { patientId = null, doctorId = null, metadata = {}, logger } = {},
  ) => {
    try {
      const entry = await auditStore.log(event, patientId, doctorId, metadata);
      logger?.debug(
        { auditEvent: event, patientId, doctorId },
        "Audit event recorded",
      );
      return entry;
    } catch (err) {
      logger?.error({ err, event }, "Failed to write audit log — continuing");
    }
  },

  getAll: async ({ limit, offset } = {}) => {
    return auditStore.getAll({ limit, offset });
  },

  getByPatient: async (patientId) => {
    return auditStore.getByPatient(patientId);
  },
};

import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockPatients = new Map();
const mockLog = {
  info: () => {},
  warn: () => {},
  debug: () => {},
  error: () => {},
};

jest.unstable_mockModule("../store/index.js", () => ({
  patientStore: {
    create: async (p) => {
      const patient = { id: crypto.randomUUID(), ...p, created_at: new Date() };
      mockPatients.set(patient.id, patient);
      return patient;
    },
    findById: async (id) => mockPatients.get(id) ?? null,
    update: async (id, fields) => {
      const existing = mockPatients.get(id);
      if (!existing) return null;
      const updated = { ...existing, ...fields };
      mockPatients.set(id, updated);
      return updated;
    },
    getWaiting: async () =>
      [...mockPatients.values()]
        .filter((p) => p.status === "waiting" && p.checked_in === true)
        .sort((a, b) => a.severity - b.severity || a.created_at - b.created_at),
  },
  doctorStore: {
    findById: async () => ({ id: "doc-1", name: "Dr. Test" }),
    update: async () => {},
  },
  auditStore: {
    log: async () => {},
  },
}));

jest.unstable_mockModule("../src/services/auditService.js", () => ({
  auditService: { log: async () => {} },
  AuditEvents: {
    PATIENT_REGISTERED: "patient.registered",
    PATIENT_CHECKED_IN: "patient.checked_in",
    PATIENT_ASSIGNED: "patient.assigned",
    PATIENT_DUPLICATE_CHECKIN: "patient.duplicate_checkin",
    DOCTOR_AVAILABLE: "doctor.available",
    QUEUE_EMPTY: "queue.empty",
    QUEUE_FLOOD: "queue.flood",
  },
}));

const { queueService } = await import("../services/queueService.js");

describe("queueService", () => {
  beforeEach(() => mockPatients.clear());

  describe("registerPatient", () => {
    it("creates a patient and returns estimated wait time", async () => {
      const result = await queueService.registerPatient(
        { name: "Ali", age: 30, complaint: "chest pain", severity: 1 },
        mockLog,
      );

      expect(result.id).toBeDefined();
      expect(result.severity).toBe(1);
      expect(result.estimatedWaitMinutes).toBeDefined();
      expect(typeof result.estimatedWaitMinutes).toBe("number");
    });

    it('assigns status "waiting" and checked_in false by default', async () => {
      const result = await queueService.registerPatient(
        { name: "Bilal", age: 22, complaint: "headache", severity: 4 },
        mockLog,
      );

      expect(result.status).toBe("waiting");
      expect(result.checked_in).toBe(false);
    });
  });

  describe("checkin", () => {
    it("marks patient as checked in", async () => {
      const patient = await queueService.registerPatient(
        { name: "Sara", age: 25, complaint: "fever", severity: 3 },
        mockLog,
      );

      const { patient: updated, duplicate } = await queueService.checkin(
        patient.id,
        mockLog,
      );
      expect(updated.checked_in).toBe(true);
      expect(duplicate).toBe(false);
    });

    it("returns duplicate:true on second check-in without throwing", async () => {
      const patient = await queueService.registerPatient(
        { name: "Omar", age: 40, complaint: "back pain", severity: 3 },
        mockLog,
      );

      await queueService.checkin(patient.id, mockLog);
      const { duplicate } = await queueService.checkin(patient.id, mockLog);
      expect(duplicate).toBe(true);
    });

    it("throws 404 for unknown patient ID", async () => {
      await expect(
        queueService.checkin("00000000-0000-0000-0000-000000000000", mockLog),
      ).rejects.toMatchObject({ statusCode: 404, code: "NOT_FOUND" });
    });
  });

  describe("dequeueNext - priority ordering", () => {
    const seed = async (severity, name = `Patient-${severity}`) => {
      const p = await queueService.registerPatient(
        { name, age: 30, complaint: "test", severity },
        mockLog,
      );
      await queueService.checkin(p.id, mockLog);
      return p;
    };

    it("dequeues severity 1 before severity 3", async () => {
      await seed(3, "Low Priority");
      await seed(1, "Critical");

      const next = await queueService.dequeueNext(mockLog);
      expect(next.name).toBe("Critical");
    });

    it("breaks ties by FIFO (earliest created_at first)", async () => {
      const first = await seed(2, "First");
      await seed(2, "Second");

      const next = await queueService.dequeueNext(mockLog);
      expect(next.id).toBe(first.id);
    });

    it("throws 503 when queue is empty", async () => {
      await expect(queueService.dequeueNext(mockLog)).rejects.toMatchObject({
        statusCode: 503,
        code: "SERVICE_UNAVAILABLE",
      });
    });

    it('dequeued patient status changes to "assigned"', async () => {
      await seed(2, "Test Patient");
      const next = await queueService.dequeueNext(mockLog);
      expect(next.status).toBe("assigned");
    });
  });

  describe("floodTest", () => {
    it("registers 50 patients concurrently", async () => {
      const results = await queueService.floodTest(mockLog);
      expect(results).toHaveLength(50);
    });

    it("queue is ordered correctly after flood", async () => {
      await queueService.floodTest(mockLog);
      const queue = await (
        await import("../src/store/index.js")
      ).patientStore.getWaiting();

      for (let i = 1; i < queue.length; i++) {
        expect(queue[i].severity).toBeGreaterThanOrEqual(queue[i - 1].severity);
      }
    });
  });
});

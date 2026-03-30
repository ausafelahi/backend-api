import db from "../db/knex.js";

export const patientStore = {
  create: async (patient) => {
    const [row] = await db("patients").insert(patient).returning("*");
    return row;
  },
  findById: async (id) => db("patients").where({ id }).first(),
  update: async (id, fields) => {
    const [row] = await db("patients")
      .where({ id })
      .update(fields)
      .returning("*");
    return row;
  },
  getWaiting: async () =>
    db("patients")
      .where({ status: "waiting" })
      .orderBy("severity", "asc")
      .orderBy("created_at", "asc"),
  getAll: async () => db("patients").orderBy("created_at", "desc"),
};

export const doctorStore = {
  findById: async (id) => db("doctors").where({ id }).first(),
  findByEmail: async (email) => db("doctors").where({ email }).first(),
  create: async (doctor) => {
    const [row] = await db("doctors").insert(doctor).returning("*");
    return row;
  },
  update: async (id, fields) => {
    const [row] = await db("doctors")
      .where({ id })
      .update(fields)
      .returning("*");
    return row;
  },
  getAvailable: async () =>
    db("doctors").where({ available: true, current_patient_id: null }),
};

export const registrationStore = {
  findByNumber: async (registrationNumber) =>
    db("registration_numbers")
      .where({ registration_number: registrationNumber })
      .first(),
  markUsed: async (registrationNumber, doctorId) =>
    db("registration_numbers")
      .where({ registration_number: registrationNumber })
      .update({ used: true, used_by: doctorId, used_at: new Date() }),
};

export const auditStore = {
  log: async (event, patientId, doctorId, metadata = {}) => {
    const [row] = await db("audit_log")
      .insert({ event, patient_id: patientId, doctor_id: doctorId, metadata })
      .returning("*");
    return row;
  },
  getAll: async ({ limit = 100, offset = 0 } = {}) =>
    db("audit_log").orderBy("created_at", "desc").limit(limit).offset(offset),
  getByPatient: async (patientId) =>
    db("audit_log")
      .where({ patient_id: patientId })
      .orderBy("created_at", "asc"),
};

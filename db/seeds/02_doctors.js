import bcrypt from "bcryptjs";

export const seed = async (knex) => {
  await knex("doctors").del();

  const passwordHash = await bcrypt.hash("password123", 12);

  await knex("doctors").insert([
    {
      name: "Dr. Sara Ahmed",
      specialization: "Emergency",
      email: "sara.ahmed@mediqueue.com",
      password_hash: passwordHash,
      registration_number: "PMDC-2024-001",
      available: true,
    },
    {
      name: "Dr. Omar Farooq",
      specialization: "General",
      email: "omar.farooq@mediqueue.com",
      password_hash: passwordHash,
      registration_number: "PMDC-2024-002",
      available: false,
    },
    {
      name: "Dr. Aisha Khan",
      specialization: "Cardiology",
      email: "aisha.khan@mediqueue.com",
      password_hash: passwordHash,
      registration_number: "PMDC-2024-003",
      available: true,
    },
  ]);

  await knex("registration_numbers")
    .whereIn("registration_number", [
      "PMDC-2024-001",
      "PMDC-2024-002",
      "PMDC-2024-003",
    ])
    .update({ used: true, used_at: new Date() });
};

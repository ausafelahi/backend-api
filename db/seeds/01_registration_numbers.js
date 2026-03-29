export const seed = async (knex) => {
  await knex("registration_numbers").del();

  await knex("registration_numbers").insert([
    { registration_number: "PMDC-2024-001", body: "PMDC" },
    { registration_number: "PMDC-2024-002", body: "PMDC" },
    { registration_number: "PMDC-2024-003", body: "PMDC" },
    { registration_number: "PMDC-2023-441", body: "PMDC" },
    { registration_number: "PMDC-2023-882", body: "PMDC" },
    { registration_number: "PMDC-2022-119", body: "PMDC" },
    { registration_number: "PMDC-2022-330", body: "PMDC" },
    { registration_number: "PMDC-2021-774", body: "PMDC" },
  ]);
};

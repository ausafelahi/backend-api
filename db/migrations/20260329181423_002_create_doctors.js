export const up = (knex) =>
  knex.schema.createTable("doctors", (t) => {
    t.uuid("id").primary().defaultTo(knex.fn.uuid());
    t.string("name").notNullable();
    t.string("specialization").notNullable();
    t.string("email").notNullable().unique();
    t.string("password_hash").notNullable();
    t.string("registration_number").notNullable().unique();
    t.boolean("available").notNullable().defaultTo(false);
    t.uuid("current_patient_id").nullable();
    t.timestamps(true, true);
  });

export const down = (knex) => knex.schema.dropTable("doctors");

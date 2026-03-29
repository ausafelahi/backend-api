export const up = (knex) =>
  knex.schema.createTable("patients", (t) => {
    t.uuid("id").primary().defaultTo(knex.fn.uuid());
    t.string("name").notNullable();
    t.integer("age").notNullable();
    t.string("complaint").notNullable();
    t.integer("severity").notNullable().checkBetween([1, 5]);
    t.string("status").notNullable().defaultTo("waiting");
    t.boolean("checked_in").notNullable().defaultTo(false);
    t.timestamp("checked_in_at").nullable();
    t.uuid("assigned_doctor_id").nullable();
    t.timestamp("assigned_at").nullable();
    t.timestamps(true, true);
  });

export const down = (knex) => knex.schema.dropTable("patients");

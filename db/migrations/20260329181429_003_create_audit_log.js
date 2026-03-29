export const up = (knex) =>
  knex.schema.createTable("audit_log", (t) => {
    t.uuid("id").primary().defaultTo(knex.fn.uuid());
    t.string("event").notNullable();
    t.uuid("patient_id").nullable();
    t.uuid("doctor_id").nullable();
    t.jsonb("metadata").defaultTo("{}");
    t.timestamp("created_at").defaultTo(knex.fn.now());
  });

export const down = (knex) => knex.schema.dropTable("audit_log");

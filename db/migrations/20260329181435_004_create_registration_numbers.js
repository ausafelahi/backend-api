export const up = (knex) =>
  knex.schema.createTable("registration_numbers", (t) => {
    t.uuid("id").primary().defaultTo(knex.fn.uuid());
    t.string("registration_number").notNullable().unique();
    t.string("body").notNullable().defaultTo("PMDC");
    t.boolean("used").notNullable().defaultTo(false);
    t.uuid("used_by").nullable();
    t.timestamp("used_at").nullable();
    t.timestamps(true, true);
  });

export const down = (knex) => knex.schema.dropTable("registration_numbers");

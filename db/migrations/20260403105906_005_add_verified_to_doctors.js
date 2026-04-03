export const up = (knex) =>
  knex.schema.alterTable("doctors", (t) => {
    t.boolean("verified").notNullable().defaultTo(false);
    t.timestamp("verified_at").nullable();
  });

export const down = (knex) =>
  knex.schema.alterTable("doctors", (t) => {
    t.dropColumn("verified");
    t.dropColumn("verified_at");
  });

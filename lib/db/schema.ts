import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const bereichEnum = pgEnum("bereich", [
  "allgemein",
  "steuerberatung",
  "recht",
  "sanierung-insolvenz",
  "unternehmensberatung",
]);

export const textbausteine = pgTable("textbausteine", {
  id: uuid("id").primaryKey().defaultRandom(),
  titel: text("titel").notNull(),
  inhalt: text("inhalt").notNull(),
  bereich: bereichEnum("bereich").notNull().default("allgemein"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});

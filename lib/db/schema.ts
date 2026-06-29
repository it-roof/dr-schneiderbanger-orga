import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
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

export const roleEnum = pgEnum("user_role", ["admin", "mitarbeiter"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("mitarbeiter"),
  bereich: bereichEnum("bereich"),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compositePk: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

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

export const authLoginAttempts = pgTable("auth_login_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type UserRole = (typeof roleEnum.enumValues)[number];

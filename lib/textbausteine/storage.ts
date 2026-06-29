import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { textbausteine } from "@/lib/db/schema";

import type { Textbaustein, TextbausteinInput } from "./types";

type TextbausteinRow = typeof textbausteine.$inferSelect;

function toTextbaustein(row: TextbausteinRow): Textbaustein {
  return {
    id: row.id,
    titel: row.titel,
    inhalt: row.inhalt,
    bereich: row.bereich,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getTextbausteine(): Promise<Textbaustein[]> {
  const rows = await db
    .select()
    .from(textbausteine)
    .orderBy(desc(textbausteine.updatedAt));

  return rows.map(toTextbaustein);
}

export async function createTextbausteinRow(
  input: TextbausteinInput
): Promise<Textbaustein> {
  const [row] = await db
    .insert(textbausteine)
    .values({
      titel: input.titel.trim(),
      inhalt: input.inhalt.trim(),
      bereich: input.bereich,
    })
    .returning();

  return toTextbaustein(row);
}

export async function updateTextbausteinRow(
  id: string,
  input: TextbausteinInput
): Promise<Textbaustein | null> {
  const [row] = await db
    .update(textbausteine)
    .set({
      titel: input.titel.trim(),
      inhalt: input.inhalt.trim(),
      bereich: input.bereich,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(textbausteine.id, id))
    .returning();

  return row ? toTextbaustein(row) : null;
}

export async function deleteTextbausteinRow(id: string): Promise<boolean> {
  const deleted = await db
    .delete(textbausteine)
    .where(eq(textbausteine.id, id))
    .returning({ id: textbausteine.id });

  return deleted.length > 0;
}

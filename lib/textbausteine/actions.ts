"use server";

import { revalidatePath } from "next/cache";

import {
  createTextbausteinRow,
  deleteTextbausteinRow,
  updateTextbausteinRow,
} from "./storage";
import { BEREICHE, type Bereich, type TextbausteinInput } from "./types";

function isValidBereich(value: string): value is Bereich {
  return BEREICHE.some((bereich) => bereich.value === value);
}

function validateInput(input: TextbausteinInput): string | null {
  const titel = input.titel.trim();
  const inhalt = input.inhalt.trim();

  if (!titel) return "Bitte einen Titel angeben.";
  if (!inhalt) return "Bitte einen Inhalt angeben.";
  if (!isValidBereich(input.bereich)) return "Bitte einen gültigen Bereich wählen.";

  return null;
}

export async function createTextbaustein(input: TextbausteinInput) {
  const error = validateInput(input);
  if (error) return { success: false as const, error };

  const item = await createTextbausteinRow(input);
  revalidatePath("/textbausteine");

  return { success: true as const, item };
}

export async function updateTextbaustein(id: string, input: TextbausteinInput) {
  const error = validateInput(input);
  if (error) return { success: false as const, error };

  const item = await updateTextbausteinRow(id, input);

  if (!item) {
    return { success: false as const, error: "Textbaustein nicht gefunden." };
  }

  revalidatePath("/textbausteine");

  return { success: true as const, item };
}

export async function deleteTextbaustein(id: string) {
  const deleted = await deleteTextbausteinRow(id);

  if (!deleted) {
    return { success: false as const, error: "Textbaustein nicht gefunden." };
  }

  revalidatePath("/textbausteine");

  return { success: true as const };
}

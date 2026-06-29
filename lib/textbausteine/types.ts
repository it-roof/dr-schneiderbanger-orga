export const BEREICHE = [
  { value: "allgemein", label: "Allgemein" },
  { value: "steuerberatung", label: "Steuerberatung" },
  { value: "recht", label: "Recht" },
  { value: "sanierung-insolvenz", label: "Sanierung & Insolvenz" },
  { value: "unternehmensberatung", label: "Unternehmensberatung" },
] as const;

export type Bereich = (typeof BEREICHE)[number]["value"];

export type Textbaustein = {
  id: string;
  titel: string;
  inhalt: string;
  bereich: Bereich;
  createdAt: string;
  updatedAt: string;
};

export type TextbausteinInput = {
  titel: string;
  inhalt: string;
  bereich: Bereich;
};

export function getBereichLabel(bereich: Bereich): string {
  return BEREICHE.find((entry) => entry.value === bereich)?.label ?? bereich;
}

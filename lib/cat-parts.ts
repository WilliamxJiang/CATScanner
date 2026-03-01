/**
 * Load CAT part numbers from a JSON file for use in parts identification.
 * Replace data/cat-parts.json with your own export from CAT SIS or dealer data.
 *
 * Format: array of { partNumber: string, description?: string, equipmentModel?: string }
 * - partNumber: official CAT part number (e.g. "230-5743")
 * - description: short part description
 * - equipmentModel: optional model (e.g. "320", "336") for filtering
 *
 * To use real CAT parts:
 * 1. Export part numbers from CAT SIS 2.0 or your dealer/parts system.
 * 2. Save as data/cat-parts.json (or set CAT_PARTS_FILE env to path).
 * 3. If the file is large, keep only the subset you need (e.g. by model) so the prompt stays under token limits.
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

export interface CatPartEntry {
  partNumber: string;
  description?: string;
  equipmentModel?: string;
}

const DEFAULT_PATH = join(process.cwd(), "data", "cat-parts.json");
const SAMPLE_PATH = join(process.cwd(), "data", "cat-parts-sample.json");
const MAX_PARTS_IN_PROMPT = 300;

let cachedParts: CatPartEntry[] | null = null;

function loadJsonPath(path: string): CatPartEntry[] {
  if (!existsSync(path)) return [];
  try {
    const raw = readFileSync(path, "utf-8");
    const data = JSON.parse(raw);
    const list = Array.isArray(data) ? data : [];
    return list.filter(
      (e: any) =>
        e && typeof e.partNumber === "string" && e.partNumber.trim().length > 0
    );
  } catch {
    return [];
  }
}

/**
 * Load CAT parts list: CAT_PARTS_FILE if set, else data/cat-parts.json, else data/cat-parts-sample.json.
 */
export function loadCatParts(): CatPartEntry[] {
  if (cachedParts !== null) return cachedParts;
  const envPath = process.env.CAT_PARTS_FILE;
  const path = envPath
    ? join(process.cwd(), envPath)
    : DEFAULT_PATH;
  cachedParts = loadJsonPath(path).length > 0
    ? loadJsonPath(path)
    : loadJsonPath(SAMPLE_PATH);
  return cachedParts;
}

/**
 * Get parts for the prompt, optionally filtered by equipment model. Caps at MAX_PARTS_IN_PROMPT.
 */
export function getCatPartsForPrompt(equipmentModel?: string): CatPartEntry[] {
  const all = loadCatParts();
  let list = all;
  if (equipmentModel && equipmentModel.trim()) {
    const model = equipmentModel.trim().toUpperCase();
    list = all.filter(
      (e) =>
        !e.equipmentModel ||
        e.equipmentModel.toUpperCase() === model ||
        e.equipmentModel.toUpperCase().includes(model) ||
        model.includes(e.equipmentModel.toUpperCase())
    );
  }
  if (list.length === 0) list = all;
  return list.slice(0, MAX_PARTS_IN_PROMPT);
}

/**
 * Format a list of CAT parts for inclusion in the model prompt.
 */
export function formatCatPartsForPrompt(parts: CatPartEntry[]): string {
  if (parts.length === 0) return "";
  return (
    "Only suggest part numbers from this official CAT parts list. Return partNumber exactly as shown.\n" +
    "CAT parts list (partNumber, description, equipmentModel):\n" +
    parts
      .map(
        (e) =>
          `- ${e.partNumber} | ${e.description || "—"} ${e.equipmentModel ? `| ${e.equipmentModel}` : ""}`
      )
      .join("\n")
  );
}

/**
 * CAT Safety & Maintenance Inspection (365-5230) – Hydraulic Excavator.
 * Checklist structure from the official form; used to generate the report in that format.
 */
import type { InspectionForm, InspectionFormRow, InspectionFormSection, InspectionResult } from "@/lib/types";

/** Static checklist: component + what to look for. Order matches PDF. */
const CHECKLIST: { section: string; component: string; whatToLookFor: string }[] = [
  { section: "FROM THE GROUND", component: "Bucket, GET", whatToLookFor: "Excessive wear or damage, cracks" },
  { section: "FROM THE GROUND", component: "Bucket cylinder & linkage", whatToLookFor: "Excessive wear, damage, leaks, lubricate" },
  { section: "FROM THE GROUND", component: "Stick, cylinder", whatToLookFor: "Wear, damage, leaks, lubricate" },
  { section: "FROM THE GROUND", component: "Boom, cylinders", whatToLookFor: "Wear, damage, leaks, lubricate" },
  { section: "FROM THE GROUND", component: "Underneath of machine", whatToLookFor: "Final drive leaks, swing drive leaks, damage" },
  { section: "FROM THE GROUND", component: "Carbody", whatToLookFor: "Cracks, damage" },
  { section: "FROM THE GROUND", component: "Undercarriage", whatToLookFor: "Wear, damage, tension" },
  { section: "FROM THE GROUND", component: "Steps & handholds", whatToLookFor: "Condition & cleanliness" },
  { section: "FROM THE GROUND", component: "Windshield wipers & washers", whatToLookFor: "Wear, damage, fluid level" },
  { section: "FROM THE GROUND", component: "Fire extinguisher", whatToLookFor: "Charge, damage" },
  { section: "FROM THE GROUND", component: "Lights", whatToLookFor: "Damage" },
  { section: "FROM THE GROUND", component: "Mirrors", whatToLookFor: "Damage" },
  { section: "FROM THE GROUND", component: "Overall machine", whatToLookFor: "Loose or missing nuts & bolts, loose guards, cleanliness" },
  { section: "ENGINE COMPARTMENT OR LOWER PLATFORM", component: "Engine Coolant (365-5110)", whatToLookFor: "Fluid level" },
  { section: "ENGINE COMPARTMENT OR LOWER PLATFORM", component: "Engine oil", whatToLookFor: "Fluid level" },
  { section: "ENGINE COMPARTMENT OR LOWER PLATFORM", component: "Pump drive oil (5130-5230)", whatToLookFor: "Fluid level" },
  { section: "ENGINE COMPARTMENT OR LOWER PLATFORM", component: "Engine oil filter", whatToLookFor: "Leaks" },
  { section: "ENGINE COMPARTMENT OR LOWER PLATFORM", component: "Primary/secondary fuel filters", whatToLookFor: "Leaks" },
  { section: "ENGINE COMPARTMENT OR LOWER PLATFORM", component: "Batteries & hold downs", whatToLookFor: "Cleanliness, loose bolts & nuts" },
  { section: "ENGINE COMPARTMENT OR LOWER PLATFORM", component: "Air filter", whatToLookFor: "Restriction indicator(s)" },
  { section: "ENGINE COMPARTMENT OR LOWER PLATFORM", component: "AC/cab filters", whatToLookFor: "Dirt, debris" },
  { section: "ENGINE COMPARTMENT OR LOWER PLATFORM", component: "Hydraulic oil tank", whatToLookFor: "Fluid level, damage, leaks" },
  { section: "ENGINE COMPARTMENT OR LOWER PLATFORM", component: "Hydraulic oil filters", whatToLookFor: "Leaks" },
  { section: "ENGINE COMPARTMENT OR LOWER PLATFORM", component: "Swing gear oil", whatToLookFor: "Fluid level, leaks" },
  { section: "ENGINE COMPARTMENT OR LOWER PLATFORM", component: "Fuel tank", whatToLookFor: "Fuel level, damage, leaks" },
  { section: "ENGINE COMPARTMENT OR LOWER PLATFORM", component: "Diesel exhaust fluid (DEF) tank (if equipped)", whatToLookFor: "Fluid level, check for debris buildup" },
  { section: "ENGINE COMPARTMENT OR LOWER PLATFORM", component: "Air tank (5130-5230)", whatToLookFor: "Moisture and sediment" },
  { section: "ENGINE COMPARTMENT OR LOWER PLATFORM", component: "Radiator", whatToLookFor: "Fin blockage, leaks" },
  { section: "ENGINE COMPARTMENT OR LOWER PLATFORM", component: "All hoses", whatToLookFor: "Cracks, wear spots, leaks" },
  { section: "ENGINE COMPARTMENT OR LOWER PLATFORM", component: "All belts", whatToLookFor: "Tightness, wear, cracks" },
  { section: "ENGINE COMPARTMENT OR LOWER PLATFORM", component: "Overall engine compartment", whatToLookFor: "Trash or dirt buildup, leaks" },
  { section: "UPPER PLATFORM (5130-5230)", component: "Engine coolant", whatToLookFor: "Fluid level (jacket water and aftercooler)" },
  { section: "UPPER PLATFORM (5130-5230)", component: "Steps & handholds", whatToLookFor: "Condition & cleanliness" },
  { section: "UPPER PLATFORM (5130-5230)", component: "Air precleaners", whatToLookFor: "Dirt, debris, blockage" },
  { section: "UPPER PLATFORM (5130-5230)", component: "Windshield wipers", whatToLookFor: "Wear, damage" },
  { section: "INSIDE THE CAB", component: "Seat", whatToLookFor: "Adjustment, able to reach pedals" },
  { section: "INSIDE THE CAB", component: "Seat belt & mounting", whatToLookFor: "Damage, wear, adjustment, installed date, age" },
  { section: "INSIDE THE CAB", component: "Horn, backup alarm, lights", whatToLookFor: "Horn, travel alarm, warning devices working" },
  { section: "INSIDE THE CAB", component: "Indicators & gauges", whatToLookFor: "Proper function" },
  { section: "INSIDE THE CAB", component: "Travel controls", whatToLookFor: "Correct operation, free from debris" },
  { section: "INSIDE THE CAB", component: "Switches", whatToLookFor: "Proper function" },
  { section: "INSIDE THE CAB", component: "Heating system", whatToLookFor: "Proper function" },
  { section: "INSIDE THE CAB", component: "Cooling system", whatToLookFor: "Proper function" },
  { section: "INSIDE THE CAB", component: "Overall cab interior", whatToLookFor: "Cleanliness" }
];

/** Normalize text for matching (lowercase, collapse spaces, remove punctuation) */
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Find the best-matching checklist row for an issue (by type/location/description). */
function matchRow(issueType: string, location?: string, description?: string): number {
  const typeNorm = norm(issueType);
  const locNorm = location ? norm(location) : "";
  const descNorm = description ? norm(description) : "";
  const combined = `${typeNorm} ${locNorm} ${descNorm}`;
  let bestIdx = -1;
  let bestScore = 0;
  for (let i = 0; i < CHECKLIST.length; i++) {
    const row = CHECKLIST[i];
    const compNorm = norm(row.component);
    const lookNorm = norm(row.whatToLookFor);
    let score = 0;
    if (compNorm && combined.includes(compNorm)) score += 2;
    if (lookNorm && combined.includes(lookNorm)) score += 1;
    const words = compNorm.split(" ");
    for (const w of words) {
      if (w.length > 2 && combined.includes(w)) score += 0.5;
    }
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  return bestIdx;
}

/**
 * Build the CAT Safety & Maintenance Inspection form from an inspection result.
 * Fills evaluator comments from issues where they match checklist rows; otherwise marks passed.
 */
export function buildInspectionForm(
  inspection: InspectionResult,
  options: {
    operatorInspector?: string;
    machineId?: string;
    date?: string;
    time?: string;
    machineHours?: string;
  } = {}
): InspectionForm {
  const now = new Date();
  const dateStr = options.date ?? now.toLocaleDateString();
  const timeStr = options.time ?? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const rowsBySection = new Map<string, InspectionFormRow[]>();

  for (const row of CHECKLIST) {
    if (!rowsBySection.has(row.section)) {
      rowsBySection.set(row.section, []);
    }
    rowsBySection.get(row.section)!.push({
      component: row.component,
      whatToLookFor: row.whatToLookFor,
      passed: true,
      evaluatorComments: ""
    });
  }

  for (const issue of inspection.issues ?? []) {
    const idx = matchRow(issue.type, issue.location, issue.description);
    if (idx >= 0) {
      const row = CHECKLIST[idx];
      const sectionRows = rowsBySection.get(row.section);
      const formRow = sectionRows?.find((r) => r.component === row.component && r.whatToLookFor === row.whatToLookFor);
      if (formRow) {
        formRow.passed = false;
        formRow.evaluatorComments = [issue.description, issue.recommendation].filter(Boolean).join(" — ");
      }
    }
  }

  const sections: InspectionFormSection[] = [];
  for (const [title, rows] of rowsBySection) {
    sections.push({ title, rows });
  }

  return {
    formTitle: "Safety & Maintenance Inspection",
    formNumber: "365-5230",
    operatorInspector: options.operatorInspector ?? "",
    date: dateStr,
    time: timeStr,
    serialNumber: options.machineId ?? "",
    machineHours: options.machineHours ?? "",
    sections,
    notesInspectedBy: options.operatorInspector ?? "",
    notesDate: dateStr,
    notesTime: timeStr
  };
}

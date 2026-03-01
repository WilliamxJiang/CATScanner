export type PassFailMonitorStatus = "PASS" | "FAIL" | "MONITOR";

export interface InspectionIssue {
  type: string;
  severity: "low" | "medium" | "high";
  location?: string;
  description: string;
  recommendation: string;
}

export interface InspectionResult {
  status: PassFailMonitorStatus;
  riskScore: number; // 0-100
  issues: InspectionIssue[];
  notes: string;
  recommendedNextSteps: string[];
}

export interface PartCandidate {
  partNumber: string;
  description?: string;
  fitmentScore: number; // 0-1
  notes?: string;
}

export interface PartsIdentificationResult {
  equipmentModel?: string;
  candidates: PartCandidate[];
  explanation: string;
}

export type LayoutOptimizationGoal = "safety" | "efficiency" | "cost";

export interface LayoutPlan {
  id: string;
  name: string;
  primaryGoal: LayoutOptimizationGoal;
  asciiMap: string;
  summary: string;
  pros: string[];
  cons: string[];
  estimatedTravelDistance?: string;
  congestionRisk?: "low" | "medium" | "high";
  safetyRisk?: "low" | "medium" | "high";
}

export interface SiteLayoutRequest {
  siteType: string;
  numberOfMachines: number;
  hazards: string[];
  objectives: string[];
}

export interface LayoutResult {
  plans: LayoutPlan[];
  overallRecommendation: string;
}

/** Single row on the CAT Safety & Maintenance Inspection form */
export interface InspectionFormRow {
  component: string;
  whatToLookFor: string;
  passed: boolean;
  evaluatorComments: string;
}

/** Section of the form (e.g. FROM THE GROUND, ENGINE COMPARTMENT) */
export interface InspectionFormSection {
  title: string;
  rows: InspectionFormRow[];
}

/** CAT-style Safety & Maintenance Inspection form (365-5230) */
export interface InspectionForm {
  formTitle: string;
  formNumber: string;
  operatorInspector: string;
  date: string;
  time: string;
  serialNumber: string;
  machineHours: string;
  sections: InspectionFormSection[];
  notesInspectedBy: string;
  notesDate: string;
  notesTime: string;
}

export interface HyperInspectReport {
  timestamp: string;
  machineId?: string;
  inspectorName?: string;
  inspection?: InspectionResult;
  /** When inspection is present, report can include the CAT form layout */
  inspectionForm?: InspectionForm;
  parts?: PartsIdentificationResult;
  layout?: LayoutResult;
  overallSummary: string;
}


import { NextRequest, NextResponse } from "next/server";
import { openai, parseJsonFromModel } from "@/lib/openai";
import type {
  HyperInspectReport,
  InspectionResult,
  LayoutResult,
  PartsIdentificationResult
} from "@/lib/types";
import { buildInspectionForm } from "@/lib/inspection-form";

export const runtime = "nodejs";

interface ReportRequestBody {
  inspectorName?: string;
  machineId?: string;
  inspection?: InspectionResult;
  parts?: PartsIdentificationResult;
  layout?: LayoutResult;
}

function summarizeFallback(body: ReportRequestBody): string {
  const parts: string[] = [];
  if (body.inspection) {
    parts.push(`Inspection: ${body.inspection.status}, risk ${body.inspection.riskScore}/100. ${body.inspection.notes || ""}`);
  }
  if (body.parts) {
    parts.push(`Parts: ${body.parts.candidates?.length ?? 0} candidate(s). ${body.parts.explanation || ""}`);
  }
  if (body.layout) {
    parts.push(`Layout: ${body.layout.plans?.length ?? 0} plan(s). ${body.layout.overallRecommendation || ""}`);
  }
  return parts.join(" ") || "Report generated from available data.";
}

function buildFallbackReport(body: ReportRequestBody): NextResponse<HyperInspectReport> {
  const report = buildReportWithForm(body);
  return NextResponse.json<HyperInspectReport>(report);
}

function buildReportWithForm(body: ReportRequestBody): HyperInspectReport {
  const report: HyperInspectReport = {
    timestamp: new Date().toISOString(),
    inspectorName: body.inspectorName,
    machineId: body.machineId,
    inspection: body.inspection ?? undefined,
    parts: body.parts ?? undefined,
    layout: body.layout ?? undefined,
    overallSummary: summarizeFallback(body)
  };
  if (body.inspection) {
    report.inspectionForm = buildInspectionForm(body.inspection, {
      operatorInspector: body.inspectorName ?? "",
      machineId: body.machineId ?? "",
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    });
  }
  return report;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as
      | ReportRequestBody
      | null;

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const { inspectorName, machineId, inspection, parts, layout } = body;

    if (!inspection && !parts && !layout) {
      return NextResponse.json(
        {
          error:
            "Provide at least one of: inspection, parts, or layout to generate a report."
        },
        { status: 400 }
      );
    }

    const systemPrompt =
      "You are an assistant generating a unified CAT HyperInspect report.\n" +
      "You MUST respond with ONLY valid JSON matching this TypeScript type exactly:\n" +
      "interface HyperInspectReport {\n" +
      "  timestamp: string;\n" +
      "  machineId?: string;\n" +
      "  inspectorName?: string;\n" +
      "  inspection?: {\n" +
      '    status: \"PASS\" | \"FAIL\" | \"MONITOR\";\n' +
      "    riskScore: number;\n" +
      "    issues: {\n" +
      "      type: string;\n" +
      '      severity: \"low\" | \"medium\" | \"high\";\n' +
      "      location?: string;\n" +
      "      description: string;\n" +
      "      recommendation: string;\n" +
      "    }[];\n" +
      "    notes: string;\n" +
      "    recommendedNextSteps: string[];\n" +
      "  };\n" +
      "  parts?: {\n" +
      "    equipmentModel?: string;\n" +
      "    candidates: {\n" +
      "      partNumber: string;\n" +
      "      description?: string;\n" +
      "      fitmentScore: number;\n" +
      "      notes?: string;\n" +
      "    }[];\n" +
      "    explanation: string;\n" +
      "  };\n" +
      "  layout?: {\n" +
      "    plans: {\n" +
      "      id: string;\n" +
      "      name: string;\n" +
      '      primaryGoal: \"safety\" | \"efficiency\" | \"cost\";\n' +
      "      asciiMap: string;\n" +
      "      summary: string;\n" +
      "      pros: string[];\n" +
      "      cons: string[];\n" +
      "      estimatedTravelDistance?: string;\n" +
      '      congestionRisk?: \"low\" | \"medium\" | \"high\";\n' +
      '      safetyRisk?: \"low\" | \"medium\" | \"high\";\n' +
      "    }[];\n" +
      "    overallRecommendation: string;\n" +
      "  };\n" +
      "  overallSummary: string;\n" +
      "}\n" +
      "Summarize the key risks, recommended actions, and cross-links between inspection findings, parts, and layout.\n" +
      "Timestamp must be an ISO 8601 string (e.g. new Date().toISOString()).\n" +
      "Echo or summarize the provided inspection, parts, and layout inside the report object.\n" +
      "Respond with ONLY the raw JSON object. No markdown, no code fences (no ```), no text before or after.";

    const userPrompt = {
      inspectorName: inspectorName ?? null,
      machineId: machineId ?? null,
      inspection: inspection ?? null,
      parts: parts ?? null,
      layout: layout ?? null
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content:
            "Generate a concise but comprehensive HyperInspect report from the following JSON data:\n" +
            JSON.stringify(userPrompt, null, 2)
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return buildFallbackReport(body);
    }

    let parsed: HyperInspectReport;
    try {
      const data = parseJsonFromModel(content);
      parsed = data as HyperInspectReport;
    } catch (err) {
      return buildFallbackReport(body);
    }

    if (!parsed.timestamp) parsed.timestamp = new Date().toISOString();
    if (!parsed.overallSummary) parsed.overallSummary = summarizeFallback(body);
    if (body.inspection && !parsed.inspectionForm) {
      parsed.inspectionForm = buildInspectionForm(body.inspection, {
        operatorInspector: parsed.inspectorName ?? body.inspectorName ?? "",
        machineId: parsed.machineId ?? body.machineId ?? "",
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      });
    }
    return NextResponse.json<HyperInspectReport>(parsed);
  } catch (error) {
    console.error("Error in /api/report:", error);
    return NextResponse.json(
      { error: "Unexpected server error while generating report." },
      { status: 500 }
    );
  }
}


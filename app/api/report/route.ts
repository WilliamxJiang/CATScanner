import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, parseJsonFromModel, OPENAI_KEY_MISSING_MESSAGE } from "@/lib/openai";
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
  let openai;
  try {
    openai = getOpenAI();
  } catch {
    return NextResponse.json(
      { error: OPENAI_KEY_MISSING_MESSAGE },
      { status: 503 }
    );
  }
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
      "You are an assistant writing the executive summary for a FieldIQ inspection report. " +
      "You will receive JSON containing the actual inspection result (status, risk score, issues, notes), optional parts identification, and optional layout plans. " +
      "Your job is to write a single narrative field: overallSummary. " +
      "Respond with ONLY valid JSON in this exact shape: { \"overallSummary\": \"Your 2–4 sentence summary here.\" }\n" +
      "The overallSummary must be specific to the data provided: mention the actual inspection status (PASS/FAIL/MONITOR), risk score, key issues by type/location if any, and any parts or layout highlights. " +
      "Do not invent or generalize—reference only what is in the provided data. No markdown, no code fences.";

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
            "Write the overallSummary for this report based on the following analysis data. Be specific to these findings.\n\n" +
            JSON.stringify({ inspectorName, machineId, inspection, parts, layout }, null, 2)
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return buildFallbackReport(body);
    }

    let parsedSummary: string;
    try {
      const data = parseJsonFromModel(content) as HyperInspectReport;
      parsedSummary =
        typeof data.overallSummary === "string" && data.overallSummary.trim()
          ? data.overallSummary.trim()
          : summarizeFallback(body);
    } catch (err) {
      return buildFallbackReport(body);
    }

    // Report is always built from the actual analysis (request body), not from LLM output.
    // Only the overallSummary narrative comes from the LLM so it's specific to the data.
    const report: HyperInspectReport = {
      timestamp: new Date().toISOString(),
      inspectorName: body.inspectorName ?? undefined,
      machineId: body.machineId ?? undefined,
      inspection: body.inspection ?? undefined,
      parts: body.parts ?? undefined,
      layout: body.layout ?? undefined,
      overallSummary: parsedSummary
    };
    if (body.inspection) {
      report.inspectionForm = buildInspectionForm(body.inspection, {
        operatorInspector: body.inspectorName ?? "",
        machineId: body.machineId ?? "",
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      });
    }
    return NextResponse.json<HyperInspectReport>(report);
  } catch (error) {
    console.error("Error in /api/report:", error);
    return NextResponse.json(
      { error: "Unexpected server error while generating report." },
      { status: 500 }
    );
  }
}


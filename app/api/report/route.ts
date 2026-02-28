import { NextRequest, NextResponse } from "next/server";
import { openai, parseJsonFromModel } from "@/lib/openai";
import type {
  HyperInspectReport,
  InspectionResult,
  LayoutResult,
  PartsIdentificationResult
} from "@/lib/types";

export const runtime = "nodejs";

interface ReportRequestBody {
  inspectorName?: string;
  machineId?: string;
  inspection?: InspectionResult;
  parts?: PartsIdentificationResult;
  layout?: LayoutResult;
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
      "Timestamp should be an ISO 8601 string (UTC is fine).\n" +
      "Do not include any explanation outside of the JSON object.";

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
      max_tokens: 1200
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "Model returned no content." },
        { status: 500 }
      );
    }

    let parsed: HyperInspectReport;
    try {
      const data = parseJsonFromModel(content);
      parsed = data as HyperInspectReport;
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to parse report JSON from model response." },
        { status: 500 }
      );
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


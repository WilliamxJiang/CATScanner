import { NextRequest, NextResponse } from "next/server";
import { openai, parseJsonFromModel } from "@/lib/openai";
import type { LayoutResult, SiteLayoutRequest } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as
      | SiteLayoutRequest
      | null;

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const { siteType, numberOfMachines, hazards, objectives } = body;

    if (
      !siteType ||
      typeof siteType !== "string" ||
      typeof numberOfMachines !== "number" ||
      !Array.isArray(hazards) ||
      !Array.isArray(objectives)
    ) {
      return NextResponse.json(
        {
          error:
            "Expected body with siteType (string), numberOfMachines (number), hazards (string[]), objectives (string[])."
        },
        { status: 400 }
      );
    }

    const systemPrompt =
      "You are an assistant helping to design construction or industrial site layouts and logistics.\n" +
      "You MUST respond with ONLY valid JSON matching this TypeScript type exactly:\n" +
      'type LayoutOptimizationGoal = "safety" | "efficiency" | "cost";\n' +
      "interface LayoutPlan {\n" +
      "  id: string;\n" +
      "  name: string;\n" +
      "  primaryGoal: LayoutOptimizationGoal;\n" +
      "  asciiMap: string; // multiline, fixed-width schematic\n" +
      "  summary: string;\n" +
      "  pros: string[];\n" +
      "  cons: string[];\n" +
      "  estimatedTravelDistance?: string;\n" +
      '  congestionRisk?: "low" | "medium" | "high";\n' +
      '  safetyRisk?: "low" | "medium" | "high";\n' +
      "}\n" +
      "interface LayoutResult {\n" +
      "  plans: LayoutPlan[];\n" +
      "  overallRecommendation: string;\n" +
      "}\n" +
      "Generate 3–4 distinct layout plans that interpret the requested objectives in different ways.\n" +
      "Each `asciiMap` should be a small schematic (roughly 30–40 characters wide) using blocks for key areas and labeled rows.\n" +
      "Do not include any explanation outside of the JSON object.";

    const userPrompt =
      "Create 3–4 alternative site layout and logistics plans based on the following:\n" +
      `Site type: ${siteType}\n` +
      `Number of machines: ${numberOfMachines}\n` +
      `Hazards: ${hazards.join(", ") || "none specified"}\n` +
      `Objectives: ${objectives.join(", ") || "none specified"}\n\n` +
      "For each plan, choose a primaryGoal of safety, efficiency, or cost.\n" +
      "Highlight how machine flows, fueling, staging, and pedestrian areas are arranged.\n" +
      "Keep asciiMap simple but readable in a monospace font.";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.4,
      max_tokens: 1200
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "Model returned no content." },
        { status: 500 }
      );
    }

    let parsed: LayoutResult;
    try {
      const data = parseJsonFromModel(content);
      parsed = data as LayoutResult;
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to parse layout JSON from model response." },
        { status: 500 }
      );
    }

    return NextResponse.json<LayoutResult>(parsed);
  } catch (error) {
    console.error("Error in /api/layout:", error);
    return NextResponse.json(
      { error: "Unexpected server error while generating layout." },
      { status: 500 }
    );
  }
}


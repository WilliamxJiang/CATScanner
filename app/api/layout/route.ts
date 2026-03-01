import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, parseJsonFromModel, OPENAI_KEY_MISSING_MESSAGE } from "@/lib/openai";
import type { LayoutResult, SiteLayoutRequest } from "@/lib/types";

export const runtime = "nodejs";

function buildFallbackLayout(siteType: string, numberOfMachines: number): LayoutResult {
  return {
    plans: [
      {
        id: "fallback-1",
        name: "Safety-first layout",
        primaryGoal: "safety",
        asciiMap: `Site: ${siteType} | Machines: ${numberOfMachines} | Staging-N, Fuel-E, Pedestrian-W`,
        zones: [
          { id: "s1", label: "Staging", x: 1, y: 1, width: 2, height: 2, colorHint: "safety" },
          { id: "f1", label: "Fuel", x: 5, y: 1, width: 2, height: 1, colorHint: "safety" },
          { id: "m1", label: "Machines", x: 3, y: 4, width: 3, height: 2 },
          { id: "p1", label: "Pedestrian", x: 0, y: 3, width: 1, height: 3, colorHint: "safety" }
        ],
        summary: "Fallback layout. Retry for AI-generated plans.",
        pros: ["Clear zones", "Safety-focused"],
        cons: ["Generated from template"]
      }
    ],
    overallRecommendation: "Layout could not be fully generated. You can retry or use the fallback plan above."
  };
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
      "You are an assistant helping to design construction or industrial site layouts and logistics. " +
      "Respond with ONLY valid JSON, no markdown or code fences. " +
      "Use this exact structure:\n" +
      "{\n" +
      '  "plans": [ { "id": "plan1", "name": "...", "primaryGoal": "safety"|"efficiency"|"cost", "asciiMap": "one line schematic", "zones": [ { "id": "z1", "label": "Staging", "x": 0, "y": 0, "width": 2, "height": 2 } ], "summary": "...", "pros": ["..."], "cons": ["..."] } ],\n' +
      '  "overallRecommendation": "..."\n' +
      "}\n" +
      "For each plan: asciiMap = short one-line text (e.g. Staging-N | Fuel-E). zones = array of 4-8 areas with id, label, x, y (0-10), width, height (1-4). Optionally z, depth, colorHint (safety|efficiency|cost). " +
      "Keep all keys and string values in double quotes. No trailing commas.";

    const userPrompt =
      "Create 3–4 alternative site layout and logistics plans based on the following:\n" +
      `Site type: ${siteType}\n` +
      `Number of machines: ${numberOfMachines}\n` +
      `Hazards: ${hazards.join(", ") || "none specified"}\n` +
      `Objectives: ${objectives.join(", ") || "none specified"}\n\n` +
      "For each plan: set primaryGoal (safety, efficiency, or cost), provide asciiMap and zones. Zones should cover staging, fueling, machine areas, pedestrian paths, entry/exit. Use 0–10 for x, y, width, height (and z, depth if stacking).";

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
          content: userPrompt
        }
      ],
      temperature: 0.4,
      max_tokens: 1200
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json(buildFallbackLayout(siteType, numberOfMachines));
    }

    let parsed: LayoutResult;
    try {
      const data = parseJsonFromModel(content) as LayoutResult;
      if (!data || typeof data !== "object" || !Array.isArray(data.plans)) {
        throw new Error("Invalid structure");
      }
      parsed = {
        plans: data.plans.map((p: any) => ({
          id: p.id ?? `plan-${Math.random().toString(36).slice(2, 9)}`,
          name: p.name ?? "Layout plan",
          primaryGoal: ["safety", "efficiency", "cost"].includes(p.primaryGoal) ? p.primaryGoal : "efficiency",
          asciiMap: typeof p.asciiMap === "string" ? p.asciiMap : "Staging | Fuel | Machines",
          zones: Array.isArray(p.zones)
            ? p.zones
                .filter((z: any) => z && z.id && z.label && typeof z.x === "number" && typeof z.y === "number")
                .map((z: any) => ({
                  id: z.id,
                  label: z.label,
                  x: z.x,
                  y: z.y,
                  z: typeof z.z === "number" ? z.z : undefined,
                  width: typeof z.width === "number" ? z.width : 1.5,
                  height: typeof z.height === "number" ? z.height : 1.5,
                  depth: typeof z.depth === "number" ? z.depth : undefined,
                  colorHint: ["safety", "efficiency", "cost"].includes(z.colorHint) ? z.colorHint : undefined
                }))
            : [],
          summary: typeof p.summary === "string" ? p.summary : "",
          pros: Array.isArray(p.pros) ? p.pros : [],
          cons: Array.isArray(p.cons) ? p.cons : [],
          estimatedTravelDistance: p.estimatedTravelDistance,
          congestionRisk: p.congestionRisk,
          safetyRisk: p.safetyRisk
        })),
        overallRecommendation: typeof data.overallRecommendation === "string" ? data.overallRecommendation : "Review the plans above."
      };
    } catch (err) {
      return NextResponse.json(buildFallbackLayout(siteType, numberOfMachines));
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


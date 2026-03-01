import { NextRequest, NextResponse } from "next/server";
import { openai, parseJsonFromModel } from "@/lib/openai";
import type { InspectionResult } from "@/lib/types";
import { INSPECT_STATUS_PROMPT } from "@/prompts/inspect";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image");
    const notes = formData.get("notes");

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "Image file is required under the `image` field." },
        { status: 400 }
      );
    }

    const arrayBuffer = await image.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = image.type || "image/jpeg";
    const imageUrl = `data:${mimeType};base64,${base64}`;

    const notesText =
      typeof notes === "string" && notes.trim().length > 0
        ? notes.trim()
        : "No additional notes were provided.";

    const systemPrompt =
      "You are an assistant helping with construction machinery inspections in a CAT-style daily walkaround.\n" +
      "You MUST respond with ONLY valid JSON matching this TypeScript type exactly:\n" +
      "type PassFailMonitorStatus = \"PASS\" | \"FAIL\" | \"MONITOR\";\n" +
      "interface InspectionIssue {\n" +
      '  type: string;\n  severity: "low" | "medium" | "high";\n' +
      "  location?: string;\n" +
      "  description: string;\n" +
      "  recommendation: string;\n" +
      "}\n" +
      "interface InspectionResult {\n" +
      "  status: PassFailMonitorStatus;\n" +
      "  riskScore: number; // 0-100\n" +
      "  issues: InspectionIssue[];\n" +
      "  notes: string;\n" +
      "  recommendedNextSteps: string[];\n" +
      "}\n" +
      "Use the image and any notes to infer likely issues such as leaks, wear, damage, missing guards, or unsafe conditions.\n" +
      "The `riskScore` should be between 0 and 100 (higher means higher risk).\n\n" +
      INSPECT_STATUS_PROMPT +
      "\nDo not include any explanation outside of the JSON object.";

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
          content: [
            {
              type: "text",
              text:
                "Perform a structured CAT-style inspection for this machine image. " +
                "Consider the overall condition, visible wear, leaks, safety items, and environment.\n\n" +
                `Notes from operator/inspector: ${notesText}`
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ] as any
        }
      ],
      temperature: 0.2,
      max_tokens: 800
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "Model returned no content." },
        { status: 500 }
      );
    }

    let parsed: InspectionResult;
    try {
      const data = parseJsonFromModel(content);
      parsed = data as InspectionResult;
    } catch (err) {
      return NextResponse.json(
        {
          error: "Failed to parse inspection JSON from model response."
        },
        { status: 500 }
      );
    }

    return NextResponse.json<InspectionResult>(parsed);
  } catch (error) {
    console.error("Error in /api/inspect:", error);
    return NextResponse.json(
      { error: "Unexpected server error while running inspection." },
      { status: 500 }
    );
  }
}


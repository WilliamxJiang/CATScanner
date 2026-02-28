import { NextRequest, NextResponse } from "next/server";
import { openai, parseJsonFromModel } from "@/lib/openai";
import type { PartsIdentificationResult } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image");
    const description = formData.get("description");
    const equipmentModel = formData.get("equipmentModel");

    const descriptionText =
      typeof description === "string" ? description.trim() : "";
    const equipmentModelText =
      typeof equipmentModel === "string" ? equipmentModel.trim() : "";

    if (!(image instanceof File) && !descriptionText) {
      return NextResponse.json(
        {
          error:
            "Provide at least an image (`image` field) or a text description (`description` field)."
        },
        { status: 400 }
      );
    }

    let imageUrl: string | undefined;
    if (image instanceof File) {
      const arrayBuffer = await image.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const mimeType = image.type || "image/jpeg";
      imageUrl = `data:${mimeType};base64,${base64}`;
    }

    const systemPrompt =
      "You are an assistant helping identify construction equipment parts in a CAT-style catalog.\n" +
      "You MUST respond with ONLY valid JSON matching this TypeScript type exactly:\n" +
      "interface PartCandidate {\n" +
      "  partNumber: string;\n" +
      "  description?: string;\n" +
      "  fitmentScore: number; // 0-1\n" +
      "  notes?: string;\n" +
      "}\n" +
      "interface PartsIdentificationResult {\n" +
      "  equipmentModel?: string;\n" +
      "  candidates: PartCandidate[];\n" +
      "  explanation: string;\n" +
      "}\n" +
      "Hallucinate 3–5 plausible CAT-style part numbers where necessary.\n" +
      "The `fitmentScore` must be between 0 and 1 (float), where higher means more likely to fit.\n" +
      "Use `explanation` to briefly describe how you arrived at the ranking.\n" +
      "Do not include any explanation outside of the JSON object.";

    const userTextParts: string[] = [];
    if (descriptionText) {
      userTextParts.push(`Part description: ${descriptionText}`);
    }
    if (equipmentModelText) {
      userTextParts.push(`Equipment model: ${equipmentModelText}`);
    }
    if (!userTextParts.length) {
      userTextParts.push(
        "No textual description provided. Rely primarily on the image."
      );
    }

    const userContent: any[] = [
      {
        type: "text",
        text:
          "Identify and rank plausible CAT-style part numbers for this part.\n" +
          userTextParts.join("\n")
      }
    ];

    if (imageUrl) {
      userContent.push({
        type: "image_url",
        image_url: { url: imageUrl }
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userContent as any
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "Model returned no content." },
        { status: 500 }
      );
    }

    let parsed: PartsIdentificationResult;
    try {
      const data = parseJsonFromModel(content);
      parsed = data as PartsIdentificationResult;
      if (
        equipmentModelText &&
        !parsed.equipmentModel
      ) {
        parsed.equipmentModel = equipmentModelText;
      }
    } catch (err) {
      return NextResponse.json(
        {
          error: "Failed to parse parts identification JSON from model response."
        },
        { status: 500 }
      );
    }

    return NextResponse.json<PartsIdentificationResult>(parsed);
  } catch (error) {
    console.error("Error in /api/parts:", error);
    return NextResponse.json(
      { error: "Unexpected server error while identifying part." },
      { status: 500 }
    );
  }
}


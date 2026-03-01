import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, parseJsonFromModel, OPENAI_KEY_MISSING_MESSAGE } from "@/lib/openai";
import type { PartsIdentificationResult } from "@/lib/types";
import type { PartCandidate } from "@/lib/types";
import {
  getCatPartsForPrompt,
  formatCatPartsForPrompt,
  type CatPartEntry
} from "@/lib/cat-parts";

export const runtime = "nodejs";

function buildFallbackPartsResult(
  partsList: CatPartEntry[],
  equipmentModel?: string,
  description?: string
): PartsIdentificationResult {
  const candidates: PartCandidate[] = partsList.slice(0, 5).map((p, i) => ({
    partNumber: p.partNumber,
    description: p.description,
    fitmentScore: Math.max(0.3, 0.9 - i * 0.15),
    notes: "Suggested from catalog; verify fit for your application."
  }));
  return {
    equipmentModel: equipmentModel || undefined,
    candidates,
    explanation:
      description?.length
        ? `No AI analysis was returned. Showing top catalog matches for "${description}". Verify part numbers in CAT SIS or with your dealer.`
        : "No AI analysis was returned. Showing sample catalog part numbers. Add a description or image and try again, or verify in CAT SIS."
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

    const catPartsList = getCatPartsForPrompt(equipmentModelText);
    const catPartsPrompt =
      catPartsList.length > 0
        ? formatCatPartsForPrompt(catPartsList)
        : "When suggesting part numbers, use realistic CAT-style format (e.g. 230-5743: three characters, dash, four digits).";

    const systemPrompt =
      "You are an assistant helping identify construction equipment parts using official CAT (Caterpillar) part numbers.\n" +
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
      catPartsPrompt +
      "\nSuggest 3–5 part candidates. The `fitmentScore` must be between 0 and 1 (higher = more likely to fit). Use `explanation` to briefly describe how you matched the part. Do not include any explanation outside of the JSON object.";

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

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json(
        buildFallbackPartsResult(catPartsList, equipmentModelText, descriptionText)
      );
    }

    let parsed: PartsIdentificationResult;
    try {
      const data = parseJsonFromModel(content);
      parsed = data as PartsIdentificationResult;
      if (equipmentModelText && !parsed.equipmentModel) {
        parsed.equipmentModel = equipmentModelText;
      }
    } catch (err) {
      return NextResponse.json(
        buildFallbackPartsResult(catPartsList, equipmentModelText, descriptionText)
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


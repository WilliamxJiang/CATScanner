import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  // In dev we prefer a clear error; in production this will surface in route handlers.
  console.warn(
    "OPENAI_API_KEY is not set. API routes that depend on OpenAI will fail until it is configured."
  );
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Some model responses may wrap JSON in markdown code fences or include extra text.
 * This helper attempts to extract and parse a strict JSON object.
 */
export function parseJsonFromModel(text: string): unknown {
  const trimmed = text.trim();

  // Strip common ```json ... ``` wrappers if present.
  const codeFenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  let jsonCandidate = codeFenceMatch ? codeFenceMatch[1].trim() : trimmed;

  const tryParse = (str: string): unknown => {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };

  let result = tryParse(jsonCandidate);
  if (result !== null) return result;

  // Fallback: extract from first '{' to last '}'.
  const firstBrace = jsonCandidate.indexOf("{");
  const lastBrace = jsonCandidate.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const sliced = jsonCandidate.slice(firstBrace, lastBrace + 1);
    result = tryParse(sliced);
    if (result !== null) return result;

    // Try stripping trailing commas (common in LLM output).
    const noTrailingCommas = sliced
      .replace(/,\s*([}\]])/g, "$1");
    result = tryParse(noTrailingCommas);
    if (result !== null) return result;
  }

  throw new Error("Failed to parse JSON from model response");
}


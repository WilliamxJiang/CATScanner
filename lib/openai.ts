import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY?.trim();

if (!apiKey) {
  console.warn(
    "OPENAI_API_KEY is not set. API routes that depend on OpenAI will return 503 until it is configured (e.g. in Vercel Environment Variables)."
  );
}

/** Lazy client so we don't throw at import time when OPENAI_API_KEY is missing (e.g. on Vercel before env is set). */
let _client: OpenAI | null = apiKey ? new OpenAI({ apiKey }) : null;

export function getOpenAI(): OpenAI {
  if (!_client) {
    const key = process.env.OPENAI_API_KEY?.trim();
    if (!key) {
      throw new Error(
        "OPENAI_API_KEY is not set. Add it in Vercel Project Settings → Environment Variables (or in .env.local for local dev)."
      );
    }
    _client = new OpenAI({ apiKey: key });
  }
  return _client;
}

/** Message returned when OPENAI_API_KEY is not set (e.g. 503 response). */
export const OPENAI_KEY_MISSING_MESSAGE =
  "OpenAI API key is not configured. Add OPENAI_API_KEY in Vercel Project Settings → Environment Variables (or .env.local for local dev).";

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


/**
 * IBM watsonx.ai REST client
 *
 * Handles IBM Cloud IAM token exchange (server-side only) and wraps the
 * watsonx.ai chat API endpoint (Granite 4 H Small and compatible models).
 *
 * Environment variables required (server-side only — never expose to client):
 *   WATSONX_API_KEY            IBM Cloud API key
 *   WATSONX_PROJECT_ID         watsonx.ai project ID
 *   WATSONX_GENERATION_MODEL   Granite model ID (e.g. ibm/granite-4-h-small)
 *   WATSONX_URL                watsonx.ai instance URL (e.g. https://us-south.ml.cloud.ibm.com)
 */

const IAM_TOKEN_URL = "https://iam.cloud.ibm.com/identity/token";
const API_VERSION = "2025-10-25";

// ---------------------------------------------------------------------------
// IAM token cache — module-scope singleton; refreshed before expiry
// ---------------------------------------------------------------------------
interface TokenCache {
  token: string;
  expiresAt: number; // Unix ms
}

let tokenCache: TokenCache | null = null;

async function getIAMToken(): Promise<string> {
  const now = Date.now();
  // Refresh 60 s before expiry to avoid using a token that expires mid-request
  if (tokenCache && tokenCache.expiresAt - 60_000 > now) {
    return tokenCache.token;
  }

  const apiKey = process.env.WATSONX_API_KEY;
  if (!apiKey) {
    throw new Error(
      "[watsonx] WATSONX_API_KEY is not set. Add it to .env.local."
    );
  }

  const body = new URLSearchParams({
    grant_type: "urn:ibm:params:oauth:grant-type:apikey",
    apikey: apiKey,
  });

  const res = await fetch(IAM_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "(no body)");
    throw new Error(
      `[watsonx] IAM token exchange failed: ${res.status} ${res.statusText} — ${text}`
    );
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  tokenCache = {
    token: data.access_token,
    // IBM IAM tokens are typically valid for 3600 s
    expiresAt: now + data.expires_in * 1000,
  };

  return tokenCache.token;
}

// ---------------------------------------------------------------------------
// Generation parameters
// ---------------------------------------------------------------------------
export interface GenerateParams {
  maxNewTokens?: number;
  temperature?: number;
  topP?: number;
  repetitionPenalty?: number;
  stopSequences?: string[];
}

const DEFAULT_PARAMS: Required<GenerateParams> = {
  maxNewTokens: 1200,
  temperature: 0,
  topP: 1,
  repetitionPenalty: 1,
  stopSequences: [],
};

// ---------------------------------------------------------------------------
// generate()  — uses /ml/v1/text/chat (Granite 4 H Small chat API)
// ---------------------------------------------------------------------------
export async function generate(
  prompt: string,
  params: GenerateParams = {}
): Promise<string> {
  const baseUrl = process.env.WATSONX_URL;
  const projectId = process.env.WATSONX_PROJECT_ID;
  const modelId = process.env.WATSONX_GENERATION_MODEL;

  if (!baseUrl) {
    throw new Error(
      "[watsonx] WATSONX_URL is not set. Add it to .env.local."
    );
  }
  if (!projectId) {
    throw new Error(
      "[watsonx] WATSONX_PROJECT_ID is not set. Add it to .env.local."
    );
  }
  if (!modelId) {
    throw new Error(
      "[watsonx] WATSONX_GENERATION_MODEL is not set. Add it to .env.local."
    );
  }

  const token = await getIAMToken();

  const merged = { ...DEFAULT_PARAMS, ...params };

  const url = `${baseUrl.replace(/\/$/, "")}/ml/v1/text/chat?version=${API_VERSION}`;

  const body: Record<string, unknown> = {
    model_id: modelId,
    project_id: projectId,
    messages: [{ role: "user", content: prompt }],
    max_completion_tokens: merged.maxNewTokens,
    temperature: merged.temperature,
    top_p: merged.topP,
  };

  if (merged.stopSequences.length > 0) {
    body.stop = merged.stopSequences;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "(no body)");
    throw new Error(
      `[watsonx] Chat API error: ${res.status} ${res.statusText} — ${text}`
    );
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (content === undefined || content === null) {
    throw new Error(
      `[watsonx] Unexpected response shape — no choices[0].message.content. Full response: ${JSON.stringify(data)}`
    );
  }

  return content;
}

// ---------------------------------------------------------------------------
// parseGraniteJSON
// Extracts JSON from a raw Granite response that may contain markdown fences
// or leading/trailing prose. Returns null on failure.
// ---------------------------------------------------------------------------
export function parseGraniteJSON<T = unknown>(raw: string): T | null {
  if (!raw || typeof raw !== "string") return null;

  let candidate = raw.trim();

  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = candidate.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    candidate = fenceMatch[1].trim();
  }

  // If not starting with { or [, try to find the first { or [
  if (!candidate.startsWith("{") && !candidate.startsWith("[")) {
    const jsonStart = candidate.search(/[{[]/);
    if (jsonStart === -1) return null;
    candidate = candidate.slice(jsonStart);
  }

  // Trim trailing content after the last } or ]
  const lastBrace = Math.max(
    candidate.lastIndexOf("}"),
    candidate.lastIndexOf("]")
  );
  if (lastBrace !== -1) {
    candidate = candidate.slice(0, lastBrace + 1);
  }

  try {
    return JSON.parse(candidate) as T;
  } catch {
    return null;
  }
}

/**
 * POST /api/generate
 *
 * Accepts startup intake data, retrieves relevant knowledge via the internal
 * RAG layer, calls IBM Granite via watsonx.ai, and returns a structured JSON
 * blueprint with: overview, problem, target customers, solution, revenue model,
 * competitors, differentiator, risks, and sources.
 *
 * Server-side only — never imports client-side code.
 */

import { NextRequest, NextResponse } from "next/server";
import { generate, parseGraniteJSON } from "@/lib/watsonx/client";
import { retrieve, formatContext } from "@/lib/rag/retriever";

// ---------------------------------------------------------------------------
// Request / Response types
// ---------------------------------------------------------------------------
export interface GenerateRequest {
  idea: string;
  industry?: string;
  targetCustomer?: string;
  location?: string;
  stage?: string;
  budget?: string;
  teamSize?: number;
}

export interface BlueprintOverview {
  overview: string;
  problem: string;
  targetCustomers: string;
  solution: string;
  revenueModel: string;
  competitors: string[];
  differentiator: string;
  risks: string[];
  sources?: string[];
}

// ---------------------------------------------------------------------------
// Prompt builder — accepts optional RAG context block
// ---------------------------------------------------------------------------
function buildPrompt(req: GenerateRequest, ragContext: string): string {
  const industry = req.industry || "technology";
  const location = req.location || "India";
  const stage = req.stage || "Idea";
  const budget = req.budget || "Not specified";
  const teamSize = req.teamSize ?? "Not specified";
  const targetCustomer = req.targetCustomer || "Not specified";

  const contextSection = ragContext
    ? `\n\nRELEVANT BACKGROUND KNOWLEDGE (use where applicable; do not contradict):\n${ragContext}\n`
    : "";

  return `You are an expert startup advisor for the Indian startup ecosystem. Analyze the following startup idea and return ONLY a valid JSON object — no markdown, no explanation, no prose before or after the JSON.${contextSection}
Startup Idea: ${req.idea}
Industry: ${industry}
Target Customer: ${targetCustomer}
Location: ${location}
Stage: ${stage}
Approximate Budget: ${budget}
Team Size: ${teamSize}

Return this exact JSON structure (all fields required, all values as strings or arrays of strings):

{
  "overview": "2-3 sentence executive summary of the startup",
  "problem": "The specific problem this startup solves",
  "targetCustomers": "Who the primary customers are and why they need this",
  "solution": "How the startup solves the problem",
  "revenueModel": "How the startup will make money (pricing model, channels)",
  "competitors": ["competitor or competitor category 1", "competitor or competitor category 2", "competitor or competitor category 3"],
  "differentiator": "What makes this startup different from existing alternatives",
  "risks": ["key risk 1", "key risk 2", "key risk 3", "key risk 4"]
}

JSON:`;
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest): Promise<NextResponse> {
  // Parse and validate request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  const input = body as Partial<GenerateRequest>;

  if (!input.idea || typeof input.idea !== "string" || input.idea.trim() === "") {
    return NextResponse.json(
      { error: "Field 'idea' is required and must be a non-empty string." },
      { status: 400 }
    );
  }

  const request: GenerateRequest = {
    idea: input.idea.trim(),
    industry: typeof input.industry === "string" ? input.industry : undefined,
    targetCustomer:
      typeof input.targetCustomer === "string" ? input.targetCustomer : undefined,
    location: typeof input.location === "string" ? input.location : undefined,
    stage: typeof input.stage === "string" ? input.stage : undefined,
    budget: typeof input.budget === "string" ? input.budget : undefined,
    teamSize:
      typeof input.teamSize === "number" ? input.teamSize : undefined,
  };

  // ── RAG: retrieve relevant knowledge ───────────────────────────────────
  const ragQuery = [
    request.idea,
    request.industry,
    request.stage,
    request.location,
  ]
    .filter(Boolean)
    .join(" ");

  const retrievedChunks = retrieve(ragQuery, 5);
  const ragContext = formatContext(retrievedChunks);
  const sources = [...new Set(retrievedChunks.map((c) => c.source))];

  if (retrievedChunks.length > 0) {
    console.log(
      `[api/generate] RAG retrieved ${retrievedChunks.length} chunks from: ${sources.join(", ")}`
    );
  }

  // ── Build prompt with context and call Granite ─────────────────────────
  const prompt = buildPrompt(request, ragContext);

  let raw: string;
  try {
    raw = await generate(prompt, {
      maxNewTokens: 900,
      temperature: 0,
      stopSequences: ["\n\n\n"],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/generate] Granite call failed:", message);
    return NextResponse.json(
      { error: `AI generation failed: ${message}` },
      { status: 502 }
    );
  }

  // ── Parse structured JSON from Granite response ─────────────────────────
  const parsed = parseGraniteJSON<BlueprintOverview>(raw);

  if (!parsed) {
    console.error("[api/generate] Failed to parse JSON from Granite response:", raw);
    return NextResponse.json(
      {
        error: "AI returned an unparseable response. Try again.",
        raw,
      },
      { status: 502 }
    );
  }

  // Validate required fields
  const required: (keyof BlueprintOverview)[] = [
    "overview",
    "problem",
    "targetCustomers",
    "solution",
    "revenueModel",
    "competitors",
    "differentiator",
    "risks",
  ];

  for (const field of required) {
    if (!(field in parsed)) {
      console.error(`[api/generate] Missing field '${field}' in parsed response`);
      return NextResponse.json(
        { error: `AI response missing required field: ${field}`, raw },
        { status: 502 }
      );
    }
  }

  // Attach source filenames to the response
  parsed.sources = sources.length > 0 ? sources : undefined;

  return NextResponse.json(parsed, { status: 200 });
}

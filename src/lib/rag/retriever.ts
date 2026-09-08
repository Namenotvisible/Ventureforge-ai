/**
 * src/lib/rag/retriever.ts
 *
 * Keyword-cosine retrieval over the in-memory TF index built by loader.ts.
 *
 * Similarity = cosine(queryTF, chunkTF) computed on the union of vocabulary
 * shared between query and chunk. No external dependencies or API calls.
 *
 * Server-side only.
 */

import { loadKnowledgeBase, buildTF, tokenise, type Chunk } from "./loader";

// ---------------------------------------------------------------------------
// Cosine similarity between two TF maps
// ---------------------------------------------------------------------------
function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const [k, va] of a) {
    const vb = b.get(k) ?? 0;
    dot += va * vb;
    normA += va * va;
  }
  for (const [, vb] of b) {
    normB += vb * vb;
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface RetrievedChunk {
  text: string;
  source: string;
  score: number;
}

/**
 * Retrieve the top-k most relevant chunks for a query string.
 *
 * @param query   Natural-language query (e.g. the startup idea + industry)
 * @param topK    Number of chunks to return (default 5)
 * @param minScore Minimum cosine similarity to include (default 0.04)
 */
export function retrieve(
  query: string,
  topK = 5,
  minScore = 0.04
): RetrievedChunk[] {
  const index = loadKnowledgeBase();
  if (index.length === 0) return [];

  const queryTokens = tokenise(query);
  if (queryTokens.length === 0) return [];

  const queryTF = buildTF(queryTokens);

  const scored: Array<{ chunk: Chunk; score: number }> = index.map((chunk) => ({
    chunk,
    score: cosineSimilarity(queryTF, chunk.tf),
  }));

  return scored
    .filter((s) => s.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ chunk, score }) => ({
      text: chunk.text,
      source: chunk.source,
      score,
    }));
}

/**
 * Format retrieved chunks into a compact context block for injection into a
 * Granite prompt. Each chunk is prefixed with its source filename.
 */
export function formatContext(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return "";
  return chunks
    .map((c) => `[Source: ${c.source}]\n${c.text}`)
    .join("\n\n---\n\n");
}

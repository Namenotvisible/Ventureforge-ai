/**
 * src/lib/rag/loader.ts
 *
 * Loads knowledge files from src/knowledge/, splits them into overlapping
 * text chunks, builds a keyword-frequency vector for each chunk, and caches
 * the resulting index in module scope so it is only built once per server
 * process (not per request).
 *
 * No external dependencies required.
 * Server-side only.
 */

import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Chunk {
  text: string;
  source: string; // filename, e.g. "startup-schemes.md"
  /** Normalised TF term-frequency vector (word → frequency/totalWords) */
  tf: Map<string, number>;
}

// ---------------------------------------------------------------------------
// Text utilities
// ---------------------------------------------------------------------------

/** Tokenise a string into lowercase alpha-only words, removing stop words. */
const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","from","as","is","are","was","were","be","been","being","have",
  "has","had","do","does","did","will","would","could","should","may",
  "might","can","this","that","these","those","it","its","i","we","you",
  "he","she","they","their","our","your","my","not","no","so","if","also",
  "which","who","what","how","when","where","than","more","into","about",
  "up","out","over","after","under","only","even","then","such","any",
  "each","all","other","some","there","here","new","use","used","using",
]);

export function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/** Build a normalised TF map from tokens. */
export function buildTF(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const t of tokens) {
    freq.set(t, (freq.get(t) ?? 0) + 1);
  }
  const total = tokens.length || 1;
  for (const [k, v] of freq) {
    freq.set(k, v / total);
  }
  return freq;
}

// ---------------------------------------------------------------------------
// Chunker — paragraph-aware with a hard-character ceiling
// ---------------------------------------------------------------------------

const CHUNK_CHARS = 800;
const OVERLAP_CHARS = 150;

function splitIntoChunks(text: string): string[] {
  // Split on double newlines (paragraph boundaries)
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let buffer = "";

  for (const para of paragraphs) {
    if (buffer.length + para.length + 2 > CHUNK_CHARS && buffer.length > 0) {
      chunks.push(buffer.trim());
      // Keep last OVERLAP_CHARS of buffer for context continuity
      buffer = buffer.slice(-OVERLAP_CHARS) + "\n\n" + para;
    } else {
      buffer = buffer ? buffer + "\n\n" + para : para;
    }
  }
  if (buffer.trim()) chunks.push(buffer.trim());
  return chunks;
}

// ---------------------------------------------------------------------------
// Loader — module-scope singleton cache
// ---------------------------------------------------------------------------

let cachedIndex: Chunk[] | null = null;

export function loadKnowledgeBase(): Chunk[] {
  if (cachedIndex) return cachedIndex;

  const knowledgeDir = path.join(process.cwd(), "src", "knowledge");

  let files: string[];
  try {
    files = fs.readdirSync(knowledgeDir).filter((f) => f.endsWith(".md"));
  } catch {
    console.warn("[rag/loader] src/knowledge directory not found — RAG disabled.");
    cachedIndex = [];
    return cachedIndex;
  }

  const index: Chunk[] = [];

  for (const file of files) {
    const fullPath = path.join(knowledgeDir, file);
    const content = fs.readFileSync(fullPath, "utf-8");
    const chunks = splitIntoChunks(content);

    for (const text of chunks) {
      const tokens = tokenise(text);
      index.push({ text, source: file, tf: buildTF(tokens) });
    }
  }

  console.log(
    `[rag/loader] Loaded ${files.length} knowledge files → ${index.length} chunks.`
  );
  cachedIndex = index;
  return cachedIndex;
}

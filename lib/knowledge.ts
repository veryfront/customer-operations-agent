import type { RagSearchResult } from "veryfront/embedding";

import { store } from "../store.ts";

const MAX_KNOWLEDGE_QUERY_LENGTH = 500;

let indexing: Promise<void> | undefined;

async function ensureKnowledgeIndexed(): Promise<void> {
  indexing ??= store.indexContentDir().catch((error) => {
    indexing = undefined;
    throw error;
  });
  await indexing;
}

export function normalizeKnowledgeQuery(query: string): string {
  return query.replace(/\s+/g, " ").trim().slice(0, MAX_KNOWLEDGE_QUERY_LENGTH);
}

export function formatKnowledgeContext(results: RagSearchResult[]): string {
  return results
    .map((result) => `[${result.title}] (score: ${result.score.toFixed(2)})\n${result.text}`)
    .join("\n\n---\n\n");
}

export async function retrieveKnowledge(query: string): Promise<{
  query: string;
  matches: RagSearchResult[];
  context: string;
}> {
  const normalizedQuery = normalizeKnowledgeQuery(query);
  if (!normalizedQuery) return { query: "", matches: [], context: "" };

  await ensureKnowledgeIndexed();

  const matches = await store.search(normalizedQuery, { topK: 3 });

  return {
    query: normalizedQuery,
    matches,
    context: formatKnowledgeContext(matches),
  };
}

import type { RagSearchResult } from "veryfront/embedding";

import { store } from "../store.ts";

let indexing: Promise<void> | undefined;

async function ensureKnowledgeIndexed(): Promise<void> {
  indexing ??= store.indexContentDir();
  await indexing;
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
  await ensureKnowledgeIndexed();

  const matches = await store.search(query, { topK: 3 });

  return {
    query,
    matches,
    context: formatKnowledgeContext(matches),
  };
}

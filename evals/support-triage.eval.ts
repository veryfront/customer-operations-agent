import {
  datasets,
  evalAgent,
  type EvalAnswerGroundednessMetricOptions,
  metrics,
} from "veryfront/eval";

function textFromOutput(output: Record<string, unknown>): string {
  if (typeof output.text === "string") return output.text;
  return JSON.stringify(output);
}

function metadataStrings(
  metadata: Record<string, unknown>,
  key: string,
): string[] {
  const value = metadata[key];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string =>
    typeof item === "string" && item.trim() !== ""
  );
}

function includesTerm(value: string, term: string): boolean {
  return value.toLowerCase().includes(term.toLowerCase());
}

const groundingJudge: NonNullable<
  EvalAnswerGroundednessMetricOptions["judge"]
> = async ({
  output,
  metadata,
  evidence,
}) => {
  const answer = textFromOutput(output);
  const evidenceText = evidence.join("\n");
  const answerTerms = metadataStrings(metadata, "answerTerms");
  const groundingTerms = metadataStrings(metadata, "groundingTerms");
  const matchedAnswerTerms = answerTerms.filter((term) =>
    includesTerm(answer, term)
  );
  const supportedGroundingTerms = groundingTerms.filter((term) =>
    includesTerm(answer, term) && includesTerm(evidenceText, term)
  );
  const answerScore = answerTerms.length === 0
    ? 1
    : matchedAnswerTerms.length / answerTerms.length;
  const groundingScore = groundingTerms.length === 0
    ? 1
    : supportedGroundingTerms.length / groundingTerms.length;
  const score = Math.round((answerScore * 0.6 + groundingScore * 0.4) * 100) /
    100;

  return {
    score,
    pass: score >= 0.7,
    explanation:
      `Matched ${matchedAnswerTerms.length}/${answerTerms.length} answer terms and ${supportedGroundingTerms.length}/${groundingTerms.length} grounded evidence terms.`,
  };
};

export default evalAgent({
  id: "eval:support-triage",
  name: "Support triage quality",
  description:
    "Checks that the customer operations agent retrieves approved knowledge and produces grounded triage guidance.",
  target: "agent:support-agent",
  dataset: datasets.json("evals/datasets/support-triage.json"),
  metrics: [
    metrics.agent.calledTool("search_knowledge").gate(),
    metrics.agent.noFailedTools().gate(),
    metrics.knowledge.recallAtK({ k: 3 }).gate({ min: 0.75 }),
    metrics.knowledge.precisionAtK({ k: 3 }).soft({ min: 0.34 }),
    metrics.knowledge.mrr({ k: 3 }).soft({ min: 0.5 }),
    metrics.answer.groundedness({ judge: groundingJudge }).gate({ min: 0.7 }),
  ],
  tags: ["support", "knowledge", "regression"],
  metadata: {
    owner: "customer-operations",
    dataset: "support-triage",
  },
});

import {
  datasets,
  evalAgent,
  judges,
  metrics,
} from "veryfront/eval";

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
    metrics.answer.groundedness({
      judge: judges.llm.groundedness(),
    }).gate({ min: 0.8 }),
  ],
  tags: ["support", "knowledge", "regression"],
  metadata: {
    owner: "customer-operations",
    dataset: "support-triage",
  },
});

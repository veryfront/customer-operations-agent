import { step, workflow } from "veryfront/workflow";

type EscalationInput = {
  customer?: string;
  subject?: string;
  description: string;
  severity?: string;
};

function buildKnowledgeQuery(input: EscalationInput): string {
  return [input.subject, input.description, input.severity].filter(Boolean).join("\n");
}

export default workflow({
  id: "escalate-ticket",
  description: "Triage a customer issue and draft an escalation plan.",
  steps: ({ input }: { input: EscalationInput }) => [
    step("knowledge", {
      tool: "retrieveKnowledge",
      input: {
        query: buildKnowledgeQuery(input),
      },
    }),
    step("triage", {
      agent: "support-agent",
      input: ({ knowledge }) => ({
        task: "Triage this customer issue using the approved knowledge context and decide whether escalation is needed.",
        issue: input,
        approvedKnowledge: knowledge.context,
        knowledgeSources: knowledge.matches.map((match) => ({
          title: match.title,
          score: match.score,
        })),
      }),
    }),
    step("draft-escalation", {
      agent: "support-agent",
      input: ({ triage }) => ({
        task: "Draft the internal escalation summary with scope, evidence, owner, and next action.",
        triage,
      }),
    }),
  ],
});

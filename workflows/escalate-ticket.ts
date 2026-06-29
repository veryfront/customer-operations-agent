import { step, workflow } from "veryfront/workflow";

type EscalationInput = {
  customer?: string;
  subject?: string;
  description: string;
  severity?: string;
  priority?: string;
  source?: string;
};

function buildKnowledgeQuery(input: EscalationInput): string {
  return [input.subject, input.description, input.severity, input.priority].filter(Boolean).join("\n");
}

export default workflow({
  id: "escalate-ticket",
  description: "Triage a customer issue and draft an escalation plan.",
  steps: ({ input }: { input: EscalationInput }) => [
    step("knowledge", {
      tool: "search_knowledge",
      input: {
        query: buildKnowledgeQuery(input),
      },
    }),
    step("triage", {
      agent: "support-agent",
      input: ({ knowledge }) => ({
        task: "Triage this customer issue using approved project knowledge and decide whether escalation is needed.",
        issue: input,
        approvedKnowledge: knowledge,
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

import { step, workflow } from "veryfront/workflow";

type EscalationIssue = {
  customer?: string;
  subject?: string;
  description?: string;
  severity?: string;
  priority?: string;
  source?: string;
};

type EscalationInput = EscalationIssue & {
  payload?: unknown;
};

function isIssue(value: unknown): value is EscalationIssue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeEscalationInput(input: EscalationInput): EscalationIssue {
  return isIssue(input.payload) ? input.payload : input;
}

function buildKnowledgeQuery(input: EscalationIssue): string {
  const query = [input.subject, input.description, input.severity, input.priority, input.customer]
    .filter(isNonEmptyString)
    .join("\n");

  if (!query) {
    throw new Error("Escalation workflow requires at least one issue field to search project knowledge.");
  }

  return query;
}

export default workflow({
  id: "escalate-ticket",
  description: "Triage a customer issue and draft an escalation plan.",
  steps: ({ input }: { input: EscalationInput }) => {
    const issue = normalizeEscalationInput(input);

    return [
      step("knowledge", {
        tool: "search_knowledge",
        input: {
          query: buildKnowledgeQuery(issue),
        },
      }),
      step("triage", {
        agent: "customer-operations-agent",
        input: ({ knowledge }) => ({
          task: "Triage this customer issue using approved project knowledge and decide whether escalation is needed.",
          issue,
          approvedKnowledge: knowledge,
        }),
      }),
      step("draft-escalation", {
        agent: "customer-operations-agent",
        input: ({ triage }) => ({
          task: "Draft the internal escalation summary with scope, evidence, owner, and next action.",
          triage,
        }),
      }),
    ];
  },
});

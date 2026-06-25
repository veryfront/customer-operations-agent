import { step, workflow } from "veryfront/workflow";

export default workflow({
  id: "escalate-ticket",
  description: "Triage a customer issue and draft an escalation plan.",
  steps: ({ input }) => [
    step("knowledge", {
      tool: "retrieveKnowledge",
      input: {
        query: JSON.stringify(input),
      },
    }),
    step("triage", {
      agent: "support-agent",
      input: ({ knowledge }) => ({
        task: "Triage this customer issue using the approved knowledge context and decide whether escalation is needed.",
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

import { step, workflow } from "veryfront/workflow";

export default workflow({
  id: "escalate-ticket",
  description: "Triage a customer issue and draft an escalation plan.",
  steps: ({ input }) => [
    step("triage", {
      agent: "support-agent",
      input: {
        task: "Triage this customer issue, search approved knowledge if useful, and decide whether escalation is needed.",
        issue: input,
      },
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

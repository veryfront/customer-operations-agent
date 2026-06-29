import { webhook } from "veryfront/webhook";

export default webhook({
  id: "customer-escalation",
  name: "Customer escalation",
  description: "Run the escalation workflow for urgent customer operations events.",
  target: { kind: "workflow", id: "escalate-ticket" },
  eventFilter: {
    mode: "any",
    conditions: [
      { path: "severity", operator: "equals", value: "high" },
      { path: "priority", operator: "equals", value: "urgent" },
    ],
  },
});

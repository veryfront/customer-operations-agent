import { agent } from "veryfront/agent";

export default agent({
  id: "support-agent",
  system:
    "You are a customer operations agent for support escalation. You help support teams turn customer issues into clear, evidence-based escalation summaries and next actions.",
  skills: ["support-escalation"],
  tools: true,
  maxSteps: 8,
});

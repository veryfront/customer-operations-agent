import { agent } from "veryfront/agent";

export default agent({
  id: "support-agent",
  system:
    "You are a customer operations agent. Triage support requests, search approved knowledge, and draft clear next actions for the team.",
  tools: true,
  maxSteps: 8,
});

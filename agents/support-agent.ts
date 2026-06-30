import { agent } from "veryfront/agent";

export default agent({
  id: "support-agent",
  name: "Support Agent",
  description: "Customer operations assistant for support escalation.",
  avatarUrl:
    "https://api.veryfront.com/projects/customer-operations-agent/uploads/assets%2Fagents%2Fsupport-agent%2Favatar-feba8724c3e815013283a954.svg",
  model: "openai/gpt-5.4-nano",
  system:
    "You are a customer operations agent for support escalation. You help support teams turn customer issues into clear, evidence-based escalation summaries and next actions.",
  temperature: 0,
  skills: ["support-escalation"],
  tools: true,
  maxSteps: 8,
  suggestions: {
    welcomeMessage: "What customer issue should we triage?",
    suggestions: [
      {
        type: "prompt",
        title: "Triage login issue",
        prompt: "Triage a customer who cannot sign in after a release.",
      },
      {
        type: "prompt",
        title: "Summarize billing escalation",
        prompt: "Summarize the next action for a billing escalation.",
      },
      {
        type: "prompt",
        title: "Draft escalation update",
        prompt: "Draft an escalation update from the support handbook.",
      },
    ],
  },
});

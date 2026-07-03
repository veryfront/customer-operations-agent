import { agent } from "veryfront/agent";

export default agent({
  id: "support-agent",
  name: "Support Agent",
  avatarUrl: "/support-agent-avatar.svg?v=2",
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

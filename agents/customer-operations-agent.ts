import { agent } from "veryfront/agent";

export default agent({
  id: "customer-operations-agent",
  name: "Customer Operations Agent",
  description: "Customer operations assistant for support escalation.",
  avatarUrl: "/customer-operations-agent-avatar.svg",
  model: "openai/gpt-5.4-nano",
  system:
    "You are a customer operations agent for support escalation. You help support teams turn customer issues into clear, evidence-based escalation summaries and next actions.",
  temperature: 0,
  skills: ["support-escalation"],
  tools: {
    get_file: true,
    search_knowledge: true,
    outlook__get_email: true,
    outlook__list_emails: true,
    outlook__search_emails: true,
    outlook__send_email: true,
  },
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

import { agent } from "veryfront/agent";

// A second agent so the composed example's `useAgents()` switcher has more than
// one entry to switch between. Same shape as `support-agent`; different remit.
export default agent({
  id: "billing-agent",
  name: "Billing Agent",
  description: "Customer operations assistant for billing and renewals.",
  model: "openai/gpt-5.4-nano",
  system:
    "You are a customer operations agent for billing and renewals. You help support teams resolve payment failures, renewal questions, and invoice disputes with clear, evidence-based next actions.",
  temperature: 0,
  tools: true,
  maxSteps: 8,
  suggestions: {
    welcomeMessage: "What billing issue should we look at?",
    suggestions: [
      {
        type: "prompt",
        title: "Failed renewal payment",
        prompt: "A customer's renewal invoice failed payment but the workspace is still active. What next?",
      },
      {
        type: "prompt",
        title: "Explain an invoice",
        prompt: "Explain the line items on a customer's latest invoice.",
      },
      {
        type: "prompt",
        title: "Refund eligibility",
        prompt: "Draft a note on whether a downgrade mid-cycle is eligible for a refund.",
      },
    ],
  },
});

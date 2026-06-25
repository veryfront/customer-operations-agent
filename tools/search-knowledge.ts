import { defineSchema } from "veryfront/schemas";
import { tool } from "veryfront/tool";

const knowledgeBase = [
  {
    title: "Login troubleshooting",
    summary:
      "Check whether the user is in the right workspace, verify SSO status, ask for the last successful login time, and confirm whether password reset or SSO re-authentication resolves the issue.",
  },
  {
    title: "Billing escalation",
    summary:
      "Collect account ID, invoice number, billing email, current plan, requested change, and urgency before escalating to finance operations.",
  },
  {
    title: "Deployment incident triage",
    summary:
      "Confirm scope, recent releases, error messages, affected environments, rollback status, and whether deployment logs show a failed build or runtime error.",
  },
];

export default tool({
  id: "searchKnowledge",
  description: "Search approved customer operations knowledge.",
  inputSchema: defineSchema((v) =>
    v.object({
      query: v.string().describe("Customer issue or operation to search for"),
    })
  )(),
  execute: ({ query }) => {
    const normalizedQuery = query.toLowerCase();
    const matches = knowledgeBase.filter((entry) =>
      `${entry.title} ${entry.summary}`.toLowerCase().includes(normalizedQuery)
    );

    return {
      matches: matches.length > 0 ? matches : knowledgeBase,
    };
  },
});

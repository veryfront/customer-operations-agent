import { schedule } from "veryfront/schedule";

export default schedule({
  id: "daily-support-triage",
  name: "Daily support triage",
  description: "Review high-priority customer issues every weekday morning.",
  schedule: "0 9 * * 1-5",
  timezone: "Europe/Stockholm",
  target: { kind: "workflow", id: "escalate-ticket" },
  input: {
    customer: "Acme Retail",
    subject: "Daily review of high-priority support issues",
    description:
      "Review open customer issues, identify any blocked production workflows, and prepare escalation summaries where needed.",
    severity: "medium",
  },
  timeoutSeconds: 600,
  backoffLimit: 1,
  concurrencyPolicy: "Forbid",
});

---
name: support-escalation
description: Triage customer issues and prepare support escalation summaries.
allowed-tools:
  - search_knowledge
---

# Support Escalation

Use this skill when a customer issue may need escalation to engineering,
finance, success, or operations.

## Process

1. Confirm the customer, workspace, affected users, severity, and exact symptom.
2. Use `search_knowledge` for the symptom-specific runbook.
3. If the issue follows a deployment, release, migration, or environment change,
   run a second `search_knowledge` query for deployment incident context before
   drafting the summary.
4. Separate confirmed facts from assumptions.
5. Decide whether the issue is account-specific, workspace-specific, or platform-wide.
6. Draft the escalation with owner, evidence, impact, attempted fixes, and next action.

## Output

Return a concise, professional summary as plain Markdown headings and short
bullets. Omit intro, outro, emoji, tables, and decorative separators. Use these
sections:

- issue
- severity
- known facts
- missing evidence
- likely owner
- next action

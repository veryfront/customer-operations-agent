---
name: support-escalation
description: Triage customer issues and prepare support escalation summaries.
allowed-tools:
  - search_knowledge
---

# Support Escalation

Use this skill when a customer issue may need escalation to engineering,
finance, success, or operations.

This skill is guidance-only. Use the process below directly; do not call
executable skill scripts unless a future version explicitly lists one.

## Process

1. Confirm the customer, workspace, affected users, severity, and exact symptom.
2. Search approved knowledge before inventing an answer.
3. Separate confirmed facts from assumptions.
4. Decide whether the issue is account-specific, workspace-specific, or platform-wide.
5. Draft the escalation with owner, evidence, impact, attempted fixes, and next action.

## Output

Return a concise, professional summary. Start the final answer exactly with
`**Issue**` and nothing before it. Do not use emoji, markdown horizontal rules,
decorative separators, large tables, or progress narration. Use tools silently.
Include:

- issue
- severity
- known facts
- missing evidence
- likely owner
- next action

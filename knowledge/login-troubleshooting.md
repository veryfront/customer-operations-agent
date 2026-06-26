---
title: Login troubleshooting
description: Resolve sign-in, SSO, workspace, session, identity provider, and account access failures.
type: runbook
resource: customer-operations
source: customer-operations-agent
source_type: demo
tags:
  - login
  - sso
  - authentication
  - workspace
  - access
added: 2026-06-26
---

# Login troubleshooting

Use this when a customer cannot sign in, cannot complete SSO, or reports an account access failure.

## Triage checklist

- Confirm whether the issue affects one user, one workspace, or all users on the account.
- Verify that the user is signing in to the correct workspace.
- Ask for the last successful login time, identity provider, browser, and exact error message.
- Check whether password reset, SSO re-authentication, or clearing stale session cookies resolves the issue.
- If SSO changed recently, ask whether the identity provider metadata, callback URL, or user group mapping changed.

## Escalation signal

Escalate when multiple users are affected, SSO metadata recently changed, authentication logs show repeated failures, or the user is blocked from a production workflow.

## Output

Summarize scope, likely cause, missing evidence, customer-facing next step, and internal owner.

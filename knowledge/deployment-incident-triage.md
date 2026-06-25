# Deployment incident triage

Use this when a customer reports a production issue after a deployment, release, migration, or environment change.

## Triage checklist

- Confirm customer impact, affected environment, affected users, and first observed timestamp.
- Ask for exact error messages, request IDs, screenshots, or failing workflow names.
- Compare behavior before and after the latest release.
- Check deployment status, build logs, runtime logs, error rate, rollback status, and environment variables.
- Identify whether the issue is release-related, configuration-related, or isolated to customer data.

## Escalation signal

Escalate immediately when production users cannot complete critical workflows, error rates increased after a release, rollback is blocked, or multiple customers are affected.

## Output

Summarize scope, suspected release or configuration change, evidence, mitigation path, owner, and next action.

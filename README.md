# Customer Operations Agent

A [Veryfront](https://veryfront.com) template for a grounded customer operations agent. It triages
customer issues against approved runbook knowledge and drafts clear, evidence-based escalation
summaries — with a skill for the procedure, deterministic knowledge retrieval, and a workflow,
schedule, and webhook for unattended runs.

## Project layout

```
.
├── agents/
│   └── customer-operations-agent.ts    # the agent: model, skill, tools, suggestions
├── skills/
│   └── support-escalation/SKILL.md      # the triage + escalation procedure
├── knowledge/                           # approved runbooks the agent is grounded on
│   ├── login-troubleshooting.md
│   ├── billing-escalation.md
│   └── deployment-incident-triage.md
├── tools/
│   └── search-knowledge.ts              # grounded knowledge retrieval
├── evals/
│   ├── support-triage.eval.ts           # retrieval + grounding checks
│   └── datasets/support-triage.json
├── workflows/
│   └── escalate-ticket.ts               # knowledge → triage → draft escalation
├── schedules/
│   └── daily-support-triage.ts          # runs escalate-ticket every weekday morning
├── webhooks/
│   └── customer-escalation.ts           # runs escalate-ticket on urgent events
└── app/
    ├── page.tsx                         # chat UI
    ├── layout.tsx
    └── api/ag-ui/route.ts               # AG-UI route
```

## Prerequisites

- Node.js and npm.
- A [Veryfront](https://veryfront.com) account.

## Getting started

```bash
npm install
npx veryfront login   # stores your token in ~/.config/veryfront/token
npx veryfront push    # push project files for hosted workflow, schedule, and webhook runs
npm run dev           # serves the chat UI + agent runtime locally
```

Open the app and ask a support question that matches the included runbooks:

- `Users cannot sign in with SSO after yesterday's deployment. Production support is blocked.`
- `The customer's renewal invoice failed payment, but the workspace is still active.`

## Automate

A workflow, schedule, and webhook all target the same `escalate-ticket` workflow. Test each locally
with fixture input:

```bash
npm run workflow:run   # escalate-ticket workflow
npm run schedule:run   # daily-support-triage schedule
npm run webhook:run    # customer-escalation webhook
```

In Veryfront Cloud, deployment creates or updates the hosted schedule and webhook from these source
files.

## Evaluate

```bash
npm run eval
```

Evals check tool use, retrieval quality, and grounded answers against the runbooks each case should
use (`evals/support-triage.eval.ts`).

## Run it without cloning

[Use this template in Veryfront Studio](https://new.veryfront.com/?template=customer-operations-agent&agent=customer-operations-agent)
— creates a new project in the browser, connect your tools, turn on the schedule. No local setup.

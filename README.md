# Customer Operations Agent

Grounded customer operations agent with an escalation skill, deterministic tools, and approved runbook knowledge.

## Project overview

Veryfront Code organizes these primitives with clear source-tree conventions for agents, skills, knowledge, tools, app routes, evals, workflows, schedules, and webhooks.

```text
customer-operations-agent/
  agents/        # agent definitions
  skills/        # reusable agent instructions
  knowledge/     # approved OKF runbooks
  tools/         # deterministic tools
  app/           # chat UI and AG-UI route
  evals/         # retrieval and grounding checks
  workflows/     # repeatable escalation operations
  schedules/     # source-defined scheduled runs
  webhooks/      # source-defined event runs
```

## Prerequisites

- Node.js and npm.
- Model access for chat, evals, workflows, and triggers: run `npx veryfront login` or set `VERYFRONT_API_TOKEN`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `GOOGLE_API_KEY`.

## Getting started

Install dependencies:

```bash
npm install
```

Start the chat UI:

```bash
npm run dev -- --port 3010
```

Open `http://localhost:3010`.

## Try the agent

Ask support questions that match the included runbooks:

- `Users cannot sign in with SSO after yesterday's deployment. Production support is blocked.`
- `The customer's renewal invoice failed payment, but the workspace is still active.`
- `A migration shipped this morning and users now see errors in the onboarding workflow.`
- `One support manager cannot access the correct workspace after changing browsers.`

## Validate it

Start with structural checks. They build the project and discover routes, schedules, and webhooks without calling a model.

```bash
npm run check
```

Run the eval suite when model credentials are available. This checks tool use, retrieval quality, and grounded answers.

```bash
npm run verify:eval
```

Run the full local verification path when credentials are available.

```bash
npm run verify:agent
```

`verify:agent` chains the structural checks, eval suite, workflow check, schedule check, and webhook check.

Eval assertions include:

- `agent.calledTool("search_knowledge")`
- `agent.noFailedTools()`
- `knowledge.recallAtK`
- `knowledge.precisionAtK`
- `knowledge.mrr`
- `answer.groundedness`

Reports are written to timestamped folders under `.veryfront/evals/`. Each dataset row declares `metadata.expectedKnowledge`, so retrieval quality is measured against the runbooks the case should use.

Compare models with explicit baseline and candidate models.

```bash
npx veryfront eval support-triage \
  --baseline-model anthropic/claude-sonnet-4-6 \
  --candidate-model moonshotai/kimi-k2.6 \
  --candidate-model openai/gpt-5.4-nano \
  --json
```

The comparison report writes per-model results plus `comparison.json` and `comparison.md` in the timestamped report folder.

## Automate it

Test the workflow fixture.

```bash
npm run verify:workflow
```

This executes `escalate-ticket` with fixture input and checks that `support-agent` can draft scope, evidence, owner, and next action.

Discover and test the source-defined schedule.

```bash
npm run schedules
npm run verify:schedule
```

Discover and test the source-defined webhook.

```bash
npm run webhooks
npm run verify:webhook
```

The schedule and webhook both target the same `escalate-ticket` workflow. In Veryfront Cloud, deploy reconciliation creates or updates the hosted schedule and webhook from these source files.

## Deploy it

Deploy a preview environment.

```bash
npx veryfront deploy --env preview --force
```

Cloud deploys the same project files. The hosted workflow can run `escalate-ticket` and resolve `search_knowledge` against the `knowledge/` files in this repository.

## Extend it

Change the smallest file that owns the behavior:

- Change agent behavior in `agents/support-agent.ts`.
- Change the escalation process in `skills/support-escalation/SKILL.md`.
- Add approved runbooks in `knowledge/`.
- Add deterministic actions in `tools/`.
- Add eval coverage in `evals/datasets/support-triage.json`.
- Add repeatable operations in `workflows/`.
- Add automatic operations in `schedules/` and `webhooks/`.

Run `npm run verify:eval` before deploying or switching models.

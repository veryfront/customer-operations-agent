# Customer Operations Agent

Grounded customer operations agent built with Veryfront Code.

## Project overview

One source tree defines the agent, gives it an escalation skill, grounds it in OKF runbooks, exposes it through chat, verifies it with evals, automates escalation work, and deploys it to Veryfront Cloud.

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

A good response:

- Searches approved knowledge.
- Separates facts from assumptions.
- Names the likely owner.
- Recommends the next customer-safe action.

## Validate it

Run structural checks first. This does not call a model.

```bash
npm run check
```

Run the eval suite when model credentials are available.

```bash
npm run verify:eval
```

Run the full local path when credentials are available.

```bash
npm run verify:agent
```

`verify:agent` builds the project, discovers routes, schedules, and webhooks, runs the eval suite, runs the workflow fixture, and runs both source-defined triggers.

The eval suite checks tool use, retrieval quality, and groundedness:

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

Run the workflow fixture.

```bash
npm run verify:workflow
```

The workflow searches approved knowledge, asks `support-agent` to triage, and drafts scope, evidence, owner, and next action.

Run the source-defined schedule.

```bash
npm run schedules
npm run verify:schedule
```

Run the source-defined webhook.

```bash
npm run webhooks
npm run verify:webhook
```

Both triggers target the same `escalate-ticket` workflow. In Veryfront Cloud, deploy reconciliation creates or updates the hosted schedule and webhook from these source files.

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

Run the eval suite before deploying or switching models.

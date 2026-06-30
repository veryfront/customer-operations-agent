# Customer Operations Agent

Grounded customer operations agent built with Veryfront Code.

One source tree defines the agent, gives it an escalation skill, grounds it in OKF runbooks, exposes it through chat, verifies it with evals, automates escalation work, and deploys it to Veryfront Cloud.

## The agent is the project

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

Start with `agents/support-agent.ts`, then follow the project through `skills/`, `knowledge/`, `tools/`, `app/`, `evals/`, `workflows/`, `schedules/`, and `webhooks/`.

Local chat, evals, workflows, triggers, and Cloud runs all use the same `support-agent` definition and `search_knowledge` response shape.

OKF reference: [knowledge docs](https://veryfront.com/docs/cloud/knowledge) and [CLI ingestion guide](https://veryfront.com/docs/code/guides/cli-knowledge-ingestion).

## Run it locally

| Step | Command |
| --- | --- |
| Install dependencies | `npm install` |
| Start the chat UI | `npm run dev -- --port 3010` |
| Log in for live model calls | `npx veryfront login` |

Open `http://localhost:3010`.

You can also set `VERYFRONT_API_TOKEN`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `GOOGLE_API_KEY`.

## Talk to it

Try runbook-backed support prompts:

- `Users cannot sign in with SSO after yesterday's deployment. Production support is blocked.`
- `The customer's renewal invoice failed payment, but the workspace is still active.`
- `A migration shipped this morning and users now see errors in the onboarding workflow.`
- `One support manager cannot access the correct workspace after changing browsers.`

A good response searches approved knowledge, separates facts from assumptions, names the likely owner, and recommends the next customer-safe action.

## Verify it

| Goal | Command | Notes |
| --- | --- | --- |
| Structural checks | `npm run check` | Builds the project and discovers routes, schedules, and webhooks. Does not call a model. |
| Eval suite | `npm run verify:eval` | Requires model credentials. Checks tool use, retrieval, and grounded answers. |
| Full local path | `npm run verify:agent` | Runs build discovery, evals, the workflow fixture, schedule trigger, and webhook trigger. |

Eval assertions include `agent.calledTool("search_knowledge")`, `agent.noFailedTools()`, `knowledge.recallAtK`, `knowledge.precisionAtK`, `knowledge.mrr`, and `answer.groundedness`.

Reports are written to timestamped folders under `.veryfront/evals/`. Each dataset row declares `metadata.expectedKnowledge`, so retrieval quality is measured against the runbooks the case should use.

Compare models with explicit baseline and candidate models:

```bash
npx veryfront eval support-triage \
  --baseline-model anthropic/claude-sonnet-4-6 \
  --candidate-model moonshotai/kimi-k2.6 \
  --candidate-model openai/gpt-5.4-nano \
  --json
```

The comparison report writes per-model results plus `comparison.json` and `comparison.md` in the timestamped report folder.

## Automate it

| Goal | Command |
| --- | --- |
| Run the workflow fixture | `npm run verify:workflow` |
| Discover and run the schedule | `npm run schedules` then `npm run verify:schedule` |
| Discover and run the webhook | `npm run webhooks` then `npm run verify:webhook` |

The workflow searches approved knowledge, asks `support-agent` to triage, and drafts scope, evidence, owner, and next action.

Both triggers target the same `escalate-ticket` workflow. In Veryfront Cloud, deploy reconciliation creates or updates the hosted schedule and webhook from these source files.

## Deploy it

```bash
npx veryfront deploy --env preview --force
```

Cloud deploys the same project files. The hosted workflow can run `escalate-ticket` and resolve `search_knowledge` against the `knowledge/` files in this repository.

## Extend it

| Need | Edit |
| --- | --- |
| Change agent behavior | `agents/support-agent.ts` |
| Change the escalation process | `skills/support-escalation/SKILL.md` |
| Add approved runbooks | `knowledge/` |
| Add deterministic actions | `tools/` |
| Add eval coverage | `evals/datasets/support-triage.json` |
| Add repeatable operations | `workflows/` |
| Add automatic operations | `schedules/` and `webhooks/` |

Run the eval suite before deploying or switching models.

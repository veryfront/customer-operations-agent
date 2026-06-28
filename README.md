# Customer Operations Agent

A reproducible Veryfront Code example for a customer operations support agent.

## What's included

- Support agent with a streaming chat UI
- OKF project knowledge in `knowledge/`
- Source-controlled `search_knowledge` tool for local and Cloud runs
- `escalate-ticket` workflow for durable support escalation
- `support-escalation` skill for repeatable triage guidance
- Support triage eval suite for retrieval and grounded-answer quality
- AG-UI endpoint for agent chat
- `veryfront.config.ts` for project metadata
- Version-pinned Veryfront dependency for repeatable installs

## Structure

```
agents/support-agent.ts       Agent definition
knowledge/                    Approved customer operations knowledge
tools/search-knowledge.ts     Local search_knowledge parity tool
workflows/escalate-ticket.ts  Support escalation workflow
evals/
  support-triage.eval.ts      Agent retrieval and answer quality eval
  datasets/
    support-triage.json       Regression cases with expected knowledge
skills/
  support-escalation/
    SKILL.md                  Agent triage guidance
app/
  api/ag-ui/route.ts          AG-UI endpoint
  page.tsx                    Chat interface
veryfront.config.ts           Project configuration
```

## Knowledge

Source knowledge lives in `knowledge/` as Markdown with OKF frontmatter.

`tools/search-knowledge.ts` registers the standard `search_knowledge` tool with
`createSearchKnowledgeTool()`. Local chat, local workflows, and Cloud workflow
runs use the same tool name and response shape. The tool reads the
source-controlled OKF Markdown files directly; it does not build an embedding
index or re-index on chat requests.

For this demo, keep knowledge source-controlled. Do not run
`veryfront knowledge ingest` unless you are intentionally moving the project to
hosted platform knowledge. Mixing ingested copies with the source files can
return duplicate results.

## Run locally

```bash
npm install
veryfront routes
npm run build
npm run dev -- --port 3010
```

Open `http://localhost:3010`.

To call the agent route with a live model, run `veryfront login` or set one of
`VERYFRONT_API_TOKEN`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or
`GOOGLE_API_KEY`.

The app can load, build, and expose the AG-UI route without credentials. Use
the workflow and eval commands below to verify agent behavior. A live agent
response requires model credentials.

## Run the workflow

Run `veryfront login` first, or set `VERYFRONT_API_TOKEN` in the environment.

```bash
veryfront workflow run escalate-ticket \
  --input '{"customer":"Acme Retail","description":"Users cannot log in with SSO after the latest deployment","severity":"high"}'
```

The workflow searches approved project knowledge with `search_knowledge`, loads
the `support-escalation` skill, and produces an escalation summary with scope,
evidence, owner, and next action.

## Run evals

The eval suite measures whether the agent retrieves the right knowledge and
keeps its triage answer grounded in that evidence.

This repo pins `veryfront@0.1.967`.

```bash
veryfront eval support-triage --json
```

By default, the report is written to a timestamped folder under
`.veryfront/evals/`, for example
`.veryfront/evals/20260628_140654566-support-triage/`. Use `--report-dir` only
when CI needs a deterministic output path.

The suite checks:

- `agent.calledTool("search_knowledge")`
- `agent.noFailedTools()`
- `knowledge.recallAtK`
- `knowledge.precisionAtK`
- `knowledge.mrr`
- `answer.groundedness`

Each dataset row declares `metadata.expectedKnowledge`, so retrieval quality is
measured against the specific runbooks the case should use.

To compare a strong baseline with cheaper candidate models, keep the baseline
explicit and pass candidates as repeatable flags. The baseline is the reference
model for deltas; candidates are the set of alternatives to test.

```bash
veryfront eval support-triage \
  --baseline-model anthropic/claude-sonnet-4-6 \
  --candidate-model moonshotai/kimi-k2.6 \
  --json
```

The comparison report writes per-model results plus `comparison.json` and
`comparison.md` in the timestamped report folder, with `baselineModel` and
`candidateModels` kept separate from the per-model summary list. If any
evaluated model has gate failures, the command exits nonzero and the report
explains whether to keep the baseline or promote a candidate.

When the eval runs through Veryfront Cloud, the comparison report also includes
gateway-sourced input/output tokens, billable tokens, provider cost, Veryfront
charge, credits, and cost source. Local/direct-provider runs keep cost as
`not measured` unless a gateway supplies billing metadata.

## Deploy

```bash
veryfront deploy --env preview --force
```

Cloud deploys the same project files. The hosted workflow can run
`escalate-ticket` and resolve `search_knowledge` against the `knowledge/` files
in this repository.

# Customer Operations Agent

A reproducible Veryfront Code example for a customer operations support agent.

## What's included

- Support agent with a streaming chat UI
- Project knowledge in `knowledge/` retrieved with `projectKnowledge()`
- Explicit local knowledge indexing with `npm run index:knowledge`
- `escalate-ticket` workflow for durable support escalation
- `support-escalation` skill for repeatable triage guidance
- AG-UI endpoint for agent chat
- `veryfront.config.ts` for app-router project metadata
- Version-pinned Veryfront dependency for repeatable installs

## Structure

```
agents/support-agent.ts       Agent definition
knowledge/                    Approved customer operations knowledge
scripts/index-knowledge.mjs   Local knowledge indexing script
tools/retrieve-knowledge.ts   Workflow retrieval bridge
workflows/escalate-ticket.ts  Support escalation workflow
skills/
  support-escalation/
    SKILL.md                  Agent triage guidance
app/
  api/ag-ui/route.ts          AG-UI endpoint
  page.tsx                    Chat interface
veryfront.config.ts           Project configuration
```

## Run locally

```bash
npm install
npm run index:knowledge
npm run build -- --ssg
npm run dev -- --port 3010
```

Open `http://localhost:3010`.

After changing files in `knowledge/`, run `npm run index:knowledge` again.
The local index is generated under `data/` and is intentionally ignored by git.

To call the agent route with a live model, run `veryfront login` or set one of
`VERYFRONT_API_TOKEN`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or
`GOOGLE_API_KEY`.

The app can load, build, and expose the AG-UI route without credentials. A live
agent response requires model credentials.

## Run the workflow

```bash
VERYFRONT_API_TOKEN="$(cat ~/.config/veryfront/token)" \
veryfront workflow run escalate-ticket \
  --input '{"customer":"Acme Retail","description":"Users cannot log in with SSO after the latest deployment","severity":"high"}'
```

The workflow retrieves approved project knowledge first, loads the
`support-escalation` skill, and produces an escalation summary with scope,
evidence, owner, and next action.

## Deploy

```bash
veryfront knowledge ingest --path knowledge --all --recursive
veryfront deploy --env preview --force
```

The deployed app retrieves from Veryfront Cloud's shared project knowledge
backend. Knowledge ingestion is an explicit deploy/setup step; chat requests
retrieve from the prepared backend and do not re-index source files.

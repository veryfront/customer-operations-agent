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

## Knowledge ingestion

Knowledge ingestion is an explicit setup and deploy step in this demo. The app
does not scan or re-index source files during chat requests.

- Source knowledge lives in `knowledge/`.
- Local indexing runs with `npm run index:knowledge`. It reads `knowledge/` and
  writes a local index under `data/`, which is ignored by git.
- Cloud indexing runs with
  `veryfront knowledge ingest --path knowledge --all --recursive`. It stores the
  same project knowledge in Veryfront Cloud for the deployed agent.
- Runtime retrieval happens through `projectKnowledge().retrieve(...)` in
  `app/api/ag-ui/route.ts` and `tools/retrieve-knowledge.ts`. Those calls read
  from the prepared local index or Cloud backend; they do not perform ingestion.

Run ingestion once during setup, and again whenever files in `knowledge/`
change. If ingestion is skipped, the agent can still receive chat requests, but
it will not have the approved customer operations knowledge available for
retrieval.

## Run locally

```bash
npm install
npm run index:knowledge
npm run build -- --ssg
npm run dev -- --port 3010
```

Open `http://localhost:3010`.

Run `npm run index:knowledge` again after changing files in `knowledge/`.

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
backend. Run `veryfront knowledge ingest` during setup and after each knowledge
change before relying on the deployed agent.

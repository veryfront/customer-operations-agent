# Customer Operations Agent

A reproducible Veryfront Code example for a customer operations support agent.

## What's included

- Support agent with a streaming chat UI
- Deterministic `searchKnowledge` tool for approved support knowledge
- `escalate-ticket` workflow for durable support escalation
- `support-escalation` skill for repeatable triage guidance
- AG-UI endpoint for agent chat
- `veryfront.config.ts` for app-router project metadata
- Version-pinned Veryfront dependency for repeatable installs

## Structure

```
agents/support-agent.ts       Agent definition
tools/search-knowledge.ts     Knowledge search tool
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
npm run build -- --ssg
npm run dev -- --port 3010
```

Open `http://localhost:3010`.

To call the agent route with a live model, run `veryfront login` or set one of
`VERYFRONT_API_TOKEN`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or
`GOOGLE_API_KEY`.

The app can load, build, and expose the AG-UI route without credentials. A live
agent response requires model credentials.

## Run the workflow

```bash
veryfront workflow run escalate-ticket \
  --input '{"customer":"Acme Retail","issue":"Users cannot log in with SSO after the latest deployment","severity":"high"}'
```

The workflow should load the `support-escalation` skill, call the
`searchKnowledge` tool when useful, and produce an escalation summary with
scope, evidence, owner, and next action.

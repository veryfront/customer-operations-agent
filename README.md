# Customer Operations Agent

A reproducible Veryfront Code example for a customer operations support agent.

## What's included

- Support agent with a streaming chat UI
- OKF project knowledge in `knowledge/`
- Local `search_knowledge` tool with the same contract as Studio/Cloud
- `escalate-ticket` workflow for durable support escalation
- `support-escalation` skill for repeatable triage guidance
- AG-UI endpoint for agent chat
- `veryfront.config.ts` for project metadata
- Version-pinned Veryfront dependency for repeatable installs

## Structure

```
agents/support-agent.ts       Agent definition
knowledge/                    Approved customer operations knowledge
tools/search-knowledge.ts     Local search_knowledge parity tool
workflows/escalate-ticket.ts  Support escalation workflow
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
`createSearchKnowledgeTool()`. Local chat and workflows use the same tool name
and response shape as Studio/Cloud. The local tool reads source-controlled OKF
frontmatter directly; it does not build an embedding index or re-index on chat
requests.

In hosted projects, Studio/Cloud can also provide `search_knowledge` over
platform project knowledge. Keep the local tool when knowledge should travel
with the codebase and workflows should be reproducible locally. Omit
`tools/search-knowledge.ts` when the hosted platform knowledge backend should
own the tool name.

Cloud knowledge ingestion is an optional deploy/setup step for the hosted
platform knowledge backend:

```bash
veryfront knowledge ingest --path knowledge --all --recursive
```

It is not required for the source-controlled local tool above.

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

Run `veryfront login` first, or set `VERYFRONT_API_TOKEN` in the environment.

```bash
veryfront workflow run escalate-ticket \
  --input '{"customer":"Acme Retail","description":"Users cannot log in with SSO after the latest deployment","severity":"high"}'
```

The workflow searches approved project knowledge with `search_knowledge`, loads
the `support-escalation` skill, and produces an escalation summary with scope,
evidence, owner, and next action.

## Deploy

```bash
veryfront deploy --env preview --force
```

If the deployment should use hosted platform knowledge instead of the
source-controlled local tool, remove `tools/search-knowledge.ts` and ingest the
knowledge source during setup:

```bash
veryfront knowledge ingest --path knowledge --all --recursive
```

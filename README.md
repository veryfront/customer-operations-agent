# Customer Operations Agent

A reproducible Veryfront Code example for a customer operations support agent.

## What's included

- Support agent with a streaming chat UI
- Deterministic `searchKnowledge` tool for approved support knowledge
- AG-UI endpoint for agent chat
- Version-pinned Veryfront dependency for repeatable installs

## Structure

```
agents/support-agent.ts      Agent definition
tools/search-knowledge.ts    Knowledge search tool
app/
  api/ag-ui/route.ts          AG-UI endpoint
  page.tsx                   Chat interface
```

## Run locally

```bash
npm install
npm run build
npm run dev -- --port 3010
```

Open `http://localhost:3010`.

To call the agent route with a live model, run `veryfront login` or set one of
`VERYFRONT_API_TOKEN`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or
`GOOGLE_API_KEY`.

The app can load, build, and expose the AG-UI route without credentials. A live
agent response requires model credentials.

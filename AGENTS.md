# Veryfront project guide

This is a Veryfront project. Veryfront is a framework for building and running AI apps and agents in TypeScript and React.

## Project conventions

Use these folders as runtime boundaries. Create folders only when the feature needs them.

- `app/`: pages, layouts, route handlers, and user-facing API routes.
- `agents/`: model reasoning and tool use.
- `knowledge/`: approved project knowledge with OKF frontmatter for `search_knowledge`.
- `tools/`: deterministic callable capabilities, including the local `search_knowledge` tool.
- `workflows/`: multi-step coordination.
- `skills/`: reusable agent instructions in `skills/<id>/SKILL.md`.
- `veryfront.config.ts`: project metadata.

## Developer loop

1. Start local development with `veryfront dev`.
2. Generate new files with `veryfront generate <type> <name>`.
3. Inspect current CLI commands with `veryfront schema --json`.
4. Verify discovered routes with `veryfront routes`.
5. Run `npm run build` before shipping the example.
6. Run the workflow or eval command before shipping agent behavior changes.
7. Use https://veryfront.com/docs when local files and CLI schema do not answer a Veryfront API or convention question.

## Coding agent loop

Prefer Veryfront scaffold tools over hand-written boilerplate. Keep app routes,
agents, knowledge, tools, workflows, and skills in their expected folders. Use
the `search_knowledge` tool contract for project knowledge instead of inventing
project-specific retrieval tools.

## Inference

Agent routes need model access. Use `npx veryfront login` for the Veryfront Cloud gateway. Use custom provider credentials only with matching model settings.

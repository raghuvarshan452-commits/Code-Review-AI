# ReviewBot AI

An AI-powered code review assistant that analyzes GitHub pull requests for security vulnerabilities, bugs, and performance issues — with auto-fix suggestions and one-click posting to GitHub.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port from workflow)
- `pnpm --filter @workspace/reviewbot run dev` — run the frontend (port from workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Wouter routing, TanStack Query
- API: Express 5
- AI: Anthropic Claude (claude-sonnet-4-5) via @anthropic-ai/sdk — streaming responses
- GitHub: REST API (personal access token auth)
- Syntax highlighting: react-syntax-highlighter
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod validation schemas
- `artifacts/reviewbot/src/` — React frontend
- `artifacts/api-server/src/routes/reviews.ts` — fetch-pr, review (streaming), post-comments routes

## Architecture decisions

- Review endpoint streams raw Claude output as text/plain; frontend buffers and parses as JSON array
- No database — review history is stored in localStorage (max 20 items)
- All GitHub API calls go through the Express server to keep the token server-side
- Single batched PR review is posted to GitHub (one review with all comments concatenated)
- The Anthropic SDK streams via `messages.stream()` and we forward chunks directly to the response

## Product

- Paste a GitHub PR URL → fetch metadata and file diffs
- Claude analyzes the diff for security, bugs, performance, and code quality issues
- Each issue shows severity badge, category, CWE tag (if security), issue description, explanation, and auto-fix code
- Review score out of 100 with circular progress indicator
- Filter issues by severity or category
- Copy fix to clipboard or post individual/all comments to the actual GitHub PR
- Review history in left sidebar (persisted to localStorage)

## User preferences

- Light theme only — warm off-white background (#FAFAF8), deep forest green primary (#1A6B3C)
- No dark mode
- Professional and dense, like Linear/Notion — not a terminal aesthetic

## Required secrets

- `ANTHROPIC_API_KEY` — Anthropic Claude API key
- `GITHUB_TOKEN` — GitHub Personal Access Token (repo scope for private repos, public_repo for public)

## Gotchas

- Review endpoint returns streaming text/plain — use raw fetch() + ReadableStream reader, not the generated useReviewPR hook
- `import.meta.env.BASE_URL` must be used as prefix for all API calls in the frontend
- Always restart the API server workflow after backend changes

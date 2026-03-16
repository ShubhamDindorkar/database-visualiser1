# Database Visualiser — Architecture Summary

This document summarizes how the backend and frontend are implemented, how they connect, and how MySQL is integrated in this repository.

## High-level Overview

- Framework: Next.js (App Router) with server `route.ts` handlers under `src/app/api/*`.
- Frontend: React components and pages under `src/app/` and `src/components/`.
- Backend responsibilities: database operations, chat/LLM proxy, auth checks, and server-side utilities in `src/lib/*`.

---

## Backend

- Routes: Server route handlers live under `src/app/api/*` (examples:
  - [src/app/api/query/execute/route.ts](src/app/api/query/execute/route.ts)
  - [src/app/api/init-db/route.ts](src/app/api/init-db/route.ts)
  - [src/app/api/test-mysql/route.ts](src/app/api/test-mysql/route.ts)
  - [src/app/api/chat/openrouter/route.ts](src/app/api/chat/openrouter/route.ts)
)

- Core helper modules live in `src/lib/` and are called by the route handlers:
  - `src/lib/mysql.ts` — MySQL helper (connection/pool and query helpers)
  - `src/lib/openrouter.ts` — LLM/OpenRouter integration
  - `src/lib/firebase.ts`, `src/lib/auth.ts`, `src/lib/auth-helper.ts` — authentication helpers
  - `src/lib/api-client.ts` — frontend HTTP wrapper that calls the server routes
  - `src/lib/cache-config.ts`, `src/lib/cache-headers.ts` — caching utilities
  - `src/lib/performance-monitoring.ts` — instrumentation and performance reporting

- Server responsibilities:
  - Validate requests and (where applicable) verify auth tokens via Firebase helpers
  - Run SQL statements, create/drop/list databases and tables, and return results
  - Proxy or orchestrate calls to external services (OpenRouter for LLM)
  - Return standardized JSON responses consumed by the frontend

---

## Frontend

- Pages live under `src/app/` using App Router conventions (server/client components as appropriate). Key pages include:
  - [src/app/page.tsx](src/app/page.tsx)
  - [src/app/dashboard/page.tsx](src/app/dashboard/page.tsx)
  - [src/app/login/page.tsx](src/app/login/page.tsx)
  - [src/app/terminal-mode/page.tsx](src/app/terminal-mode/page.tsx)

- UI components are organized in `src/components/`:
  - `src/components/database/*` — modals and panels to create databases/tables and manage data
  - `src/components/layout/*` — `Navbar`, `Sidebar`, `Terminal`, `Settings`
  - `src/components/chatbot/SQLChatbot.tsx` — chat UI that talks to the chat API
  - `src/components/auth/*` — `GitHubLoginButton`, `GoogleLoginButton`

- Client-side hooks and data flow:
  - `src/hooks/useAuth.ts` manages auth state on the client and exposes the current user/token
  - `src/hooks/useWorkflowLayouts.ts` manages UI workflow/layout-specific state
  - The frontend calls `src/lib/api-client.ts` to interact with `src/app/api/*` routes; responses are rendered in components such as `QueryResultsPanel.tsx` and visual graph components like `TableNode.tsx`.

---

## How MySQL is connected (detailed)

Location: [src/lib/mysql.ts](src/lib/mysql.ts)

Typical responsibilities of this module (as used across the repo):

- Read connection configuration from environment variables, e.g.:
  - `MYSQL_HOST` (or `DB_HOST`)
  - `MYSQL_PORT` (or `DB_PORT`)
  - `MYSQL_USER` (or `DB_USER`)
  - `MYSQL_PASSWORD` (or `DB_PASSWORD`)
  - `MYSQL_DATABASE` (optional default database)

- Create and export a connection pool (preferred) or a singleton connection to avoid reconnect overhead in serverless contexts.
  - The helper exposes functions such as `query(sql, params)` and `execute(sql, params)` that return rows/results or throw errors.
  - Route handlers import these helper functions and call them to run SQL statements, e.g., creating tables, inserting/updating/deleting rows, and SELECT queries.

- Error handling and resource cleanup:
  - The helper should return or throw errors in a consistent format for route handlers to convert into HTTP responses.
  - When used in serverless deployments (Vercel, etc.), the module should reuse a pool or global client so connections are not recreated on every invocation.

- Where it's used:
  - `src/app/api/init-db/route.ts` — calls the helper to run schema initialization SQL
  - `src/app/api/database/*` and `src/app/api/table/*` — create/drop/list operations for databases and tables
  - `src/app/api/query/execute/route.ts` — executes user-submitted SQL and returns results
  - `src/app/api/test-mysql/route.ts` — verifies that a connection can be established

Practical notes (check `src/lib/mysql.ts` for exact implementation):
- Ensure the helper uses a connection pool or a lazily-initialized singleton connection for serverless performance.
- Secure credentials using environment variables and do not commit them to source control.
- Sanitize and validate any SQL coming from users; consider parameterized queries and strict privileges for the DB user.

---

## Auth & external services

- Firebase is used for authentication; Firebase initialization and config are in `src/lib/firebase.ts`.
- Auth flows are implemented with provider buttons in `src/components/auth/*` and client state in `src/hooks/useAuth.ts`.
- OpenRouter (LLM) is integrated via `src/lib/openrouter.ts` and a chat server route at `src/app/api/chat/openrouter/route.ts`.

---

## Data flow (end-to-end example)

1. User logs in via provider button; `useAuth` obtains a session/token.
2. User executes a SQL query in the UI; the UI calls `src/lib/api-client.ts`.
3. `api-client.ts` POSTs to `/api/query/execute` (implemented in `src/app/api/query/execute/route.ts`).
4. The route handler verifies auth (if required), calls `src/lib/mysql.ts` to run the query, and returns JSON containing rows and metadata.
5. The frontend `QueryResultsPanel.tsx` receives the response and renders a table or error message.

---

## Important files (quick map)

- [src/lib/mysql.ts](src/lib/mysql.ts) — MySQL helper (connection + query functions)
- [src/lib/api-client.ts](src/lib/api-client.ts) — frontend HTTP wrapper
- [src/lib/firebase.ts](src/lib/firebase.ts) — Firebase config
- [src/app/api/query/execute/route.ts](src/app/api/query/execute/route.ts) — Run SQL queries
- [src/app/api/init-db/route.ts](src/app/api/init-db/route.ts) — DB init
- [src/app/api/chat/openrouter/route.ts](src/app/api/chat/openrouter/route.ts) — Chat/LLM proxy
- `src/components/database/*` — DB UI and editors
- `src/components/chatbot/SQLChatbot.tsx` — Chat UI

---

If you want this exported into a different path or a different filename, or if you want me to include the exact code snippets from `src/lib/mysql.ts` (I can open and paste the exact implementation), tell me which you prefer and I will update the file accordingly.

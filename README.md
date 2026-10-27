# MandiBuddy

Multi-tenant ERP for arhtiyas (commission agents) in Indian APMC mandis — arrival, stock sale,
billing, payments, ledgers and crate tracking.

## Stack

| Part | Tech |
|---|---|
| `client/` | React + Vite + TypeScript, plain CSS · Vitest + React Testing Library · Playwright |
| `server/` | Node.js + Express 5 + TypeScript + Prisma 7 + PostgreSQL · Zod · Vitest + Supertest |
| `shared/` | Pure TS used by both sides (money helpers; later the sale calculation) |
| Local DB | Docker Compose: Postgres 17 on host port **5433**, databases `mandibuddy_dev` + `mandibuddy_test` |
| CI | GitHub Actions — lint, test, build |

Multi-tenant from day one: every table carries `tenant_id`, every query is tenant-scoped.

## Status

- [x] Client boilerplate (Vite + React + TS, Vitest, oxlint)
- [ ] Homepage
- [x] Sign in / Sign up pages (mock: `abc` / `abc` checked in the browser, sign-up saves nothing — Q6)
- [x] Server boilerplate (Express + Prisma, mock sign-in API: `POST /api/auth/sign-in`, `GET /api/auth/me`)
- [ ] Supplier Master

## Run it

Needs Node 24+ and Docker Desktop. All commands from the repo root.

```
npm install                        # all workspaces; also generates the Prisma client
copy server\.env.example server\.env   # first time only
npm run db:up                      # start Postgres (Docker)
npm run db:migrate                 # apply migrations to mandibuddy_dev
npm run db:seed                    # WIPES dev data, creates user abc / abc
npm run dev                        # API http://localhost:4000 + web http://localhost:5173
npm test                           # shared + server (uses mandibuddy_test) + client
npm run lint
npm run typecheck
```

Project rules and decisions for contributors (and Claude Code) are in [CLAUDE.md](CLAUDE.md).

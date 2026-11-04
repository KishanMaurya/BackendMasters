# BackendMasters

**Learn. Build. Design. Scale.** A premium engineering knowledge platform at [backendmasters.in](https://backendmasters.in).

| Path              | What it is                                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| `apps/web`        | Next.js 16 (App Router, Tailwind 4, shadcn/ui), deployed to Vercel                                                |
| `apps/api`        | NestJS 12 REST API with Swagger, deployed to a Node host                                                          |
| `packages/shared` | Types shared by both apps                                                                                         |
| `supabase`        | Supabase project config and migrations                                                                            |
| `docs`            | [Architecture](docs/ARCHITECTURE.md), [design system](docs/DESIGN_SYSTEM.md), [plan](docs/IMPLEMENTATION_PLAN.md) |
| `TASKS.md`        | Phase checklist                                                                                                   |

## Getting started

Requires Node 22.12 or newer. Docker is only needed for a local Supabase.

```bash
npm install
```

```bash
cp apps/api/.env.example apps/api/.env
```

```bash
cp apps/web/.env.example apps/web/.env.local
```

```bash
npm run dev
```

- Web: http://localhost:3000
- API health: http://localhost:4000/api/v1/health
- API docs: http://localhost:4000/api/docs

The API runs without Supabase credentials in development; the health endpoint reports `not_configured`. In production it refuses to start without them.

## Commands

| Command            | Does                                  |
| ------------------ | ------------------------------------- |
| `npm run dev`      | Run web and API                       |
| `npm run check`    | Typecheck, lint, unit tests and build |
| `npm run test:e2e` | API integration tests                 |
| `npm run format`   | Format with Prettier                  |
| `npm run db:start` | Start local Supabase (Docker)         |

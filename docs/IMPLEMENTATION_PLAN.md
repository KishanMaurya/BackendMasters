# BackendMasters — Implementation Plan

## Repository inspection (2026-11-04)

- `~/Developer/Projects` is not a git repository and held no BackendMasters code, so this is a new project at `backendmasters/`. No existing code was changed.
- Related projects, not modified: `dsa-store` (Next.js PDF store), `interview-pdfs` (Markdown interview books with tested code), `dsa-clips` (video).
- Toolchain: Node 22.23, npm 10.9, Docker 29. pnpm and the Supabase CLI aren't installed globally; the Supabase CLI runs through a dev dependency.

## Versions chosen

Next 16 · React 19 · NestJS 12 · Tailwind 4 · shadcn 4 · TypeScript 6.0 (see D2 in `ARCHITECTURE.md`) · Turborepo 2 · Vitest 5 (Vitest 4 crashes npm 10's dependency resolver in this workspace).

## Phases

Each phase ends with: run the app, typecheck, lint, tests, fix errors, summarize. Checklist in `TASKS.md`.

| Phase                   | Output                                                                               | Done when                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| **1. Foundation**       | Monorepo, Next.js, NestJS, Tailwind tokens, Supabase folder and client, env examples | Both apps run and all checks pass                                                            |
| **2. Design and shell** | Theme, nav, footer, homepage, category pages, illustration primitives, hero          | All public shells responsive in both themes, passing the reduced-motion check                |
| **3. Data and API**     | Schema, RLS, seed, article/category/tag modules, frontend API client                 | RLS tests prove anonymous users can't read drafts or write anything                          |
| **4. Reading**          | Listing, detail, Markdown, Shiki, Mermaid, TOC, progress                             | A real article renders every required element                                                |
| **5. Admin**            | Auth, guard, dashboard, CRUD, uploads, publish workflow, on-demand revalidation      | Publishing updates the live page in seconds; non-admins are refused at both API and database |
| **6. Learning modules** | DSA, LLD, HLD, AWS, Observability, interview bank, interactive explainers            | Filters work; each module has real sample content                                            |
| **7. Launch**           | Search, SEO, sitemap, structured data, full test pass, performance, deployment       | Web Vitals targets met; production deployed at backendmasters.in                             |

## What's in Phase 1, and what isn't

**In:** workspace tooling; `apps/web` with design tokens and shadcn wired up; `apps/api` with validated config, Swagger, validation, response envelope, error filter, security headers, logging and a health endpoint; `packages/shared`; `supabase/` project config; `.env.example` files; tests.

**Out, on purpose:** homepage, navigation and theme switcher (Phase 2), database tables (Phase 3), content routes (Phase 2+). The web root is a small placeholder that proves tokens, fonts, shadcn, shared types and the API connection all work.

## Open questions for you

None of these block the current phase.

1. **Reader accounts:** sign-ups are off, since the only login specified is for admins. The `bookmarks` table and its rules stay in place, so reader accounts can be added later without a schema change.
2. **Launch content:** your `interview-pdfs` books are tested Markdown and could seed DSA articles, but you sell those on Topmate. Would you publish some of it free, or should site content be separate?
3. **API host:** needs a decision by Phase 7. Railway is the simplest choice; ECS would double as AWS content material.
4. **Contact address:** the footer and `/about` link to your Instagram and YouTube, taken from your `interview-pdfs` brand files. Is there an email address to publish as well?

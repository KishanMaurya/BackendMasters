# BackendMasters — Tasks

Status: **Phases 1 to 6 complete. Phase 7 not started.** Check off items only once verified.

## Phase 0 — Planning

- [x] Inspect repository and dependencies
- [x] Architecture document (`docs/ARCHITECTURE.md`)
- [x] Visual design system and animation guidelines (`docs/DESIGN_SYSTEM.md`)
- [x] Implementation plan and risks (`docs/IMPLEMENTATION_PLAN.md`)

## Phase 1 — Foundation

- [x] Initialize monorepo (npm workspaces, Turborepo)
- [x] Shared TypeScript, ESLint and Prettier config
- [x] `packages/shared` contracts
- [x] Configure Next.js with App Router and TypeScript
- [x] Configure Tailwind with brand tokens (dark and light)
- [x] Configure shadcn/ui and Lucide
- [x] Configure NestJS (config, validation, Swagger, envelope, error filter, health)
- [x] Set up Supabase project config and API client factory
- [x] `.env.example` files, no invented credentials
- [x] Unit and integration tests for the API
- [x] Run both apps, typecheck, lint, test, build

## Phase 2 — Design system and public shell

- [x] Replace the Phase 1 placeholder page
- [x] Theme provider and switcher
- [x] Illustration primitives (`Node`, `Wire`, `Packet`)
- [x] Twelve illustrations in `components/illustrations/`
- [x] Navigation (desktop, animated mobile)
- [x] Footer
- [x] Homepage: animated hero
- [x] Homepage: categories
- [x] Homepage: featured and latest articles (typed data interface, honest empty states)
- [x] Homepage: interview preparation
- [x] Category pages: `/learn`, `/dsa`, `/lld`, `/hld`, `/system-design`, `/aws`, `/observability`, `/backend-engineering`, `/interview-questions`
- [x] `/about`
- [x] Page transitions and skeletons
- [x] Responsive, theme and reduced-motion checks

## Phase 3 — Database and API

- [x] Migrations: `profiles`, `categories`, `articles`, `tags`, `article_tags`, `bookmarks`, `article_views`, `interview_questions`, `dsa_problems`
- [x] Indexes, unique slugs, timestamp triggers
- [x] Row Level Security policies and tests
- [x] Categories seed
- [x] NestJS read APIs: articles, categories, tags (writes need auth, so they come in Phase 5)
- [x] Web API client and connected pages

## Phase 4 — Articles

- [x] `/articles/[slug]` detail route, with real 404s for crawlers
- [x] Listing with pagination and filters
- [x] Detail page layout
- [x] Markdown rendering with sanitization
- [x] Shiki highlighting (JS, TS, Go, Java, Python, SQL, Bash, JSON)
- [x] Copy button with success animation, expandable code
- [x] Mermaid diagrams (lazy, interactive)
- [x] Table of contents, reading progress, related articles, inline notes

## Phase 5 — Admin

- [x] Reject the reserved article slug `slugs`, in the API and the database
- [x] Admin login and `AdminGuard`
- [x] Dashboard statistics
- [x] Article CRUD with Markdown editor and preview
- [x] Cover and inline image upload
- [x] Category editing and tag management (adding a category needs code, see `docs/ADMIN.md`)
- [x] Publish, schedule and unpublish, on-demand revalidation of the `content` cache tag
- [x] Public sign-ups off locally. Turn them off on the hosted project too (`docs/ADMIN.md`)
- [x] Storage bucket for images, and its policies

## Phase 6 — Learning modules

- [x] DSA module, topics and difficulty filters, multi-language solutions
- [x] LLD module (topics link to articles by tag)
- [x] HLD and system design template (10 required sections, as an outline and checklist in the editor)
- [x] AWS module
- [x] Observability module
- [x] Interview question bank, search and filters
- [x] Admin screens for DSA problems and interview questions
- [x] Interactive explainers: load balancer, Kafka, sharding, tracing, caching, sliding window
- [x] React Flow architecture explorer
- [x] Sample content for local development, with every DSA solution run in all four languages

## Phase 7 — Launch

- [ ] Global search, suggestions, category and tag filters (replace the `/search` holding page)
- [ ] Metadata, canonical URLs, Open Graph
- [ ] Sitemap, robots.txt, Article and Breadcrumb structured data
- [ ] Full test pass
- [ ] Contact address on `/about` and in the footer, if you want one beyond social links
- [ ] Core Web Vitals and bundle budget (first-load JS is 170 to 190 KB against a 170 KB budget)
- [ ] Published launch content: articles, problems and questions on the hosted project
- [ ] Keep the language choice across DSA problems
- [ ] Deploy web and API, configure backendmasters.in
- [ ] Refresh the site when a scheduled article's date arrives
- [ ] Redirects for changed article slugs
- [ ] Remove unused images from storage
- [ ] Multi-factor sign-in for administrators

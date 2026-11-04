# BackendMasters — Tasks

Status: **Phase 1 complete. Phase 2 not started.** Check off items only once verified.

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

- [ ] Replace the Phase 1 placeholder page
- [ ] Theme provider and switcher
- [ ] Illustration primitives (`Node`, `Wire`, `Packet`)
- [ ] Ten illustrations in `components/illustrations/`
- [ ] Navigation (desktop, animated mobile)
- [ ] Footer
- [ ] Homepage: animated hero
- [ ] Homepage: categories
- [ ] Homepage: featured and latest articles (typed data interface, honest empty states)
- [ ] Homepage: interview preparation
- [ ] Category pages: `/learn`, `/dsa`, `/lld`, `/hld`, `/system-design`, `/aws`, `/observability`, `/backend-engineering`, `/interview-questions`
- [ ] `/about`
- [ ] Page transitions and skeletons
- [ ] Responsive, theme and reduced-motion checks

## Phase 3 — Database and API

- [ ] Migrations: `profiles`, `categories`, `articles`, `tags`, `article_tags`, `bookmarks`, `article_views`, `interview_questions`, `dsa_problems`
- [ ] Indexes, unique slugs, timestamp triggers
- [ ] Row Level Security policies and tests
- [ ] Categories seed
- [ ] NestJS modules: articles, categories, tags
- [ ] Web API client and connected pages

## Phase 4 — Articles

- [ ] Listing with pagination and filters
- [ ] Detail page layout
- [ ] Markdown rendering with sanitization
- [ ] Shiki highlighting (JS, TS, Go, Java, Python, SQL, Bash, JSON)
- [ ] Copy button with success animation, expandable code
- [ ] Mermaid diagrams (lazy, interactive)
- [ ] Table of contents, reading progress, related articles, inline notes

## Phase 5 — Admin

- [ ] Admin login and `AdminGuard`
- [ ] Dashboard statistics
- [ ] Article CRUD with Markdown editor and preview
- [ ] Cover image upload
- [ ] Category and tag management
- [ ] Publish and unpublish, on-demand revalidation

## Phase 6 — Learning modules

- [ ] DSA module, topics and difficulty filters, multi-language solutions
- [ ] LLD module
- [ ] HLD and system design template (10 required sections)
- [ ] AWS module
- [ ] Observability module
- [ ] Interview question bank and filters
- [ ] Interactive explainers: load balancer, Kafka, sharding, tracing, caching
- [ ] React Flow architecture explorer

## Phase 7 — Launch

- [ ] Global search, suggestions, category and tag filters
- [ ] Metadata, canonical URLs, Open Graph
- [ ] Sitemap, robots.txt, Article and Breadcrumb structured data
- [ ] Full test pass
- [ ] Core Web Vitals and bundle budget
- [ ] Deploy web and API, configure backendmasters.in

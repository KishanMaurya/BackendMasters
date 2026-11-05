# BackendMasters — Tasks

Status: **Phases 1 to 7 are built. Launch steps that need your accounts or decisions are listed under Launch.** Check off items only once verified.

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

## Phase 7 — Launch preparation

- [x] Global search across articles, DSA problems and questions, ranked, with track and tag filters
- [x] Search suggestions and a search dialog (Cmd+K)
- [x] Metadata, canonical URLs, Open Graph, share image
- [x] Sitemap, robots.txt, Article and Breadcrumb structured data
- [x] Security headers
- [x] Refresh the site when a scheduled article's date arrives
- [x] Admin addresses from the brief redirect to the real ones
- [x] Accessibility audit (axe, 27 pages in both themes, no violations)
- [x] Full test pass
- [x] Dockerfile for the API, Vercel settings, CI workflow and deployment guide (`docs/DEPLOYMENT.md`)
- [ ] First-load JS under 170 KB on every page: listing pages are 161 to 167 KB, articles 173 KB, DSA problems 178 KB and `/hld` 181 KB

## Launch

These need your accounts or decisions.

- [ ] Choose an API host
- [ ] Create the hosted Supabase project and your administrator (`docs/ADMIN.md`)
- [ ] Deploy web and API, configure backendmasters.in (`docs/DEPLOYMENT.md`)
- [ ] Write or import launch content: articles, problems and questions
- [ ] Contact address on `/about` and in the footer, if you want one beyond social links
- [ ] Submit the sitemap in Google Search Console

## After launch

- [ ] Count article views. Nothing writes to `article_views` yet, so the dashboard's view counts stay at 0
- [ ] Reader accounts and bookmarks, if wanted. The table exists, with no screens
- [ ] Redirects for changed article slugs
- [ ] Remove unused images from storage
- [ ] Multi-factor sign-in for administrators
- [ ] Rate limits on search, and on sign-in per user rather than per server address
- [ ] A content security policy
- [ ] Count DSA problems and questions on their homepage track cards, which only count articles
- [ ] Keep the language choice across DSA problems

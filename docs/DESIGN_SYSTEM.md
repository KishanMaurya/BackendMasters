# BackendMasters — Visual Design System & Animation Guidelines

The visual reference for Phase 2 onward. The site should read as a **premium engineering publication crossed with modern developer docs**.

## 1. Concept: "the system is alive"

One visual idea runs through the product: **requests moving through a system**. A thin line with a small green packet travelling along it is the brand's signature. It appears at full scale in the hero, at small scale in category illustrations, and as an explanation inside articles.

This gives us one motion language across the site, not unrelated effects on every page. It also means motion carries meaning: when something moves, data is moving.

## 2. Colour

Brand values from the brief are unchanged in dark mode. Light mode needs its own accent, because of the contrast results below.

| Token                  | Dark      | Light     | Use                           |
| ---------------------- | --------- | --------- | ----------------------------- |
| `--background`         | `#10131C` | `#F6F7F9` | Page                          |
| `--card`               | `#1C2230` | `#FFFFFF` | Surfaces                      |
| `--foreground`         | `#FFFFFF` | `#10131C` | Primary text                  |
| `--muted-foreground`   | `#A1A1AA` | `#52525B` | Secondary text                |
| `--primary`            | `#54D045` | `#1F7A14` | Accent, links, primary button |
| `--primary-foreground` | `#10131C` | `#FFFFFF` | Text on accent                |

### Measured contrast (WCAG AA needs 4.5:1)

| Pair                   | Ratio |                                          |
| ---------------------- | ----- | ---------------------------------------- |
| `#54D045` on `#10131C` | 9.26  | Pass                                     |
| `#54D045` on `#1C2230` | 7.94  | Pass                                     |
| `#A1A1AA` on `#10131C` | 7.24  | Pass                                     |
| `#A1A1AA` on `#1C2230` | 6.20  | Pass                                     |
| `#10131C` on `#54D045` | 9.26  | Pass: **button text is dark, not white** |
| `#FFFFFF` on `#54D045` | 2.00  | **Fail**                                 |
| `#54D045` on `#FFFFFF` | 2.00  | **Fail**: why light mode uses `#1F7A14`  |
| `#1F7A14` on `#FFFFFF` | 5.45  | Pass                                     |
| `#1F7A14` on `#F6F7F9` | ≥5.00 | Pass                                     |
| `#52525B` on `#F6F7F9` | 7.21  | Pass                                     |

`#54D045` may still be used in light mode for non-text decoration such as packets and illustration fills.

## 3. Typography

| Role         | Typeface           | Why                                                      |
| ------------ | ------------------ | -------------------------------------------------------- |
| Headings     | **Space Grotesk**  | Technical character, distinct from default-template sans |
| Body         | **Inter**          | Long-form readability                                    |
| Code, labels | **JetBrains Mono** | Clear glyphs, good ligature-free reading                 |

All self-hosted through `next/font`, so no layout shift and no third-party request. Article body: 17–18px, line height 1.7, max width about 70 characters. Small mono uppercase labels ("HLD · 12 MIN") are a recurring publication detail.

## 4. Layout

- Max content width 1200px, article column about 720px.
- 4px spacing base.
- Radius: 8px controls, 12px cards. No oversized cards.
- Borders do the work of separation, with 1px low-contrast lines. Elevation is used only on hover.

## 5. Things we avoid

Multi-colour gradients, purple anything, glassmorphism, large glows, centred-everything templates, emoji icons, identical three-column feature grids, animations with no meaning, and scroll-jacking.

A single soft green accent glow is allowed behind the hero. That's the whole gradient budget.

## 6. Animation guidelines

### Motion tokens

| Token           | Value                            | Use                                 |
| --------------- | -------------------------------- | ----------------------------------- |
| `--motion-fast` | 120ms                            | Hover, press, copy feedback         |
| `--motion-base` | 220ms                            | Dropdowns, card lift, nav indicator |
| `--motion-slow` | 420ms                            | Section and text entrances          |
| `--ease-out`    | `cubic-bezier(0.16, 1, 0.3, 1)`  | Things entering                     |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Packets travelling                  |

### Rules

1. **Motion explains or responds.** If it does neither, cut it.
2. **Animate only `transform` and `opacity`.** SVG line motion may use `stroke-dashoffset`.
3. **Reading is sacred.** Nothing moves beside article body text except the progress bar.
4. **Offscreen animation pauses**, using IntersectionObserver.
5. **Reduced motion is a designed state, not an afterthought.** With `prefers-reduced-motion`, ambient loops stop, entrances become instant, and explainer steps change without animation. Explainers never start by themselves, whatever the setting.
6. **No content depends on animation.** Every animated illustration has a static SVG state and a text alternative.
7. **LCP is text.** The hero heading paints immediately; the background joins afterwards.

### Library budget

The brief lists seven tools and also says to choose the lightest fit. This is how we reconcile that:

| Tool                         | Status                     | Scope                                                                                                                |
| ---------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **CSS + SVG**                | Default, no JS             | Hover, packets, grids, ambient hero, category illustrations, skeletons                                               |
| **Motion** (`motion/react`)  | Not installed yet          | Everything in Phase 2 was achievable without it. Add it in Phase 6 if an explainer needs gesture or layout animation |
| **React `<ViewTransition>`** | Live                       | Page crossfades, with no extra library. Browsers without support swap instantly                                      |
| **Mermaid**                  | Phase 4, dynamic import    | Only loaded on articles containing a diagram                                                                         |
| **React Flow**               | Live, dynamic import       | Only on `/system-design`, about 60 KB, loaded when the explorer nears the screen                                     |
| **GSAP**                     | Not installed until needed | Added only if a scroll-story explainer can't be done with Motion                                                     |
| **Lottie**                   | Not planned                | Would need external After Effects assets; SVG/CSS covers small loaders at lower weight                               |

**Targets:** LCP < 2.5s, INP < 200ms, CLS < 0.1 on mid-range mobile. First-load JS: React and Next take about 116 KB of it on their own, so the budget is **under 170 KB compressed in total**. Own code stays small by rendering on the server and loading heavy pieces on demand (the mobile menu dialog loads on first use).

**Measured at the end of Phase 2** (production build, 375px, 4x CPU throttle, slow 4G, empty cache): LCP 0.7 to 1.2s, CLS 0, under 5ms of blocking time.

**Articles at the end of Phase 4** (same conditions): LCP 0.7s, CLS 0, 169 KB of JS. An article with a diagram also loads Mermaid (about 650 KB) after the page goes idle, with about 220ms of blocking time. It never affects articles without diagrams.

**Learning modules at the end of Phase 6** (same conditions): LCP 0.7 to 1.4s, CLS 0.011 or less, under 25ms of blocking time. First-load JS is 170 to 190 KB, a little over budget, and `/system-design` adds about 60 KB for React Flow once scrolled to.

**Code colours:** `github-dark-default` and `github-light-default`. The plain `github-dark` and `github-light` themes fail AA on our card colours (3.3:1 and 3.49:1). Ligatures are off in code, so readers see the characters they would type.

### How the system works

- `src/styles/motion.css` holds all keyframes, inside a `no-preference` query, so reduced motion needs no extra code.
- Illustrations run while a parent `.group` is hovered or focused, or inside `.bm-live`.
- `<InView>` pauses a scene that's offscreen.
- `.bm-reveal` is a scroll reveal in pure CSS (`animation-timeline: view()`). Browsers without support show the content straight away, and full-page screenshot tools show these sections blank because nothing has scrolled into view.
- Packets are short dashes moving along the same path as their wire, using `stroke-dashoffset`.

### Hero: the distributed system

A low-opacity SVG scene behind the heading: a faint grid, a client, a load balancer, three services, a cache, a queue and a database, joined by hairlines with green packets moving along them, occasionally splitting at the load balancer.

- Pure SVG + CSS, so it costs almost no main-thread time.
- Mobile shows a simplified scene.
- Heading, description and CTAs enter with a short stagger, and remain readable before it finishes.

The brief's particles and floating symbols are treated as optional. They're added only if the scene still feels empty, since the moving packets already provide that life.

### Illustration library

`apps/web/src/components/illustrations/`: `Dsa`, `Lld`, `Hld`, `Aws`, `Observability`, `SystemDesign`, `Backend`, `Interview`, `DistributedSystems`, `Database`, `Kafka`, `Api`. All share primitives (`Node`, `Wire`, `Packet`), use `currentColor` and tokens so both themes work, and animate on card hover or when in view.

| Category            | Visual identity                                            |
| ------------------- | ---------------------------------------------------------- |
| DSA                 | Binary tree with a traversal highlight moving node to node |
| LLD                 | UML classes with relationship lines drawing in             |
| HLD                 | Load balancer fanning packets to three servers             |
| System Design       | Connected microservices exchanging packets                 |
| AWS                 | Cloud boundary with request routing to compute and storage |
| Observability       | Metric line and trace spans drawing in                     |
| Backend Engineering | Request pipeline through middleware layers                 |
| Interview Prep      | Question card that flips into a code snippet               |

### Interactive explainers

Load balancer, Kafka, sharding, distributed tracing, caching and sliding window, in `features/explainers/`.

- **One frame for all of them.** `<Explainer>` provides play, pause, step and restart controls, a caption, and every step as text under "Read all steps". An explainer only supplies its captions and how to draw a step.
- **Real logic.** `scenes.ts` holds the simulations, separate from drawing and covered by tests. The sliding window runs the same algorithm as the published problem.
- **Nothing starts by itself.** Playback stops when the explainer leaves the screen. Each explainer is its own chunk, so a page only loads the ones it shows.
- **Usable in articles.** A fenced code block with the language `explainer` and a name inserts one. An unknown name renders nothing.

### Architecture explorer

`features/architecture/` on `/system-design`. Components can be selected and dragged, and selecting one explains what it does and what happens when it fails. The page keeps scrolling over the canvas on touch screens, so panning is off and zoom uses the on-screen controls. The same content is always available as text beneath it.

## 7. Testing animation

For each section, check 375px, 768px and 1440px; light and dark; reduced motion on; a 4× CPU throttle. Interactive elements must be reachable by keyboard with a visible focus ring.

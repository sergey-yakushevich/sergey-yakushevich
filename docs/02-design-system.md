# Design System

Source of the visual language: **digitalcreator.club** (tokens extracted from its
compiled stylesheet, not guessed). Source of the page structure: the reference
portfolio screenshot. Source of the content: `cv/src/data/en-batumi-10y-go.tsx`.

The system is deliberately small. One neutral ramp, two fonts, one radius, one
container width. Colour is used for meaning only, never for decoration.

---

## 1. Colour tokens

Copied verbatim from the reference site. These are shadcn/ui token names, so
`npx shadcn@latest add <component>` output works with no edits.

### Dark theme (default for this site)

| Token | Value | Used for |
|---|---|---|
| `--background` | `#0a0a0a` | Page background |
| `--foreground` | `#fafafa` | Primary text |
| `--card` | `#111111` | Card / panel surface |
| `--card-foreground` | `#fafafa` | Text on cards |
| `--popover` | `#111111` | Popover, dropdown, command menu |
| `--popover-foreground` | `#fafafa` | Text in popovers |
| `--primary` | `#fafafa` | Solid button fill |
| `--primary-foreground` | `#0a0a0a` | Text on solid buttons |
| `--secondary` | `#171717` | Secondary button, chip fill |
| `--secondary-foreground` | `#fafafa` | Text on secondary |
| `--muted` | `#171717` | Muted surface |
| `--muted-foreground` | `#a3a3a3` | Secondary text, labels, captions |
| `--accent` | `#1c1c1c` | Hover surface |
| `--accent-foreground` | `#fafafa` | Text on hover surface |
| `--destructive` | `#d4d4d4` | Destructive state |
| `--border` | `#262626` | All hairlines and card edges |
| `--input` | `#262626` | Field borders |
| `--ring` | `#737373` | Focus ring |

### Light theme

| Token | Value |
|---|---|
| `--background` | `#fafafa` |
| `--foreground` | `#111111` |
| `--card` | `#ffffff` |
| `--card-foreground` | `#111111` |
| `--popover` | `#ffffff` |
| `--popover-foreground` | `#111111` |
| `--primary` | `#111111` |
| `--primary-foreground` | `#fafafa` |
| `--secondary` | `#f5f5f5` |
| `--secondary-foreground` | `#111111` |
| `--muted` | `#f5f5f5` |
| `--muted-foreground` | `#666666` |
| `--accent` | `#f0f0f0` |
| `--accent-foreground` | `#111111` |
| `--destructive` | `#404040` |
| `--border` | `#e5e5e5` |
| `--input` | `#e5e5e5` |
| `--ring` | `#a3a3a3` |

**Note on the ramp.** There is no brand hue in the neutral scale. The reference
site is pure greyscale. Do not add a tinted grey — it breaks the match.

### Signal colours

The reference site keeps five chart colours. This site needs far fewer, so the
set is cut down to the three that carry meaning in a portfolio.

| Token | Dark | Light | Meaning |
|---|---|---|---|
| `--signal-available` | `#34d399` | `#00a544` | "Open to work", "Remote" status dot |
| `--signal-shipped` | `#60a5fa` | `#2563eb` | Live project link, external reference |
| `--signal-attention` | `#f59e0b` | `#b45309` | Draft post, work in progress |

The light values are darker than the reference site's, deliberately. `#34d399`
on a `#fafafa` background is roughly 1.7:1 — invisible as a dot and unreadable
as anything else. The neutral ramp is copied exactly; the signals are not, since
the reference site never puts them on a light surface.

Rules:

1. A signal colour is allowed on a **dot, an icon, or a 1px border** — never as
   a large fill.
2. Never put body text in a signal colour. Body text is `--foreground` or
   `--muted-foreground` only.
3. Maximum two signal colours are visible in one viewport.

### Domain accent — payments

The CV is 10 years of payment backends. That is the single differentiator, so
it gets exactly one visual marker and nothing more: the payments-related skill
chips (`PCI-DSS`, `3DS`, `Card Tokenization`, `Fraud Detection`, `KYC`) carry a
`--signal-shipped` left border at 1px. Every other chip is plain. One marker,
used consistently, reads as intent. Ten markers read as noise.

---

## 2. Typography

The reference site loads four families but really uses two. Copy those two.

| Role | Family | Notes |
|---|---|---|
| UI and prose | **Inter** | `--font-inter`, variable weight |
| Labels, code, data | **JetBrains Mono** | `--font-jetbrains`, variable weight |

Load both as self-hosted variable fonts. Do not call Google Fonts at runtime —
it costs a third-party round trip and hurts the first paint on a page this small.

### Scale

Standard Tailwind v4 steps. The reference site uses only these seven.

| Step | Size / line height | Applied to |
|---|---|---|
| `text-xs` | 12 / 16 | Chip text, footnote |
| `text-sm` | 14 / 20 | Secondary text, card body, section subtitle |
| `text-base` | 16 / 24 | Body prose, card heading (`h3`) |
| `text-lg` | 18 / 28 | Larger card heading |
| `text-xl` | 20 / 28 | Name in the profile card (mobile) |
| `text-2xl` | 24 / 32 | Name in the profile card (≥640px) |
| `text-3xl` | 30 / 36 | Section heading (`h2`) |

### Exact heading recipes

Lifted from the reference markup, unchanged:

```
h1  → text-xl font-semibold tracking-tight sm:text-2xl
h2  → text-3xl font-semibold tracking-tight
h3  → text-base font-semibold          (card title, with gap-2 icon row)
h3  → text-lg font-semibold            (larger card title)
```

`tracking-tight` is `-0.025em`. It is applied to headings **only**. Body text
uses default tracking.

### The mono label

This is the signature detail of the reference site and the thing that makes the
whole page feel considered. Every group label uses it:

```
font-jetbrains text-[10px] font-medium uppercase tracking-[0.05em]
color: var(--muted-foreground)
```

Used for: `LANGUAGES`, `BACKEND`, `DATABASE`, `PAYMENTS`, and for every date
range in the experience list. Positive tracking on tiny uppercase mono is what
keeps it legible. Do not scale this above 10px, and do not use it for anything
longer than three words.

### Prose rules

- Body copy is `text-base` at `leading-relaxed` (1.625).
- Inside a bio paragraph, the load-bearing phrases are `font-semibold` in
  `--foreground` while the rest of the sentence sits in `--muted-foreground`.
  The reference screenshot does exactly this ("scale to millions of requests",
  "cost less to run", "ship on time"). For this CV the emphasised phrases are:
  **10 years on payment backends**, **350M+ payments**, **Ruby and Go**.
- One emphasis per sentence. Two makes both disappear.
- Maximum three sentences in a bio paragraph.

---

## 3. Layout

| Property | Value |
|---|---|
| Container | `max-w-[700px]`, centred |
| Page padding | `px-6 py-10` |
| Gap between sections | `gap-16` (64px) |
| Gap inside a section | `space-y-5` (20px) |
| Card padding | `p-6` |
| Radius | `10px` (`--radius`) — one value everywhere |

700px is narrow on purpose. It forces one idea per row and makes the page read
like a document rather than a dashboard.

### Grid

- Tech stack: 3 columns ≥1024px, 2 columns ≥640px, 1 column below, `items-start`.
  `PAYMENTS` spans 2 columns. See §5.
- Everything else: single column at every width.

### Elevation

There is none. No shadows anywhere. Separation comes from a 1px `--border`
against a `--card` surface that is 7 points lighter than the page. That is the
entire depth model and it must stay that way — a shadow on this palette looks
like a rendering bug.

---

## 4. Components

Base layer is **shadcn/ui**. Variants come from **shadcnspace.com** (427+
components across 68 groups). Only the components below are needed. Anything
not on this list does not get installed.

### From shadcn/ui core

| Component | Where it is used |
|---|---|
| `button` | Installed; kept for future use |
| `badge` | Installed; the `Chip` primitive covers the tech-chip case |
| `card` | Article preview (via card-01) |
| `avatar` | Profile photo, with initials `SY` as fallback |
| `separator` | Divider inside the profile card |
| `tooltip` | Social icon labels |
| `tabs` | Tag filter on `/writing`, driven by tabs-08 |

### From shadcnspace

| Item | Where | What was changed |
|---|---|---|
| `@shadcn-space/card-01` | Article preview on `/writing` and the home page | Rewritten to take props. The demo's stock photo, lorem body and four-co-author avatar stack are gone — a "+4" bubble on a solo blog is a lie told by a placeholder. Cover image is optional. Staggered entrance kept. |
| `@shadcn-space/tabs-08` | Tag filter on `/writing` | Demo dashboard panels and the default export removed. Indicator shadow dropped and radius pinned to the token. Spring `layoutId` indicator and direction-aware panel transitions kept. |

Built in-house rather than installed, because each is a handful of lines against
the token set and an installed variant would have to be stripped back to it
anyway: the pill navbar, the status badge, the `Chip`, the stat ticker
(`motion`'s `animate` plus `useInView`), and the theme toggle.

Every installed component is stripped to match the token set: shadows removed,
radius forced to `10px`, colours mapped to the tokens above. A shadcnspace
variant that fights the token set is edited, not accepted as delivered.

**Brand icons.** lucide-react v1 removed `Github` and `Linkedin`. Both marks now
live in `app/frontend/components/brand-icons.tsx` as inline SVG.

---

## 5. Component specifications

### Pill navigation

Centred at the top of the page, above the profile card.

- Container: `--secondary` fill, `--border` 1px, fully rounded, `p-1`.
- Items: `Home` · `Projects` · `Writing`.
- Active item: `--card` fill, `--foreground` text, radius 10px inside the pill.
- Inactive item: `--muted-foreground`, moves to `--foreground` on hover.
- The active pill slides between items on route change, 200ms, `ease-out`.
  Suppress the animation under `prefers-reduced-motion`.

### Profile card

Two columns. Left: avatar plus identity. Right: social icon row.

- Avatar: 96px, radius 10px (square with soft corners, **not** a circle — the
  reference screenshot uses a rounded square).
- Name: `h1` recipe. `Sergey Yakushevich`.
- Status badge next to the name: dot in `--signal-available`, label `Remote`,
  `--secondary` fill, `text-xs`.
- Role line: `Senior Backend Engineer · Go, Ruby`, `text-sm` in
  `--muted-foreground`.
- Location line: `Batumi, Georgia`, with a pin icon at 14px.
- Email line: mail icon plus `sergeyayya@gmail.com`, underline on hover only.
- Social row: GitHub, LinkedIn, personal site. Icons at 20px in
  `--muted-foreground`, to `--foreground` on hover.
- `separator` below the identity block, then the bio paragraphs.

### Tech chip

- `--secondary` fill, `--border` 1px, radius 10px, `px-3 py-1.5`, `text-sm`.
- Optional 16px technology icon on the left.
- Payments-domain chips add a 1px `--signal-shipped` left border. Nothing else.
- Chips do not link anywhere and are not interactive. No hover state.

### Theme toggle

A 34px sliding switch in the header, ported from the dawn project. Clicking it
starts a View Transitions "wave": an expanding `clip-path` circle anchored at the
click coordinates, 900ms on `--ease-calm`. The knob carries its own
`view-transition-name` so it slides in sync with the wave rather than being
frozen inside the root snapshot.

Two fallbacks, both silent:

- **No View Transitions API** (Firefox) → instant swap.
- **`prefers-reduced-motion: reduce`** → instant swap.

Dark is the default. `<html>` ships with `class="dark"` already set and an
inline script in the layout removes it for a light-theme visitor before first
paint, so neither theme flashes the other on load.

### Tech stack group card

- `--card` fill, `--border` 1px, `p-6`.
- Header uses the mono label recipe.
- Chips flow in a `flex-wrap` row at `gap-2`.

Groups, taken from the CV skills list:

| Label | Chips |
|---|---|
| `LANGUAGES` | Go (Golang), Ruby |
| `BACKEND` | Ruby on Rails, Kafka, REST, GraphQL, Microservices, Event-Driven, Distributed Systems, Concurrency & Queues |
| `DATABASE` | PostgreSQL, Redis, Elasticsearch |
| `INFRA` | AWS, Docker, Kubernetes, Terraform, GitHub Actions |
| `PAYMENTS` | PCI-DSS, 3DS, Card Tokenization, Fraud Detection, KYC, OAuth2 / JWT |

`PAYMENTS` is listed last but is the group that matters. It spans **two**
columns, not three: with five groups in a 3-column grid, a full-width Payments
row leaves `INFRA` sitting alone with two empty cells beside it. Two columns
emphasise Payments *and* close the row.

The grid is `items-start`. Without it, a two-chip `LANGUAGES` card is stretched
to the height of the eight-chip `BACKEND` card, and the empty half reads as a
section someone forgot to fill in.

Chips are `whitespace-nowrap`. A chip that wraps onto two lines stops looking
like a chip; the `flex-wrap` parent moves it to the next row instead.

### Experience entry

- Company name, `text-base font-semibold`, linked to the company site.
- Date range on the same row, right-aligned, in the mono label recipe.
- Job title below, `text-sm` in `--muted-foreground`.
- Badge row: the `badges` array from the CV data, as tech chips at `text-xs`.
- Bullets: `text-sm`, `leading-relaxed`, at most three shown. A "Show more"
  toggle reveals the rest. The CV file has up to six bullets per job and all six
  on screen at once turns the page into a wall.

### CTA strip

The "AI agent reading this portfolio?" panel from the screenshot. Keep it — the
CV data already targets automated screening, so a machine-readable page is on
message.

- `--card` fill, `--border` 1px, `p-6`, single row, space-between.
- Left: question in `text-sm`.
- Right: outline button whose border is `--signal-shipped`.
- Links to `/agents`, a plain-text page carrying the same content, plus the
  GraphQL endpoint the CV project already exposes.

---

## 6. Motion

| Event | Treatment |
|---|---|
| Section mounts | Fade in, 6px rise, 300ms, `ease-soft` |
| Nav pill change | Spring `layoutId` slide (stiffness 420, damping 34) |
| Tab change | Spring indicator, plus a direction-aware panel slide |
| Article card mounts | 24px rise, cascaded 60ms per list position, then staggered children at 120ms |
| Hover on any control | Colour only, 150ms |
| Number ticker | Count up over 900ms on `ease-calm` when it first scrolls in |
| Theme switch | 900ms `clip-path` wave on `ease-calm`, from the click point |
| "Show more" on a job | Height auto, 250ms, `ease-soft` |

`--default-transition-duration` is `.15s` and the easing is
`cubic-bezier(.4,0,.2,1)`, both copied from the reference site. Nothing moves on
this site except opacity, colour, and small vertical offsets. Every animation is
disabled under `prefers-reduced-motion: reduce`.

**Entrances animate on mount, not on scroll.** The first implementation used
motion's `whileInView`, and it left the whole `/projects` page stranded at
`opacity: 0` — the viewport callback never resolved for a static subtree with
nothing to force a re-render, and the section stayed invisible indefinitely.
Pages where something else re-rendered (the animated tab bar on `/writing`) were
unaffected, which is what made it look like a page-specific bug rather than a
pattern-level one.

A reveal that can permanently hide primary content is not a trade worth making
for a 6px rise. Cards cascade by list position instead of by scroll position,
which reads the same on a page this short.

---

## 7. Token file

The live token file is `app/frontend/entrypoints/application.css`. It is the
implementation of everything above, in this order:

1. `:root` — light values. `.dark` — dark values. Both include the three signal
   colours at their per-theme values.
2. `@theme inline` — maps the raw variables onto Tailwind's `--color-*`,
   `--radius-*` and `--font-*` names, so `bg-card`, `text-muted-foreground` and
   `rounded-lg` resolve to the tokens. Also defines `--ease-calm` and
   `--ease-soft`.
3. `@font-face` — self-hosted Inter and JetBrains Mono from `public/fonts/`.
4. `@layer base` — border colour default, focus-visible ring, selection colour.
5. `@utility label-mono` — the 10px uppercase mono label as a single class.
6. The theme-switch wave, the section entrance, the prose styles, the syntax
   highlighting map, and the reduced-motion block.

Read that file rather than a copy pasted here; a duplicated token list is a
token list that goes stale.

---

## 8. Syntax highlighting

Rouge emits the token classes; the stylesheet maps them onto the design tokens.
Greyscale plus the three signal colours, with weight and opacity carrying most of
the structure rather than hue:

| Rouge class | Treatment |
|---|---|
| comments (`.c`, `.c1`, `.cm`, `.cp`) | `--muted-foreground` at 75%, italic |
| keywords and operators (`.k*`, `.o`, `.ow`) | `--foreground`, weight 600 |
| strings (`.s*`) | `--signal-available` |
| numbers (`.m*`, `.il`) | `--signal-shipped` |
| builtins and tags (`.nb`, `.bp`, `.nt`) | `--signal-attention` |

This is the one place the two-signals-per-viewport rule is relaxed — a code block
is a self-contained surface, and the alternative is either monochrome code or a
borrowed theme that does not match anything else on the page.

---

## 9. Accessibility

- `--muted-foreground` `#a3a3a3` on `--background` `#0a0a0a` gives about 9.7:1.
  Safe at every size.
- The 10px mono label sits below the 12px many guidelines prefer. It is used
  only for short non-essential labels that repeat as a visible heading or are
  duplicated in the accessible name. Never put unique information in it alone.
- Focus ring: 2px `--ring` with a 2px offset. Never remove the outline.
- The status dot repeats its meaning in the badge text (`Remote`), so colour is
  never the only signal.
- Target size is at least 44×44px for every social icon, achieved with padding
  rather than a larger glyph.

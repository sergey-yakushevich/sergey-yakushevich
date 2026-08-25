# Design System

Sources, in the order they were layered on:

- **Colour tokens** — digitalcreator.club, extracted from its compiled
  stylesheet, not guessed.
- **Typeface, type scale and the background** — the author's own portfolio,
  `github.com/sergey-yakushevich/portfolio`.
- **Page structure** — the reference portfolio screenshot.
- **Content** — `cv/src/data/en-batumi-10y-go.tsx`.

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

**Rubik**, self-hosted as a variable font (300–900), taken from the author's
portfolio along with its type scale. JetBrains Mono is kept for one job only —
code blocks in blog posts, where a proportional face is wrong.

Do not call Google Fonts at runtime. It costs a third-party round trip and hurts
first paint on a page this small.

### Scale

Straight from the portfolio's `styles.css`, which is why the numbers are round
pixel values rather than Tailwind steps:

| Utility | Value | Applied to |
|---|---|---|
| `display-1` | 50px / 50px, weight 700 | The name in the profile card |
| `display-2` | 40px, weight 600 | Every section heading (`h2`) |
| `nav-text` | 18px, weight 700 | The navigation items |
| body | 20px / 1.5 | Set on `body`; everything inherits it |
| `label-mono` | 12px, weight 700, uppercase, `+0.06em` | Group labels, dates |

Body copy at 20px is the single biggest departure from the first build, which
used 16px. It is also why the container had to grow — see §3.

### The label

Originally 10px JetBrains Mono. Now Rubik at 12px/700, uppercase, tracked
`+0.06em`. Same job — `LANGUAGES`, `BACKEND`, `PAYMENTS`, every date range in
the experience list, the footer — but it belongs to the same family as
everything else, and 12px clears the small-text floor that 10px did not.

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
| Container | `max-w-[910px]`, centred |
| Page background | Aurora image + 32px grid, fixed, behind everything |
| Card surface | `bg-card/80` with `backdrop-blur-sm`, so the aurora shows through |
| Page padding | `px-6 py-10` |
| Gap between sections | `gap-16` (64px) |
| Gap inside a section | `space-y-5` (20px) |
| Card padding | `p-6` |
| Radius | `10px` (`--radius`) — one value everywhere |

910px. The first build used the reference site's 700px, which was too tight
once the chips were in — the tech-stack columns were narrow enough that an
eight-chip group stacked almost one per line. Still narrow enough to read as a
document rather than a dashboard.

### Grid

- Tech stack: CSS **columns**, not a grid — 3 at ≥1024px, 2 at ≥640px, 1 below,
  with `break-inside-avoid` on each card. A grid aligns rows, so a two-chip
  `LANGUAGES` card left a hole beside the eight-chip `BACKEND` card no matter
  how the heights were handled. Columns pack the cards tightly instead.
- Everything else: single column at every width.

### Background

Two layers, both lifted from the portfolio, both `position: fixed` and
`pointer-events: none` so they never intercept a click:

1. **The aurora**, dimmed 30% — but by a different mechanism per theme, because
   "dimmer" means opposite things on opposite substrates. Dark uses
   `brightness(0.7)`, a true dim toward black. Light uses `opacity: 0.7`;
   a brightness filter there drags the near-white paper to grey and the whole
   page reads dirty. `background.jpg` in light, `background-dark.jpg` in dark —
   the repo ships both, and the dark one is the photo-negative of the light one.
   Anchored top-centre at `100% auto`, so it bleeds off the bottom rather than
   squashing.
2. **The grid.** A 32×32 inline SVG of a single corner stroke, tiled.
   `#0f172a` at 4% in light, `#f8fafc` at 5% in dark, masked with
   `linear-gradient(180deg, white, transparent)` so it fades out down the page.

Cards sit on `bg-card/80` with a small backdrop blur. At full opacity they would
cover the aurora entirely and the whole layer would be wasted.

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
| `badge` | Every tech chip, via the `Chip` wrapper (`variant="outline"`) |
| `card` | Article preview (via card-01) |
| `avatar` | Profile photo, with initials `SY` as fallback |
| `separator` | Divider inside the profile card |
| `tooltip` | Social icon labels |
| `tabs` | The top navigation, with `asChild` Inertia links |

### From shadcnspace

| Item | Where | What was changed |
|---|---|---|
| `@shadcn-space/card-01` | Article preview on `/blog` and the home page | Rewritten to take props. The demo's stock photo, lorem body and four-co-author avatar stack are gone — a "+4" bubble on a solo blog is a lie told by a placeholder. Cover image is optional. Staggered entrance kept. |
| `@shadcn-space/badge-03` | Every tech chip | The registry item is a one-line demo of `<Badge variant="outline">`, so `Badge` is used directly through the `Chip` wrapper rather than keeping a demo file. The outline variant was later dropped for a theme-inverted fill. |
| `@shadcn-space/card-24` | Project cards | An event card in the registry — date chip, venue, attendee avatars, RSVP button. Rebuilt as a project card: the date chip became a "Live" pill, the clock and pin rows became stack and domain, the attendee stack became tech chips, and the RSVP button became "Visit". `useInView` was replaced with a mount animation for the reason in §6. |

`@shadcn-space/tabs-08` was installed for the tag filter on the blog index. That
filter is gone, and the navigation uses the shadcn `tabs` primitive directly, so
tabs-08 no longer had an importer and was removed. `pnpm dlx shadcn@latest add
@shadcn-space/tabs-08` brings it back.

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

Centred at the top of the page, above the profile card. Built on the shadcn
`Tabs` primitive with `asChild` Inertia links, so the markup is a tab list and
the behaviour is navigation.

- Container: `--secondary` fill, `--border` 1px, fully rounded, `p-1`.
- Items: `Home` · `Projects` · `Blog`.
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

shadcn `Badge` with `variant="outline"`: transparent fill, 1px `--border`, fully
rounded, `--muted-foreground` text at `font-normal`.

- `md` (tech stack): `px-2.5 py-0.5`, `text-xs`.
- `sm` (job badges, post tags, project cards): `px-2 py-0`, `text-[11px]`.
- Every chip is identical — no group carries a colour or weight marker.
- The **inverted** treatment (`bg-foreground` / `text-background`) is reserved
  for exactly one element: the category badge on a project card. It is the only
  badge on the site that names a kind rather than a technology, and being the
  sole inverted thing is what makes it read as a label rather than another chip.
- Chips do not link anywhere and are not interactive. No hover state.

### Profile card CTA

The "agent reading this?" prompt lives inside the profile card, below the bio
and behind a `Separator`, rather than in a card of its own. Two bordered panels
stacked with a gap read as two unrelated things; one card with a rule reads as
a footnote to the bio, which is what it is.

The control is the plain shadcn `Button` in its default variant. That variant is
already theme-inverted — `bg-primary` resolves to near-white on dark and
near-black on light — so it matches the chips without any custom classes.

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

---

## 6. Motion

| Event | Treatment |
|---|---|
| Section mounts | Fade in, 6px rise, 300ms, `ease-soft` |
| Nav pill change | Spring `layoutId` slide (stiffness 420, damping 34) |
| Tab change | Spring indicator, plus a direction-aware panel slide |
| Article card mounts | 24px rise, cascaded 60ms per list position, then staggered children at 120ms |
| Project card mounts | 16px rise, cascaded 80ms, then staggered children at 80ms |
| Hover on any control | Colour only, 150ms |
| Number ticker | Count up over 900ms on `ease-calm`, on mount |
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

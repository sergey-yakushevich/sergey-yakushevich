# cyberjosef

Blog and portfolio for Sergey Yakushevich — Senior Backend Engineer (Go, Ruby).

**Live: https://cyberjosef.dev**

Rails 8 · Inertia · React 19 + TypeScript · Vite · Tailwind CSS v4 · shadcn/ui ·
markdown posts in git · Kamal 2.

## Run it

```bash
bin/setup          # bundle, pnpm install, prepare the database
bin/dev            # Rails on :3000, Vite on :3036
```

Checks:

```bash
bin/rails test               # 13 tests
bundle exec rubocop          # clean
pnpm run check               # tsc, clean
bundle exec vite build       # production assets
```

## Deploy

Kamal 2 to a VPS, image on GHCR, TLS from Let's Encrypt via kamal-proxy.

```bash
set -a && . ./.env && set +a                      # SECRET_KEY_BASE
export KAMAL_REGISTRY_PASSWORD="$(gh auth token)" # needs write:packages
bundle exec kamal deploy
```

`.env` is gitignored and holds `SECRET_KEY_BASE`. The GHCR token needs the
`write:packages` scope — a plain `repo`-scoped `gh` token can log in to ghcr.io
but silently fails on push. SSH uses a dedicated key, `~/.ssh/cyberjosef_deploy`,
matching the per-app key convention already on the server.

Useful:

```bash
bundle exec kamal logs -f
bundle exec kamal app exec --interactive --reuse "bin/rails console"
bundle exec kamal rollback <version>
```

## Pages

| Path | What it is |
|---|---|
| `/` | Profile, tech stack, stats, experience, recent posts |
| `/projects` | Project list — title, link and tech stack |
| `/writing` | Post list with a tag filter |
| `/writing/:slug` | A post |
| `/agents` | The same CV as plain HTML — no CSS, no JavaScript |

## Where things live

| Thing | File |
|---|---|
| The CV | `content/resume.yml` — one source, read by React *and* the ERB page |
| Posts | `content/posts/*.md`, YAML front matter, parsed by `app/models/post.rb` |
| Design tokens | `app/frontend/entrypoints/application.css` |
| Page shell | `app/frontend/layouts/site-layout.tsx` |
| Theme wave | `app/frontend/lib/theme.tsx` + the `::view-transition` block in the CSS |

Publishing a post is a git commit. There is no admin, no posts table, and no
database rows anywhere in the app.

## Documents

| File | Contents |
|---|---|
| [`docs/01-stack.md`](docs/01-stack.md) | Stack, install steps and their traps, layout, routes, what is left |
| [`docs/02-design-system.md`](docs/02-design-system.md) | Colour, typography, layout, components, motion, accessibility |
| [`docs/03-content.md`](docs/03-content.md) | Page structure, copy, experience entries, content rules |

## Sources

- **Visual language** — tokens read out of the compiled stylesheet of
  https://digitalcreator.club/ (Inter + JetBrains Mono, greyscale neutral ramp,
  10px radius, 700px container). Exact values, not estimates from a screenshot.
- **Page structure** — the reference portfolio screenshot.
- **Content** — `/Users/test/Code/cv/src/data/en-batumi-10y-go.tsx`.
- **Components** — shadcn/ui core, plus `card-01` and `tabs-08` from
  https://shadcnspace.com/components/.
- **Theme switch** — ported from the `dawn` project in this workspace.

## Before it goes live

1. **Close the CV gaps.** All three are flagged in the comments of the CV data
   file itself, and they are more visible on a portfolio than on a CV:
   - No Go inside a dated job in the work history, while the headline says
     "Go, Ruby". A reviewer reads the skills list and then looks for the date.
   - No public personal Go project. The projects grid already renders a fourth,
     dashed "open slot" card so the gap stays visible instead of forgotten.
   - Two `TODO: metric` markers on the Mondido and Regate lead bullets.
2. **Write posts two and three.** One post makes the `/writing` tab bar filter a
   list of one.

Content rule, enforced across the site: nothing here claims more than the CV
claims. When Go lands in the Moyasar work history, the site follows — not before.

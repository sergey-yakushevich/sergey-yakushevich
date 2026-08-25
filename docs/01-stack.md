# Stack

A blog and portfolio for Sergey Yakushevich. Server-rendered routing from Rails,
React views over Inertia, shadcn/ui components on Tailwind v4.

**Built.** This document describes the app as it stands, and flags the two
places where the build deviated from the original plan (§2 database, §6 CV
data).

---

## 1. Why this stack

The site is content-first: a profile, a work history, a project list, and posts.
That is a documents problem, not an application problem. Inertia Rails fits
because it removes the API layer entirely — controllers render React pages
directly, and there is no client-side data-fetching layer, no serializer set, and
no second router to keep in sync with the first.

It also matches the CV. Ten years of Rails is the claim on the page; the page
running on Rails is the proof. A Next.js portfolio from a Rails engineer is a
small contradiction that a reviewer will notice.

The existing `cv/` project stays where it is — Next.js, and already working. This
is a separate site that reads the same source data. See §6.

---

## 2. Components

| Layer | Choice | Reason |
|---|---|---|
| Server | Rails 8 | Routing, controllers, content models |
| Bridge | `inertia_rails` | Controllers render React, no API |
| Client | React 19 + TypeScript | Required by the shadcn ecosystem |
| Build | Vite (`vite_rails`) | The path the Inertia generator sets up |
| CSS | Tailwind CSS v4 | The reference site is v4; tokens map directly |
| Components | shadcn/ui + shadcnspace | Copy-paste, owned in-repo, no runtime dependency |
| Database | SQLite (Rails 8 default) | The app has no tables — see the note below |
| Content | Markdown + front matter | Posts are files in git, not database rows |
| CV data | YAML, read by Rails | One copy, three readers — see §6 |
| Deploy | Kamal 2 on a VPS | Ships with Rails 8; also on-message for the CV |

Deliberately absent: no Redis, no background jobs, no CMS, no auth. A portfolio
that needs a queue has been over-built.

**On the database.** The plan said PostgreSQL, to match the CV. The app as built
has zero tables: posts are markdown files and the CV is a YAML file. Postgres
would be a service to run, back up and deploy for no rows, so the build uses the
Rails 8 SQLite default. Nothing depends on the choice — if a future feature
needs real persistence, switching is a `database.yml` change.

---

## 3. Install

Verified against the current Inertia Rails documentation.

```bash
rails new cyberjosef --skip-javascript --skip-jbuilder \
  --skip-action-mailbox --skip-action-text --skip-active-storage \
  --skip-action-cable --skip-ci

bundle add inertia_rails vite_rails
bin/rails generate inertia:install --framework=react --typescript --vite --tailwind --no-interactive
```

The generator installs the adapter, Vite, React, and Tailwind, and creates
`app/frontend/`.

### Path aliases

shadcn/ui expects `@/` to resolve. Rails puts the frontend in `app/frontend`, so
both TypeScript configs need the alias.

`tsconfig.json` — shadcn reads this one to validate the alias:

```json
{
  "compilerOptions": {
    "baseUrl": "./app/frontend",
    "paths": { "@/*": ["./*"] }
  }
}
```

`tsconfig.app.json` — this one is compiled, so it must **not** carry `baseUrl`:

```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./app/frontend/*"], "~/*": ["./app/frontend/*"] }
  }
}
```

Two traps here, both hit during the build:

1. **TypeScript 7 removed `baseUrl`.** `tsc` errors out with TS5102 if it is
   present in a compiled config. Paths now resolve relative to the config file,
   which is what the values above assume. `tsconfig.json` keeps `baseUrl`
   because it is never compiled (`files: []`) and shadcn wants to read it.
2. **Vite does not read `tsconfig` paths.** The alias has to be repeated in
   `vite.config.ts` via `resolve.alias`, or the build fails on every `@/`
   import even though the typecheck passes.

Do this **before** `shadcn init`. The init step validates the alias and fails
without it.

### shadcn/ui

```bash
npx shadcn@latest init
```

Answers that match the design system:

| Prompt | Answer |
|---|---|
| Style | New York |
| Base colour | Neutral |
| CSS variables for theming | **yes** |

"Neutral" plus CSS variables is what makes the token file in
`docs/02-design-system.md` drop in cleanly. Any other base colour produces a
tinted grey ramp that will not match the reference site.

This build wrote `components.json` by hand instead of running `init`. If you do
the same, install what `init` would have added, or the first typecheck fails on
four missing modules:

```bash
pnpm add clsx tailwind-merge class-variance-authority tw-animate-css
```

Then install only the components listed in the design system:

```bash
pnpm dlx shadcn@latest add button badge card avatar separator tooltip tabs
```

### shadcnspace

shadcnspace is a namespaced registry. Declare it in `components.json`:

```json
"registries": { "@shadcn-space": "https://shadcnspace.com/r/{name}.json" }
```

Then:

```bash
pnpm dlx shadcn@latest add @shadcn-space/card-01 @shadcn-space/tabs-08 --yes --overwrite
```

Two things to expect:

- Registry items declare `registryDependencies`, so `tabs-08` also pulls the
  base `tabs` and `switch`. Without `--overwrite` the CLI stops on an
  interactive "file already exists" prompt.
- Their file paths start with `src/components/...`, which the CLI writes to a
  `components/` directory at the **repository root**, not into `app/frontend`.
  Move them to `app/frontend/components/shadcn-space/` afterwards; the `@/`
  imports inside them are already correct.

Treat every pasted variant as our code from the moment it lands. There is no
upstream to sync with. Both items in this build were edited on arrival — see the
header comment in each file for what changed and why.

---

## 4. Directory layout

```
app/
  controllers/
    application_controller.rb  # shares resume + asset URLs with every page
    pages_controller.rb        # home, projects, agents
    posts_controller.rb        # index, show
  models/
    post.rb                    # markdown from disk, no table
    resume.rb                  # content/resume.yml, no table
  views/
    layouts/plain.html.erb     # no CSS, no JS
    pages/agents.html.erb      # plain-text CV
  frontend/
    entrypoints/
      application.css          # Tailwind v4 import + token file
      inertia.tsx              # Inertia client entry
    layouts/
      site-layout.tsx          # pill nav + 700px container + footer
    pages/
      home.tsx
      projects.tsx
      posts/
        index.tsx
        show.tsx
    components/
      ui/                      # shadcn core, owned in-repo
      shadcn-space/
        card/card-01.tsx       # article preview, rewritten to take props
        tabs/tabs-08.tsx       # animated tabs, demo payload stripped
      profile-card.tsx
      tech-stack.tsx
      experience-list.tsx
      project-card.tsx
      chip.tsx
      section.tsx
      emphasis.tsx
      stat-row.tsx
      cta-strip.tsx
      pill-nav.tsx
      theme-toggle.tsx
      brand-icons.tsx          # lucide v1 dropped GitHub / LinkedIn
    lib/
      utils.ts                 # cn() helper
      theme.tsx                # View Transitions theme wave
      resume.ts                # useResume() over the shared prop
    types/
      index.ts                 # shapes sent from Rails
      view-transitions.d.ts
content/
  resume.yml                   # the CV, single source
  posts/
    2026-08-25-search-off-mysql.md
docs/
  01-stack.md
  02-design-system.md
  03-content.md
```

`content/resume.yml` is the single source for the profile, the tech stack, the
experience list and the projects. Components read it through `useResume()`.
Nothing is typed twice.

---

## 5. Routing

| Path | Controller | Page |
|---|---|---|
| `/` | `PagesController#home` | Profile, tech stack, experience, recent posts |
| `/projects` | `PagesController#projects` | Project list |
| `/writing` | `PostsController#index` | Post list |
| `/writing/:slug` | `PostsController#show` | Single post |
| `/agents` | `PagesController#agents` | Plain text for automated readers |

An unknown slug redirects to `/writing` with a 301 rather than raising, so a
stale link from elsewhere lands somewhere useful instead of on an error page.

Posts are markdown files with YAML front matter, parsed at boot and cached. No
posts table, no admin. Publishing is a git commit, which is the correct workflow
for a site with one author.

---

## 6. Relationship to `cv/`

`/Users/test/Code/cv/src/data/en-batumi-10y-go.tsx` is the authoritative CV
content. It is a Next.js project with its own `ResumeData` type.

This site does **not** import from it. Cross-project imports between two
independent Rails and Next.js apps create a build coupling that will break the
first time either side moves. Instead, `content/resume.yml` is a copy in this
repo with the same field names, so a diff between the two is readable.

Inside this repo there is exactly one copy. The original plan had a typed
`resume.ts` for the frontend, but `/agents` is server-rendered ERB and cannot
read TypeScript — that would have meant a second copy in YAML, kept in step by
hand. Instead `app/models/resume.rb` reads the YAML, camelCases the keys, and
`ApplicationController` shares it with every Inertia page. React reads it via
`useResume()`; the ERB page reads `Resume.data`. The TypeScript shape lives in
`app/frontend/types/index.ts` and is the one thing that must be updated
alongside the YAML.

The CV file carries three open items that also apply here, marked in its own
comments:

1. **No Go in the work history yet.** The headline says "Go, Ruby" and the skills
   list leads with Go, but no dated job contains it. That gap is visible on a
   portfolio in the same way it is visible on a CV. Until something in Go ships
   at Moyasar, the site should not claim more than the CV does.
2. **No public Go project.** The `projects` array has three employer projects and
   no personal repository. A portfolio is the natural place for one, and it is
   the strongest available answer to a 3-year Go filter.
3. **Two `TODO: metric` markers** on the Mondido and Regate lead bullets.

None of these are blockers for building the site. They are content gaps to close
before it goes live, and the design system already reserves the space for them —
the projects grid takes a fourth card without any layout change.

---

## 7. Build order

1. ~~Rails app, Inertia install, path aliases, shadcn config.~~ Done.
2. ~~Token file and the two fonts.~~ Done — self-hosted Inter and JetBrains Mono.
3. ~~`site-layout.tsx`: pill nav, 700px container, footer.~~ Done.
4. ~~`content/resume.yml` populated from the CV data file.~~ Done.
5. ~~Home page: profile card → CTA strip → tech stack → stats → experience.~~ Done.
6. ~~Projects page.~~ Done.
7. ~~Markdown pipeline and the writing pages.~~ Done.
8. ~~`/agents` plain-text page.~~ Done.
9. Kamal deploy to `cyberjosef.dev`. **Not done.**

Remaining before launch, in order of what a visitor notices:

1. Close the content gaps listed in the README.
2. Write the second and third posts. One post makes a `/writing` tab bar that
   filters a list of one.

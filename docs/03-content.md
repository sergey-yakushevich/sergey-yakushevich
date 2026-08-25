# Content and page structure

The section order follows the reference screenshot. The content in each section
comes from `cv/src/data/en-batumi-10y-go.tsx`.

---

## Home page

```
┌──────────────────────────────────────────────┐
│              [ Home  Projects  Writing ]     │  pill nav, centred
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│  ┌────┐  Sergey Yakushevich   ● Remote       │
│  │ SY │  Senior Backend Engineer · Go, Ruby  │      GH   in   ↗
│  └────┘  📍 Batumi, Georgia                  │
│          ✉  sergeyayya@gmail.com             │
│  ──────────────────────────────────────────  │
│  bio paragraphs                              │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│  AI agent reading this?      [ /agents  ]    │
└──────────────────────────────────────────────┘

Tech Stack
Technologies I work with
┌───────────┐ ┌───────────┐ ┌───────────┐
│ LANGUAGES │ │  BACKEND  │ │ DATABASE  │
└───────────┘ └───────────┘ └───────────┘
┌───────────┐ ┌──────────────────────────┐
│   INFRA   │ │        PAYMENTS          │
└───────────┘ └──────────────────────────┘

Experience
  Moyasar        ·  DEC 2025 — AUG 2026
  Mondido        ·  JAN 2024 — JAN 2026
  Regate         ·  NOV 2021 — JAN 2024
  iTransition    ·  JAN 2016 — JUN 2020

Writing
  three most recent posts

Footer
```

The screenshot puts Tech Stack directly after the profile. That works here for
the same reason it works there: the strongest filter a reviewer applies is
"which technologies", and the answer should not be below the fold.

---

## Bio copy

Three paragraphs, adapted from the CV `summary` field. Emphasis in bold is the
`font-semibold` treatment described in the design system.

> Hi, I'm Sergey — a backend engineer in Batumi, Georgia.
>
> I have spent **10 years on backends**, the last five of them on payment
> systems. At Moyasar I built fraud blocking and regulatory KYC on a platform
> that has processed **350M+ payments** across 10+ microservices. Before that I
> shipped Visa installments and PCI-DSS card tokenization at Mondido, and
> rebuilt banking integrations at Regate.
>
> I take a feature from schema design through to the alert that pages someone
> when it breaks in production. Most of my career I wrote **Ruby**, and I write
> **Go** now as well.

Three paragraphs is the ceiling. The reference screenshot uses three and stops.

One deliberate change from the CV text: the CV closes with "I am looking for
backend roles in Ruby or Go." That sentence belongs on a CV sent to a specific
opening. On a permanent site it goes stale the day the search ends. The
availability signal lives in the `Remote` status badge instead, which is one
value to change rather than a paragraph to rewrite.

---

## Stat row

A count-up on first view. Three numbers, all already evidenced in the CV
bullets:

| Value | Label |
|---|---|
| 10 | years on backends |
| 350M+ | payments processed |
| 90% | faster search for 50M+ users |

Only use numbers that appear in a work bullet on the same page. A statistic
without an adjacent claim reads as decoration.

---

## Experience entries

Taken from the CV `work` array with no rewriting. Employer-assigned job titles
stay exactly as they are — the CV file is explicit about this, and for good
reason: a rewritten title is what falls apart in a reference check.

Three bullets are shown per role, chosen as the strongest available:

**Moyasar** — Senior Ruby on Rails Engineer
- Built the fraud system that scores and blocks transactions on risk signals, on
  a platform that has taken 350M+ payments across 10+ microservices.
- Shipped identity verification to the regulator's spec, which is what opened
  new markets.
- Wrote the alerting for payment flow disruptions and took time-to-detection
  from hours to seconds.

**Mondido** — Senior Ruby on Rails Engineer
- Delivered the Visa installment integration end to end, backend and checkout UI.
- Built PCI-DSS compliant card tokenization, so raw card numbers stayed out of
  our systems.
- Compared several audit log designs, then built the one that traces every
  merchant and staff action without adding request latency.

**Regate** — Senior Ruby on Rails Engineer
- Automated per-pull-request AWS environments in CI, so reviewers got a running
  app instead of a screenshot.
- Owned the payment and banking API integrations behind the automated accounting
  workflows.
- Started the Service Layer refactor that pulled business logic out of
  callback-heavy Rails models.

**iTransition** — Software Engineer
- Moved the main search workload off MySQL onto Elasticsearch and made it 90%
  faster for 50M+ users.
- Made the test pipeline 5x faster, taking a release cycle from days to hours.
- Introduced Kafka, which let the microservices stop calling each other
  synchronously.

The remaining bullets from the CV sit behind the "Show more" toggle.

---

## Projects page

Three project cards from the CV `projects` array: Moyasar payments platform,
Mondido checkout, Regate accounting automation. Each card carries the title, an
outbound link, and the tech stack as chips. No prose description — the stack is
what a reviewer scans for, and a paragraph per project repeats what the
experience section already says.

The CV file flags the gap directly: there is no public personal Go project. The
grid takes a fourth card with no layout change, and that card is the one worth
building. A payments-shaped service in Go would double as domain proof and
answer the Go-experience filter at the same time.

---

## Writing

Markdown files in `content/posts/`, with front matter:

```yaml
---
title: "Why we moved search off MySQL"
date: 2026-08-25
summary: "One sentence for the list page."
tags: [elasticsearch, postgres, performance]
status: published   # or draft
---
```

`draft` posts render in development only, and carry the `--signal-attention`
marker in the list.

The list page shows title, date and reading time in the mono label style,
summary, and tags. No excerpt beyond the summary line, no view counter.

---

## The `/agents` page

Plain semantic HTML, no JavaScript, no styling beyond the browser default. It
carries the full CV text, every bullet rather than the three shown on the home
page.

The reasoning is in the CV file itself: it is written for automated screening,
and the first reader is often a filter rather than a person. A page that answers
that reader cleanly costs one controller action.

---

## Content rules

1. Nothing on the site claims more than the CV claims. When the CV adds Go to
   the Moyasar work history, the site follows. Not before.
2. Every number is traceable to a bullet on the same page.
3. Job titles are quoted exactly as the employer assigned them.
4. Company names link to the company site.
5. Both spellings — "Go" and "Golang" — appear in the tech stack, for the same
   search reason the CV file gives.

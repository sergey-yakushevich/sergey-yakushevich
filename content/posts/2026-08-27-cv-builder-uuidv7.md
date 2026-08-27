---
title: "I shipped a CV builder because I wanted an excuse to use UUIDv7"
summary: "I had a small local script that printed my CV to PDF. Then I got tired of sites charging money to download a file, so I made it a real thing."
date: 2026-08-27
tags: [nextjs, uuidv7, pdf]
cover_image: /images/posts/cv-builder-uuidv7/cover.webp
status: published
---

For a while I had a small local project that turned an HTML page into a PDF. I
used it to print my own CV. One source of truth for the content, no Word
document quietly drifting away from it.

It sat on my laptop for months doing exactly that and nothing else.

Then I got annoyed enough at CV sites charging money to download your own file
that I turned it into [buildcv.cc](https://buildcv.cc/). Unlimited CVs, real
PDF download, free, no account.

## The part I actually wanted to build

No registration. Every first visit mints a **UUIDv7** and puts it in a
first-party httpOnly cookie. That id owns the workspace, so the session
survives a refresh and nobody has to invent a password they will forget.

I will be honest: I built the whole thing because I wanted to use UUIDv7
somewhere. Everything else is a justification I worked out afterwards.

It does earn its place, though. UUIDv7 is time-ordered, so ids sort by creation
without a separate timestamp column, and rows land in order instead of
scattering across the index the way v4 does.

## What that costs

The id in the URL is the whole permission model. Anyone holding a link can read
that CV, download it, and edit it. That is the trade for having no accounts —
there is no session to check because there is no account to check it against.
CV pages are `noindex`, outbound links carry `noreferrer`, and the analytics
tracker reports a fake path, so the URL never leaks somewhere it shouldn't.

Clearing cookies loses the workspace. That is real, and I decided it was worth
it.

## The thing I took out

I did build fingerprinting first, to survive a cleared cookie. Then I read the
numbers: the open-source libraries land somewhere around 40–80% uniqueness.

For analytics, fine. Here, a collision shows one person another person's CV —
name, email, phone number. A cookie is exact. So the fingerprinting came back
out, and losing your workspace when you clear cookies is the price.

## Stack

Next.js and shadcn on the front, SQLite underneath, and the PDF is the page
itself printed by headless Chrome — not a rebuilt document, not a screenshot.
So the file you download is the thing you were looking at.

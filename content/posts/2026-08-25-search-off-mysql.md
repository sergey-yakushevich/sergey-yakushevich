---
title: "Moving search off MySQL, and what it actually cost"
summary: "A LIKE query against 50M rows is not a search engine. Here is what replacing it looked like, including the part nobody writes down."
date: 2026-08-25
tags: [elasticsearch, performance, postgres]
cover_image: /images/posts/search-off-mysql.jpg
status: published
---

The search box was a `LIKE '%term%'` against a table with fifty million rows.
It worked for years, which is the dangerous part — nothing breaks loudly, the
p50 stays fine, and only the p99 quietly walks off a cliff.

## What the numbers said

The query plan was a full table scan every time. MySQL cannot use an index for a
leading wildcard, so the optimiser was not doing anything wrong. We were asking
the wrong question of the wrong tool.

```sql
EXPLAIN SELECT * FROM listings
WHERE title LIKE '%wireless keyboard%'
LIMIT 20;
-- type: ALL, rows: 51_402_118
```

Fifty million row reads to return twenty results.

## The move

We put the searchable projection into Elasticsearch and left the source of
truth in MySQL. That distinction matters more than the index design: the search
cluster is a derived read model, so it can be rebuilt from scratch at any time,
and losing it is an availability problem rather than a data-loss problem.

Three things made it survivable:

1. **Dual-read behind a flag.** Both paths ran for two weeks, and we compared
   result sets rather than latency. Latency was never in doubt; correctness was.
2. **Reindex as a routine job, not an incident procedure.** If rebuilding the
   index is something you only do in an emergency, you will discover it is
   broken during the emergency.
3. **The projection was explicit.** No "index the whole row and figure it out
   later". Every field in the mapping had a reason to be there.

The result was about 90% faster at the p99, which is the number that ended up on
my CV. It is a true number, and it is also the least interesting thing about the
project.

## The part nobody writes down

The interesting part is that search results changed. Not "got better" — changed.
A `LIKE` query is a substring match with no notion of relevance, so users had
spent years learning to type in a way that made substring matching work. When
relevance scoring arrived, the queries those users had trained themselves to
write started returning different things.

We had no metric for that. We had latency dashboards, error rates, and index
lag, and none of them would have moved if search had become subtly worse for the
people who used it most.

That is the lesson I actually took: when you replace a system, instrument the
thing that changed, not the thing that improved.

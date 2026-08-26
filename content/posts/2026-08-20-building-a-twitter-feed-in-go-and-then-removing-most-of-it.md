---
title: "Building a Twitter feed in Go, and then removing most of it."
summary: "I’m still learning Go, so I skipped “todo list” and went straight to “rebuild a social network used by a sixth of the planet.” The target was 600,000 timeline writes per second."
date: 2026-08-20
tags: []
canonical: https://medium.com/@sergeyayya/building-a-twitter-feed-in-go-and-then-removing-most-of-it-14cfd513c91a
status: published
---

I’m still learning Go, so I skipped “todo list” and went straight to “rebuild a social network used by a sixth of the planet.” The target was 600,000 timeline writes per second. I hit it, on paper, and here is the thing I didn’t expect: every decision that got me there **removed** a part of the system.

An outbox table. A relay process. A transaction. A column. An index. A whole class of bug. All deleted, and the system got more capable each time. The moment it finally clicked, none of my own code was running.

**The numbers I was designing against:**

- About 1 billion users, 100 followers each.
- 500 million posts a day — roughly 6,000 posts per second.
- 6,000 × 100 ≈ **600,000 timeline writes per second**.
- About **50 billion timeline rows per day**, at 1 KB per post.
- People read far more than they write. The read has to be fast.

Those numbers are, to use the technical term, a lot. They are also completely made up by me, at my desk, deciding that I am Twitter now. So treat everything below as a design study, not a benchmark. I measured nothing. What I can defend is the shape of the thing, and the shape is what this piece is about.

Because scaling is supposed to be additive. More shards, more consumers, more queues, more machines. That’s what the word means everywhere else. So how do you get to 600,000 writes a second by taking parts *out*?

## The first decision: build the feed before anyone asks for it

Start with the obvious way to do it. You open your feed. The system looks up the 100 people you follow, fetches their recent posts, merges the lot, and sorts by time. Those 100 people are spread across 100 different machines, so showing you one screen means 100 reads.

And that happens every time anyone scrolls, which on a social network is constantly. Meanwhile the posting itself is rare. So the expensive operation is the one people do all day, and the cheap one is the one they hardly do at all.

I flipped it. Now the work happens when you post:

- You post once.
- The system immediately writes one row into each of your followers’ timelines.
- Your feed is already sitting there, in order, waiting to be read.

A read is now one scan, of one place, on one machine. The expensive read is gone. Deleted. The name for this is **fan-out on write** — one post fans out into hundreds of little rows — and I’ll use that term for the rest of the piece.

But I should be honest about what just happened, because it’s the thing the rest of the article depends on. **Fan-out doesn’t delete any work.** It moves it. I traded one slow read for six hundred thousand writes a second, which is a much worse problem than the one I started with. If nothing in the system is already good at absorbing 600,000 sequential writes a second, I’ve made it worse.

So the question isn’t “how do I build something that fast.” It’s “what here is already writing like that anyway?”

## The write path was already sequential

I used two databases, and split them by how much I’d cry if I lost them.

- **Postgres** holds posts and follows. This is the source of truth. Lose it and the data is gone.
- **Cassandra** holds timelines and followers. This is derived data. I can delete all of it and build it again from Postgres.

Cassandra takes the fan-out for one reason above the others: it appends new rows to a commit log, sequentially, because that’s how it makes writes durable. It was going to do that whether I showed up or not. My 600,000 writes a second ride on a mechanism that exists for a completely different reason.

```
CREATE TABLE timeline (
  user_id   uuid,
  post_id   uuid,
  author_id uuid,
  PRIMARY KEY ((user_id), post_id)
) WITH CLUSTERING ORDER BY (post_id DESC);
```

user\_id is the partition key, so one user's rows live together on one node. That's the same trick again: the partition key exists to place data, and placing data is exactly what makes the feed read cheap. I didn't build a colocation layer. I named a column.

Cassandra also has no leader, which matters more than it sounds. A single-leader database stops accepting writes for a few seconds while it elects a new one, and fan-out stalls for that whole window. Cassandra doesn’t pause. And a feed that’s 200 milliseconds stale is fine — nobody has ever been harmed by seeing a hot take one fifth of a second late.

A row of *what*, though? Only identifiers. No post text.

- One row is 48 bytes. One post is about 1 kilobyte.
- Storage drops from ~50 TB/day to ~2.4 TB/day.

The bodies get fetched at read time, from a cache, so the system keeps *one* copy of a popular post instead of a million identical ones. This step is called **hydration**, which sounds far healthier than it is.

One trap, which caught me: fan-out writes to your **followers**, not to the people you follow. Those are different groups, and mixing them up gives you a feed of your own posts, which is a lonely product. Postgres can answer “who do I follow?” quickly, because the follows primary key starts with follower\_id. It cannot answer the reverse without reading the whole table, and fan-out asks the reverse on every single post. So that answer lives pre-computed in Cassandra:

```
CREATE TABLE followers (
  user_id     uuid,
  follower_id uuid,
  PRIMARY KEY ((user_id), follower_id)
);
```

> ***Assumed, not measured:****that all of Cassandra’s contents can be rebuilt from Postgres. That’s true in principle — it’s derived data — but at 50 billion rows a day a rebuild is a multi-day operation, not a relaxing afternoon. “Just rebuild it” is a recovery plan with a real recovery time, and I never timed mine.*

## The new problem: the post saves, but nobody ever sees it

One post fans out to hundreds of separate Cassandra writes, each able to fail on its own. That genuinely needs a queue, and Kafka is the right call. Which leaves the handoff: the app writes a row to Postgres, then publishes to Kafka. Two systems, no shared transaction, no safety net.

```
db.Insert(post)        // this succeeds
kafka.Publish(post)    // ← the process dies right here
```

- The post is in the database. The event never reaches Kafka.
- No follower ever sees it. The failure is permanent **and silent**.
- The author sees their own post and assumes all is well. Nobody else does.
- Reversing the order is no better — now an event can point at a post that Postgres rolled back.

This is the dual-write problem, and it’s the kind of bug that never pages you. It just quietly makes the product worse until somebody complains on the internet.

## The standard fix: a second table, and a process to drain it

The standard answer is the outbox. Write the post *and* an outbox row in one transaction, then run a separate process that reads the outbox and publishes to Kafka.

```
func (s *Store) CreatePost(ctx context.Context, authorID, text string) (model.Post, error) {
    p := model.Post{
        ID:        uuid.NewString(),
        AuthorID:  authorID,
        Text:      text,
        CreatedAt: time.Now().UTC().Truncate(time.Millisecond),
    }
```

```
    err := pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
        if _, err := tx.Exec(ctx,
            `INSERT INTO posts (id, author_id, text, created_at) VALUES ($1,$2,$3,$4)`,
            p.ID, p.AuthorID, p.Text, p.CreatedAt); err != nil {
            return err
        }
        return enqueue(ctx, tx, queue.TopicPosts, p.AuthorID, p)  // the second INSERT
    })
    return p, err
}
```

And then you get to run this, forever:

```
for {
    rows, _ := st.UnpublishedOutbox(ctx, 100)
    if len(rows) == 0 {
        time.Sleep(200 * time.Millisecond)
        continue
    }
    for _, r := range rows {
        queue.Publish(ctx, prod, r.Topic, r.Key, r.Payload)
    }
    st.MarkPublished(ctx, ids)
}
```

It works. It also costs you four things:

- An extra row written on every single operation.
- One more process to run, monitor, alert on, and scale.
- The relay polls, so you’ve added latency on purpose.
- Two relays can grab the same row, so now you need locking.

Look at what that solution is made of. Every item on that list is a part I had to *add*. The outbox solves the problem by doing more work — a second write to guard the first one, and a process whose entire job is to notice that the second write happened. It’s the exact opposite of every decision that worked so far.

Which is the tell. When the fix is a new component, I’ve probably stopped looking too early.

## So I went looking for who was already doing it

The job is: produce a durable, ordered, complete record of every change to the posts table. Ask it that way and the answer is embarrassing. **Postgres already writes one.** It’s called the write-ahead log, it exists so replicas can be rebuilt, and a log good enough to reconstruct an entire replica is by construction good enough to feed a fan-out.

Debezium pretends to be a Postgres replica and reads that log directly. So the event stream comes out of work the database was already doing.

```
func (s *Store) CreatePost(ctx context.Context, authorID, text string) (model.Post, error) {
    id, err := uuid.NewV7()
    if err != nil {
        return model.Post{}, err
    }
```

```
    p := model.Post{
        ID:        id.String(),
        AuthorID:  authorID,
        Text:      text,
        CreatedAt: time.Now().UTC().Truncate(time.Millisecond),
    }
```

```
    _, err = s.pool.Exec(ctx,
        `INSERT INTO posts (id, author_id, text, created_at) VALUES ($1,$2,$3,$4)`,
        p.ID, p.AuthorID, p.Text, p.CreatedAt)
    return p, err
}
```

One INSERT. One return. That’s the whole function.

No transaction. No second write. No outbox table. The relay process — deleted. The commit **is** the event, so there’s no gap between the two operations and no window in which to lose one.

It wants three things, none of them exotic: wal\_level set to logical, a replication slot, and the pgoutput plugin that ships with Postgres 10 and up.

Then I ran the test I enjoyed most. I typed a single INSERT into psql by hand, bypassing my application completely, and the post showed up in every timeline.

Debezium captures *all* writers. My app, my scripts, my migrations, and me at 2 a.m. poking at prod. Which means the thing that defines a post is no longer my Go handler. It’s the table. I didn’t replace the relay with a better relay; I moved the boundary of the system down a level, from the application to the database.

## The catch: everything downstream now depends on my table

There’s a real price for this, and it isn’t obvious until later. Debezium sends out row images, not events I designed. So whatever my posts table looks like today *is* the contract, and every consumer downstream is now built against it. Rename a column and they all break at once.

The outbox would have protected me from that, because I’d have been writing the event by hand and could shape it however I liked. Debezium gave me a much simpler system instead. Pick your poison, then write down which poison you picked, so future-you doesn’t have to guess.

> ***Assumed, not measured:****that schema churn on a hot table is rare — a column rename a quarter, maybe — and that the cost is a coordinated deploy rather than an outage. If your posts table changes weekly, this trade inverts and the outbox is the right call.*

So “every good decision deleted something” is too strong, and I should fix it before somebody else does. Nothing was deleted. The work was moved onto a component that was already paying for it. In absolute terms this system does *vastly* more work than the naive one — 50 billion rows a day to avoid a join. What got cheaper is only the part **I** own.

That’s a smaller claim. It’s also the useful one, because it tells you what to go looking for.

## The same move, hiding in the primary key

Claude suggested UUIDv7 instead of UUIDv4, and it turned out to be the same move again, in a much smaller place. A UUIDv7 packs a millisecond timestamp into its first 48 bits:

```
01a0142f841e  7fb  ...random...
└─ 48 bits ─┘ └┬┘
  timestamp  version
```

Every index is a promise the database keeps for you, and the primary key index was already keeping mine sorted. UUIDv7 just makes that sort *mean* something.

- IDs sort by time, because their **bytes** sort by time.
- New rows land at the end of the B-tree. UUIDv4 scatters inserts across random pages and fragments the index, which is exactly as fun as it sounds.
- No index on created\_at needed. The primary key is already ordered.
- I dropped created\_at from the timeline table entirely and sort by post ID — 8 bytes off every row of the biggest table in the system.
- The pagination cursor is a post ID, not a timestamp, so time-zone bugs are now structurally impossible. My favourite kind of impossible.

You can even recover the creation time from the ID:

```
01a0142f-841e-71fb-...   0x01a0142f841e = 1787045053470 ms = 09:24:13.470Z
```

Postgres 18 ships a uuidv7() function. On anything earlier, generate them in the app and feel slightly smug about it.

So there are two different mechanisms handing out free work here, not one. Durability makes databases keep ordered, complete logs — that’s Debezium. Indexes make databases keep invariants — that’s UUIDv7. Different machinery, same opportunity.

## The whole thing, at last

```
POST /posts → INSERT INTO posts        ← the app does nothing else
                     │
               postgres WAL
                     │
                 Debezium
                     │
                   Kafka
           ┌─────────┴─────────┐
        posts               follows
           │                   │
        fanout               graph
           │                   │
           ▼                   ▼
      timeline            followers
      (one row           (the reverse index:
     per follower)        who follows me)
```

```
GET /feed → one partition scan → hydration → cache
```

The write is one INSERT. Every stage scales alone. New consumers — search, analytics — attach to the same stream without touching the application, and all writes are idempotent, so at-least-once delivery is safe and I don’t need exactly-once. Which is good, because I wasn’t going to get it.

## Where it stops

There’s one part of this design I skipped, and it turns out to be the most interesting part, because it’s the only place where the trick fails completely.

Some accounts have more than 100 million followers. You cannot fan out for those. One post becomes 100 million writes, and those writes park at the front of the queue and ruin the day for everyone else’s perfectly reasonable posts. The real fix needs a second mechanism: detect the popular accounts, don’t fan them out, cache their posts, and merge at read time.

I didn’t build it, and I told myself that was to keep the example small.

But look at *why* there’s nothing to borrow here. Nothing in Postgres is already tracking “which accounts are too big to fan out.” No index maintains it. No log implies it. Durability doesn’t produce it as a side effect. The requirement is genuinely new to every system in the stack, so there is no free work anywhere, so I have to add a real component — and that’s the first time in this whole build that adding one was the correct answer.

Which also means I have to correct the diagram above. With celebrities handled properly, a feed read is a partition scan **plus** a merge. Not one scan. I’d been quoting the clean version of my own architecture because I’d skipped the part that dirties it.

> ***Assumed, not measured:****that below roughly ten thousand active users, none of this is right. At that size the naive read across 100 authors is fine, and every deletion in this article is a component you’d be adding for no reason. The whole design only becomes correct above some threshold, and I never found mine.*

So here’s the rule, with its edges on. You get free work when the system already maintains the invariant you want, for its own reasons. You pay full price when your requirement is new to it. And the moment you find yourself adding a component, that’s the signal to go looking one more time — because the outbox looked necessary too, right up until I asked who else was already writing a log.

The test I liked best was the one where my own code never ran. I typed an INSERT by hand, and a million timelines updated.

Every part I deleted was already being kept by something else. Every part I had to add was a place where nothing was.

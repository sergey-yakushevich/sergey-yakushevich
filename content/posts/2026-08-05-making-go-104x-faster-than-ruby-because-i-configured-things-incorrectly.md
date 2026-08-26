---
title: "Making Go 104x faster than Ruby because I configured things incorrectly"
summary: "I was reading a 2015 Twitter engineering post — Handling five billion sessions a day in real time. Hundreds of thousands of compressed payloads per second, all landing on one ingest tier."
date: 2026-08-05
tags: [go, ruby, performance, benchmarks]
cover_image: /images/posts/making-go-104x-faster-than-ruby-because-i-configured-things-incorrectly/01.webp
canonical: https://medium.com/@sergeyayya/making-go-104x-faster-than-ruby-because-i-configured-things-incorrectly-eea9ff170faa
status: published
---

I was reading a 2015 Twitter engineering post — [Handling five billion sessions a day in real time](https://blog.twitter.com/engineering/en_us/a/2015/handling-five-billion-sessions-a-day-in-real-time). Hundreds of thousands of compressed payloads per second, all landing on one ingest tier.

Go appears in that article exactly once:

> This service is written in GOLANG, fronted by Amazon Elastic Load Balancer (ELB), and simply enqueues every payload that it receives into a durable Kafka queue.

Everything else is JVM. One component, one job: accept gzipped event batches, push them into Kafka.

I’m transitioning from Ruby to Go, and reading about someone else’s design decision isn’t the same as understanding it. So I built that service twice — once in Go, once in Ruby — and measured it.

My first run said Go was **104x faster**.

That number is garbage. So are most numbers in posts like this one. Here’s how I got it, and what survives six corrections.

## The rules

Both servers implement the same contract, or I’d be measuring the difference between two programs instead of two runtimes.

```
POST /events
  gzipped JSON batch, ~20 events
  → gunzip → parse → validate → 202 {"accepted":20}
```

Same payload files, byte for byte. Same validation, in the same order.

One knob: **how long the server waits before replying.**

- **0 ms** — reply immediately. Measures pure CPU cost.
- **15 ms** — sleep first, modelling the Kafka ack the real service waited on.

That knob turns out to decide the entire result.

Five servers:

```
------  -------------------------------------------
go-v1   net/http, goroutine per request, no pooling
go-v2   + bounded queue, worker pool, load shedding
go-v3   + sync.Pool, GC tuning
puma    Ruby, thread pool × forked workers
falcon  Ruby, fibers on a reactor
```

Hardware: M4 Pro, 14 cores, 48 GB. Load generator is oha, running on the same machine — which turns out to matter a lot.

## The 104x number

Here’s the run that made Go look incredible. 15 ms wait, 5000 concurrent connections.

```
go-v1     87,470 successful rps
puma         838 successful rps
```

104x. Ship it, rewrite everything in Go.

Except I made six separate mistakes to get there.

## Fix 1: Raise your file descriptor limit

My first real run looked like this:

```
Success rate: 98.94%
Requests/sec: 15000.2404
```

```
Error distribution:
  [4756] Too many open files (os error 24)
  [244]  aborted due to deadline
```

98.94% success rate. Looks fine. It isn’t.

I asked for 5000 concurrent connections. Watch the arithmetic:

```
5000 requested
- 4756 "Too many open files"
= 244 connections that actually opened
```

Confirm it with Little’s Law (throughput = concurrency ÷ latency):

```
15,000 rps × 0.0164 s = 246 requests in flight
```

**The test ran at 244 concurrency, not 5000.** macOS ships a soft limit of 256 file descriptors, which GUI terminals inherit:

```
launchctl limit maxfiles
    maxfiles    256    unlimited
```

244 sockets + stdio + the payload file ≈ 256. oha hit the wall and the remaining 4756 connections failed instantly.

With a 15 ms wait, throughput is *purely* concurrency ÷ 15ms. So I measured my shell's ulimit, not a server.

```
ulimit -n 200000   # in BOTH terminals — the server needs fds too
```

The fix is one line, and every result before it was fiction.

## Fix 2: Calibrate the load generator

Second run, limits fixed:

```
Requests/sec: 99357.5061
Average:      0.0488 sec
```

99k rps. Better. Also still meaningless, because I never asked the obvious question: **how fast can**oha**itself go on this box?**

Both servers expose a /static endpoint that returns two bytes and does nothing:

```
oha -z 8s -c 500 http://127.0.0.1:8080/static
  Requests/sec: 145454.8923
```

145k is the ceiling of the measuring instrument. My 99k result is 68% of it. I wasn’t measuring a server, I was measuring oha sharing 14 cores with the thing it was testing.

The proof is a decomposition — same server, increasing amounts of work:

```
what the server does                rps
----------------------------------  -------
/static — returns 2 bytes           115,210
/events — gunzip + JSON + validate  92,437
/events — all that + 15 ms wait     95,726
```

Read the last two rows again. **Adding a 15 ms sleep to every request did not reduce throughput.** If the server were the bottleneck that would be impossible.

Any benchmark that doesn’t publish its tool ceiling is publishing the tool.

![](/images/posts/making-go-104x-faster-than-ruby-because-i-configured-things-incorrectly/01.webp)

## Fix 3: Count successful responses

oha reports this at the top:

```
Requests/sec: 1649.9263
```

And this at the bottom:

```
Status code distribution:
  [202] 24899 responses
Error distribution:
  [20678] timeout
  [4050]  aborted due to deadline
```

Do the division:

```
(24,899 + 20,678 + 4,050) ÷ 30.078 s = 1,649.9   ← what it printed
 24,899                    ÷ 30.078 s =   827.8   ← actual successful rps
```

The headline number counts timeouts as throughput. For an overloaded server that inflates the result by 2x. Every number in the rest of this article is successful 202s only.

## Fix 4: Compare like cores to like cores

This one is the biggest single contributor to the 104x.

Go’s GOMAXPROCS defaults to your core count — Go gets all 14 cores for free. Ruby's GVL means one process executes at most one thread of Ruby bytecode at a time, so **one Puma worker is one core**. The default is one worker.

I was comparing a 14-core Go process to a 1-core Ruby process and calling it a language benchmark.

With that controlled, with no wait:

```
rps     CPU µs/req  RSS
-------------  ------  ----------  -----
go-v1, 1 core  18,706  53.6        31 MB
puma, 1 core   19,010  58.6        74 MB
```

**Ruby is 9% more expensive per request.** Not 104x. Nine percent.

![](/images/posts/making-go-104x-faster-than-ruby-because-i-configured-things-incorrectly/02.webp)

## Why Ruby holds up here

Look at where the work actually happens:

```
step        Ruby                       Go
----------  -------------------------  ------------------------------------
gunzip      Zlib → C                   compress/gzip → pure Go
JSON parse  json gem → C extension     encoding/json → pure Go + reflection
HTTP parse  puma_http11 → C extension  net/http → pure Go
```

Ruby delegates every hot path to battle-tested C. Go’s stdlib is pure Go, and encoding/json is reflection-based and not fast. On this workload "Ruby" is mostly C and "Go" is mostly Go.

“Go is faster than Ruby” is not a language property. It depends entirely on where the work lands.

## Fix 5: Configure both sides

Puma’s defaults are 1 worker and 16 threads. That’s 16 concurrent requests. With a 15 ms wait:

```
16 slots ÷ 0.020 s service time = 800 rps
```

Measured: 838. So the default config was never going to produce anything else.

Sweeping the knob shows exactly what’s happening:

```
config     slots  rps     rps ÷ slots
---------  -----  ------  -----------
1w × 16t   16     838     52.4
1w × 64t   64     3,135   49.0
1w × 256t  256    10,828  42.3
14w × 32t  448    24,299  54.2
```

That fourth column is essentially constant. Puma’s throughput is slots ÷ service time, full stop. Quadruple the threads, quadruple the throughput.

**Puma wasn’t slow. It was under-configured**, and I published the number anyway.

![](/images/posts/making-go-104x-faster-than-ruby-because-i-configured-things-incorrectly/03.webp)

Note the falloff at 256 threads (52.4 → 42.3). That’s where a single process stops being slot-bound and starts being CPU-bound — one core of Ruby doing gunzip and JSON tops out around 10k rps regardless of thread count.

## Fix 6: Pick the workload that matches production

Here’s the same two servers, all 14 cores, with the wait knob flipped:

```
wait   go-v1   puma    winner
-----  ------  ------  --------
0 ms   87,780  98,574  Ruby
15 ms  90,563  12,381  Go, 7.3x
```

Same code. Same hardware. Opposite conclusions.

With no wait, requests finish in microseconds and nothing ever blocks — so Ruby’s 224 thread slots are plenty and it wins on raw throughput. With a 15 ms wait, every in-flight request holds a thread, and Ruby runs out.

Which one is “the truth”? Neither on its own. But the real service wrote to a **Kafka broker over the network**, so requests blocked. The 15 ms wait is the honest one for this workload, and a post that quietly picked 0 ms would be just as wrong as one that quietly picked default Puma.

## The honest numbers

Everything tuned, 14 cores, 15 ms wait, 5000 concurrent, successful requests only:

```
server                  rps      CPU µs/req  RSS      p50    p99
----------------------  -------  ----------  -------  -----  -------
go-v3 (pooled, tuned)   115,766  67.4        303 MB   37 ms  207 ms
go-v1 (naive)           90,563   93.7        658 MB   50 ms  190 ms
go-v2 (pool, no reuse)  87,958   95.5        547 MB   1 ms   1585 ms
falcon (Ruby, fibers)   71,939   131.0       1988 MB  45 ms  113 ms
puma 14w × 16t          12,381   110.6       486 MB   17 ms  1096 ms
```

Best Go against best Ruby:

```
throughput   115,766 vs 71,939   →  1.6x
CPU/request     67.4 vs  131.0   →  1.9x
memory          303 vs    1988   →  6.6x
```

**1.6x, not 104x.** The other 65x was my benchmarking.

And even 1.6x is soft — go-v3 hit 80% of the tool’s 145k ceiling, so Go’s real number is higher than I can measure on one machine.

## Four things that surprised me

**Falcon is not Puma.** Same application code, same Rack app, 5.8x the throughput (71,939 vs 12,381). Fibers instead of threads means a blocked request costs kilobytes instead of a megabyte. It also posted the **best p99 of any server tested** — 113 ms, better than Go’s 190 ms. Ruby has a good answer to goroutines and almost nobody uses it.

**Go’s memory is not automatically small.** go-v1 used 658 MB — more than Puma. With 5000 in-flight requests each holding a ~40 KB gzip.Reader and a decompressed buffer, it adds up. Concurrency capacity isn't free, it's paid in RAM. sync.Pool in v3 brought it back to 303 MB.

**Worker pools are a trap when requests block.** go-v2 and go-v3 default to WORKERS = GOMAXPROCS × 2 = 28. With a 15 ms wait that caps the drain rate at 28 ÷ 0.015 = 1,866/sec. Result:

```
go-v2 (WORKERS=28)    2,323 rps    1,310,377 requests shed with 503
go-v3 (WORKERS=28)    2,212 rps    1,867,034 requests shed with 503
```

39x *worse* than the naive v1, which just spawns a goroutine per request and has no such ceiling. WORKERS=4096 fixes it completely. Bounded queues are for fast work; when requests block you size workers to your concurrency, not your cores.

**Puma at 12,381 rps was using 1.4 of 14 cores.** It had 12.6 cores idle and still couldn’t go faster, because all 224 threads were parked in sleep. Adding cores does nothing. Only threads help. That's the difference between parallelism and concurrency capacity, in one measurement.

![](/images/posts/making-go-104x-faster-than-ruby-because-i-configured-things-incorrectly/04.webp)

## Conclusion

Go won this task for two reasons: a blocked request costs ~2 KB instead of ~1 MB, and the whole thing fit in 303 MB instead of 1,988 MB. Both matter enormously for a service whose entire job is holding connections open while something slower finishes — and not much at all for anything else.

Look at what’s actually written in Go: Kubernetes, Prometheus, Traefik, etcd, kubectl. Every one of those is a hold-many-connections problem or a ship-a-binary problem. Not one of them is a business-logic problem.

And Ruby held up far better than I expected. Per core, on pure request processing, it was 9% behind Go — not 10x, not 100x. With no wait it beat Go outright. And Falcon, which almost nobody uses, produced the best p99 in the entire test while running the exact same application code as Puma.

Comparing Ruby to Go is a bit like comparing movies to film cameras. They serve different things — one is where you express the idea, the other is the equipment that gets it recorded. Arguing about which is “better” means you’ve misunderstood what each is for.

I’d still write the business logic in Rails. I’d write the thing standing in front of it in Go.

Full source: [github.com/sergey-yakushevich/go-vs-ruby-ingest-bench](https://github.com/sergey-yakushevich/go-vs-ruby-ingest-bench)

Memes generated with [memegen](https://github.com/jacebrowning/memegen) via memes/generate.py, plus memes/render\_local.py for templates that only exist in a local checkout.

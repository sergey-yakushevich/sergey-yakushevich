---
title: "How much RAM Rails app uses?"
summary: "RAM is one of the most important resources for modern web apps. If we run out of RAM, things get really slow."
date: 2025-09-10
tags: []
canonical: https://medium.com/@sergeyayya/how-much-ram-rails-app-uses-442098b9ac25
status: published
---

RAM is one of the most important resources for modern web apps. If we run out of RAM, things get really slow. The system either starts swapping into disk (20–50x slower than RAM) or worse - processes crash.

That’s why understanding **where our memory goes, how much gets allocated per request**is critical to building reliable Rails apps.

In this article, I’ll walk through a few practical strategies and tools that I actually ran on a demo Rails app. We’ll look at live memory tracking with a Rack middleware, and then jump into deeper profilers like **stackprof**, **memory\_profiler** and **derailed\_benchmarks**. I’ll also show real outputs from running these tools.

## A Simple GC Middleware

The simplest starting point: measure memory and allocations during each request, right inside your app.

To test we create simple endpoint, that just returns json.

```
class SpeedController < ApplicationController
  def check
    render json: { success: 1 }
  end
end
```

We can add a Rack middleware that looks at Ruby’s GC stats **before** and **after** each request and then reports:

- How many objects were allocated during the request
- How much RAM the whole process is currently using

Here’s an example:

```
class AllocationCounter
  def initialize(app)
    @app = app
  end

  def call(env)
    before_alloc = GC.stat[:total_allocated_objects]
    before_mem   = current_memory

    status, headers, response = @app.call(env)

    after_alloc = GC.stat[:total_allocated_objects]
    after_mem   = current_memory

    headers["X-Allocations"] = (after_alloc - before_alloc).to_s
    headers["X-Memory-MB"]   = after_mem.to_s

    [status, headers, response]
  end

  private

  def current_memory
    pid = Process.pid
    status = File.read("/proc/#{pid}/status") rescue nil
    if status && status =~ /^VmRSS:\s+(\d+) kB$/m
      ($1.to_i / 1024.0).round(1)
    else
      `ps -o rss= -p #{pid}`.to_i / 1024.0
    end
  end
end
```

And the output looks like this:

```
curl -i http://localhost:3000/
HTTP/1.1 200 OK
X-Allocations: 28848
X-Memory-MB: 78.6
```

We can see that during this simple request rails allocated 28k objects and ~78 MB of ram was used.

Lets see what happens when we create 10k ActiveRecord objects in this endpoint

Here is what controller looks like now:

```
class SpeedController < ApplicationController
  def check
    objects = 10_000.times.map do |i|
      Test.new(data: "obj#{i}")
    end

    # Just return a count so the response stays small
    render json: { success: 1, created: objects.size }
  end
end
```

And the output looks like this:

```
curl -i http://localhost:3000/
HTTP/1.1 200 OK
X-Allocations: 192393
X-Memory-MB: 98.2
```

So to create 10k ActiveRecord objects Rails allocated almost 166k new objects and used almost 20 MB of RAM.

## memory\_profiler — What each gem cost?

So its all nice but what if want to profile gems, to spot really heavy one.

We can utilise **memory\_profiler** gem for that. Lets create rake task, that will boot app and allocate how much RAM each gem consumed

```
require "memory_profiler"

namespace :profile do
  desc "Profile memory allocations for a request"
  task memory: :environment do
    app = Rails.application

    # Simulate a request to #check endpoint
    env = Rack::MockRequest.env_for("/")

    report = MemoryProfiler.report do
      status, headers, body = app.call(env)
      body.each(&:to_s)
    end

    report.pretty_print(detailed_report: true, scale_bytes: true)
  end
end
```

Lets run it:

```
bundle exec rake profile:memory
Total allocated: 1.22 MB (8891 objects)
Total retained:  346.88 kB (2390 objects)

allocated memory by gem
-----------------------------------
 395.72 kB  newrelic_rpm-9.21.0
 250.08 kB  bootsnap-1.18.6
 214.62 kB  actionview-8.0.2.1
 108.84 kB  activesupport-8.0.2.1
  58.73 kB  actionpack-8.0.2.1
  55.28 kB  rack-mini-profiler-4.0.1
  25.74 kB  railties-8.0.2.1
  20.04 kB  i18n-1.14.7
  16.34 kB  rubygems
  16.06 kB  erubi-1.13.1
  15.14 kB  devise-4.9.4
  15.01 kB  uri-1.0.3
   6.20 kB  jbuilder-2.14.1
   3.82 kB  json-2.13.2
   3.69 kB  kaminari-core-1.2.2
   3.58 kB  rack-3.2.1
   2.37 kB  other
   1.74 kB  bundler-2.4.22
   1.73 kB  logger-1.7.0
   1.45 kB  kaminari-actionview-1.2.2
   1.39 kB  concurrent-ruby-1.3.5
   1.32 kB  zeitwerk-2.7.3
   1.07 kB  actioncable-8.0.2.1
  120.00 B  set
   40.00 B  activestorage-8.0.2.1
```

This tells us:
During the request, **newrelic\_rpm** allocated ~400 KB, **bootsnap** ~250 KB, etc.
Useful for spotting gems that churn memory even on trivial requests.

## derailed\_benchmarks

Looking at gem allocation alone can feel disconnected from real life. A better way is to use the **derailed\_benchmarks** gem. With it we can measure how much memory is used when Rails boots with all gems loaded.

Example run:

```
derailed exec perf:mem
Booting: production
Database 'storage/production.sqlite3' already exists
Database 'storage/production_cache.sqlite3' already exists
Database 'storage/production_queue.sqlite3' already exists
Database 'storage/production_cable.sqlite3' already exists
Method: GET
Endpoint: "/"
TOP: 56.1445 MiB
  application: 15.0313 MiB
    newrelic_rpm: 3.8828 MiB
      new_relic/control: 3.8789 MiB
        new_relic/agent: 3.3594 MiB
          new_relic/agent/agent: 2.5703 MiB
            new_relic/agent/configuration/manager: 0.8984 MiB (Also required by: new_relic/agent/configuration)
              new_relic/agent/configuration/default_source: 0.4805 MiB
            new_relic/agent/monitors: 0.4141 MiB
              /Users/mac/.rbenv/versions/ruby-3.2.2/lib/ruby/gems/3.2.0/gems/newrelic_rpm-9.21.0/lib/new_relic/agent/monitors/cross_app_monitor: 0.3867 MiB
                new_relic/agent/tracer: 0.3438 MiB (Also required by: new_relic/rack/agent_middleware, new_relic/agent/instrumentation/middleware_tracing)
    faraday: 2.8945 MiB
      faraday/net_http: 0.8867 MiB
        faraday/adapter/net_http: 0.8828 MiB
```

This report says our app used about 56 MB of ram for the / endpoint. But in the middleware test we saw 98 MB ram. That’s 42 MB higher. Why? Because we are measuring different things.

Derailed reports cost of gems and Rails objects created at boot.

Middleware measures RSS (Resident Set Size). RSS equals the **entire** memory footprint reported by the OS.

So on top of the 56 MB of gems and Rails objects, RSS also includes:

1. Unused Ruby heap capacity (extra memory Ruby reserved for future objects).
2. Many gems depend on C extensions that allocate their own buffers or caches.
3. Heap fragmentation ( MRI’s memory allocator may request memory pages from the OS that don’t get fully used or can’t be returned).

## Summary

- **derailed\_benchmarks** shows the baseline memory cost of gems at boot.
- Middleware + GC.stat shows the real RAM usage per request including Ruby’s internal overhead.
- Use **memory\_profiler** to see how much memory each gem allocates.
- Use GC.stat (via middleware) to inspect per‑endpoint allocations and live RAM usage.
- Together, these tools give you a clear view: what gems cost you, how your app grows beyond boot, and how much memory each request really burns.

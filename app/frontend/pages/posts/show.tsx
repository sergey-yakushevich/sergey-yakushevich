import { Head, Link } from "@inertiajs/react"
import { ArrowLeft } from "lucide-react"

import { Chip } from "@/components/chip"
import SiteLayout from "@/layouts/site-layout"
import { useResume } from "@/lib/resume"
import type { PostDetail } from "@/types"

export default function PostShow({ post }: { post: PostDetail }) {
  const RESUME = useResume()

  return (
    <SiteLayout>
      <Head>
        <title>{`${post.title} — ${RESUME.name}`}</title>
        <meta name="description" content={post.summary} />
        {post.canonical && <link rel="canonical" href={post.canonical} />}
      </Head>

      <article className="pt-2">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          All posts
        </Link>

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <time dateTime={post.date} className="label-mono">
              {post.dateLabel}
            </time>
            <span className="label-mono">{post.readingTime}</span>
            {post.draft && (
              <span className="label-mono text-signal-attention">Draft</span>
            )}
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {post.title}
          </h1>

          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            {post.summary}
          </p>

          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Chip key={tag} size="sm">
                  {tag}
                </Chip>
              ))}
            </div>
          )}
        </header>

        {post.canonical && (
          <p className="mt-4 text-sm text-muted-foreground">
            Originally published on{" "}
            <a
              href={post.canonical}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Medium
            </a>
            .
          </p>
        )}

        <hr className="my-8 border-border" />

        <div
          className="prose-post"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </article>
    </SiteLayout>
  )
}

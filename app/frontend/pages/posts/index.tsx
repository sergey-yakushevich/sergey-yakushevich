import { Head } from "@inertiajs/react"

import { Section } from "@/components/section"
import { ArticlePreviewCard } from "@/components/shadcn-space/card/card-01"
import SiteLayout from "@/layouts/site-layout"
import { useResume } from "@/lib/resume"
import type { PostSummary } from "@/types"

type PostsIndexProps = {
  posts: PostSummary[]
}

export default function PostsIndex({ posts }: PostsIndexProps) {
  const RESUME = useResume()

  return (
    <SiteLayout>
      <Head>
        <title>{`Blog — ${RESUME.name}`}</title>
        <meta
          name="description"
          content="Notes on backends, payment systems, Kafka and Go."
        />
      </Head>

      <Section
        title="Blog"
        subtitle="Notes on backends, payments and Go"
        className="pt-2"
      >
        {posts.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
            Nothing here yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {posts.map((post, index) => (
              <ArticlePreviewCard
                key={post.slug}
                index={index}
                title={post.title}
                summary={post.summary}
                href={post.url}
                date={post.date}
                dateLabel={post.dateLabel}
                readingTime={post.readingTime}
                tags={post.tags}
                coverImage={post.coverImage}
                draft={post.draft}
              />
            ))}
          </div>
        )}
      </Section>
    </SiteLayout>
  )
}

import { useMemo } from "react"
import { Head } from "@inertiajs/react"

import { Section } from "@/components/section"
import { ArticlePreviewCard } from "@/components/shadcn-space/card/card-01"
import {
  AnimatedTabs,
  type AnimatedTabItem,
} from "@/components/shadcn-space/tabs/tabs-08"
import SiteLayout from "@/layouts/site-layout"
import { useResume } from "@/lib/resume"
import type { PostSummary } from "@/types"

type PostsIndexProps = {
  posts: PostSummary[]
  tags: string[]
}

function PostGrid({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
        Nothing here yet.
      </p>
    )
  }

  return (
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
  )
}

export default function PostsIndex({ posts, tags }: PostsIndexProps) {
  const RESUME = useResume()

  const tabs = useMemo<AnimatedTabItem[]>(() => {
    const all: AnimatedTabItem = {
      value: "all",
      label: "All",
      badge: posts.length,
      content: <PostGrid posts={posts} />,
    }

    const byTag = tags.map((tag) => {
      const tagged = posts.filter((post) => post.tags.includes(tag))
      return {
        value: tag,
        label: tag,
        badge: tagged.length,
        content: <PostGrid posts={tagged} />,
      }
    })

    return [all, ...byTag]
  }, [posts, tags])

  return (
    <SiteLayout>
      <Head>
        <title>{`Writing — ${RESUME.name}`}</title>
        <meta
          name="description"
          content="Notes on backends, payment systems, Kafka and Go."
        />
      </Head>

      <Section
        title="Writing"
        subtitle="Notes on backends, payments and Go"
        className="pt-2"
      >
        {tabs.length > 1 ? (
          <AnimatedTabs tabs={tabs} indicatorId="writing-tabs" />
        ) : (
          <PostGrid posts={posts} />
        )}
      </Section>
    </SiteLayout>
  )
}

import { Head, Link } from "@inertiajs/react"
import { ArrowRight } from "lucide-react"

import { ExperienceList } from "@/components/experience-list"
import { ProfileCard } from "@/components/profile-card"
import { Section } from "@/components/section"
import { TechStack } from "@/components/tech-stack"
import { ArticlePreviewCard } from "@/components/shadcn-space/card/card-01"
import SiteLayout from "@/layouts/site-layout"
import { useResume } from "@/lib/resume"
import type { PostSummary, SharedProps } from "@/types"

type HomeProps = SharedProps & {
  posts: PostSummary[]
}

export default function Home({ avatarUrl, posts }: HomeProps) {
  const RESUME = useResume()

  return (
    <SiteLayout>
      <Head>
        <title>{`${RESUME.name} — ${RESUME.headline}`}</title>
        <meta
          name="description"
          content={`${RESUME.headline} (${RESUME.languages}). 10 years on payment backends. Kafka, PostgreSQL, AWS, PCI-DSS.`}
        />
      </Head>

      <ProfileCard avatarUrl={avatarUrl} />

      <Section title="Tech Stack" subtitle="Technologies I work with">
        <TechStack />
      </Section>

      <Section title="Experience" subtitle="Ten years, four companies">
        <ExperienceList />
      </Section>

      {posts.length > 0 && (
        <Section
          title="Blog"
          subtitle="Notes on backends, payments and Go"
          action={
            <Link
              href="/blog"
              className="inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              All posts
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          }
        >
          <div className="gap-4 md:columns-2 [&>*]:mb-4 [&>*]:break-inside-avoid">
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
        </Section>
      )}
    </SiteLayout>
  )
}

import { Head } from "@inertiajs/react"

import { Section } from "@/components/section"
import { ProjectCard } from "@/components/shadcn-space/card/card-24"
import SiteLayout from "@/layouts/site-layout"
import { useResume } from "@/lib/resume"

export default function Projects() {
  const RESUME = useResume()

  return (
    <SiteLayout>
      <Head>
        <title>{`Projects — ${RESUME.name}`}</title>
        <meta
          name="description"
          content="Rails and Inertia products shipped end to end — an AI integration studio, a resin storefront, and a direct-to-consumer sleep brand."
        />
      </Head>

      <Section
        title="Projects"
        subtitle="Shipped, live, and running in production"
        className="pt-2"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {RESUME.projects.map((project, index) => (
            <ProjectCard
              key={project.title}
              project={project}
              index={index}
            />
          ))}
        </div>
      </Section>
    </SiteLayout>
  )
}

import { Head } from "@inertiajs/react"

import { ProjectCard } from "@/components/project-card"
import { Section } from "@/components/section"
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
          content="Payment platforms, checkout flows and accounting automation built over ten years of backend work."
        />
      </Head>

      <Section
        title="Projects"
        subtitle="What I built, and what it runs on"
        className="pt-2"
      >
        <div className="grid grid-cols-1 gap-4">
          {RESUME.projects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
      </Section>
    </SiteLayout>
  )
}

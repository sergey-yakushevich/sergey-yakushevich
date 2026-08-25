import { ArrowUpRight } from "lucide-react"

import { Chip } from "@/components/chip"
import type { Project } from "@/types"
import { cn } from "@/lib/utils"

export function ProjectCard({ project }: { project: Project }) {
  const isPlaceholder = project.placeholder === true

  return (
    <article
      className={cn(
        "rounded-lg border border-border bg-card p-6 transition-colors",
        isPlaceholder
          ? "border-dashed bg-transparent"
          : "hover:border-foreground/25",
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3
          className={cn(
            "text-base font-semibold",
            isPlaceholder ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {project.title}
        </h3>
        {project.link && (
          <a
            href={project.link.href}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {project.link.label}
            <ArrowUpRight
              className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
        )}
        {isPlaceholder && <span className="label-mono">Open slot</span>}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.techStack.map((tech) => (
          <Chip key={tech} size="sm">
            {tech}
          </Chip>
        ))}
      </div>
    </article>
  )
}

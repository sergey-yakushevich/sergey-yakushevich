import { motion } from "motion/react"
import { ArrowUpRight, Globe, Layers } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Chip } from "@/components/chip"
import type { Project } from "@/types"

const contentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
}

export function ProjectCard({
  project,
  index = 0,
}: {
  project: Project
  index?: number
}) {
  const delay = Math.min(index, 6) * 0.08

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="h-full w-full"
    >
      <Card className="group h-full gap-0 overflow-hidden rounded-2xl border-border bg-card/80 p-0 backdrop-blur-sm">
        <a
          href={project.link.href}
          target="_blank"
          rel="noreferrer"
          className="flex h-full flex-col"
        >
          <div className="relative h-44 w-full overflow-hidden border-b border-border">
            <img
              src={project.image}
              alt={project.title}
              loading="lazy"
              className="h-full w-full object-cover object-top transition-transform duration-600 ease-out group-hover:scale-108"
            />
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 16,
                delay: delay + 0.25,
              }}
              className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-foreground"
            >
              <span className="size-1.5 rounded-full bg-signal-available" />
              Live
            </motion.span>
          </div>

          <CardContent className="flex flex-1 flex-col p-5">
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              transition={{ delayChildren: delay }}
              className="flex flex-1 flex-col gap-4"
            >
              <motion.div variants={itemVariants} className="flex flex-col gap-2">
                <Badge className="w-fit rounded-full text-[11px]">
                  {project.category}
                </Badge>
                <p className="text-lg font-bold text-foreground">
                  {project.title}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {project.description}
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex flex-col gap-1.5"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Layers className="size-4 shrink-0" />
                  <span>{project.stack}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="size-4 shrink-0" />
                  <span className="line-clamp-1">{project.link.label}</span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-auto">
                <Separator className="mb-4" />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {project.techStack.slice(0, 3).map((tech) => (
                      <Chip key={tech} size="sm">
                        {tech}
                      </Chip>
                    ))}
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-foreground transition-transform group-hover:translate-x-0.5">
                    Visit
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </CardContent>
        </a>
      </Card>
    </motion.div>
  )
}

export default ProjectCard

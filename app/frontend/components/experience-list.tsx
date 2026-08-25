import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ArrowUpRight, ChevronDown } from "lucide-react"

import { Chip } from "@/components/chip"
import { useResume } from "@/lib/resume"
import type { WorkEntry } from "@/types"
import { cn } from "@/lib/utils"

function ExperienceEntry({ entry }: { entry: WorkEntry }) {
  const [expanded, setExpanded] = useState(false)
  const extra = entry.more ?? []

  return (
    <article className="rounded-lg border border-border bg-card p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <a
          href={entry.link}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-1 text-base font-semibold text-foreground"
        >
          {entry.company}
          <ArrowUpRight
            className="size-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </a>
        <span className="label-mono">
          {entry.start} — {entry.end}
        </span>
      </div>

      <p className="mt-1 text-sm text-muted-foreground">{entry.title}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {entry.badges.map((badge) => (
          <Chip key={badge} size="sm">
            {badge}
          </Chip>
        ))}
      </div>

      <ul className="mt-4 space-y-2">
        {entry.description.map((bullet) => (
          <li
            key={bullet}
            className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
          >
            <span
              aria-hidden="true"
              className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground"
            />
            {bullet}
          </li>
        ))}
      </ul>

      {extra.length > 0 && (
        <>
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="space-y-2 overflow-hidden"
              >
                {extra.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex gap-2.5 pt-2 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground"
                    />
                    {bullet}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            aria-expanded={expanded}
            className="mt-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {expanded ? "Show less" : `Show ${extra.length} more`}
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform",
                expanded && "rotate-180",
              )}
              aria-hidden="true"
            />
          </button>
        </>
      )}
    </article>
  )
}

export function ExperienceList() {
  const RESUME = useResume()

  return (
    <div className="space-y-4">
      {RESUME.work.map((entry) => (
        <ExperienceEntry key={entry.company} entry={entry} />
      ))}
    </div>
  )
}

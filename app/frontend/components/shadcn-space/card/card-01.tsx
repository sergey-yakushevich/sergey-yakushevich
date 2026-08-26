import { Link } from "@inertiajs/react"
import { motion } from "motion/react"

import { Card, CardContent } from "@/components/ui/card"
import { Chip } from "@/components/chip"
import { cn } from "@/lib/utils"

export type ArticlePreviewCardProps = {
  title: string
  summary: string
  href: string
  date: string
  dateLabel: string
  readingTime?: string
  tags?: string[]
  coverImage?: string | null
  draft?: boolean
  index?: number
  className?: string
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export function ArticlePreviewCard({
  title,
  summary,
  href,
  date,
  dateLabel,
  readingTime,
  tags = [],
  coverImage,
  draft = false,
  index = 0,
  className,
}: ArticlePreviewCardProps) {
  const delay = Math.min(index, 6) * 0.06

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn("w-full", className)}
    >
      <Card className="group w-full gap-0 overflow-hidden bg-card/80 p-0 backdrop-blur-sm transition-colors hover:border-foreground/25">
        <Link href={href} className="block focus-visible:outline-none">
          {coverImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: delay + 0.08 }}
              className="overflow-hidden border-b border-border"
            >
              <img
                src={coverImage}
                alt=""
                loading="lazy"
                className="aspect-[16/9] w-full bg-black object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </motion.div>
          )}

          <CardContent className="p-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={container}
              transition={{ delayChildren: delay }}
            >
              <motion.div
                variants={item}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-3"
              >
                <time dateTime={date} className="label-mono">
                  {dateLabel}
                </time>
                {readingTime && (
                  <span className="label-mono">{readingTime}</span>
                )}
                {draft && (
                  <span className="label-mono text-signal-attention">
                    Draft
                  </span>
                )}
              </motion.div>

              <motion.h3
                variants={item}
                transition={{ duration: 0.4 }}
                className="mt-2 text-lg font-semibold tracking-tight text-foreground"
              >
                {title}
              </motion.h3>

              <motion.p
                variants={item}
                transition={{ duration: 0.45 }}
                className="mt-2 text-sm leading-relaxed text-muted-foreground"
              >
                {summary}
              </motion.p>

              {tags.length > 0 && (
                <motion.div
                  variants={item}
                  transition={{ duration: 0.5 }}
                  className="mt-4 flex flex-wrap gap-2"
                >
                  {tags.map((tag) => (
                    <Chip key={tag} size="sm">
                      {tag}
                    </Chip>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  )
}

export default ArticlePreviewCard

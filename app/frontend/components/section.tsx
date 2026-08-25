import type { ReactNode } from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

export function Section({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn("space-y-5", className)}
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="display-2">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-base text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </motion.section>
  )
}

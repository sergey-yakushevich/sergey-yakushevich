import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function Chip({
  children,
  size = "md",
  signal = false,
  className,
}: {
  children: ReactNode
  size?: "sm" | "md"
  signal?: boolean
  className?: string
}) {
  return (
    <Badge
      className={cn(
        "border-transparent bg-foreground font-medium text-background",
        size === "sm" ? "px-2 py-0 text-[11px]" : "px-2.5 py-0.5 text-xs",
        signal && "bg-signal-shipped text-white dark:text-background",
        className,
      )}
    >
      {children}
    </Badge>
  )
}

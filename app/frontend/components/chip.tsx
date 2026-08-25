import type { ReactNode } from "react"

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
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-lg border border-border bg-secondary text-secondary-foreground",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1.5 text-sm",
        signal && "border-l-2 border-l-signal-shipped",
        className,
      )}
    >
      {children}
    </span>
  )
}

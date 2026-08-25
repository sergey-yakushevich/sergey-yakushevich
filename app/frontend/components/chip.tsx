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
      variant="outline"
      className={cn(
        "font-normal text-muted-foreground",
        size === "sm" ? "px-2 py-0 text-[11px]" : "px-2.5 py-0.5 text-xs",
        signal && "border-signal-shipped/70 text-foreground",
        className,
      )}
    >
      {children}
    </Badge>
  )
}

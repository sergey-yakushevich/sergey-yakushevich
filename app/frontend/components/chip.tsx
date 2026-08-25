import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function Chip({
  children,
  size = "md",
  className,
}: {
  children: ReactNode
  size?: "sm" | "md"
  className?: string
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "border-transparent font-medium",
        size === "sm" ? "px-2 py-0 text-[11px]" : "px-2.5 py-0.5 text-xs",
        className,
      )}
    >
      {children}
    </Badge>
  )
}

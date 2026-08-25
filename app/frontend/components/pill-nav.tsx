import { Link, usePage } from "@inertiajs/react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

const ITEMS = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Writing", href: "/writing" },
]

export function PillNav() {
  const { url } = usePage()
  const path = url.split("?")[0]

  const activeHref =
    ITEMS.filter((item) => item.href !== "/" && path.startsWith(item.href))[0]
      ?.href ?? "/"

  return (
    <nav className="flex justify-center">
      <div className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary p-1">
        {ITEMS.map((item) => {
          const isActive = item.href === activeHref
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative rounded-full px-4 py-1.5 text-sm transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="pill-nav-active"
                  className="absolute inset-0 -z-10 rounded-full bg-card ring-1 ring-border"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

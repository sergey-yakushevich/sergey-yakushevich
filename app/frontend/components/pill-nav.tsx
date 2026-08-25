import { Link, usePage } from "@inertiajs/react"
import { motion } from "motion/react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const ITEMS = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
]

export function PillNav() {
  const { url } = usePage()
  const path = url.split("?")[0]

  const activeHref =
    ITEMS.filter((item) => item.href !== "/" && path.startsWith(item.href))[0]
      ?.href ?? "/"

  return (
    <Tabs value={activeHref} className="w-fit">
      <TabsList className="h-auto! w-fit gap-1 rounded-full border border-border bg-secondary p-1">
        {ITEMS.map((item) => {
          const isActive = item.href === activeHref
          return (
            <TabsTrigger
              key={item.href}
              value={item.href}
              asChild
              className={cn(
                "relative z-0 h-9 flex-none rounded-full border-none bg-transparent nav-text px-4 shadow-none transition-colors after:hidden data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Link href={item.href} aria-current={isActive ? "page" : undefined}>
                {isActive && (
                  <motion.span
                    layoutId="pill-nav-active"
                    className="absolute inset-0 -z-10 rounded-full bg-card ring-1 ring-border"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                {item.label}
              </Link>
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}

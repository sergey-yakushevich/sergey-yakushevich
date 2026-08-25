import { useMemo, useState, type ReactNode } from "react"
import { motion, AnimatePresence, type Variants } from "motion/react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export type AnimatedTabItem = {
  value: string
  label: string
  icon?: LucideIcon
  badge?: number | string
  disabled?: boolean
  content: ReactNode
}

const panelVariants: Variants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? 24 : -24,
    scale: 0.97,
    filter: "blur(6px)",
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.045,
      delayChildren: 0.05,
      type: "spring",
      stiffness: 300,
      damping: 28,
      mass: 0.9,
    },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -24 : 24,
    scale: 0.97,
    filter: "blur(6px)",
    transition: { duration: 0.15, ease: "easeIn" },
  }),
}

interface AnimatedTabsProps {
  tabs: AnimatedTabItem[]
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  listClassName?: string
  contentClassName?: string
  indicatorId?: string
}

export function AnimatedTabs({
  tabs,
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  listClassName,
  contentClassName,
  indicatorId = "animated-tabs-indicator",
}: AnimatedTabsProps) {
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? tabs[0]?.value,
  )
  const [direction, setDirection] = useState(0)

  const value = controlledValue ?? internalValue
  const activeTab = useMemo(
    () => tabs.find((tab) => tab.value === value),
    [tabs, value],
  )

  const handleChange = (next: string) => {
    const prevIndex = tabs.findIndex((tab) => tab.value === value)
    const nextIndex = tabs.findIndex((tab) => tab.value === next)
    setDirection(nextIndex > prevIndex ? 1 : -1)
    if (controlledValue === undefined) setInternalValue(next)
    onValueChange?.(next)
  }

  return (
    <Tabs
      value={value}
      onValueChange={handleChange}
      className={cn("w-full gap-4", className)}
    >
      <TabsList
        className={cn(
          "no-scrollbar h-auto! w-full gap-1 overflow-x-auto rounded-full border border-border bg-secondary p-1 sm:w-fit",
          listClassName,
        )}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.value === value
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              disabled={tab.disabled}
              className={cn(
                "relative z-0 h-9 shrink-0 cursor-pointer gap-1.5 rounded-full border-none bg-transparent px-3.5 text-sm font-medium shadow-none outline-none transition-colors after:hidden data-active:bg-transparent data-active:shadow-none",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId={indicatorId}
                  className="absolute inset-0 -z-10 rounded-full bg-card ring-1 ring-border"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 34,
                    mass: 0.9,
                  }}
                />
              )}
              <motion.span
                key={isActive ? "active" : "inactive"}
                initial={isActive ? { scale: 0.85 } : false}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="flex items-center gap-1.5"
              >
                {Icon && <Icon className="size-4" />}
                <span>{tab.label}</span>
              </motion.span>
              {tab.badge !== undefined && (
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={tab.badge}
                    initial={{ opacity: 0, scale: 0.5, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 6 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className={cn(
                      "flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted-foreground/15 text-muted-foreground",
                    )}
                  >
                    {tab.badge}
                  </motion.span>
                </AnimatePresence>
              )}
            </TabsTrigger>
          )
        })}
      </TabsList>

      <motion.div
        layout
        transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
        className={cn("relative overflow-hidden", contentClassName)}
      >
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          {activeTab && (
            <motion.div
              key={activeTab.value}
              custom={direction}
              role="tabpanel"
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {activeTab.content}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Tabs>
  )
}

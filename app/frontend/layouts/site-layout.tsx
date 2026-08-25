import type { ReactNode } from "react"

import { PillNav } from "@/components/pill-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/lib/theme"
import { useResume } from "@/lib/resume"

export function SiteLayout({ children }: { children: ReactNode }) {
  const RESUME = useResume()

  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={200}>
        <div className="min-h-screen bg-background">
          <div className="mx-auto flex w-full max-w-[910px] flex-col gap-16 px-6 py-10">
            <header className="relative flex items-center justify-center">
              <PillNav />
              <ThemeToggle className="absolute right-0" />
            </header>

            <main className="flex flex-col gap-16">{children}</main>

            <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-6">
              <p className="label-mono">{RESUME.name}</p>
              <a
                href={`mailto:${RESUME.email}`}
                className="label-mono transition-colors hover:text-foreground"
              >
                {RESUME.email}
              </a>
            </footer>
          </div>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default SiteLayout

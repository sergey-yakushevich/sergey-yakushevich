import { Moon, Sun } from "lucide-react"

import { useTheme } from "@/lib/theme"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { isDark, toggle } = useTheme()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={
        isDark ? "Switch to the light theme" : "Switch to the dark theme"
      }
      title={isDark ? "Light" : "Dark"}
      onClick={(event) =>
        toggle({ clientX: event.clientX, clientY: event.clientY })
      }
      className={cn(
        "relative inline-flex h-[34px] w-16 shrink-0 items-center rounded-full border border-border bg-secondary transition-colors",
        className,
      )}
    >
      <span
        className={cn(
          "theme-toggle-knob absolute inset-y-0 left-px my-auto grid size-[30px] place-items-center rounded-full bg-primary text-primary-foreground transition-transform duration-300",
          isDark ? "translate-x-[30px]" : "translate-x-0",
        )}
        style={{ transitionTimingFunction: "var(--ease-soft)" }}
      >
        {isDark ? (
          <Moon className="size-4" strokeWidth={2} />
        ) : (
          <Sun className="size-4" strokeWidth={2} />
        )}
      </span>
    </button>
  )
}

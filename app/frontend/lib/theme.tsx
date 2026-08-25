import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react"
import { flushSync } from "react-dom"

export type Theme = "light" | "dark"

export const THEME_STORAGE_KEY = "cyberjosef-theme"

type ToggleOrigin = { clientX: number; clientY: number }

type ThemeContextValue = {
  theme: Theme
  isDark: boolean
  setTheme: (theme: Theme) => void
  toggle: (origin?: ToggleOrigin) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readInitialTheme(): Theme {
  if (typeof document === "undefined") return "dark"
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme)

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    const root = document.documentElement
    root.classList.toggle("dark", next === "dark")
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      /* empty */
    }
  }, [])

  const toggle = useCallback(
    (origin?: ToggleOrigin) => {
      const next: Theme = theme === "dark" ? "light" : "dark"
      const root = document.documentElement
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches

      if (!document.startViewTransition || prefersReducedMotion) {
        setTheme(next)
        return
      }

      if (origin) {
        root.style.setProperty("--x", `${origin.clientX}px`)
        root.style.setProperty("--y", `${origin.clientY}px`)
      }

      document.startViewTransition(() => {
        flushSync(() => setTheme(next))
      })
    },
    [theme, setTheme],
  )

  return (
    <ThemeContext.Provider
      value={{ theme, isDark: theme === "dark", setTheme, toggle }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

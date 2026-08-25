import { useEffect, useState } from "react"
import { animate } from "motion/react"

import { useResume } from "@/lib/resume"

function Ticker({ value, suffix }: { value: number; suffix: string }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    if (prefersReducedMotion) {
      setDisplay(value)
      return
    }

    const controls = animate(0, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
      onComplete: () => setDisplay(value),
    })

    return () => controls.stop()
  }, [value])

  return (
    <span className="tabular-nums">
      {display}
      {suffix}
    </span>
  )
}

export function StatRow() {
  const RESUME = useResume()

  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {RESUME.stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-border bg-card/80 p-6"
        >
          <dd className="text-3xl font-semibold tracking-tight text-foreground">
            <Ticker value={stat.value} suffix={stat.suffix} />
          </dd>
          <dt className="mt-1 text-sm text-muted-foreground">{stat.label}</dt>
        </div>
      ))}
    </dl>
  )
}

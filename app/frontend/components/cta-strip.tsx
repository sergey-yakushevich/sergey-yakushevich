import { ArrowRight } from "lucide-react"

export function CtaStrip() {
  return (
    <section className="flex flex-col items-start justify-between gap-4 rounded-lg border border-border bg-card/80 p-6 sm:flex-row sm:items-center">
      <p className="text-sm text-muted-foreground">
        An agent or a recruiter&apos;s parser reading this? There is a
        plain-text version with every detail.
      </p>
      <a
        href="/agents"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-signal-shipped px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
      >
        Open the plain-text page
        <ArrowRight className="size-4" aria-hidden="true" />
      </a>
    </section>
  )
}

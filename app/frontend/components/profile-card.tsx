import { Globe, Mail, MapPin } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { GithubIcon, LinkedinIcon } from "@/components/brand-icons"
import { Emphasis } from "@/components/emphasis"
import { useResume } from "@/lib/resume"

const ICONS = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  globe: Globe,
  mail: Mail,
}

export function ProfileCard({ avatarUrl }: { avatarUrl?: string | null }) {
  const RESUME = useResume()

  return (
    <section className="rounded-lg border border-border bg-card/80 p-6 backdrop-blur-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <Avatar className="size-24 rounded-lg">
            <AvatarImage
              src={avatarUrl ?? undefined}
              alt={RESUME.name}
              className="object-cover"
            />
            <AvatarFallback className="rounded-lg text-xl font-semibold">
              {RESUME.initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight sm:display-1">
                {RESUME.name}
              </h1>
              {RESUME.available && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-signal-available"
                  />
                  {RESUME.availabilityLabel}
                </span>
              )}
            </div>

            <p className="mt-2 text-base text-muted-foreground">
              {RESUME.headline} · {RESUME.languages}
            </p>

            <a
              href={RESUME.locationLink}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <MapPin className="size-3.5" aria-hidden="true" />
              {RESUME.location}
            </a>

            <a
              href={`mailto:${RESUME.email}`}
              className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
            >
              <Mail className="size-3.5" aria-hidden="true" />
              {RESUME.email}
            </a>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {RESUME.social.map((link) => {
            const Icon = ICONS[link.icon]
            return (
              <Tooltip key={link.name}>
                <TooltipTrigger asChild>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.name}
                    className="grid size-11 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>{link.name}</TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </div>

      <Separator className="my-6" />

      <div className="space-y-4">
        {RESUME.bio.map((paragraph, index) => (
          <p
            key={index}
            className="text-base leading-relaxed text-muted-foreground"
          >
            <Emphasis text={paragraph} />
          </p>
        ))}
      </div>
    </section>
  )
}

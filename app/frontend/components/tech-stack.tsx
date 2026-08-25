import { Chip } from "@/components/chip"
import { useResume } from "@/lib/resume"

export function TechStack() {
  const RESUME = useResume()

  return (
    <div className="gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
      {RESUME.skillGroups.map((group) => (
        <div
          key={group.label}
          className="rounded-lg border border-border bg-card/80 p-5"
        >
          <p className="label-mono">{group.label}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {group.chips.map((chip) => (
              <Chip key={chip}>{chip}</Chip>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

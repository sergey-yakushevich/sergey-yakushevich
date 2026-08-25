import { Chip } from "@/components/chip"
import { useResume } from "@/lib/resume"
import { cn } from "@/lib/utils"

export function TechStack() {
  const RESUME = useResume()

  return (
    <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {RESUME.skillGroups.map((group) => (
        <div
          key={group.label}
          className={cn(
            "rounded-lg border border-border bg-card p-6",
            group.wide && "sm:col-span-2",
          )}
        >
          <p className="label-mono">{group.label}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {group.chips.map((chip) => (
              <Chip key={chip} signal={group.signal}>
                {chip}
              </Chip>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

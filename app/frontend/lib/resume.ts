import { usePage } from "@inertiajs/react"

import type { SharedProps } from "@/types"

export function useResume() {
  return usePage<SharedProps>().props.resume
}

export function useShared() {
  return usePage<SharedProps>().props
}

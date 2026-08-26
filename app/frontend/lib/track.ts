/**
 * Lightweight, fire-and-forget visitor tracking (ported from sickstuff.shop).
 *
 * `startTracking()` is called once from the Inertia entrypoint and owns all
 * ambient tracking: a `page_view` (with dwell time) for the initial load and
 * every Inertia navigation, `cta_click` for elements marked `data-track-cta`,
 * and `form_field` the first time each form field is filled in (fired on
 * blur, so abandoned forms are recorded too).
 *
 * Beacons go to POST /track on this app, which forwards them server-side to
 * the central trackhub API. Nothing here blocks rendering and tracking must
 * never break the page.
 */

import { router } from '@inertiajs/react'
import FingerprintJS from '@fingerprintjs/fingerprintjs'

const TOKEN_KEY = 'cj_vid'

type EventName = 'page_view' | 'cta_click' | 'form_field'

type EventOptions = {
  label?: string
  path?: string
  meta?: Record<string, unknown>
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function visitorToken(): string {
  try {
    let token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      token = uuid()
      localStorage.setItem(TOKEN_KEY, token)
    }
    return token
  } catch {
    return uuid()
  }
}

let cachedFingerprint: string | null = null

async function getFingerprint(): Promise<string> {
  if (cachedFingerprint) return cachedFingerprint
  try {
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    cachedFingerprint = result.visitorId
    return cachedFingerprint
  } catch {
    return ''
  }
}

function clientContext(): Record<string, unknown> {
  const params = new URLSearchParams(window.location.search)
  return {
    screen_w: window.screen?.width,
    screen_h: window.screen?.height,
    viewport_w: window.innerWidth,
    viewport_h: window.innerHeight,
    device_pixel_ratio: window.devicePixelRatio,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    referrer: document.referrer || null,
    landing_path: window.location.pathname,
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    utm_term: params.get('utm_term'),
  }
}

function send(body: Record<string, unknown>): void {
  const json = JSON.stringify(body)

  if (navigator.sendBeacon) {
    const blob = new Blob([json], { type: 'application/json' })
    if (navigator.sendBeacon('/track', blob)) return
  }

  void fetch('/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: json,
    keepalive: true,
  }).catch(() => {
    // Tracking must never break the page.
  })
}

/** Synchronous envelope, usable from unload handlers. */
function envelopeSync(): Record<string, unknown> {
  return { token: visitorToken() }
}

let contextSent = false

/** Shared envelope, attaching one-time client context + fingerprint. */
async function envelope(): Promise<Record<string, unknown>> {
  const body = envelopeSync()

  if (!contextSent) {
    contextSent = true
    const fingerprint = await getFingerprint()
    Object.assign(body, clientContext(), { device_fingerprint: fingerprint || null })
  }

  return body
}

export async function trackEvent(name: EventName, options: EventOptions = {}): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    send({
      ...(await envelope()),
      event: {
        id: uuid(),
        name,
        label: options.label ?? null,
        path: options.path ?? window.location.pathname,
        occurred_at: new Date().toISOString(),
        meta: options.meta ?? null,
      },
    })
  } catch {
    // Tracking must never break the page.
  }
}

// ---------------------------------------------------------------------------
// Page views + dwell time
// ---------------------------------------------------------------------------

type OpenPageView = {
  id: string
  path: string
  activeMs: number
  resumedAt: number | null
}

let openPageView: OpenPageView | null = null

function accumulate(view: OpenPageView): void {
  if (view.resumedAt === null) return
  view.activeMs += Date.now() - view.resumedAt
  view.resumedAt = null
}

function closePageView(): void {
  const view = openPageView
  if (!view) return
  openPageView = null

  accumulate(view)
  // Deliberately synchronous: runs on unload, where a promise continuation is
  // not guaranteed to execute.
  send({
    ...envelopeSync(),
    event: { id: view.id, name: 'page_view', path: view.path, duration_ms: view.activeMs },
  })
}

export function trackPageView(path = window.location.pathname): void {
  if (typeof window === 'undefined') return
  if (openPageView?.path === path) return

  closePageView()

  const view: OpenPageView = { id: uuid(), path, activeMs: 0, resumedAt: Date.now() }
  openPageView = view

  void (async () => {
    try {
      send({
        ...(await envelope()),
        event: { id: view.id, name: 'page_view', path, occurred_at: new Date().toISOString() },
      })
    } catch {
      // Tracking must never break the page.
    }
  })()
}

// ---------------------------------------------------------------------------
// Ambient wiring
// ---------------------------------------------------------------------------

let started = false

export function startTracking(): void {
  if (typeof window === 'undefined' || started) return
  started = true

  // Page views: initial load + every Inertia visit, with dwell measurement
  // paused while the tab is hidden.
  trackPageView()
  router.on('navigate', () => trackPageView())
  window.addEventListener('pagehide', closePageView)
  document.addEventListener('visibilitychange', () => {
    const view = openPageView
    if (!view) return
    if (document.visibilityState === 'hidden') {
      accumulate(view)
    } else if (view.resumedAt === null) {
      view.resumedAt = Date.now()
    }
  })

  // CTA clicks: anything marked data-track-cta.
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target as HTMLElement | null
      const el = target?.closest('a, button') as HTMLElement | null
      if (!el) return

      const cta = el.closest('[data-track-cta]') as HTMLElement | null
      if (cta) {
        const named = cta.dataset.trackCta?.trim()
        const label = named && named !== 'true' ? named : elementLabel(el)
        void trackEvent('cta_click', { label })
      }
    },
    true
  )

  // Form fills — capture abandoned forms: a field counts as filled the moment
  // it has a value, reported on blur or flushed when the visitor leaves.
  const reported = new Set<string>()
  const pending = new Map<string, FormField>()

  const report = (el: FormField) => {
    const value = el.value?.trim()
    const field = el.getAttribute('name') || el.id
    if (!value || !field) return

    const key = `${window.location.pathname}:${field}`
    pending.delete(key)
    if (reported.has(key)) return
    reported.add(key)

    void trackEvent('form_field', {
      label: humanize(field),
      meta: { field, value: previewValue(el, value) },
    })
  }

  const trackable = (target: EventTarget | null): FormField | null => {
    const el = target as FormField | null
    if (!el || !isFormField(el) || el.closest('[data-track-ignore]')) return null
    return el
  }

  document.addEventListener(
    'input',
    (event) => {
      const el = trackable(event.target)
      if (!el) return
      const field = el.getAttribute('name') || el.id
      if (field) pending.set(`${window.location.pathname}:${field}`, el)
    },
    true
  )
  document.addEventListener(
    'focusout',
    (event) => {
      const el = trackable(event.target)
      if (el) report(el)
    },
    true
  )

  const flushPending = () => {
    pending.forEach((el) => report(el))
    pending.clear()
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushPending()
  })
  window.addEventListener('pagehide', flushPending)
}

type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

function isFormField(el: Element): el is FormField {
  const tag = el.tagName
  if (tag === 'SELECT' || tag === 'TEXTAREA') return true
  if (tag !== 'INPUT') return false

  const type = (el as HTMLInputElement).type
  return !['submit', 'button', 'reset', 'hidden', 'file'].includes(type)
}

/** Passwords are never recorded; secret-ish fields reduce to a length. */
function previewValue(el: HTMLElement, value: string): string {
  const type = (el as HTMLInputElement).type
  const name = (el.getAttribute('name') || el.id || '').toLowerCase()

  if (type === 'password' || /card|cvc|cvv|secret|token/.test(name)) {
    return `${value.length} chars`
  }
  return value.slice(0, 120)
}

function elementLabel(el: HTMLElement): string {
  return (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80)
}

function humanize(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim()
}

import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { createSceneWheelSteps } from "@/lib/scene-wheel-steps"

gsap.registerPlugin(ScrollTrigger)

type ScrollSceneOptions = {
  id: string
  element: HTMLElement
  timeline: gsap.core.Timeline
  screens?: number
  top?: number
  stops?: number[]
  onRefresh?: (trigger: ScrollTrigger) => void
  onUpdate?: (trigger: ScrollTrigger) => void
  anchor?: HTMLElement
  wheelStops?: number[]
  refreshPriority?: number
}

// Call inside a GSAP context so its pin, spacing and animation are reverted together.
export function createScrollScene({
  id,
  element,
  timeline,
  screens = 3,
  top = 0,
  stops = [],
  onRefresh,
  onUpdate,
  anchor = element,
  wheelStops = [],
  refreshPriority = 0,
}: ScrollSceneOptions) {
  let wheel: ReturnType<typeof createSceneWheelSteps> | undefined
  const trigger = ScrollTrigger.create({
    id,
    trigger: element,
    animation: timeline,
    start: () => `top ${top}px`,
    end: () => `+=${Math.round(window.innerHeight * screens)}`,
    pin: true,
    pinSpacing: true,
    scrub: 0.45,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    refreshPriority,
    // Small local corrections only: never snap to another section or predict momentum.
    snap: stops.length
      ? {
          snapTo: (progress: number) => {
            const nearest = gsap.utils.snap(stops, progress)
            return Math.abs(nearest - progress) < 0.04 ? nearest : progress
          },
          inertia: false,
          directional: false,
          delay: 0.25,
          duration: { min: 0.15, max: 0.3 },
        }
      : undefined,
    onRefresh,
    onUpdate,
  })
  if (wheelStops.length)
    wheel = createSceneWheelSteps(element, trigger, wheelStops)

  // A pinned element's native anchor position includes its pin translation.
  // Resolve only links into this scene against the stable ScrollTrigger start.
  const navigate = (event: MouseEvent) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return
    const link =
      event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>("a[href]")
        : null
    if (!link || link.target === "_blank" || link.hasAttribute("download"))
      return
    const url = new URL(link.href)
    if (
      !anchor.id ||
      url.hash !== `#${anchor.id}` ||
      url.origin !== location.origin ||
      url.pathname !== location.pathname ||
      url.search !== location.search
    )
      return
    event.preventDefault()
    wheel?.cancel()
    if (location.hash !== url.hash) history.pushState(null, "", url.hash)
    const anchorTop =
      anchor === element
        ? trigger.start
        : anchor.getBoundingClientRect().top + window.scrollY
    const margin = parseFloat(getComputedStyle(anchor).scrollMarginTop) || 0
    window.scrollTo({
      top: Math.max(0, anchorTop - margin),
      behavior: "smooth",
    })
    anchor.focus({ preventScroll: true })
  }
  document.addEventListener("click", navigate)
  return () => {
    document.removeEventListener("click", navigate)
    wheel?.destroy()
    trigger.kill()
  }
}

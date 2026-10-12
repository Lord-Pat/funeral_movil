import { gsap } from "gsap"
import { Observer } from "gsap/Observer"
import type { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(Observer)

// Optional desktop enhancement. Only wheel events over the active scene are consumed.
// Native keyboard navigation, touch, scrollbar dragging and links remain available.
export function createSceneWheelSteps(
  element: HTMLElement,
  trigger: ScrollTrigger,
  stops: number[]
) {
  let locked = false
  let tween: gsap.core.Tween | undefined
  let hold: gsap.core.Tween | undefined
  const context = gsap.context(() => {})
  const cancel = () => {
    tween?.kill()
    hold?.kill()
    locked = false
  }
  context.add("advance", (direction: number) => {
    if (locked) return
    const progress = trigger.progress
    const next =
      direction > 0
        ? (stops.find((stop) => stop > progress + 0.025) ?? 1.03)
        : ([...stops].reverse().find((stop) => stop < progress - 0.025) ??
          -0.03)
    locked = true
    const position = { y: window.scrollY }
    tween = gsap.to(position, {
      y: Math.max(0, trigger.start + (trigger.end - trigger.start) * next),
      duration: 0.4,
      ease: "power2.inOut",
      onUpdate: () => window.scrollTo({ top: position.y, behavior: "instant" }),
      onComplete: () => {
        // Let scrub catch up and the selected state become readable before the next gesture.
        hold = gsap.delayedCall(0.45, () => {
          locked = false
        })
      },
    })
  })
  const observer = Observer.create({
    target: element,
    type: "wheel",
    preventDefault: true,
    tolerance: 18,
    ignoreCheck: (event) => {
      if (!(event instanceof WheelEvent)) return true
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY))
        return true
      const y = window.scrollY
      const delta =
        event.deltaY *
        (event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? window.innerHeight
            : 1)
      // Also catch a wheel over the entering scene that would cross its start.
      return y < trigger.start
        ? delta <= 0 || y + delta < trigger.start
        : y > trigger.end
          ? delta >= 0 || y + delta > trigger.end
          : false
    },
    onChangeY: (self) => context.advance(Math.sign(self.deltaY)),
  })
  // Explicit navigation always takes precedence over an in-flight wheel step.
  const keydown = (event: KeyboardEvent) => {
    if (
      [
        "Tab",
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        "Enter",
        "Escape",
        " ",
      ].includes(event.key)
    )
      cancel()
  }
  const pointerdown = () => cancel()
  document.addEventListener("keydown", keydown)
  document.addEventListener("pointerdown", pointerdown)
  return {
    cancel,
    destroy: () => {
      cancel()
      observer.kill()
      context.revert()
      document.removeEventListener("keydown", keydown)
      document.removeEventListener("pointerdown", pointerdown)
    },
  }
}

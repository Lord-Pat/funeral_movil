"use client"

import Image from "next/image"
import { X } from "lucide-react"
import { useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { createScrollScene } from "@/lib/scroll-scene"

gsap.registerPlugin(ScrollTrigger, useGSAP)

const stories = [
  {
    name: "El nostálgico",
    text: "Lo guardaste por todas esas fotos que nunca llegaste a pasar al ordenador.",
  },
  {
    name: "El superviviente",
    text: "Sobrevivió a tres caídas. La cuarta fue definitiva.",
  },
  {
    name: "El olvidado",
    text: "Hace tanto que no lo enciendes que ya ni recuerdas dónde está su cargador.",
  },
]

export function ForgottenDrawer() {
  const stageRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([])

  useGSAP(() => {
    const stage = stageRef.current
    if (!stage) return
    const section = stage.closest<HTMLElement>(".forgotten-section")
    const layout = section?.querySelector<HTMLElement>(".forgotten-layout")
    if (!section || !layout) return
    const media = gsap.matchMedia()
    const originalStyle = stage.getAttribute("style")
    const main = section.closest("main")
    const originalAnchor = main?.style.overflowAnchor ?? ""
    // Keep anchoring disabled throughout pin refreshes, including media changes.
    if (main) main.style.overflowAnchor = "none"
    let disposed = false
    let resizeTimer: ReturnType<typeof setTimeout> | undefined
    let sceneProgress: number | undefined
    let pendingProgress: number | undefined
    let wasOpen = false
    const update = (progress: number) => {
      stage.style.setProperty(
        "--drawer-closed",
        String(Math.max(0, 1 - progress * 2))
      )
      stage.style.setProperty(
        "--drawer-middle",
        String(1 - Math.abs(progress * 2 - 1))
      )
      stage.style.setProperty(
        "--drawer-open",
        String(Math.max(0, progress * 2 - 1))
      )
      const isOpen = progress >= 0.99
      if (isOpen !== wasOpen) setReady(isOpen)
      if (!isOpen && wasOpen) {
        if (controlsRef.current?.contains(document.activeElement))
          stage.focus({ preventScroll: true })
        setSelected(null)
      }
      wasOpen = isOpen
    }
    const setup = () => {
      const scrollPosition = window.scrollY
      const previousScene = ScrollTrigger.getById("forgotten-drawer-scene")
      const previousProgress = pendingProgress ?? previousScene?.progress
      const wasInScene =
        pendingProgress !== undefined ||
        (previousScene &&
          scrollPosition >= previousScene.start &&
          scrollPosition <= previousScene.end)
      media.revert()
      media.add(
        {
          all: "(min-width: 0px)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { reduced } = context.conditions!
          const desktop = window.innerWidth >= 1024
          if (reduced) {
            update(1)
            return
          }

          const styles = getComputedStyle(section)
          // Only pin when the entire scene fits below the fixed navbar.
          const fits =
            layout.offsetHeight +
              parseFloat(styles.paddingTop) +
              parseFloat(styles.paddingBottom) <=
            window.innerHeight
          const figure = stage.closest<HTMLElement>("figure")!
          const visualFits = figure.offsetHeight <= window.innerHeight - 112
          // On narrow/short screens, read the copy first and pin just the visual.
          // If even that cannot fit (e.g. browser zoom), keep every control accessible.
          if (!fits && !visualFits) {
            update(1)
            return
          }
          const fullScene = desktop && fits
          const state = { progress: 0 }
          update(0)
          const timeline = gsap.timeline({
            paused: true,
            onUpdate: () => update(state.progress),
          })
          // Stable plateaus make all three renders readable in either direction.
          timeline
            .addLabel("closed", 0)
            .to(state, { progress: 0, duration: 0.18, ease: "none" })
            .to(state, { progress: 0.5, duration: 0.17, ease: "none" })
            .addLabel("half-open")
            .to(state, { progress: 0.5, duration: 0.2, ease: "none" })
            .to(state, { progress: 1, duration: 0.2, ease: "none" })
            .addLabel("open")
            .to(state, { progress: 1, duration: 0.25, ease: "none" })

          const sceneWidth = window.innerWidth
          const sceneHeight = window.innerHeight
          const cleanupScene = createScrollScene({
            id: "forgotten-drawer-scene",
            element: fullScene ? section : figure,
            anchor: section,
            timeline,
            top: fullScene ? 0 : 96,
            screens: fullScene ? 1.8 : 1,
            stops: fullScene ? [0, 0.45, 0.85, 1] : [],
            wheelStops: fullScene ? [0, 0.45, 0.85] : [],
            onUpdate: (trigger) => {
              // Ignore automatic refreshes after CSS has switched layout on resize.
              if (
                window.innerWidth === sceneWidth &&
                window.innerHeight === sceneHeight
              ) {
                sceneProgress = trigger.isActive ? trigger.progress : undefined
              }
            },
            onRefresh: (trigger) => {
              timeline.totalProgress(trigger.progress)
              update(state.progress)
            },
          })

          for (const selector of [".forgotten-copy", ".forgotten-conclusion"]) {
            const block = section.querySelector<HTMLElement>(selector)
            if (!block) continue
            gsap.fromTo(
              block.children,
              { opacity: 0, y: 18 },
              {
                opacity: 1,
                y: 0,
                duration: 0.65,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: block,
                  start: "top 65%",
                  once: true,
                  invalidateOnRefresh: true,
                  markers: false,
                },
              }
            )
          }
          return cleanupScene
        }
      )
      // Removing a pin spacer can otherwise move the browser's scroll anchor.
      window.scrollTo({ top: scrollPosition, behavior: "instant" })
      ScrollTrigger.refresh()
      const nextScene = ScrollTrigger.getById("forgotten-drawer-scene")
      if (wasInScene && nextScene && previousProgress !== undefined) {
        window.scrollTo({
          top:
            nextScene.start +
            (nextScene.end - nextScene.start) * previousProgress,
          behavior: "instant",
        })
        ScrollTrigger.update()
      }
    }
    const refresh = () => {
      if (!disposed) ScrollTrigger.refresh()
    }
    const resize = () => {
      if (resizeTimer === undefined) pendingProgress = sceneProgress
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        setup()
        resizeTimer = undefined
        pendingProgress = undefined
      }, 180)
    }
    setup()
    const images = Array.from(section.querySelectorAll("img"))
    images.forEach((image) => image.addEventListener("load", refresh))
    void document.fonts.ready.then(refresh)
    window.addEventListener("resize", resize)
    window.addEventListener("pageshow", refresh)
    return () => {
      disposed = true
      clearTimeout(resizeTimer)
      images.forEach((image) => image.removeEventListener("load", refresh))
      window.removeEventListener("resize", resize)
      window.removeEventListener("pageshow", refresh)
      media.revert()
      if (main) main.style.overflowAnchor = originalAnchor
      if (originalStyle === null) stage.removeAttribute("style")
      else stage.setAttribute("style", originalStyle)
    }
  }, [])

  const closeStory = () => {
    if (selected !== null) triggerRefs.current[selected]?.focus()
    setSelected(null)
  }

  return (
    <figure className="forgotten-drawer">
      <div
        ref={stageRef}
        className="drawer-stage"
        role="img"
        aria-label="Cajón de madera que se abre al bajar, revelando móviles antiguos y cables"
        tabIndex={-1}
      >
        <Image
          src="/images/cajon_cerrado.webp"
          alt=""
          width={1448}
          height={1086}
          sizes="(min-width: 1440px) 760px, (min-width: 1024px) 55vw, 100vw"
          className="drawer-frame drawer-frame-closed"
        />
        <Image
          src="/images/cajon_medio_abierto.webp"
          alt=""
          width={1448}
          height={1086}
          sizes="(min-width: 1440px) 760px, (min-width: 1024px) 55vw, 100vw"
          className="drawer-frame drawer-frame-middle"
        />
        <Image
          src="/images/cajon_abierto.webp"
          alt=""
          width={1448}
          height={1086}
          sizes="(min-width: 1440px) 760px, (min-width: 1024px) 55vw, 100vw"
          className="drawer-frame drawer-frame-open"
        />
      </div>
      <figcaption className="drawer-caption">
        {ready
          ? "Cada móvil guarda una historia. Descubre la suya."
          : "Sigue bajando para abrir el cajón."}
      </figcaption>
      <div
        ref={controlsRef}
        className="drawer-interactions"
        data-ready={ready}
        inert={!ready}
        aria-hidden={!ready}
        onKeyDown={(event) => {
          if (event.key === "Escape") closeStory()
        }}
      >
        <div
          className="drawer-story-controls"
          role="group"
          aria-label="Historias de los móviles olvidados"
        >
          {stories.map((story, index) => (
            <button
              key={story.name}
              ref={(element) => {
                triggerRefs.current[index] = element
              }}
              type="button"
              className="drawer-story-trigger"
              aria-expanded={selected === index}
              aria-controls="drawer-story"
              onClick={() => setSelected(selected === index ? null : index)}
            >
              <span aria-hidden="true" />
              {story.name}
            </button>
          ))}
        </div>
        <div
          className="drawer-story-space"
          aria-live="polite"
          aria-atomic="true"
        >
          {selected !== null && (
            <div key={selected} id="drawer-story" className="drawer-story">
              <div>
                <h3>{stories[selected].name}</h3>
                <p>{stories[selected].text}</p>
              </div>
              <button
                type="button"
                aria-label="Cerrar historia"
                onClick={closeStory}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </figure>
  )
}

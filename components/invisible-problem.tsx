"use client"

import { useRef } from "react"
import {
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  Keyboard,
  Radio,
} from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { createScrollScene } from "@/lib/scroll-scene"

gsap.registerPlugin(ScrollTrigger, useGSAP)

const devices = [
  Smartphone,
  Monitor,
  Laptop,
  Tablet,
  Radio,
  Smartphone,
  Keyboard,
  Laptop,
  Monitor,
  Tablet,
  Smartphone,
  Radio,
]
const source =
  "https://unitar.org/about/news-stories/press/global-e-waste-monitor-2024-electronic-waste-rising-five-times-faster-documented-e-waste-recycling"

export function InvisibleProblem() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const section = sectionRef.current!
      const inner = section.querySelector<HTMLElement>(".problem-inner")!
      const media = gsap.matchMedia()
      let timer: ReturnType<typeof setTimeout> | undefined
      let pendingProgress: number | undefined
      let progress: number | undefined
      let disposed = false

      const setup = () => {
        const savedY = window.scrollY
        const savedProgress = pendingProgress
        media.revert()
        media.add(
          {
            all: "(min-width: 0px)",
            reduced: "(prefers-reduced-motion: reduce)",
          },
          (context) => {
            if (context.conditions!.reduced || window.innerWidth < 768) return
            gsap.set(section, { attr: { "data-narrative": "true" } })
            const style = getComputedStyle(section)
            if (
              inner.offsetHeight +
                parseFloat(style.paddingTop) +
                parseFloat(style.paddingBottom) >
              window.innerHeight + 1
            ) {
              gsap.set(section, { attr: { "data-narrative": "false" } })
              return
            }
            const single = section.querySelector(".problem-single")!
            const icons = section.querySelectorAll(".problem-device")
            const grid = section.querySelector(".problem-devices")!
            const generated = section.querySelector(".problem-generated")!
            const recycled = section.querySelector(".problem-recycled")!
            const fill = section.querySelector(".problem-bar-fill")!
            const conclusion = section.querySelector(".problem-conclusion")!
            gsap.set(icons, { opacity: 0, scale: 0.85, y: 10 })
            gsap.set([generated, recycled, conclusion], { autoAlpha: 0, y: 14 })
            gsap.set(fill, { scaleX: 0 })
            const timeline = gsap
              .timeline({ paused: true })
              .addLabel("one", 0)
              .to({}, { duration: 0.18 })
              .to(single, { autoAlpha: 0, scale: 0.85, duration: 0.12 }, 0.18)
              .to(
                icons,
                {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  stagger: 0.008,
                  duration: 0.12,
                  ease: "power2.out",
                },
                0.2
              )
              .to(generated, { autoAlpha: 1, y: 0, duration: 0.15 }, 0.2)
              .addLabel("global", 0.35)
              .to({}, { duration: 0.2 }, 0.35)
              .to(generated, { autoAlpha: 0, y: -12, duration: 0.12 }, 0.55)
              .to(grid, { opacity: 0.22, duration: 0.2 }, 0.55)
              .to(recycled, { autoAlpha: 1, y: 0, duration: 0.15 }, 0.6)
              .to(fill, { scaleX: 1, duration: 0.15, ease: "none" }, 0.6)
              .to(conclusion, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.65)
              .addLabel("recycling", 0.75)
              .to({}, { duration: 0.25 }, 0.75)
            const width = window.innerWidth
            const height = window.innerHeight
            const cleanup = createScrollScene({
              id: "invisible-problem-scene",
              element: section,
              timeline,
              screens: 1.8,
              stops: [0, 0.45, 0.85, 1],
              wheelStops: width >= 1024 ? [0, 0.45, 0.85] : [],
              refreshPriority: -1,
              onUpdate: (trigger) => {
                if (
                  window.innerWidth === width &&
                  window.innerHeight === height
                )
                  progress = trigger.isActive ? trigger.progress : undefined
              },
              onRefresh: (trigger) => timeline.totalProgress(trigger.progress),
            })
            return cleanup
          }
        )
        window.scrollTo({ top: savedY, behavior: "instant" })
        ScrollTrigger.refresh()
        const scene = ScrollTrigger.getById("invisible-problem-scene")
        if (savedProgress !== undefined && scene) {
          window.scrollTo({
            top: scene.start + (scene.end - scene.start) * savedProgress,
            behavior: "instant",
          })
          ScrollTrigger.update()
        }
      }
      const resize = () => {
        if (timer === undefined) pendingProgress = progress
        clearTimeout(timer)
        timer = setTimeout(() => {
          setup()
          pendingProgress = undefined
          timer = undefined
        }, 220)
      }
      const refresh = () => {
        if (!disposed) ScrollTrigger.refresh()
      }
      setup()
      void document.fonts.ready.then(refresh)
      window.addEventListener("resize", resize)
      window.addEventListener("pageshow", refresh)
      return () => {
        disposed = true
        clearTimeout(timer)
        window.removeEventListener("resize", resize)
        window.removeEventListener("pageshow", refresh)
        media.revert()
      }
    },
    { scope: sectionRef }
  )

  return (
    <section
      id="section-2"
      ref={sectionRef}
      aria-labelledby="problem-title"
      tabIndex={-1}
      className="bg-stone problem-section"
    >
      <div className="problem-inner">
        <header className="problem-heading">
          <p className="problem-eyebrow">02 / EL PROBLEMA INVISIBLE</p>
          <h2 id="problem-title">
            Un cajón parece poco. Millones cuentan otra historia.
          </h2>
          <p className="problem-description">
            Lo que empieza con un teléfono olvidado se convierte en un problema
            global cuando multiplicamos ese gesto por millones de personas. Los
            residuos electrónicos siguen aumentando, mientras gran parte de sus
            materiales no se recupera mediante sistemas formales de reciclaje.
          </p>
        </header>
        <div className="problem-scene">
          <figure className="problem-single">
            <Smartphone strokeWidth={1} aria-hidden="true" />
            <figcaption>Todo empieza con uno</figcaption>
          </figure>
          <div className="problem-visual" aria-hidden="true">
            <div className="problem-devices">
              {devices.map((Device, index) => (
                <Device
                  key={index}
                  className="problem-device"
                  strokeWidth={1.15}
                />
              ))}
            </div>
          </div>
          <div className="problem-statistics">
            <div className="problem-stat problem-generated">
              <p className="problem-number">
                62 <span>millones de toneladas.</span>
              </p>
              <p>
                Residuos electrónicos generados en todo el mundo durante 2022.
              </p>
            </div>
            <div className="problem-stat problem-recycled">
              <p className="problem-number">
                22,3 <span className="problem-percent">%</span>
              </p>
              <p id="problem-rate">
                Proporción documentada como recogida y reciclada formalmente en
                2022.
              </p>
              <div
                className="problem-bar"
                role="img"
                aria-label="22,3 % de los residuos electrónicos mundiales recogidos y reciclados formalmente en 2022"
              >
                <div className="problem-bar-fill" />
              </div>
            </div>
          </div>
        </div>
        <footer className="problem-footer">
          <p className="problem-conclusion">
            Lo que dejamos atrás todavía puede tener valor.
          </p>
          <p className="problem-source">
            Datos del conjunto de residuos electrónicos mundiales, no solo de
            móviles.{" "}
            <a href={source} target="_blank" rel="noopener noreferrer">
              Global E-waste Monitor 2024 — ITU y UNITAR
              <span className="sr-only"> (abre en otra pestaña)</span>
            </a>
            .
          </p>
        </footer>
      </div>
    </section>
  )
}

"use client"

import { useRef } from "react"
import { RefreshCw, Recycle } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { createScrollScene } from "@/lib/scroll-scene"

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function SecondLife() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const section = sectionRef.current!
      const inner = section.querySelector<HTMLElement>(".rebirth-inner")!
      const branches = section.querySelectorAll(".rebirth-branch")!
      const conclusion = section.querySelector(".rebirth-conclusion")!
      const stem = section.querySelector(".rebirth-stem")!
      const paths = section.querySelectorAll(".rebirth-path")!
      const media = gsap.matchMedia()
      let disposed = false
      let timer: ReturnType<typeof setTimeout> | undefined
      let progress: number | undefined
      let pendingProgress: number | undefined
      let restoreFrame = 0
      const restoreKey = `second-life:${location.pathname}`
      let reloadProgress: number | undefined
      try {
        if (
          (
            performance.getEntriesByType(
              "navigation"
            )[0] as PerformanceNavigationTiming
          )?.type === "reload"
        ) {
          const stored = sessionStorage.getItem(restoreKey)
          if (stored !== null) reloadProgress = Number(stored)
        }
      } catch {
        /* Native restoration is used when storage is unavailable. */
      }
      const remember = () => {
        const scene = ScrollTrigger.getById("second-life-scene")
        try {
          if (scene?.isActive)
            sessionStorage.setItem(restoreKey, String(scene.progress))
          else sessionStorage.removeItem(restoreKey)
        } catch {
          /* Storage is optional. */
        }
      }
      const restore = () => {
        if (reloadProgress === undefined || document.readyState !== "complete")
          return
        cancelAnimationFrame(restoreFrame)
        restoreFrame = requestAnimationFrame(() => {
          restoreFrame = requestAnimationFrame(() => {
            if (disposed) return
            const scene = ScrollTrigger.getById("second-life-scene")
            if (!scene) return
            ScrollTrigger.refresh()
            window.scrollTo({
              top: scene.start + (scene.end - scene.start) * reloadProgress!,
              behavior: "instant",
            })
            reloadProgress = undefined
            ScrollTrigger.update()
          })
        })
      }
      const setup = () => {
        if (disposed) return
        const savedY = window.scrollY
        const savedProgress = pendingProgress
        media.revert()
        media.add(
          {
            all: "(min-width: 0px)",
            reduced: "(prefers-reduced-motion: reduce)",
          },
          (context) => {
            if (context.conditions!.reduced || window.innerWidth < 1024) return
            const style = getComputedStyle(section)
            if (
              inner.offsetHeight +
                parseFloat(style.paddingTop) +
                parseFloat(style.paddingBottom) >
              window.innerHeight + 1
            )
              return
            gsap.set([stem, ...paths], {
              strokeDasharray: 1,
              strokeDashoffset: 1,
            })
            gsap.set(branches, { autoAlpha: 0, y: 10 })
            gsap.set(conclusion, { autoAlpha: 0, y: 8 })
            const timeline = gsap
              .timeline({ paused: true })
              .addLabel("question", 0)
              .to({}, { duration: 0.16 })
              .to(
                stem,
                { strokeDashoffset: 0, duration: 0.12, ease: "none" },
                0.16
              )
              .to(
                paths,
                { strokeDashoffset: 0, duration: 0.22, ease: "none" },
                0.28
              )
              .to(
                branches,
                { autoAlpha: 1, y: 0, duration: 0.16, ease: "power2.out" },
                0.42
              )
              .addLabel("paths", 0.58)
              .to(conclusion, { autoAlpha: 1, y: 0, duration: 0.14 }, 0.7)
              .addLabel("opportunity", 0.84)
              .to({}, { duration: 0.16 }, 0.84)
            const width = window.innerWidth
            const height = window.innerHeight
            const cleanup = createScrollScene({
              id: "second-life-scene",
              element: section,
              timeline,
              screens: 1.2,
              stops: [0, 0.6, 0.92, 1],
              wheelStops: [0, 0.6, 0.92],
              refreshPriority: -5,
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
        const scene = ScrollTrigger.getById("second-life-scene")
        if (savedProgress !== undefined && scene) {
          window.scrollTo({
            top: scene.start + (scene.end - scene.start) * savedProgress,
            behavior: "instant",
          })
          ScrollTrigger.update()
        }
        restore()
      }
      const resize = () => {
        if (timer === undefined) pendingProgress = progress
        clearTimeout(timer)
        cancelAnimationFrame(restoreFrame)
        timer = setTimeout(() => {
          setup()
          pendingProgress = undefined
          timer = undefined
        }, 380)
      }
      const refresh = () => {
        if (!disposed) ScrollTrigger.refresh()
      }
      window.addEventListener("resize", resize)
      window.addEventListener("pageshow", refresh)
      window.addEventListener("load", restore)
      window.addEventListener("pagehide", remember)
      void document.fonts.ready.then(() => {
        if (!disposed) setup()
      })
      setup()
      return () => {
        disposed = true
        clearTimeout(timer)
        cancelAnimationFrame(restoreFrame)
        window.removeEventListener("resize", resize)
        window.removeEventListener("pageshow", refresh)
        window.removeEventListener("load", restore)
        window.removeEventListener("pagehide", remember)
        media.revert()
      }
    },
    { scope: sectionRef }
  )

  return (
    <section
      id="section-6"
      ref={sectionRef}
      className="bg-sage rebirth-section"
      aria-labelledby="rebirth-title"
      tabIndex={-1}
    >
      <div className="rebirth-inner">
        <header className="rebirth-heading">
          <p className="rebirth-eyebrow">06 / SEGUNDA VIDA</p>
          <h2 id="rebirth-title">Su historia no termina aquí.</h2>
          <p className="rebirth-intro">
            Después de la despedida, comienza una nueva oportunidad. El programa
            evalúa qué dispositivos pueden volver a utilizarse y cuáles
            necesitan un reciclaje adecuado para recuperar sus materiales.
          </p>
        </header>
        <div className="rebirth-diagram">
          <p className="rebirth-question">
            ¿Qué puede pasar después del funeral?
          </p>
          <div
            className="rebirth-device"
            role="img"
            aria-label="Smartphone antes de evaluar sus posibles destinos"
          >
            <svg
              width={56}
              height={76}
              viewBox="0 0 56 76"
              preserveAspectRatio="none"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <rect x="8" y="1" width="40" height="74" rx="7" />
              <path d="M23 66H33" />
            </svg>
          </div>
          <svg
            className="rebirth-routing"
            viewBox="0 0 1100 64"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <path className="rebirth-stem" d="M550 0V20" pathLength="1" />
            <path className="rebirth-path" d="M550 20H255V64" pathLength="1" />
            <path className="rebirth-path" d="M550 20H845V64" pathLength="1" />
          </svg>
          <div className="rebirth-branches">
            <article
              className="rebirth-branch"
              aria-labelledby="rebirth-reuse-title"
            >
              <svg
                className="rebirth-mobile-line"
                fill="none"
                aria-hidden="true"
              >
                <line x1="20" y1="0" x2="20" y2="100%" />
                <path d="M20 44H48" />
              </svg>
              <RefreshCw
                className="rebirth-icon"
                size={40}
                strokeWidth={1.3}
                aria-hidden="true"
              />
              <p className="rebirth-label">CAMINO 01 / REUTILIZACIÓN</p>
              <h3 id="rebirth-reuse-title">Reutilizar antes que reciclar.</h3>
              <p className="rebirth-description">
                Cuando un smartphone todavía puede utilizarse, se estudia la
                posibilidad de prolongar su vida útil. La revisión, preparación
                y, cuando proceda, reparación permiten que un dispositivo siga
                siendo útil durante más tiempo.
              </p>
              <blockquote className="rebirth-quote">
                «Todavía tengo historias que vivir».
              </blockquote>
            </article>
            <article
              className="rebirth-branch"
              aria-labelledby="rebirth-recycle-title"
            >
              <svg
                className="rebirth-mobile-line"
                fill="none"
                aria-hidden="true"
              >
                <path d="M20 0V44H48" />
              </svg>
              <Recycle
                className="rebirth-icon"
                size={40}
                strokeWidth={1.3}
                aria-hidden="true"
              />
              <p className="rebirth-label">CAMINO 02 / RECICLAJE</p>
              <h3 id="rebirth-recycle-title">
                Reciclar para recuperar recursos.
              </h3>
              <p className="rebirth-description">
                Si el teléfono ya no puede reutilizarse, sus componentes
                requieren una gestión adecuada. El reciclaje de móviles permite
                recuperar materiales aprovechables y tratar por separado
                elementos que necesitan atención especial, como las baterías.
              </p>
              <blockquote className="rebirth-quote">
                «Quizá no vuelva a encenderme, pero todavía puedo aportar algo».
              </blockquote>
            </article>
          </div>
        </div>
        <footer className="rebirth-conclusion">
          <p>Despedimos al dispositivo. No a sus posibilidades.</p>
          <p>
            Dar una segunda oportunidad a nuestros dispositivos ayuda a
            aprovechar mejor los recursos y a reducir los residuos electrónicos.
          </p>
          <p className="rebirth-management">
            Los residuos electrónicos deben gestionarse mediante canales y
            gestores autorizados.
          </p>
        </footer>
      </div>
    </section>
  )
}

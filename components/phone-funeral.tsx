"use client"

import Image from "next/image"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { createScrollScene } from "@/lib/scroll-scene"

gsap.registerPlugin(ScrollTrigger, useGSAP)

function FuneralFlowers() {
  return (
    <svg viewBox="0 0 160 130" fill="none" aria-hidden="true">
      <path
        d="M28 116 Q65 84 109 34 M36 122 Q76 99 130 68 M35 113 Q62 93 67 51"
        stroke="#A9B8A8"
        strokeWidth="2"
      />
      <path
        d="M64 88 Q41 65 45 85 Q48 96 64 88 M94 92 Q112 105 110 87 Q102 80 94 92"
        fill="#A9B8A8"
      />
      {[
        { x: 109, y: 34 },
        { x: 130, y: 68 },
        { x: 67, y: 51 },
      ].map(({ x, y }) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <ellipse
              key={angle}
              cy="-9"
              rx="5"
              ry="10"
              transform={`rotate(${angle})`}
              fill="#F6F5F1"
            />
          ))}
          <circle r="4" fill="#A9B8A8" />
        </g>
      ))}
    </svg>
  )
}

export function PhoneFuneral() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const section = sectionRef.current!
      const inner = section.querySelector<HTMLElement>(".funeral-inner")!
      const stage = section.querySelector<HTMLElement>(".funeral-stage")!
      const phonePosition = section.querySelector(".funeral-phone-position")!
      const phone = section.querySelector(".funeral-phone")!
      const initial = section.querySelector(".funeral-message-initial")!
      const farewell = section.querySelector(".funeral-message-farewell")!
      const flowers = section.querySelector(".funeral-flowers")!
      const conclusion = section.querySelector(".funeral-conclusion")!
      const cta = section.querySelector<HTMLAnchorElement>(".funeral-cta")!
      const media = gsap.matchMedia()
      let disposed = false
      let timer: ReturnType<typeof setTimeout> | undefined
      let progress: number | undefined
      let pendingProgress: number | undefined
      let restoreFrame = 0
      const restoreKey = `phone-funeral:${location.pathname}`
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
        const scene = ScrollTrigger.getById("phone-funeral-scene")
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
            const scene = ScrollTrigger.getById("phone-funeral-scene")
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
            gsap.set(phonePosition, {
              xPercent: -50,
              yPercent: -50,
              x: () => -stage.offsetWidth * 0.38,
              y: () => -stage.offsetHeight * 0.2,
            })
            gsap.set(phone, { transform: "matrix(1,0,0,1,0,0)" })
            gsap.set(initial, { autoAlpha: 1 })
            gsap.set([farewell, flowers, conclusion, cta], { autoAlpha: 0 })
            gsap.set([conclusion, cta], { y: 12 })
            const timeline = gsap
              .timeline({ paused: true })
              .addLabel("arrival", 0)
              .to({}, { duration: 0.16 })
              .to(
                phonePosition,
                { x: 0, y: 0, duration: 0.32, ease: "power2.inOut" },
                0.16
              )
              .to(
                phone,
                {
                  transform: "matrix(.55,-.30,.82,.27,0,0)",
                  duration: 0.32,
                  ease: "power2.inOut",
                },
                0.16
              )
              .to(initial, { autoAlpha: 0, duration: 0.08 }, 0.32)
              .to(farewell, { autoAlpha: 1, duration: 0.1 }, 0.4)
              .addLabel("farewell", 0.5)
              .to({}, { duration: 0.16 }, 0.5)
              .to(flowers, { autoAlpha: 1, duration: 0.14 }, 0.66)
              .to(farewell, { opacity: 0.65, duration: 0.12 }, 0.68)
              .to(conclusion, { autoAlpha: 1, y: 0, duration: 0.12 }, 0.7)
              .to(cta, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.78)
              .addLabel("opportunity", 0.88)
              .to({}, { duration: 0.12 }, 0.88)
            const width = window.innerWidth
            const height = window.innerHeight
            const cleanup = createScrollScene({
              id: "phone-funeral-scene",
              element: section,
              timeline,
              screens: 1.8,
              stops: [0, 0.55, 0.92, 1],
              wheelStops: [0, 0.55, 0.92],
              refreshPriority: -3,
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
        const scene = ScrollTrigger.getById("phone-funeral-scene")
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
        timer = setTimeout(() => {
          setup()
          pendingProgress = undefined
          timer = undefined
        }, 300)
      }
      const refresh = () => {
        if (!disposed) ScrollTrigger.refresh()
      }
      const images = section.querySelectorAll("img")
      images.forEach((image) => image.addEventListener("load", refresh))
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
        images.forEach((image) => image.removeEventListener("load", refresh))
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
      id="section-4"
      ref={sectionRef}
      className="bg-dark funeral-section"
      aria-labelledby="funeral-title"
      tabIndex={-1}
    >
      <div className="funeral-inner">
        <div className="funeral-copy">
          <header>
            <p className="funeral-eyebrow">04 / LA DESPEDIDA</p>
            <h2 id="funeral-title">
              Un último adiós. Una segunda oportunidad.
            </h2>
            <p className="funeral-description">
              El Funeral de tu Móvil es una experiencia de concienciación
              ambiental que transforma la despedida de un smartphone antiguo en
              una oportunidad para fomentar la reutilización y el reciclaje de
              móviles.
            </p>
          </header>
          <div className="funeral-ending">
            <p className="funeral-conclusion">
              No estamos aquí para llorar por la tecnología. Estamos aquí para
              darle un futuro mejor.
            </p>
            <a className="funeral-cta" href="#section-5">
              Descubre cómo funciona <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="funeral-visual">
          <div
            className="funeral-stage"
            role="img"
            aria-label="El smartphone del Hero descansa con los ojos encendidos sobre el interior de un ataúd negro abierto, acompañado de flores blancas. Una despedida simbólica antes de darle una segunda oportunidad."
          >
            <Image
              src="/images/Ataúd negro de lujo abierto.webp"
              alt=""
              width={1448}
              height={1086}
              sizes="(min-width: 1024px) 55vw, 90vw"
              className="funeral-coffin"
            />
            <div className="funeral-phone-position">
              <div className="funeral-phone">
                <Image
                  src="/images/phone.webp"
                  alt=""
                  width={750}
                  height={1451}
                  sizes="(min-width: 1024px) 130px, 70px"
                />
                <svg
                  className="funeral-phone-eyes"
                  viewBox="0 0 120 34"
                  aria-hidden="true"
                >
                  <path
                    d="M8 26 C10 1 39 1 43 26 C33 17 19 17 8 26Z M77 26 C79 1 108 1 112 26 C102 17 88 17 77 26Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>
            <div className="funeral-flowers">
              <FuneralFlowers />
            </div>
          </div>
          <div className="funeral-bubble">
            <p className="funeral-bubble-label">TU ANTIGUO MÓVIL</p>
            <div className="funeral-message-slot">
              <p className="funeral-message-initial">
                Creo que ha llegado mi momento.
              </p>
              <p className="funeral-message-farewell">
                Gracias por todos esos recuerdos. Ha llegado mi momento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

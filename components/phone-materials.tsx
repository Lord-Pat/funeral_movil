"use client"

import { useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { createScrollScene } from "@/lib/scroll-scene"

gsap.registerPlugin(ScrollTrigger, useGSAP)

const materials = [
  {
    name: "Carcasa y estructura",
    text: "Contienen materiales como aluminio y otros metales que pueden recuperarse mediante tratamientos adecuados.",
    x: 12,
  },
  {
    name: "Batería",
    text: "Contiene materiales valiosos, pero necesita una recogida y un tratamiento especializados.",
    x: 36,
  },
  {
    name: "Placa electrónica",
    text: "Sus circuitos incorporan metales y componentes que pueden aprovecharse mediante procesos especializados.",
    x: 61,
  },
  {
    name: "Pantalla",
    text: "Está formada por capas de vidrio y materiales electrónicos que necesitan una gestión adecuada.",
    x: 88,
  },
]

export function PhoneMaterials() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [selected, setSelected] = useState(0)
  const [enhanced, setEnhanced] = useState(false)
  const [ready, setReady] = useState(true)
  const [failed, setFailed] = useState(false)

  useGSAP(
    () => {
      const section = sectionRef.current!
      const video = videoRef.current!
      const inner = section.querySelector<HTMLElement>(".materials-inner")!
      const exploration = section.querySelector<HTMLElement>(
        ".materials-exploration"
      )!
      const labels = section.querySelectorAll(".materials-label")
      const lines = section.querySelector(".materials-connectors")!
      const conclusion = section.querySelector(".materials-conclusion")!
      const hint = section.querySelector(".materials-hint")!
      const media = gsap.matchMedia()
      let disposed = false
      let timer: ReturnType<typeof setTimeout> | undefined
      let progress: number | undefined
      let pendingProgress: number | undefined
      let targetTime = 0.6
      let controlled = false
      let wasReady = true
      // Coalesce seeks: a slow decoder finishes its current seek before receiving the latest target.
      const seek = () => {
        if (!controlled || disposed || video.readyState < 1 || video.seeking)
          return
        if (Math.abs(video.currentTime - targetTime) > 1 / 48)
          video.currentTime = targetTime
      }
      const setExplorable = (value: boolean) => {
        if (wasReady === value) return
        if (
          !value &&
          (exploration.contains(document.activeElement) ||
            section
              .querySelector(".materials-labels")
              ?.contains(document.activeElement))
        )
          video.focus({ preventScroll: true })
        wasReady = value
        setReady(value)
      }
      const setup = () => {
        if (disposed || !Number.isFinite(video.duration) || video.duration <= 0)
          return
        const savedY = window.scrollY
        const savedProgress = pendingProgress
        video.pause()
        media.revert()
        media.add(
          {
            all: "(min-width: 0px)",
            reduced: "(prefers-reduced-motion: reduce)",
          },
          (context) => {
            const finalTime = Math.max(0, video.duration - 1 / 24)
            const firstTime = Math.min(0.6, finalTime)
            const fallback = () => {
              controlled = false
              setEnhanced(false)
              setExplorable(true)
              targetTime = context.conditions!.reduced ? finalTime : firstTime
              video.currentTime = targetTime
            }
            if (context.conditions!.reduced || window.innerWidth < 768) {
              fallback()
              return
            }
            gsap.set(section, { attr: { "data-narrative": "true" } })
            const style = getComputedStyle(section)
            if (
              inner.offsetHeight +
                parseFloat(style.paddingTop) +
                parseFloat(style.paddingBottom) >
              window.innerHeight + 1
            ) {
              gsap.set(section, { attr: { "data-narrative": "false" } })
              fallback()
              return
            }
            setEnhanced(true)
            controlled = true
            setExplorable(false)
            gsap.set([labels, lines, exploration, conclusion], { autoAlpha: 0 })
            gsap.set(labels, { y: 6 })
            const state = { time: firstTime }
            const sync = () => {
              targetTime = state.time
              seek()
              setExplorable(state.time >= finalTime - 0.025)
            }
            const timeline = gsap
              .timeline({ paused: true, onUpdate: sync })
              .addLabel("presentation", 0)
              .to(state, { time: firstTime, duration: 0.12, ease: "none" })
              .to(state, { time: finalTime, duration: 0.48, ease: "none" })
              .to(hint, { autoAlpha: 0, duration: 0.08 }, 0.46)
              .to(
                labels,
                { autoAlpha: 1, y: 0, duration: 0.06, stagger: 0.025 },
                0.48
              )
              .to(lines, { autoAlpha: 1, duration: 0.12 }, 0.5)
              .to(exploration, { autoAlpha: 1, duration: 0.08 }, 0.6)
              .addLabel("exploration", 0.68)
              .to(conclusion, { autoAlpha: 1, duration: 0.1 }, 0.78)
              .addLabel("conclusion", 0.88)
              .to(state, { time: finalTime, duration: 0.4, ease: "none" }, 0.6)
            const width = window.innerWidth
            const height = window.innerHeight
            const cleanup = createScrollScene({
              id: "phone-materials-scene",
              element: section,
              timeline,
              screens: 1.8,
              stops: [0, 0.68, 0.92, 1],
              wheelStops: width >= 1024 ? [0, 0.68, 0.92] : [],
              refreshPriority: -2,
              onUpdate: (trigger) => {
                if (
                  window.innerWidth === width &&
                  window.innerHeight === height
                )
                  progress = trigger.isActive ? trigger.progress : undefined
              },
              onRefresh: (trigger) => {
                timeline.totalProgress(trigger.progress)
                sync()
              },
            })
            sync()
            return cleanup
          }
        )
        window.scrollTo({ top: savedY, behavior: "instant" })
        ScrollTrigger.refresh()
        const scene = ScrollTrigger.getById("phone-materials-scene")
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
        }, 260)
      }
      const refresh = () => {
        if (!disposed) ScrollTrigger.refresh()
      }
      const handleError = () => {
        controlled = false
        media.revert()
        setFailed(true)
        setEnhanced(false)
        setExplorable(true)
        refresh()
      }
      video.addEventListener("loadedmetadata", setup)
      video.addEventListener("error", handleError)
      video.addEventListener("loadeddata", seek)
      video.addEventListener("seeked", seek)
      window.addEventListener("resize", resize)
      window.addEventListener("pageshow", refresh)
      void document.fonts.ready.then(refresh)
      setup()
      return () => {
        disposed = true
        clearTimeout(timer)
        video.pause()
        video.removeEventListener("loadedmetadata", setup)
        video.removeEventListener("error", handleError)
        video.removeEventListener("loadeddata", seek)
        video.removeEventListener("seeked", seek)
        window.removeEventListener("resize", resize)
        window.removeEventListener("pageshow", refresh)
        media.revert()
      }
    },
    { scope: sectionRef }
  )

  return (
    <section
      id="section-3"
      ref={sectionRef}
      aria-labelledby="materials-title"
      tabIndex={-1}
      className="bg-light materials-section"
    >
      <div className="materials-inner">
        <header className="materials-heading">
          <p className="materials-eyebrow">03 / MÁS ALLÁ DE LA PANTALLA</p>
          <h2 id="materials-title">
            Puede que ya no funcione. Sus materiales todavía tienen valor.
          </h2>
          <p className="materials-description">
            Detrás de cada pantalla rota hay materiales, componentes y recursos
            que no deberían acabar en la basura. Descubre qué esconde tu antiguo
            smartphone y por qué merece una segunda oportunidad.
          </p>
        </header>
        <p className="materials-hint">Desliza para descubrir qué hay dentro.</p>
        <div className="materials-stage">
          <div className="materials-media">
            <video
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              controls={!enhanced}
              width={848}
              height={478}
              poster="/images/desmontaje_movil_poster.webp"
              aria-label="Smartphone que se desmonta para mostrar su carcasa, batería, placa electrónica y pantalla"
              tabIndex={0}
              onPlay={() => {
                if (enhanced) videoRef.current?.pause()
              }}
            >
              <source
                src="/images/desmontaje_movil_scroll.webm"
                type="video/webm"
              />
              Tu navegador no permite reproducir este vídeo. Consulta las
              explicaciones de los componentes a continuación.
            </video>
            <svg
              className="materials-connectors"
              viewBox="0 0 848 478"
              aria-hidden="true"
            >
              <path d="M102 478 L178 325 M305 478 L288 300 M517 478 L475 285 M746 478 L580 320" />
              <circle cx="178" cy="325" r="3" />
              <circle cx="288" cy="300" r="3" />
              <circle cx="475" cy="285" r="3" />
              <circle cx="580" cy="320" r="3" />
            </svg>
          </div>
          <div
            className="materials-labels"
            role="group"
            aria-label="Explorar componentes del smartphone"
            inert={!ready}
          >
            {materials.map((material, index) => (
              <button
                key={material.name}
                type="button"
                className="materials-label"
                style={{ left: `${material.x}%` }}
                aria-pressed={selected === index}
                aria-controls={`material-description-${index}`}
                onClick={() => setSelected(index)}
              >
                {material.name}
              </button>
            ))}
          </div>
        </div>
        {failed && (
          <p role="status" className="materials-error">
            No se ha podido cargar el vídeo. Puedes consultar la información de
            cada componente a continuación.
          </p>
        )}
        <div
          className="materials-exploration"
          aria-live="polite"
          aria-atomic="true"
        >
          {materials.map((material, index) => (
            <div
              key={material.name}
              id={`material-description-${index}`}
              hidden={selected !== index}
            >
              <h3>{material.name}</h3>
              <p>{material.text}</p>
            </div>
          ))}
        </div>
        <p className="materials-conclusion">
          Lo que parece el final de un móvil puede ser el principio de algo
          nuevo.
        </p>
      </div>
    </section>
  )
}

"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function MemorialCard() {
  const sectionRef = useRef<HTMLElement>(null)
  const entryRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<gsap.core.Tween | null>(null)
  const [phoneName, setPhoneName] = useState("Mi antiguo móvil")
  const [dedication, setDedication] = useState(
    "Sobreviviste a mil caídas, pero no al paso del tiempo"
  )

  useGSAP(
    () => {
      const media = gsap.matchMedia()
      let disposed = false
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const animation = gsap.fromTo(
          entryRef.current,
          { autoAlpha: 0, y: 12 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out",
            scrollTrigger: {
              trigger: entryRef.current,
              start: "top 75%",
              once: true,
              invalidateOnRefresh: true,
              refreshPriority: -6,
            },
          }
        )
        animationRef.current = animation
        return () => {
          animationRef.current = null
        }
      })
      const refresh = () => {
        if (!disposed) ScrollTrigger.refresh()
      }
      void document.fonts.ready.then(refresh)
      window.addEventListener("pageshow", refresh)
      return () => {
        disposed = true
        window.removeEventListener("pageshow", refresh)
        media.revert()
      }
    },
    { scope: sectionRef }
  )

  const finishEntry = () => {
    animationRef.current?.progress(1).pause()
  }

  return (
    <section
      id="section-7"
      ref={sectionRef}
      className="bg-light memorial-section"
      aria-labelledby="memorial-title"
      tabIndex={-1}
    >
      <div className="memorial-inner">
        <header className="memorial-heading">
          <p className="memorial-eyebrow">07 / SU ÚLTIMO RECUERDO</p>
          <h2 id="memorial-title">Escribe sus últimas palabras.</h2>
          <p className="memorial-intro">
            Todo móvil tiene una historia que merece ser recordada. Personaliza
            su esquela y dedica unas últimas palabras a ese compañero que estuvo
            contigo durante tantos años.
          </p>
          <p id="memorial-instructions" className="memorial-instructions">
            Pulsa sobre la tarjeta para personalizarla.
          </p>
        </header>
        <div className="memorial-card-entry" ref={entryRef}>
          <div
            className="memorial-card"
            role="group"
            aria-label="Esquela personalizable de tu smartphone"
            aria-describedby="memorial-instructions"
            onPointerDownCapture={finishEntry}
            onFocusCapture={finishEntry}
          >
            <Image
              src="/images/esquela_funeral_movil_sin_texto.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 430px, (min-width: 600px) 400px, 90vw"
              className="memorial-decoration"
            />
            <div className="memorial-card-content">
              <p className="memorial-in-memory">EN MEMORIA DE</p>
              <label className="sr-only" htmlFor="memorial-phone-name">
                Nombre de tu smartphone (máximo 40 caracteres)
              </label>
              <input
                id="memorial-phone-name"
                className="memorial-phone-name"
                type="text"
                maxLength={40}
                placeholder="Nombre de tu smartphone"
                value={phoneName}
                onChange={(event) => setPhoneName(event.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              <label className="sr-only" htmlFor="memorial-dedication">
                Dedicatoria (máximo 120 caracteres)
              </label>
              <textarea
                id="memorial-dedication"
                className="memorial-dedication"
                maxLength={120}
                rows={3}
                placeholder="Escribe aquí sus últimas palabras..."
                value={dedication}
                onChange={(event) => setDedication(event.target.value)}
              />
              <p className="memorial-rest">DESCANSA EN PAZ</p>
              <p className="memorial-signature">FUNERAL DE TU MÓVIL</p>
            </div>
          </div>
        </div>
        <p className="memorial-conclusion">
          Ya has escrito sus últimas palabras. Ahora ha llegado el momento de
          despedirse.
        </p>
      </div>
    </section>
  )
}

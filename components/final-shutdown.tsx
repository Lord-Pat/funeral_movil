"use client"

import { useRef } from "react"
import { ArrowUpRight } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
import { useGSAP } from "@gsap/react"
import { BatteryShutdownIcon } from "@/components/battery-shutdown-icon"

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP)

// Supply the real registration URL here when the campaign has an enrolment mechanism.
export function FinalShutdown({
  registrationHref,
}: {
  registrationHref?: string
}) {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    (_context, contextSafe) => {
      const section = sectionRef.current!
      const previous = document.getElementById("section-7")!
      const overlay = section.querySelector<HTMLElement>(".shutdown-overlay")!
      const icon = section.querySelector(".shutdown-battery-icon")!
      const content = section.querySelector<HTMLElement>(".shutdown-content")!
      const elements = section.querySelectorAll("[data-shutdown-reveal]")
      const media = gsap.matchMedia()
      let disposed = false
      const refresh = () => {
        if (!disposed) ScrollTrigger.refresh()
      }

      media.add("(prefers-reduced-motion: no-preference)", () => {
        let entered = false
        let transitioning = false
        let lastY = window.scrollY
        let touchY: number | undefined
        let timeline: gsap.core.Timeline | undefined
        let scrollTween: gsap.core.Tween | undefined
        let veilTween: gsap.core.Tween | undefined
        const top = () => section.getBoundingClientRect().top + window.scrollY
        const boundary = () => top() - window.innerHeight
        const editing = () =>
          document.activeElement instanceof Element &&
          !!document.activeElement.closest(
            "input, textarea, select, [contenteditable=true]"
          )
        const reveal = () => {
          if (transitioning) entered = true
          timeline?.kill()
          scrollTween?.kill()
          veilTween?.kill()
          scrollTween = undefined
          transitioning = false
          gsap.set(overlay, { autoAlpha: 0 })
          gsap.set(content, { autoAlpha: 1 })
          gsap.set(elements, { autoAlpha: 1, y: 0 })
        }
        const shutdown = contextSafe!(() => {
          if (entered || editing()) {
            reveal()
            return
          }
          entered = true
          transitioning = false
          gsap.set(content, { autoAlpha: 1 })
          gsap.set(elements, { autoAlpha: 0, y: 10 })
          gsap.set(overlay, { autoAlpha: 1 })
          gsap.set(icon, { autoAlpha: 0 })
          timeline = gsap
            .timeline()
            .to(icon, { autoAlpha: 1, duration: 0.12 })
            .to(icon, {
              opacity: 0.3,
              duration: 0.25,
              repeat: 3,
              yoyo: true,
              ease: "sine.inOut",
            })
            .to(icon, { autoAlpha: 0, duration: 0.18 })
            .to(overlay, { autoAlpha: 0, duration: 0.5 }, 1.12)
            .to(
              elements,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.35,
                stagger: 0.035,
                ease: "power2.out",
              },
              1.23
            )
        })
        const advance = contextSafe!(() => {
          if (entered || transitioning || editing()) return
          transitioning = true
          gsap.set(content, { autoAlpha: 0 })
          gsap.set(icon, { autoAlpha: 0 })
          veilTween = gsap.to(overlay, { autoAlpha: 1, duration: 0.16 })
          scrollTween = gsap.to(window, {
            duration: 0.42,
            ease: "power2.inOut",
            scrollTo: { y: top(), autoKill: true, onAutoKill: reveal },
            onComplete: () => {
              scrollTween = undefined
              shutdown()
            },
          })
        })
        const wheel = (event: WheelEvent) => {
          if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY))
            return
          if (event.deltaY < 0) {
            if (transitioning || timeline?.isActive()) reveal()
            return
          }
          if (transitioning) {
            event.preventDefault()
            return
          }
          if (
            editing() ||
            entered ||
            transitioning ||
            window.scrollY < boundary() - 2
          )
            return
          event.preventDefault()
          advance()
        }
        const touchStart = (event: TouchEvent) => {
          touchY = event.touches[0]?.clientY
        }
        const touchMove = (event: TouchEvent) => {
          const y = event.touches[0]?.clientY
          if (touchY === undefined || y === undefined) return
          const delta = touchY - y
          touchY = y
          if (delta < -4) {
            if (transitioning || timeline?.isActive()) reveal()
            return
          }
          if (transitioning && delta > 0) {
            if (event.cancelable) event.preventDefault()
            return
          }
          if (
            delta > 8 &&
            !editing() &&
            !entered &&
            !transitioning &&
            window.scrollY >= boundary() - 2
          ) {
            if (event.cancelable) event.preventDefault()
            advance()
          }
        }
        const key = (event: KeyboardEvent) => {
          if (
            ["ArrowUp", "PageUp", "Home", "Tab", "Escape"].includes(event.key)
          ) {
            if (transitioning || timeline?.isActive()) reveal()
            return
          }
          if (
            editing() ||
            event.defaultPrevented ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey
          )
            return
          const down =
            event.key === "ArrowDown" ||
            event.key === "PageDown" ||
            (event.key === " " &&
              !event.shiftKey &&
              document.activeElement === document.body)
          if (
            down &&
            !entered &&
            !transitioning &&
            window.scrollY >= boundary() - 2 &&
            window.scrollY < top()
          ) {
            event.preventDefault()
            advance()
          }
        }
        const scroll = () => {
          const y = window.scrollY
          if (
            y < lastY - 2 &&
            !scrollTween &&
            (transitioning || timeline?.isActive())
          )
            reveal()
          if (y < boundary() - 80) entered = false
          if (!transitioning && !entered && !editing()) {
            if (y >= top() - 1) shutdown()
            else if (y > boundary() + 2 && y > lastY) advance()
          }
          lastY = y
        }
        const trigger = ScrollTrigger.create({
          id: "final-shutdown-scene",
          trigger: section,
          start: "top 1px",
          end: "bottom top",
          refreshPriority: -7,
          onEnter: () => {
            if (!transitioning && !entered && !editing()) shutdown()
          },
        })
        previous.addEventListener("wheel", wheel, { passive: false })
        section.addEventListener("wheel", wheel, { passive: false })
        previous.addEventListener("touchstart", touchStart, { passive: true })
        previous.addEventListener("touchmove", touchMove, { passive: false })
        section.addEventListener("touchstart", touchStart, { passive: true })
        section.addEventListener("touchmove", touchMove, { passive: false })
        window.addEventListener("scroll", scroll, { passive: true })
        document.addEventListener("keydown", key)
        return () => {
          previous.removeEventListener("wheel", wheel)
          section.removeEventListener("wheel", wheel)
          previous.removeEventListener("touchstart", touchStart)
          previous.removeEventListener("touchmove", touchMove)
          section.removeEventListener("touchstart", touchStart)
          section.removeEventListener("touchmove", touchMove)
          window.removeEventListener("scroll", scroll)
          document.removeEventListener("keydown", key)
          reveal()
          trigger.kill()
        }
      })
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

  return (
    <section
      id="section-8"
      ref={sectionRef}
      className="bg-blackout shutdown-section"
      aria-labelledby="shutdown-title"
      tabIndex={-1}
    >
      <div className="shutdown-overlay" aria-hidden="true">
        <BatteryShutdownIcon />
      </div>
      <div className="shutdown-content">
        <p className="shutdown-eyebrow" data-shutdown-reveal>
          08 / EL ÚLTIMO ADIÓS
        </p>
        <h2 id="shutdown-title" data-shutdown-reveal>
          Su batería se ha agotado.
        </h2>
        <p className="shutdown-subtitle" data-shutdown-reveal>
          Su historia no tiene por qué terminar aquí.
        </p>
        <p className="shutdown-description" data-shutdown-reveal>
          ¿Listo para despedirte de tu antiguo smartphone? Participa en nuestro
          funeral simbólico y dale una segunda oportunidad mediante la
          reutilización o el reciclaje.
        </p>
        <div className="shutdown-participation" data-shutdown-reveal>
          {registrationHref ? (
            <a className="shutdown-cta" href={registrationHref}>
              Quiero participar <ArrowUpRight size={20} aria-hidden="true" />
            </a>
          ) : (
            <>
              <button
                className="shutdown-cta"
                type="button"
                aria-disabled="true"
                aria-describedby="shutdown-registration-pending"
              >
                Quiero participar <ArrowUpRight size={20} aria-hidden="true" />
              </button>
              <p
                id="shutdown-registration-pending"
                className="shutdown-registration-pending"
              >
                Inscripciones próximamente.
              </p>
            </>
          )}
        </div>
        <p className="shutdown-closing" data-shutdown-reveal>
          Un último adiós. Un futuro más sostenible.
        </p>
      </div>
    </section>
  )
}

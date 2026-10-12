"use client"

import { useRef } from "react"
import { Smartphone, Flower2, Recycle, ArrowUpRight } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, useGSAP)

const steps = [
  {
    number: "01",
    title: "Rescata tu antiguo smartphone",
    description:
      "Busca ese móvil que lleva años olvidado en un cajón. Guarda tus recuerdos, desvincula tus cuentas y elimina tus datos personales antes de entregarlo.",
    Icon: Smartphone,
  },
  {
    number: "02",
    title: "Celebra su último adiós",
    description:
      "Participa en una pequeña ceremonia simbólica. Recuerda los buenos momentos, despídete de tu antiguo compañero y forma parte de una experiencia diferente.",
    Icon: Flower2,
  },
  {
    number: "03",
    title: "Dale una segunda oportunidad",
    description:
      "Tras la despedida, tu teléfono entrará en un programa donde se evaluará su posible reutilización o se destinará a un proceso de reciclaje adecuado para recuperar materiales.",
    Icon: Recycle,
  },
]

export function FuneralSteps() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const section = sectionRef.current!
      const items = Array.from(
        section.querySelectorAll<HTMLElement>(".participation-step")
      )
      const fill = section.querySelector(".participation-rail-fill")!
      const ending = section.querySelector(".participation-ending")!
      const media = gsap.matchMedia()
      let disposed = false
      let timer: ReturnType<typeof setTimeout> | undefined

      const revealStep = (
        timeline: gsap.core.Timeline,
        item: HTMLElement,
        at: number
      ) => {
        const content = item.querySelectorAll(
          ".participation-number, .participation-icon, .participation-body"
        )
        const dot = item.querySelector(".participation-dot-fill")!
        gsap.set(content, { autoAlpha: 0, y: 8 })
        gsap.set(dot, { scale: 0 })
        timeline
          .to(
            content,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.25,
              stagger: 0.045,
              ease: "power2.out",
            },
            at
          )
          .to(dot, { scale: 1, duration: 0.15, ease: "none" }, at)
      }

      const setup = () => {
        if (disposed) return
        media.revert()
        media.add(
          {
            all: "(min-width: 0px)",
            reduced: "(prefers-reduced-motion: reduce)",
          },
          (context) => {
            if (context.conditions!.reduced) return
            const fullSceneFits =
              window.innerWidth >= 1024 &&
              section.offsetHeight <= window.innerHeight + 1
            if (fullSceneFits) {
              gsap.set(fill, { scaleX: 0 })
              gsap.set(ending, { autoAlpha: 0, y: 8 })
              const timeline = gsap.timeline({
                scrollTrigger: {
                  trigger: section,
                  start: "top 1px",
                  end: "bottom bottom-=1px",
                  toggleActions: "restart none restart none",
                  invalidateOnRefresh: true,
                  refreshPriority: -4,
                },
              })
              items.forEach((item, index) => {
                const at = index * 0.28
                revealStep(timeline, item, at)
                if (index)
                  timeline.to(
                    fill,
                    { scaleX: index / 2, duration: 0.28, ease: "none" },
                    at - 0.1
                  )
              })
              timeline.to(
                ending,
                { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out" },
                0.85
              )
              return
            }
            items.forEach((item, index) => {
              const timeline = gsap.timeline({
                scrollTrigger: {
                  trigger: item,
                  start: "top 75%",
                  end: "bottom 25%",
                  toggleActions: "restart none restart none",
                  invalidateOnRefresh: true,
                  refreshPriority: -4,
                },
              })
              if (index) {
                const connector = items[index - 1].querySelector(
                  ".participation-connector-fill"
                )!
                gsap.set(connector, { scaleY: 0 })
                timeline.to(
                  connector,
                  { scaleY: 1, duration: 0.2, ease: "none" },
                  0
                )
              }
              revealStep(timeline, item, index ? 0.1 : 0)
            })
            // Short desktop windows retain the horizontal layout and a scroll-driven line.
            if (window.innerWidth >= 1024) {
              gsap.fromTo(
                fill,
                { scaleX: 0 },
                {
                  scaleX: 1,
                  ease: "none",
                  scrollTrigger: {
                    trigger: section.querySelector(".participation-path"),
                    start: "top 65%",
                    end: "bottom 55%",
                    scrub: 0.3,
                    invalidateOnRefresh: true,
                    refreshPriority: -4,
                  },
                }
              )
            }
            gsap.fromTo(
              ending,
              { autoAlpha: 0, y: 8 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.3,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: ending,
                  start: "top 85%",
                  end: "bottom 15%",
                  toggleActions: "restart none restart none",
                  refreshPriority: -4,
                },
              }
            )
          }
        )
        ScrollTrigger.refresh()
      }
      const resize = () => {
        clearTimeout(timer)
        timer = setTimeout(setup, 340)
      }
      const refresh = () => {
        if (!disposed) ScrollTrigger.refresh()
      }
      setup()
      void document.fonts.ready.then(() => {
        if (!disposed) setup()
      })
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
      id="section-5"
      ref={sectionRef}
      className="bg-light participation-section"
      aria-labelledby="participation-title"
      tabIndex={-1}
    >
      <div className="participation-inner">
        <header className="participation-heading">
          <p className="participation-eyebrow">05 / CÓMO FUNCIONA</p>
          <h2 id="participation-title">
            Tres pasos para una despedida inolvidable.
          </h2>
          <p className="participation-intro">
            Participar en el Funeral de tu Móvil es muy sencillo. Solo necesitas
            traer un teléfono que ya no utilices y acompañarnos en una
            experiencia que combina recuerdos, concienciación ambiental y
            reciclaje tecnológico.
          </p>
        </header>
        <ol
          className="participation-path"
          role="list"
          aria-label="Cómo participar en el funeral"
        >
          <li
            className="participation-rail"
            role="presentation"
            aria-hidden="true"
          >
            <span className="participation-rail-fill" />
          </li>
          {steps.map(({ number, title, description, Icon }, index) => (
            <li key={number} className="participation-step">
              {index < 2 && (
                <span className="participation-connector" aria-hidden="true">
                  <span className="participation-connector-fill" />
                </span>
              )}
              <div className="participation-step-head">
                <span className="participation-number" aria-hidden="true">
                  {number}
                </span>
                <span className="participation-icon" aria-hidden="true">
                  <Icon size={28} strokeWidth={1.4} />
                </span>
              </div>
              <span className="participation-dot" aria-hidden="true">
                <span className="participation-dot-fill" />
              </span>
              <div className="participation-body">
                <h3>{title}</h3>
                <p>{description}</p>
                {index === 0 && (
                  <p className="participation-preparation">
                    Próximamente: guía para preparar tu teléfono.
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
        <footer className="participation-ending">
          <p>Tu móvil puede dejar de funcionar. Su valor no desaparece.</p>
          <a href="#section-8" className="participation-cta">
            Quiero participar en el funeral{" "}
            <ArrowUpRight size={19} aria-hidden="true" />
          </a>
        </footer>
      </div>
    </section>
  )
}

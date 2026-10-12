"use client"

import Image from "next/image"
import { Pause, Play } from "lucide-react"
import { useEffect, useState } from "react"

const messages = [
  {
    title: "Ey... ¿todavía te acuerdas de mí?",
    detail: "Llevo años esperando en ese cajón.",
  },
  {
    title: "Hemos pasado muchas cosas juntos...",
    detail: "¿Recuerdas todas esas fotos y conversaciones?",
  },
  {
    title: "Creo que ha llegado mi momento.",
    detail: "¿Me acompañas en mi último viaje?",
  },
]

export function HeroPhone() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [interacting, setInteracting] = useState(false)

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    let timer: ReturnType<typeof setInterval> | undefined
    const start = () => {
      clearInterval(timer)
      if (!paused && !interacting && !preference.matches) {
        timer = setInterval(
          () => setActive((index) => (index + 1) % messages.length),
          4800
        )
      }
    }
    start()
    preference.addEventListener("change", start)
    return () => {
      clearInterval(timer)
      preference.removeEventListener("change", start)
    }
  }, [paused, interacting, active])

  return (
    <div id="hero-visual" className="hero-visual">
      <div className="hero-phone-entry">
        <div
          className="hero-phone"
          role="img"
          aria-label="Tu antiguo smartphone, con pantalla oscura y dos ojos blancos"
        >
          <Image
            src="/images/phone.webp"
            alt=""
            width={750}
            height={1451}
            sizes="(min-width: 1450px) 290px, (min-width: 1024px) 20vw, (min-width: 600px) 190px, 180px"
            loading="eager"
            className="hero-phone-image"
          />
          <div className="hero-phone-screen" aria-hidden="true">
            <div className="hero-eyes" data-expression={active}>
              <svg viewBox="0 0 120 34" fill="none" className="hero-eye-shapes">
                <path
                  d="M8 26 C10 1 39 1 43 26 C33 17 19 17 8 26Z"
                  fill="currentColor"
                />
                <path
                  d="M77 26 C79 1 108 1 112 26 C102 17 88 17 77 26Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div
        className="hero-conversation"
        role="region"
        aria-roledescription="carrusel"
        aria-label="La historia de tu antiguo móvil"
        onMouseEnter={() => setInteracting(true)}
        onMouseLeave={() => setInteracting(false)}
        onFocusCapture={() => setInteracting(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setInteracting(false)
        }}
      >
        <div className="hero-bubble">
          <p className="hero-bubble-label">TU ANTIGUO MÓVIL</p>
          <div
            aria-live={paused || interacting ? "polite" : "off"}
            aria-atomic="true"
            className="hero-message-slot"
          >
            {messages.map((message, index) => (
              <div
                key={message.title}
                className="hero-bubble-message"
                data-active={active === index}
                aria-hidden={active !== index}
                role="group"
                aria-roledescription="diapositiva"
                aria-label={`${index + 1} de 3`}
              >
                <p className="hero-message-title">{message.title}</p>
                <p className="hero-message-detail">{message.detail}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-message-controls">
          {messages.map((message, index) => (
            <button
              key={message.title}
              type="button"
              aria-label={`Ver mensaje ${index + 1}: ${message.title}`}
              aria-pressed={active === index}
              onClick={() => setActive(index)}
              className="hero-message-dot"
            >
              <span data-active={active === index} />
            </button>
          ))}
          <button
            type="button"
            aria-label={
              paused
                ? "Reanudar mensajes automáticos"
                : "Pausar mensajes automáticos"
            }
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
            className="hero-message-pause"
          >
            {paused ? (
              <Play size={14} aria-hidden="true" />
            ) : (
              <Pause size={14} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

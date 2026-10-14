"use client"

import Image from "next/image"
import { Recycle } from "lucide-react"
import type { MouseEvent } from "react"

type FooterLink = { label: string; href: string }

// Supply contact and legal links only when their real destinations exist.
export function Footer({
  informationLinks = [],
}: {
  informationLinks?: FooterLink[]
}) {
  const navigate = (event: MouseEvent<HTMLElement>) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return
    const link =
      event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>('a[href^="#"]')
        : null
    const target = link ? document.getElementById(link.hash.slice(1)) : null
    if (!target || !link) return
    event.preventDefault()
    // A pin can translate its section. Its spacer retains the stable document position.
    const anchor = target.parentElement?.classList.contains("pin-spacer")
      ? target.parentElement
      : target
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0
    if (location.hash !== link.hash)
      history.pushState(history.state, "", link.hash)
    window.scrollTo({
      top: Math.max(
        0,
        anchor.getBoundingClientRect().top + window.scrollY - margin
      ),
      behavior: "instant",
    })
    target.focus({ preventScroll: true })
  }
  return (
    <footer className="landing-footer" onClick={navigate}>
      <div className="landing-footer-inner">
        <div className="landing-footer-columns">
          <div>
            <a
              className="landing-footer-brand"
              href="#hero"
              aria-label="Funeral de tu Móvil, inicio"
            >
              <Image
                src="/images/logo_funeral_navbar.webp"
                alt=""
                width={1254}
                height={1254}
                sizes="44px"
                className="landing-footer-logo"
              />
              <span>
                <strong>FUNERAL.</strong>
                <span>DE TU MÓVIL</span>
              </span>
            </a>
            <p className="landing-footer-description">
              Un último adiós. Un futuro más sostenible.
            </p>
          </div>
          <nav aria-label="Explora la landing">
            <h2>Explora</h2>
            <ul>
              <li>
                <a href="#section-1">El problema</a>
              </li>
              <li>
                <a href="#section-3">El funeral</a>
              </li>
              <li>
                <a href="#section-6">Reciclaje</a>
              </li>
            </ul>
          </nav>
          <div>
            <h2>Información</h2>
            {informationLinks.length > 0 ? (
              <nav aria-label="Información de la organización">
                <ul>
                  {informationLinks.map(({ label, href }) => (
                    <li key={href}>
                      <a href={href}>{label}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : (
              <ul>
                <li>Contacto</li>
                <li>Aviso legal</li>
                <li>Política de privacidad</li>
              </ul>
            )}
          </div>
        </div>
        <div className="landing-footer-bottom">
          <p>© 2026 Funeral de tu Móvil</p>
          <p>
            <Recycle size={16} aria-hidden="true" />
            Reciclaje tecnológico responsable
          </p>
        </div>
      </div>
    </footer>
  )
}

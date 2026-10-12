"use client"

import * as React from "react"
import { useState } from "react"
import { ScrollBattery } from "@/components/scroll-battery"
import { Menu, X } from "lucide-react"

const links = [
  { label: "El problema", href: "#section-1" },
  { label: "El funeral", href: "#section-3" },
  { label: "Reciclaje", href: "#section-6" },
]

const Navbar1 = () => {
  const [isOpen, setIsOpen] = useState(false)

  const overlayRef = React.useRef<HTMLDivElement>(null)
  const menuButtonRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (!isOpen) return
    const panel = overlayRef.current
    const trigger = menuButtonRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    panel?.querySelector<HTMLButtonElement>("button")?.focus()
    const closeOnDesktop = window.matchMedia("(min-width: 768px)")
    const onResize = () => {
      if (closeOnDesktop.matches) setIsOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
      if (event.key !== "Tab" || !panel) return
      const controls = panel.querySelectorAll<HTMLElement>("a[href], button")
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    closeOnDesktop.addEventListener("change", onResize)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKeyDown)
      closeOnDesktop.removeEventListener("change", onResize)
      trigger?.focus()
    }
  }, [isOpen])

  const toggleMenu = () => setIsOpen((open) => !open)

  return (
    <div className="fixed inset-x-0 top-5 z-50 px-3 sm:px-5">
      <div className="mx-auto flex h-16 w-full max-w-[980px] items-center justify-between gap-2 rounded-full border border-[#D7DAD5] bg-[var(--bg-light)] px-4 text-[var(--bg-dark)] shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:gap-4 sm:px-6">
        <a
          href="#hero"
          aria-label="Funeral de tu Móvil, inicio"
          className="flex shrink-0 items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-primary)] sm:gap-3"
        >
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-full bg-[var(--bg-dark)] text-xl font-semibold text-[var(--bg-light)]"
          >
            F
          </span>
          <span className="flex flex-col">
            <span className="text-sm leading-tight font-bold tracking-[0.08em]">
              FUNERAL.
            </span>
            <span className="text-[9px] leading-tight tracking-[0.12em]">
              DE TU MÓVIL
            </span>
          </span>
        </a>
        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-5 md:flex lg:gap-8"
        >
          {links.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-sm text-sm font-medium hover:text-[var(--accent-primary)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-primary)]"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <a
            href="#section-7"
            className="hidden items-center justify-center rounded-full bg-[var(--bg-dark)] px-5 py-2.5 text-sm font-medium text-[var(--bg-light)] hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-primary)] md:inline-flex"
          >
            Participar
          </a>
          <button
            ref={menuButtonRef}
            type="button"
            aria-label="Abrir menú"
            aria-expanded={isOpen}
            aria-controls="navbar-mobile-menu"
            className="flex size-10 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] md:hidden"
            onClick={toggleMenu}
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <ScrollBattery />
        </div>
      </div>
      {isOpen && (
        <div
          id="navbar-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navegación móvil"
          ref={overlayRef}
          className="fixed inset-0 z-50 overflow-y-auto bg-[var(--bg-light)] px-6 pt-24 pb-8 text-[var(--bg-dark)] md:hidden"
        >
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute top-6 right-6 flex size-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]"
            onClick={toggleMenu}
          >
            <X className="size-6" aria-hidden="true" />
          </button>
          <nav aria-label="Navegación móvil" className="flex flex-col gap-6">
            {links.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-lg font-medium focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              href="#section-7"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-[var(--bg-dark)] px-5 py-3 font-medium text-[var(--bg-light)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-primary)]"
              onClick={() => setIsOpen(false)}
            >
              Participar
            </a>
          </nav>
        </div>
      )}
    </div>
  )
}

export { Navbar1 }

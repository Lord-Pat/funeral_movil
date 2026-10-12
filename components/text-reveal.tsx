"use client"

import { useEffect, useRef, type ReactNode } from "react"

export function TextReveal({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (
      !container ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return

    const animations: Animation[] = []
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return

        Array.from(container.children).forEach((child, index) => {
          animations.push(
            child.animate(
              [
                { opacity: 0, transform: "translateY(20px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              {
                duration: 800,
                delay: index * 140,
                easing: "cubic-bezier(0.4, 0, 0.2, 1)",
                fill: "backwards",
              }
            )
          )
        })
        observer.disconnect()
      },
      { threshold: 0.1 }
    )

    observer.observe(container)
    return () => {
      observer.disconnect()
      animations.forEach((animation) => animation.cancel())
    }
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

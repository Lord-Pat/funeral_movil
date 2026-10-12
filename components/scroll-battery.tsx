"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

export function ScrollBattery() {
  const [level, setLevel] = useState(100)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const hero = document.getElementById("hero")
      const start = hero
        ? hero.getBoundingClientRect().bottom + window.scrollY
        : 0
      const finalSection = document.getElementById("section-8")
      const end = finalSection
        ? finalSection.getBoundingClientRect().top + window.scrollY
        : document.documentElement.scrollHeight - window.innerHeight
      const progress =
        end > start
          ? Math.min(1, Math.max(0, (window.scrollY - start) / (end - start)))
          : 0
      setLevel(window.scrollY >= end - 1 ? 0 : Math.ceil((1 - progress) * 100))
    }
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    const observer = new ResizeObserver(schedule)
    observer.observe(document.querySelector("main") ?? document.body)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      observer.disconnect()
    }
  }, [])

  const batteryImage =
    level <= 25
      ? "low-battery"
      : level <= 50
        ? "mid-battery"
        : level <= 75
          ? "semi-battery"
          : "full-battery"

  return (
    <div
      role="meter"
      aria-label="Batería según el progreso de lectura"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={level}
      aria-valuetext={`${level} % de batería`}
      title={`${level} %`}
      className="flex shrink-0 items-center gap-1"
    >
      <span className="relative h-9 w-12">
        <Image
          src={`/images/${batteryImage}.webp`}
          alt=""
          width={512}
          height={512}
          sizes="48px"
          className="pointer-events-none absolute top-1/2 left-0 size-12 -translate-y-1/2"
        />
      </span>
      <span
        aria-hidden="true"
        className="w-10 text-right text-xs font-medium tabular-nums sm:text-sm"
      >
        {level}%
      </span>
    </div>
  )
}

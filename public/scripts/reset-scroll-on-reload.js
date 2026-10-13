(() => {
  const navigation = performance.getEntriesByType("navigation")[0]
  if (navigation?.type !== "reload") return

  history.scrollRestoration = "manual"
  // Clear only saved scene positions before their GSAP effects initialize.
  // Keep the animation setup and resize behavior inside each scene unchanged.
  try {
    for (const scene of ["phone-materials", "phone-funeral", "second-life"]) {
      sessionStorage.removeItem(`${scene}:${location.pathname}`)
    }
  } catch {
    // Storage may be disabled; native scroll restoration is still disabled above.
  }
  if (location.hash) {
    history.replaceState(history.state, "", location.pathname + location.search)
  }
  window.scrollTo({ top: 0, left: 0, behavior: "instant" })
})()

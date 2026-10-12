(() => {
  const navigation = performance.getEntriesByType("navigation")[0]
  if (navigation?.type !== "reload") return

  history.scrollRestoration = "manual"
  if (location.hash) {
    history.replaceState(history.state, "", location.pathname + location.search)
  }
  window.scrollTo({ top: 0, left: 0, behavior: "instant" })
})()

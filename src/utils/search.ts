type ClosableSearchModal = {
  close?: () => void
}

type ClosestEventTarget = EventTarget & {
  closest?: (selector: string) => unknown
}

export const bindSearchResultNavigation = (
  container: EventTarget,
  modal: ClosableSearchModal,
) => {
  container.addEventListener("click", (event) => {
    const target = event.target as ClosestEventTarget | null

    if (target?.closest?.("pagefind-results a")) {
      modal.close?.()
    }
  })
}

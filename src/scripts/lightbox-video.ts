import "@videojs/html/video/player"
import "@videojs/html/video/neutral-skin"

const storageKey = "bws-video"

// Video.js dismisses root menus at document level. GLightbox's window
// listener must not also close the gallery for that same Escape key.
window.addEventListener("keydown", (event) => {
  if (
    event.defaultPrevented &&
    event.target instanceof Element &&
    event.target.closest("video-player")
  ) {
    event.stopImmediatePropagation()
  }
})

export const createLightboxVideo = (src: string, index: number) => {
  const container = document.createElement("div")
  container.className = "gvideo-wrapper"
  container.dataset.index = String(index)
  container.tabIndex = -1

  const player = document.createElement("video-player")
  const skin = document.createElement("video-neutral-skin")
  const video = document.createElement("video")
  video.src = src
  video.preload = "metadata"
  video.playsInline = true

  // Retain existing Plyr preferences on the first visit after migration.
  try {
    const saved = JSON.parse(
      localStorage.getItem(storageKey) ??
        localStorage.getItem("plyr") ??
        "null",
    )
    if (
      Number.isFinite(saved?.volume) &&
      saved.volume >= 0 &&
      saved.volume <= 1
    ) {
      video.volume = saved.volume
    }
    if (typeof saved?.muted === "boolean") video.muted = saved.muted
    if (
      Number.isFinite(saved?.speed) &&
      saved.speed >= 0.2 &&
      saved.speed <= 4
    ) {
      video.playbackRate = saved.speed
    }
  } catch {
    // Invalid or unavailable storage must not prevent playback.
  }

  const savePreferences = () => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          muted: video.muted,
          speed: video.playbackRate,
          volume: video.volume,
        }),
      )
    } catch {
      // Playback still works when storage is blocked.
    }
  }
  video.addEventListener("ratechange", savePreferences)
  video.addEventListener("volumechange", savePreferences)

  // Do not let gallery navigation intercept player shortcuts or focus.
  player.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || event.defaultPrevented)
      event.stopPropagation()
  })

  skin.append(video)
  player.append(skin)
  container.append(player)

  // GLightbox's public player registry expects this small playback interface.
  return {
    elements: { container },
    get playing() {
      return !video.paused
    },
    pause: () => video.pause(),
    play: () => video.play(),
    destroy: () => {
      video.removeEventListener("ratechange", savePreferences)
      video.removeEventListener("volumechange", savePreferences)
      video.pause()
      video.removeAttribute("src")
      video.load()
    },
  }
}

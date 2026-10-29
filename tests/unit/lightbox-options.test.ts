import fs from "node:fs/promises"
import vm from "node:vm"
import { parse } from "node-html-parser"
import ts from "typescript"
import { GLIGHTBOX_OPTIONS } from "../../src/consts"
import { describe, expect, it, vi } from "vitest"

describe("GLightbox options", () => {
  // https://github.com/biati-digital/glightbox/blob/a9385e5/src/js/core/slide.js#L85-L87
  it("prevents GLightbox from altering captions on mobile devices", () => {
    expect(GLIGHTBOX_OPTIONS.moreLength).toBe(0)
  })

  // https://github.com/biati-digital/glightbox/blob/a9385e5/src/js/glightbox.js#L54-L55
  it("prevents GLightbox from loading separate plyr assets from CDN", () => {
    expect(GLIGHTBOX_OPTIONS.plyr.css).toBe("")
    expect(GLIGHTBOX_OPTIONS.plyr.js).toBe("")
  })
})

describe("Lightbox video lifecycle", () => {
  it("reuses preloaded media and releases it on close before reopening", async () => {
    const component = await fs.readFile(
      new URL("../../src/components/LightboxInit.astro", import.meta.url),
      "utf-8",
    )
    const script = parse(component).querySelector("script")?.rawText
    if (!script) throw new Error("Missing lightbox initialization script")
    const { outputText } = ts.transpileModule(script, {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    })
    const media: Array<{ src: string }> = []
    const createLightboxVideo = (src: string) => {
      const container = { src }
      media.push(container)
      return {
        elements: { container },
        destroy: () => {
          container.src = ""
        },
      }
    }
    const players: Record<string, ReturnType<typeof createLightboxVideo>> = {}
    const events = new EventTarget()
    const instance = {
      getAllPlayers: () => players,
      on: (name: string, callback: (detail: unknown) => void) => {
        events.addEventListener(name, (event) =>
          callback((event as CustomEvent).detail),
        )
      },
    }
    const trigger = { href: "/device.mp4", matches: () => true }
    const modules: Record<string, unknown> = {
      "@consts": { GLIGHTBOX_OPTIONS },
      "../scripts/lightbox-video": { createLightboxVideo },
      glightbox: { default: () => instance },
      "glightbox/dist/css/glightbox.min.css": {},
    }
    const window: { bwsLightbox?: { instance?: unknown } } = {}
    vm.runInNewContext(outputText, {
      document: {
        addEventListener: () => undefined,
        querySelector: () => trigger,
        querySelectorAll: () => [trigger],
      },
      exports: {},
      require: (id: string) => {
        if (!(id in modules)) throw new Error(`Unexpected import: ${id}`)
        return modules[id]
      },
      window,
    })
    await vi.waitFor(() => expect(window.bwsLightbox?.instance).toBe(instance))

    const slideConfig: { content?: { src: string } } = {}
    const load = () =>
      events.dispatchEvent(
        new CustomEvent("slide_before_load", {
          detail: { slideIndex: 3, trigger, slideConfig },
        }),
      )

    // Preloading emits before loading content. Navigation during that delay
    // emits again for the same slide, before its DOM is marked loaded.
    load()
    const preloaded = slideConfig.content
    load()
    const displayed = slideConfig.content
    events.dispatchEvent(new Event("close"))

    expect(media.every((video) => video.src === "")).toBe(true)
    expect(displayed).toBe(preloaded)
    expect(players).toEqual({})

    load()
    expect(slideConfig.content).not.toBe(preloaded)
    expect(slideConfig.content?.src).toBe(trigger.href)
    events.dispatchEvent(new Event("close"))
    expect(media.every((video) => video.src === "")).toBe(true)
  })
})

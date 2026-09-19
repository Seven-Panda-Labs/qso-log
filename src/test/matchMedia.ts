type Listener = (event: MediaQueryListEvent) => void

const listeners = new Set<Listener>()
let prefersDark = false

/** Sets the system preference for a test, and notifies anything listening. */
export function setPrefersDark(value: boolean) {
  prefersDark = value

  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({
        media: query,
        get matches() {
          return query.includes('prefers-color-scheme: dark') && prefersDark
        },
        addEventListener: (_: string, listener: Listener) => listeners.add(listener),
        removeEventListener: (_: string, listener: Listener) => listeners.delete(listener),
        addListener: (listener: Listener) => listeners.add(listener),
        removeListener: (listener: Listener) => listeners.delete(listener),
        onchange: null,
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList
    return
  }

  listeners.forEach((listener) => listener({ matches: prefersDark } as MediaQueryListEvent))
}

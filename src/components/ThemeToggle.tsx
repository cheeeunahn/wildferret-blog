import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

// The is:inline script in src/layouts/Base.astro already resolved the theme
// before paint, so the DOM is the source of truth on mount. Reading `document`
// during render is why this island is mounted with client:only rather than
// server-rendered.
function readTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

// The labels arrive as props (from strings.theme in Base.astro) rather than
// being looked up here, so the island ships only the two strings it renders
// and an /en/ page never announces Korean.
export default function ThemeToggle({ toLight, toDark }: { toLight: string; toDark: string }) {
  const [theme, setTheme] = useState<Theme>(readTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
    document.documentElement.dataset.theme = theme
  }, [theme])

  // Keep following the OS until the reader picks a side themselves
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem('theme')) return
      } catch {
        // storage blocked — fall through and follow the OS
      }
      setTheme(e.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    try {
      localStorage.setItem('theme', next)
    } catch {
      // private mode — the choice just won't survive a reload
    }
  }

  const isDark = theme === 'dark'
  const label = isDark ? toLight : toDark

  // A native button, not Astryx's IconButton: this island loads on every page,
  // and IconButton pulls in Astryx's shared button chunk (~31 KB gzipped) for a
  // single icon. The classes resolve to Astryx's tokens (see global.css @theme).
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex size-9 items-center justify-center rounded-lg text-ink-600 hover:text-ink-900 hover:bg-ink-50 transition-colors cursor-pointer"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {isDark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </>
        ) : (
          <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
        )}
      </svg>
    </button>
  )
}

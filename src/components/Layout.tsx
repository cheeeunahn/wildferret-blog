import { useLayoutEffect } from 'react'
import { Outlet, Link, useLocation, useNavigationType } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

export default function Layout() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  // 새 페이지로 이동하면 항상 맨 위에서 시작한다.
  // 뒤로/앞으로 가기(POP)는 브라우저가 복원한 위치를 그대로 둔다.
  useLayoutEffect(() => {
    if (navigationType === 'POP') return
    // 전역 scroll-behavior가 smooth라 이동 시에는 즉시 점프하도록 덮어쓴다.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, navigationType])

  return (
    <div className="min-h-screen flex flex-col boot-shell">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-paper/80 backdrop-blur-md border-b border-ink-100 boot-header">
        <nav className="max-w-[720px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="text-ink-900 text-lg font-semibold tracking-tight no-underline hover:opacity-70 transition-opacity"
          >
            wildferret's blog
          </Link>
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm no-underline transition-colors ${
                pathname === '/'
                  ? 'text-ink-900 font-medium'
                  : 'text-ink-400 hover:text-ink-700'
              }`}
            >
              글
            </Link>
            <Link
              to="/about"
              className={`text-sm no-underline transition-colors ${
                pathname === '/about'
                  ? 'text-ink-900 font-medium'
                  : 'text-ink-400 hover:text-ink-700'
              }`}
            >
              소개
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </header>

      {/* Main */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-ink-100 bg-paper-warm">
        <div className="max-w-[720px] mx-auto px-6 py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-ink-900 font-semibold text-sm">wildferret</p>
            <p className="text-ink-400 text-xs mt-1">
              Product Manager
            </p>
          </div>
          <p className="text-ink-300 text-xs">
            &copy; {new Date().getFullYear()} wildferret. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

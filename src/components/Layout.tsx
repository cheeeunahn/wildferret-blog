import { Outlet, Link, useLocation } from 'react-router-dom'

export default function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-paper/80 backdrop-blur-md border-b border-ink-100">
        <nav className="max-w-[720px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="text-ink-900 text-lg font-semibold tracking-tight no-underline hover:opacity-70 transition-opacity"
          >
            wildferret's blog
          </Link>
          <div className="flex items-center gap-8">
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
              유저 리서치, 기획, 그리고 PM.
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

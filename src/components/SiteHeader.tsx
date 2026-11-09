import { Link, useRouter } from '@tanstack/react-router'
import { Bell, LogOut, Wallet } from 'lucide-react'
import { Logo } from './Logo'
import { useAccount, useQuotes } from '@/lib/store'
import { logout, useCurrentUser } from '@/lib/learn'
import { fmtUsd } from '@/lib/format'

type NavTo = '/dashboard' | '/markets' | '/trade' | '/wallet' | '/materi' | '/leaderboard' | '/admin'

export function SiteHeader() {
  const balances = useAccount((a) => a.balances)
  const quotes = useQuotes()
  const user = useCurrentUser()
  const router = useRouter()
  const total = Object.entries(balances).reduce((sum, [s, amt]) => sum + amt * (s === 'USDT' ? 1 : (quotes[s]?.price ?? 0)), 0)

  const nav: { to: NavTo; label: string }[] = [
    ...(user ? [{ to: '/dashboard' as const, label: 'Dashboard' }] : []),
    { to: '/markets', label: 'Pasar' },
    { to: '/trade', label: 'Trade' },
    { to: '/wallet', label: 'Dompet' },
    { to: '/materi', label: 'Belajar' },
    { to: '/leaderboard', label: 'Peringkat' },
    ...(user?.role === 'admin' ? [{ to: '/admin' as const, label: 'Admin' }] : []),
  ]

  const onLogout = () => {
    logout()
    router.history.push('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-700/60 bg-ink-950/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-6 px-4 sm:px-6">
        <Link to="/" aria-label="Cryptonize beranda">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-1.5 text-sm text-ink-300 transition hover:bg-ink-800 hover:text-ink-100"
              activeProps={{ className: '!text-ink-100 bg-ink-800' }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/wallet"
            className="hidden items-center gap-2 rounded-md border border-ink-700 px-3 py-1.5 text-sm sm:flex hover:border-ink-600"
          >
            <Wallet className="h-4 w-4 text-volt" />
            <span className="num">{fmtUsd(total)}</span>
          </Link>
          <button className="rounded-md p-2 text-ink-300 hover:bg-ink-800 hover:text-ink-100" aria-label="Notifikasi">
            <Bell className="h-4 w-4" />
          </button>
          {user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full bg-ink-800 py-1 pl-1 pr-3 hover:bg-ink-700"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-volt text-xs font-bold text-ink-950">
                  {user.nama[0]?.toUpperCase()}
                </span>
                <span className="hidden text-xs text-ink-300 lg:inline">{user.nama}</span>
              </Link>
              <button
                onClick={onLogout}
                className="rounded-md p-2 text-ink-300 hover:bg-ink-800 hover:text-ink-100"
                aria-label="Keluar"
                title="Keluar"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="rounded-md px-3 py-1.5 text-sm text-ink-300 hover:text-ink-100">
                Masuk
              </Link>
              <Link to="/register" className="rounded-md bg-volt px-3 py-1.5 text-sm font-semibold text-ink-950 hover:bg-volt-dim">
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
      <nav className="flex overflow-x-auto border-t border-ink-700/60 md:hidden">
        {nav.map((n) => (
          <Link key={n.to} to={n.to} className="flex-1 whitespace-nowrap px-3 py-2 text-center text-sm text-ink-300" activeProps={{ className: '!text-volt' }}>
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}

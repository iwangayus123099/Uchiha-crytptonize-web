import { useLocation, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useCurrentUser, useLearn } from '@/lib/learn'

// Halaman yang memerlukan akun masuk (AUTH-02). Halaman publik (/, /markets) tetap bisa dibuka.
const PROTECTED = ['/dashboard', '/profile', '/materi', '/kuis', '/leaderboard', '/trade', '/wallet']
const ADMIN = ['/admin']

const matches = (path: string, list: string[]) => list.some((p) => path === p || path.startsWith(p + '/'))

/** Mengarahkan pengguna yang belum masuk ke /login, dan mencegah non-admin membuka /admin. */
export function AuthGuard() {
  const path = useLocation({ select: (l) => l.pathname })
  const router = useRouter()
  const ready = useLearn((s) => s.ready)
  const user = useCurrentUser()

  useEffect(() => {
    if (!ready) return
    if (matches(path, PROTECTED) && !user) {
      router.history.push(`/login?redirect=${encodeURIComponent(path)}`)
      return
    }
    if (matches(path, ADMIN) && user?.role !== 'admin') {
      router.history.push(user ? '/dashboard' : `/login?redirect=${encodeURIComponent(path)}`)
    }
  }, [ready, user, path, router])

  return null
}

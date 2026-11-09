import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { login, useCurrentUser, useLearn } from '@/lib/learn'
import { toast } from '@/lib/store'
import { Field, btnCls, fieldCls } from '@/components/ui'

export const Route = createFileRoute('/login')({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof s.redirect === 'string' && s.redirect.startsWith('/') && !s.redirect.startsWith('//') ? s.redirect : undefined,
  }),
  head: () => ({ meta: [{ title: 'Masuk · Cryptonize' }] }),
  component: LoginPage,
})

function LoginPage() {
  const { redirect } = Route.useSearch()
  const router = useRouter()
  const ready = useLearn((s) => s.ready)
  const user = useCurrentUser()
  const [error, setError] = useState('')

  useEffect(() => {
    if (ready && user) router.history.push(redirect ?? '/dashboard')
  }, [ready, user, redirect, router])

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const res = login(String(f.get('identifier') ?? ''), String(f.get('password') ?? ''))
    if (!res.ok) return setError(res.error)
    toast(`Selamat datang, ${res.data.nama}`, 'success')
    router.history.push(redirect ?? '/dashboard')
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="panel p-6">
        <h1 className="text-xl font-semibold">Masuk ke Cryptonize</h1>
        <p className="mt-1 text-sm text-ink-400">Masuk untuk mengakses belajar, kuis, dan simulasi trading.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="Username atau email">
            <input name="identifier" required autoComplete="username" className={fieldCls} />
          </Field>
          <Field label="Kata sandi">
            <input name="password" type="password" required autoComplete="current-password" className={fieldCls} />
          </Field>
          {error && <p className="text-sm text-bear">{error}</p>}
          <button type="submit" className={`${btnCls} w-full`}>
            Masuk
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-ink-400">
          Belum punya akun?{' '}
          <a href="/register" className="text-volt hover:underline">
            Daftar
          </a>
        </p>
        <p className="mt-3 text-center text-xs text-ink-500">
          Akun admin demo: <code className="num">admin</code> / <code className="num">admin123</code>
        </p>
      </div>
    </main>
  )
}

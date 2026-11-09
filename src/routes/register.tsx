import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { register } from '@/lib/learn'
import { toast } from '@/lib/store'
import { Field, btnCls, fieldCls } from '@/components/ui'

export const Route = createFileRoute('/register')({
  head: () => ({ meta: [{ title: 'Daftar · Cryptonize' }] }),
  component: RegisterPage,
})

function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const res = register({
      nama: String(f.get('nama') ?? ''),
      email: String(f.get('email') ?? ''),
      username: String(f.get('username') ?? ''),
      password: String(f.get('password') ?? ''),
    })
    if (!res.ok) return setError(res.error)
    toast('Akun berhasil dibuat. Silakan masuk.', 'success')
    router.history.push('/login')
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="panel p-6">
        <h1 className="text-xl font-semibold">Buat akun baru</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="Nama">
            <input name="nama" required className={fieldCls} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" required className={fieldCls} />
          </Field>
          <Field label="Username">
            <input name="username" required className={fieldCls} />
          </Field>
          <Field label="Kata sandi (minimal 6 karakter)">
            <input name="password" type="password" minLength={6} required autoComplete="new-password" className={fieldCls} />
          </Field>
          {error && <p className="text-sm text-bear">{error}</p>}
          <button type="submit" className={`${btnCls} w-full`}>
            Daftar
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-ink-400">
          Sudah punya akun?{' '}
          <a href="/login" className="text-volt hover:underline">
            Masuk
          </a>
        </p>
      </div>
    </main>
  )
}

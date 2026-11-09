import { createFileRoute } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { poinOf, progressOf, updateProfile, useCurrentUser, useLearn } from '@/lib/learn'
import { toast } from '@/lib/store'
import { Field, PageHeader, btnCls, fieldCls } from '@/components/ui'

export const Route = createFileRoute('/profile')({
  head: () => ({ meta: [{ title: 'Profil · Cryptonize' }] }),
  component: ProfilePage,
})

function ProfilePage() {
  const user = useCurrentUser()
  const poin = useLearn((s) => (user ? poinOf(progressOf(s, user.id)) : 0))
  const [error, setError] = useState('')
  if (!user) return null

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const res = updateProfile(user.id, {
      nama: String(f.get('nama') ?? ''),
      email: String(f.get('email') ?? ''),
      username: String(f.get('username') ?? ''),
      password: String(f.get('password') ?? ''),
    })
    if (!res.ok) return setError(res.error)
    setError('')
    e.currentTarget.reset()
    toast('Profil berhasil disimpan.', 'success')
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <PageHeader title="Profil" sub={`Peran: ${user.role === 'admin' ? 'Admin' : 'Pengguna'} · ${poin} poin`} />
      <form key={user.id + user.username + user.email} onSubmit={onSubmit} className="panel space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama">
            <input name="nama" defaultValue={user.nama} required className={fieldCls} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" defaultValue={user.email} required className={fieldCls} />
          </Field>
          <Field label="Username">
            <input name="username" defaultValue={user.username} required className={fieldCls} />
          </Field>
          <Field label="Kata sandi baru (kosongkan jika tidak diubah)">
            <input name="password" type="password" minLength={6} autoComplete="new-password" className={fieldCls} />
          </Field>
        </div>
        {error && <p className="text-sm text-bear">{error}</p>}
        <button type="submit" className={btnCls}>
          Simpan perubahan
        </button>
      </form>
    </main>
  )
}

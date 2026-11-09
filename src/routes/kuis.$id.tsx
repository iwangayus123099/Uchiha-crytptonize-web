import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { kuisBest, poinOf, progressOf, submitKuis, useCurrentUser, useLearn } from '@/lib/learn'
import { toast } from '@/lib/store'
import { btnCls, btnGhostCls } from '@/components/ui'

export const Route = createFileRoute('/kuis/$id')({
  head: () => ({ meta: [{ title: 'Kuis · Cryptonize' }] }),
  component: KuisPage,
})

type Hasil = { benar: number; total: number; skor: number }

function KuisPage() {
  const { id } = Route.useParams()
  const user = useCurrentUser()
  const kuis = useLearn((s) => s.kuis.find((k) => k.id === id))
  const poin = useLearn((s) => (user ? poinOf(progressOf(s, user.id)) : 0))
  const best = useLearn((s) => (user && kuis ? kuisBest(progressOf(s, user.id), kuis.id) : 0))
  const [jawaban, setJawaban] = useState<Record<number, number>>({})
  const [hasil, setHasil] = useState<Hasil | null>(null)
  const [error, setError] = useState('')

  if (!kuis) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-ink-400">Kuis tidak ditemukan.</p>
      </main>
    )
  }

  const onSubmit = () => {
    if (kuis.soal.some((_, i) => jawaban[i] === undefined)) return setError('Jawab semua soal terlebih dahulu.')
    const res = submitKuis(kuis, kuis.soal.map((_, i) => jawaban[i]))
    if (!res.ok) return setError(res.error)
    setError('')
    setHasil(res.data)
    toast(`Skor kamu ${res.data.skor}`, 'success')
  }

  const ulangi = () => {
    setHasil(null)
    setJawaban({})
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link to="/materi" className="text-sm text-ink-400 hover:text-ink-100">
        ← Kembali ke materi
      </Link>
      <h1 className="mt-3 text-2xl font-semibold">{kuis.judul}</h1>
      <p className="num mb-6 text-sm text-ink-400">
        Skor terbaik {best}/{kuis.soal.length} · Poin kamu {poin}
      </p>

      {!user && <p className="text-sm text-bear">Masuk terlebih dahulu agar skor dan poin tersimpan.</p>}

      {hasil ? (
        <section className="panel space-y-3 p-6 text-center">
          <div className="num text-4xl font-semibold text-volt">{hasil.skor}</div>
          <p className="text-sm text-ink-300">
            Benar {hasil.benar} dari {hasil.total} soal.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <button onClick={ulangi} className={btnCls}>
              Ulangi kuis
            </button>
            <Link to="/materi" className={btnGhostCls}>
              Kembali ke materi
            </Link>
          </div>
        </section>
      ) : (
        <div className="space-y-4">
          {kuis.soal.map((s, i) => (
            <fieldset key={i} className="panel p-5">
              <legend className="mb-3 font-semibold">
                {i + 1}. {s.pertanyaan}
              </legend>
              <div className="space-y-2">
                {s.pilihan.map((p, j) => (
                  <label key={j} className="flex cursor-pointer items-center gap-3 rounded-md border border-ink-700 px-3 py-2 text-sm hover:border-ink-600">
                    <input
                      type="radio"
                      name={`q${i}`}
                      checked={jawaban[i] === j}
                      onChange={() => setJawaban((prev) => ({ ...prev, [i]: j }))}
                      className="accent-volt"
                    />
                    {p}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          {error && <p className="text-sm text-bear">{error}</p>}
          <button onClick={onSubmit} disabled={!user} className={btnCls}>
            Kirim jawaban
          </button>
        </div>
      )}
    </main>
  )
}

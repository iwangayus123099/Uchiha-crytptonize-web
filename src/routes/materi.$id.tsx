import { Link, createFileRoute } from '@tanstack/react-router'
import { markBagian, progressOf, useCurrentUser, useLearn } from '@/lib/learn'
import { toast } from '@/lib/store'
import { btnCls } from '@/components/ui'

export const Route = createFileRoute('/materi/$id')({
  head: () => ({ meta: [{ title: 'Modul · Cryptonize' }] }),
  component: MateriDetailPage,
})

function MateriDetailPage() {
  const { id } = Route.useParams()
  const user = useCurrentUser()
  const materi = useLearn((s) => s.materi.find((m) => m.id === id))
  const kuis = useLearn((s) => s.kuis.find((k) => k.materiId === id))
  const done = useLearn((s) => (user ? progressOf(s, user.id).bagian[id] ?? [] : []))

  if (!materi) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-ink-400">Materi tidak ditemukan.</p>
        <Link to="/materi" className="text-volt hover:underline">
          ← Kembali ke materi
        </Link>
      </main>
    )
  }

  const onDone = (i: number) => {
    markBagian(id, i)
    toast('Bagian selesai (+10 poin)', 'success')
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link to="/materi" className="text-sm text-ink-400 hover:text-ink-100">
        ← Kembali ke materi
      </Link>
      <h1 className="mt-3 text-2xl font-semibold">{materi.judul}</h1>
      <p className="mb-6 text-sm text-ink-400">Topik: {materi.topik}</p>

      <div className="space-y-4">
        {materi.bagian.map((b, i) => {
          const selesai = done.includes(i)
          return (
            <section key={i} className={`panel p-5 ${selesai ? 'border-bull/50' : ''}`}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="font-semibold">
                  {i + 1}. {b.judul}
                </h2>
                {selesai && <span className="text-xs font-semibold text-bull">✓ Selesai</span>}
              </div>
              <p className="text-sm leading-relaxed text-ink-300">{b.isi}</p>
              {!selesai && user && (
                <button onClick={() => onDone(i)} className={`${btnCls} mt-4`}>
                  Tandai selesai (+10 poin)
                </button>
              )}
            </section>
          )
        })}
      </div>

      {kuis && (
        <Link to="/kuis/$id" params={{ id: kuis.id }} className={`${btnCls} mt-6 inline-block`}>
          Kerjakan kuis
        </Link>
      )}
    </main>
  )
}

import { Link, createFileRoute } from '@tanstack/react-router'
import { progressOf, useCurrentUser, useLearn } from '@/lib/learn'
import { PageHeader, ProgressBar } from '@/components/ui'

export const Route = createFileRoute('/materi/')({
  head: () => ({ meta: [{ title: 'Materi Edukasi · Cryptonize' }] }),
  component: MateriListPage,
})

function MateriListPage() {
  const user = useCurrentUser()
  const materi = useLearn((s) => s.materi)
  const progress = useLearn((s) => (user ? progressOf(s, user.id) : null))
  const topik = [...new Set(materi.map((m) => m.topik))]

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6">
      <PageHeader title="Materi Edukasi Aset Kripto" sub="Pelajari konsep dasarnya, selesaikan modul, lalu uji dengan kuis." />
      {topik.map((t) => (
        <section key={t} className="mb-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-400">{t}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {materi
              .filter((m) => m.topik === t)
              .map((m) => {
                const n = progress?.bagian[m.id]?.length ?? 0
                return (
                  <Link key={m.id} to="/materi/$id" params={{ id: m.id }} className="panel block space-y-3 p-5 transition hover:border-volt/60">
                    <h3 className="font-semibold text-ink-100">{m.judul}</h3>
                    <p className="num text-xs text-ink-400">
                      {n}/{m.bagian.length} bagian selesai
                    </p>
                    <ProgressBar value={n} max={m.bagian.length} />
                  </Link>
                )
              })}
          </div>
        </section>
      ))}
      {!materi.length && <p className="text-ink-400">Belum ada materi.</p>}
    </main>
  )
}

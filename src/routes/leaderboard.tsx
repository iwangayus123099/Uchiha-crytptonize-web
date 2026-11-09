import { createFileRoute } from '@tanstack/react-router'
import { poinOf, useCurrentUser, useLearn, type Progress } from '@/lib/learn'
import { PageHeader } from '@/components/ui'

const EMPTY: Progress = { bagian: {}, kuis: {} }

export const Route = createFileRoute('/leaderboard')({
  head: () => ({ meta: [{ title: 'Peringkat · Cryptonize' }] }),
  component: LeaderboardPage,
})

function LeaderboardPage() {
  const me = useCurrentUser()
  const users = useLearn((s) => s.users)
  const progressMap = useLearn((s) => s.progress)
  const rows = users
    .filter((u) => u.role === 'user')
    .map((u) => ({ u, p: poinOf(progressMap[u.id] ?? EMPTY) }))
    .sort((a, b) => b.p - a.p)

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader title="Papan Peringkat" sub="Diurutkan berdasarkan poin dari materi dan kuis." />
      <div className="panel overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-850 text-left text-xs uppercase tracking-wider text-ink-400">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3 text-right">Poin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-700/60">
            {rows.map((r, i) => (
              <tr key={r.u.id} className={r.u.id === me?.id ? 'bg-volt/5 text-volt' : ''}>
                <td className="num px-4 py-3">{i + 1}</td>
                <td className="px-4 py-3">{r.u.nama}</td>
                <td className="px-4 py-3 text-ink-400">{r.u.username}</td>
                <td className="num px-4 py-3 text-right font-semibold">{r.p}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="p-6 text-center text-sm text-ink-400">Belum ada pengguna.</p>}
      </div>
    </main>
  )
}

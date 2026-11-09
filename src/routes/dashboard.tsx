import { Link, createFileRoute } from '@tanstack/react-router'
import { kuisBest, poinOf, progressOf, useCurrentUser, useLearn } from '@/lib/learn'
import { useAccount, useQuotes } from '@/lib/store'
import { fmtUsd } from '@/lib/format'
import { PageHeader, ProgressBar, btnGhostCls } from '@/components/ui'

export const Route = createFileRoute('/dashboard')({
  head: () => ({ meta: [{ title: 'Dashboard · Cryptonize' }] }),
  component: DashboardPage,
})

function DashboardPage() {
  const user = useCurrentUser()
  const materi = useLearn((s) => s.materi)
  const kuis = useLearn((s) => s.kuis)
  const progress = useLearn((s) => (user ? progressOf(s, user.id) : null))
  const balances = useAccount((a) => a.balances)
  const quotes = useQuotes()
  if (!user || !progress) return null

  const holdings = Object.entries(balances).filter(([sym, amt]) => sym !== 'USDT' && amt > 0)
  const nilai = Object.entries(balances).reduce((sum, [s, amt]) => sum + amt * (s === 'USDT' ? 1 : (quotes[s]?.price ?? 0)), 0)
  const selesai = materi.filter((m) => (progress.bagian[m.id]?.length ?? 0) >= m.bagian.length).length

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6">
      <PageHeader title={`Halo, ${user.nama}`} sub="Ringkasan belajar dan simulasi trading kamu." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Poin" value={String(poinOf(progress))} />
        <Stat label="Saldo USDT" value={fmtUsd(balances.USDT ?? 0)} />
        <Stat label="Nilai portofolio" value={fmtUsd(nilai)} />
        <Stat label="Aset dimiliki" value={String(holdings.length)} />
        <Stat label="Materi selesai" value={`${selesai}/${materi.length}`} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="panel p-5">
          <h2 className="mb-4 font-semibold">Progres belajar</h2>
          <ul className="space-y-4">
            {materi.map((m) => {
              const n = progress.bagian[m.id]?.length ?? 0
              return (
                <li key={m.id}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <Link to="/materi/$id" params={{ id: m.id }} className="hover:text-volt">
                      {m.judul}
                    </Link>
                    <span className="num text-ink-400">
                      {n}/{m.bagian.length}
                    </span>
                  </div>
                  <ProgressBar value={n} max={m.bagian.length} />
                </li>
              )
            })}
          </ul>
        </section>

        <section className="panel p-5">
          <h2 className="mb-4 font-semibold">Kuis</h2>
          <ul className="divide-y divide-ink-700/60">
            {kuis.map((k) => (
              <li key={k.id} className="flex items-center justify-between py-3 text-sm">
                <Link to="/kuis/$id" params={{ id: k.id }} className="hover:text-volt">
                  {k.judul}
                </Link>
                <span className="num text-ink-400">
                  skor terbaik {kuisBest(progress, k.id)}/{k.soal.length}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/trade" className={btnGhostCls}>
              Buka Trade
            </Link>
            <Link to="/wallet" className={btnGhostCls}>
              Lihat Dompet
            </Link>
            <Link to="/leaderboard" className={btnGhostCls}>
              Peringkat
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-4">
      <div className="text-xs text-ink-400">{label}</div>
      <div className="num mt-1 text-xl font-semibold">{value}</div>
    </div>
  )
}

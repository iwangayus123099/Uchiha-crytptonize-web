import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, ArrowUpRight, Bolt, Landmark, LineChart, Lock, ShieldCheck, Smartphone } from 'lucide-react'
import { assets, generateCandles, sparkline } from '@/data/fixtures'
import { useQuote, useQuotes } from '@/lib/store'
import { fmtCompact, fmtPct, fmtPrice } from '@/lib/format'
import { CoinIcon } from '@/components/CoinIcon'
import { Sparkline } from '@/components/Sparkline'
import { CandleChart } from '@/components/CandleChart'
import { Logo } from '@/components/Logo'

export const Route = createFileRoute('/')({
  component: Home,
})

const btc = assets[0]
const heroCandles = generateCandles(btc, '1h', 60)

const features = [
  { icon: Bolt, title: 'Eksekusi < 5 ms', body: 'Matching engine berlatensi rendah untuk order limit dan market — harga yang Anda lihat adalah harga yang Anda dapat.' },
  { icon: Landmark, title: 'Deposit Rupiah instan', body: 'Top up via virtual account, QRIS, dan e-wallet. Saldo masuk dalam hitungan detik, tanpa biaya tersembunyi.' },
  { icon: ShieldCheck, title: 'Aset terlindungi', body: '95% aset nasabah disimpan di cold wallet multi-signature dengan audit proof-of-reserve berkala.' },
  { icon: LineChart, title: 'Chart profesional', body: 'Candlestick multi-timeframe, indikator MA, order book kedalaman penuh, dan riwayat transaksi real-time.' },
  { icon: Lock, title: 'Keamanan berlapis', body: 'Autentikasi dua faktor, whitelist alamat penarikan, dan notifikasi aktivitas di setiap perangkat.' },
  { icon: Smartphone, title: 'Trading di mana saja', body: 'Antarmuka responsif yang terasa sama tajamnya di desktop, tablet, maupun ponsel.' },
]

function Home() {
  const quotes = useQuotes()
  const live = useQuote('BTC')
  const movers = [...assets]
    .filter((a) => a.category !== 'Stablecoin')
    .sort((a, b) => Math.abs(quotes[b.symbol].change24h) - Math.abs(quotes[a.symbol].change24h))
    .slice(0, 5)

  return (
    <main>
      {/* Hero */}
      <section className="grid-bg relative overflow-hidden border-b border-ink-700/60">
        <div className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[720px] rounded-full bg-volt/10 blur-[120px]" />
        <div className="relative mx-auto grid max-w-[1400px] gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div className="rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-volt/30 bg-volt/10 px-3 py-1 text-xs font-medium text-volt">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-volt" /> Pasar buka 24/7 · 17 aset kripto
            </span>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Trading kripto
              <br />
              <span className="text-volt">secepat</span> keputusan Anda.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-300">
              Cryptonize adalah platform web trading untuk Bitcoin, Ethereum, dan ratusan aset digital — dengan chart real-time, order book
              transparan, dan deposit Rupiah instan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/trade" className="group inline-flex items-center gap-2 rounded-lg bg-volt px-5 py-3 font-semibold text-ink-950 transition hover:bg-volt-dim">
                Mulai Trading <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link to="/markets" className="inline-flex items-center gap-2 rounded-lg border border-ink-600 px-5 py-3 font-medium hover:border-ink-400">
                Lihat Pasar
              </Link>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-ink-700/60 pt-6">
              {[
                ['$2,4 M', 'Volume harian'],
                ['1,2 jt+', 'Pengguna terdaftar'],
                ['0,1%', 'Biaya trading'],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="text-xs text-ink-400">{l}</dt>
                  <dd className="num mt-1 text-2xl font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Live preview card */}
          <div className="rise panel overflow-hidden shadow-[0_40px_120px_-40px_rgb(198_244_50/0.25)]" style={{ animationDelay: '120ms' }}>
            <div className="flex items-center justify-between border-b border-ink-700/70 px-4 py-3">
              <div className="flex items-center gap-3">
                <CoinIcon symbol="BTC" />
                <div>
                  <div className="text-sm font-semibold">BTC / USDT</div>
                  <div className="text-xs text-ink-400">Bitcoin · 1 Jam</div>
                </div>
              </div>
              <div className="text-right">
                <div key={live.tick} className={`num rounded px-1 text-lg font-semibold ${live.dir === 'up' ? 'flash-up' : live.dir === 'down' ? 'flash-down' : ''}`}>
                  {fmtPrice(live.price)}
                </div>
                <div className={`num text-xs ${live.change24h >= 0 ? 'text-bull' : 'text-bear'}`}>{fmtPct(live.change24h)}</div>
              </div>
            </div>
            <CandleChart candles={heroCandles} livePrice={live.price} height={300} />
            <div className="grid grid-cols-2 gap-px border-t border-ink-700/70 bg-ink-700/70">
              <Link to="/trade" search={{ pair: 'BTC' }} className="bg-ink-900 py-3 text-center text-sm font-semibold text-bull hover:bg-bull/10">
                Beli BTC
              </Link>
              <Link to="/trade" search={{ pair: 'BTC' }} className="bg-ink-900 py-3 text-center text-sm font-semibold text-bear hover:bg-bear/10">
                Jual BTC
              </Link>
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div className="relative overflow-hidden border-t border-ink-700/60 bg-ink-900/60 py-3">
          <div className="animate-ticker flex w-max gap-10 whitespace-nowrap">
            {[...assets, ...assets].map((a, i) => {
              const q = quotes[a.symbol]
              return (
                <Link key={i} to="/trade" search={{ pair: a.symbol }} className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">{a.symbol}</span>
                  <span className="num text-ink-300">{fmtPrice(q.price)}</span>
                  <span className={`num text-xs ${q.change24h >= 0 ? 'text-bull' : 'text-bear'}`}>{fmtPct(q.change24h)}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Movers */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-volt">Pergerakan terbesar hari ini</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Pasar sedang bergerak.</h2>
          </div>
          <Link to="/markets" className="inline-flex items-center gap-1 text-sm text-ink-300 hover:text-ink-100">
            Semua pasar <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {movers.map((a) => {
            const q = quotes[a.symbol]
            return (
              <Link key={a.symbol} to="/trade" search={{ pair: a.symbol }} className="panel group p-4 transition hover:-translate-y-0.5 hover:border-ink-600">
                <div className="flex items-center gap-2">
                  <CoinIcon symbol={a.symbol} size={24} />
                  <span className="font-semibold">{a.symbol}</span>
                  <span className="truncate text-xs text-ink-400">{a.name}</span>
                </div>
                <div className="num mt-4 text-xl font-semibold">{fmtPrice(q.price)}</div>
                <div className={`num text-sm ${q.change24h >= 0 ? 'text-bull' : 'text-bear'}`}>{fmtPct(q.change24h)}</div>
                <div className="mt-3">
                  <Sparkline data={sparkline(a)} width={200} height={40} up={q.change24h >= 0} />
                </div>
                <div className="mt-2 text-xs text-ink-400">Vol 24j {fmtCompact(a.volume24h)}</div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-ink-700/60 bg-ink-900/40">
        <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Semua yang dibutuhkan trader serius, <span className="text-ink-400">tanpa kerumitan.</span>
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-ink-700/70 bg-ink-700/70 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="bg-ink-900 p-6">
                <f.icon className="h-5 w-5 text-volt" />
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-300">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Mulai dalam tiga langkah.</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            ['Daftar & verifikasi', 'Buat akun dengan email, lalu verifikasi identitas (KYC) dengan KTP dalam kurang dari 5 menit.'],
            ['Deposit Rupiah', 'Isi saldo lewat transfer bank, QRIS, atau e-wallet. Dana otomatis dikonversi ke USDT.'],
            ['Trading', 'Pilih pasangan, pasang order limit atau market, dan pantau portofolio Anda secara real-time.'],
          ].map(([t, b], i) => (
            <li key={t} className="panel p-6">
              <span className="num text-sm text-volt">0{i + 1}</span>
              <h3 className="mt-3 text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-ink-300">{b}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-6">
        <div className="grid-bg relative overflow-hidden rounded-2xl border border-volt/25 bg-ink-900 px-8 py-14 text-center">
          <div className="pointer-events-none absolute inset-x-0 -bottom-32 mx-auto h-64 w-[640px] rounded-full bg-volt/15 blur-[100px]" />
          <h2 className="relative text-3xl font-semibold tracking-tight sm:text-5xl">Siap mengambil posisi pertama?</h2>
          <p className="relative mx-auto mt-4 max-w-lg text-ink-300">Coba terminal trading Cryptonize sekarang dengan akun demo — saldo awal sudah tersedia.</p>
          <Link to="/trade" className="relative mt-8 inline-flex items-center gap-2 rounded-lg bg-volt px-6 py-3 font-semibold text-ink-950 hover:bg-volt-dim">
            Buka Terminal Trading <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink-700/60">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-8 text-sm text-ink-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo />
          <p className="max-w-xl text-xs">
            Perdagangan aset kripto memiliki risiko tinggi. Harga dapat berfluktuasi secara signifikan. Pastikan Anda memahami risikonya sebelum
            bertransaksi.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs">© 2026 Cryptonize</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

/**
 * Akun, sesi, materi, kuis, progres, dan poin.
 * Disimpan di localStorage browser (demo). PLAN.md Milestone 3–4 menggantinya dengan
 * autentikasi dan database sungguhan.
 */
import { Store, useSelector } from '@tanstack/react-store'
import { useEffect } from 'react'

export type Role = 'user' | 'admin'
export type User = { id: string; nama: string; email: string; username: string; password: string; role: Role }
export type Bagian = { judul: string; isi: string }
export type Materi = { id: string; topik: string; judul: string; bagian: Bagian[] }
export type Soal = { pertanyaan: string; pilihan: string[]; jawaban: number }
export type Kuis = { id: string; materiId: string; judul: string; soal: Soal[] }
export type Progress = { bagian: Record<string, number[]>; kuis: Record<string, number> }

type State = {
  ready: boolean
  users: User[]
  sessionId: string | null
  materi: Materi[]
  kuis: Kuis[]
  progress: Record<string, Progress>
}

export type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string }

const KEY = 'cryptonize:v2'
const POIN_PER_AKSI = 10
const EMPTY: Progress = Object.freeze({ bagian: {}, kuis: {} }) as Progress

const ADMIN_SEED: User = {
  id: 'u-admin',
  nama: 'Administrator',
  email: 'admin@cryptonize.local',
  username: 'admin',
  password: 'admin123',
  role: 'admin',
}

const SEED_MATERI: Materi[] = [
  {
    id: 'm1', topik: 'Dasar', judul: 'Apa itu Blockchain',
    bagian: [
      { judul: 'Pengertian', isi: 'Blockchain adalah buku besar digital yang dicatat dan disalin di banyak komputer sekaligus sehingga sulit diubah.' },
      { judul: 'Cara kerja', isi: 'Data dikelompokkan dalam blok, lalu tiap blok diikat ke blok sebelumnya dengan kode hash. Perubahan kecil pada satu blok akan terlihat oleh seluruh jaringan.' },
    ],
  },
  {
    id: 'm2', topik: 'Aset', judul: 'Mengenal Bitcoin',
    bagian: [
      { judul: 'Asal usul', isi: 'Bitcoin dirilis pada 2009 oleh seseorang dengan nama samaran Satoshi Nakamoto sebagai uang digital yang terdesentralisasi.' },
      { judul: 'Pasokan terbatas', isi: 'Jumlah Bitcoin dibatasi hingga 21 juta koin, sehingga sering disebut aset dengan pasokan langka.' },
    ],
  },
  {
    id: 'm3', topik: 'Aset', judul: 'Mengenal Altcoin',
    bagian: [
      { judul: 'Definisi', isi: 'Altcoin adalah istilah untuk semua kripto selain Bitcoin, misalnya Ethereum, Solana, dan Cardano.' },
      { judul: 'Fungsi', isi: 'Banyak altcoin dibuat untuk fungsi tertentu, seperti kontrak pintar, pembayaran lebih cepat, atau aplikasi terdesentralisasi.' },
    ],
  },
  {
    id: 'm4', topik: 'Keamanan', judul: 'Dompet Kripto (Wallet)',
    bagian: [
      { judul: 'Jenis wallet', isi: 'Wallet panas terhubung ke internet, sedangkan wallet dingin tidak terhubung. Wallet dingin umumnya lebih aman untuk menyimpan aset dalam jumlah besar.' },
      { judul: 'Frasa pemulihan', isi: 'Seed phrase adalah kunci utama dompet. Jangan pernah membagikannya kepada siapa pun.' },
    ],
  },
  {
    id: 'm5', topik: 'Risiko', judul: 'Risiko Aset Kripto',
    bagian: [
      { judul: 'Volatilitas', isi: 'Harga aset kripto dapat naik dan turun sangat cepat dalam waktu singkat.' },
      { judul: 'Penipuan', isi: 'Waspadai janji untung pasti, skema investasi cepat kaya, dan tautan yang meminta kata sandi.' },
    ],
  },
]

const SEED_KUIS: Kuis[] = [
  {
    id: 'k1', materiId: 'm1', judul: 'Kuis Apa itu Blockchain',
    soal: [
      { pertanyaan: 'Apa fungsi hash pada blockchain?', pilihan: ['Mempercepat internet', 'Menghubungkan blok secara aman', 'Menyimpan kata sandi', 'Mencetak koin'], jawaban: 1 },
      { pertanyaan: 'Di mana salinan buku besar blockchain disimpan?', pilihan: ['Hanya di satu server pusat', 'Di banyak komputer (node)', 'Di bank', 'Di kertas'], jawaban: 1 },
    ],
  },
  {
    id: 'k2', materiId: 'm2', judul: 'Kuis Mengenal Bitcoin',
    soal: [
      { pertanyaan: 'Kapan Bitcoin pertama kali dirilis?', pilihan: ['2005', '2009', '2015', '2020'], jawaban: 1 },
      { pertanyaan: 'Berapa batas maksimum jumlah Bitcoin?', pilihan: ['21 juta', '100 juta', '1 miliar', 'Tidak terbatas'], jawaban: 0 },
    ],
  },
  {
    id: 'k3', materiId: 'm3', judul: 'Kuis Mengenal Altcoin',
    soal: [
      { pertanyaan: 'Manakah yang termasuk altcoin?', pilihan: ['Bitcoin', 'Ethereum', 'Rupiah', 'Emas'], jawaban: 1 },
      { pertanyaan: 'Altcoin umumnya dibuat untuk apa?', pilihan: ['Hanya untuk ditimbun', 'Fungsi tertentu di luar Bitcoin', 'Menggantikan internet', 'Tanpa alasan'], jawaban: 1 },
    ],
  },
  {
    id: 'k4', materiId: 'm4', judul: 'Kuis Dompet Kripto',
    soal: [
      { pertanyaan: 'Jenis wallet yang lebih aman untuk aset besar biasanya?', pilihan: ['Wallet panas', 'Wallet dingin', 'Screenshot di HP', 'Catatan di media sosial'], jawaban: 1 },
      { pertanyaan: 'Bagaimana seharusnya seed phrase diperlakukan?', pilihan: ['Dibagikan ke teman', 'Disimpan rahasia', 'Diunggah ke internet', 'Dikirim lewat chat'], jawaban: 1 },
    ],
  },
  {
    id: 'k5', materiId: 'm5', judul: 'Kuis Risiko Kripto',
    soal: [
      { pertanyaan: 'Sifat utama harga aset kripto adalah?', pilihan: ['Stabil', 'Volatil', 'Tetap', 'Selalu naik'], jawaban: 1 },
      { pertanyaan: 'Manakah tanda penipuan?', pilihan: ['Janji untung pasti', 'Edukasi resmi', 'Dokumen legal', 'Harga yang wajar'], jawaban: 0 },
    ],
  },
]

export const learnStore = new Store<State>({
  ready: false,
  users: [ADMIN_SEED],
  sessionId: null,
  materi: SEED_MATERI,
  kuis: SEED_KUIS,
  progress: {},
})

const ok = <T,>(data: T): Result<T> => ({ ok: true, data })
const fail = (error: string) => ({ ok: false as const, error })
const uid = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
const emailValid = (e: string) => /^\S+@\S+\.\S+$/.test(e)

function save(s: State) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ users: s.users, sessionId: s.sessionId, materi: s.materi, kuis: s.kuis, progress: s.progress }),
    )
  } catch {
    // Penyimpanan penuh atau diblokir: data tetap ada selama sesi halaman.
  }
}

function commit(next: State) {
  learnStore.setState(() => next)
  save(next)
}

/** Memuat data tersimpan sekali di browser. Dipanggil dari root layout. */
export function hydrateLearn() {
  const s = learnStore.state
  if (s.ready) return
  let saved: Partial<State> = {}
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) saved = JSON.parse(raw)
  } catch {
    saved = {}
  }
  let users = saved.users?.length ? saved.users : s.users
  if (!users.some((u) => u.id === ADMIN_SEED.id)) users = [ADMIN_SEED, ...users]
  learnStore.setState(() => ({
    ...s,
    ready: true,
    users,
    sessionId: saved.sessionId ?? null,
    materi: saved.materi ?? s.materi,
    kuis: saved.kuis ?? s.kuis,
    progress: saved.progress ?? {},
  }))
}

/* ---------------------------- hooks ---------------------------- */

export function useHydrateLearn() {
  useEffect(() => {
    hydrateLearn()
  }, [])
}

export function useLearn<T>(selector: (s: State) => T) {
  return useSelector(learnStore, selector)
}

export const currentUserOf = (s: State) => s.users.find((u) => u.id === s.sessionId) ?? null

export function useCurrentUser() {
  return useLearn(currentUserOf)
}

/* ---------------------------- akun (AUTH-01..03, USR-01) ---------------------------- */

export function register({ nama, email, username, password }: { nama: string; email: string; username: string; password: string }): Result<User> {
  const s = learnStore.state
  const n = nama.trim()
  const e = email.trim().toLowerCase()
  const u = username.trim()
  if (!n || !e || !u || !password) return fail('Semua kolom wajib diisi.')
  if (!emailValid(e)) return fail('Format email tidak valid.')
  if (password.length < 6) return fail('Kata sandi minimal 6 karakter.')
  if (s.users.some((x) => x.username.toLowerCase() === u.toLowerCase())) return fail('Username sudah dipakai.')
  if (s.users.some((x) => x.email === e)) return fail('Email sudah terdaftar.')
  const user: User = { id: uid('u'), nama: n, email: e, username: u, password, role: 'user' }
  commit({ ...s, users: [...s.users, user] })
  return ok(user)
}

export function login(identifier: string, password: string): Result<User> {
  const s = learnStore.state
  const id = identifier.trim().toLowerCase()
  const user = s.users.find((u) => (u.username.toLowerCase() === id || u.email === id) && u.password === password)
  if (!user) return fail('Username/email atau kata sandi salah.')
  commit({ ...s, sessionId: user.id })
  return ok(user)
}

export function logout() {
  const s = learnStore.state
  commit({ ...s, sessionId: null })
}

export function updateProfile(userId: string, { nama, email, username, password }: { nama: string; email: string; username: string; password: string }): Result<User> {
  const s = learnStore.state
  const target = s.users.find((x) => x.id === userId)
  if (!target) return fail('Pengguna tidak ditemukan.')
  const e = email.trim().toLowerCase()
  const u = username.trim()
  const n = nama.trim()
  if (!n || !e || !u) return fail('Nama, email, dan username wajib diisi.')
  if (!emailValid(e)) return fail('Format email tidak valid.')
  if (s.users.some((x) => x.id !== userId && x.username.toLowerCase() === u.toLowerCase())) return fail('Username sudah dipakai.')
  if (s.users.some((x) => x.id !== userId && x.email === e)) return fail('Email sudah terdaftar.')
  if (password && password.length < 6) return fail('Kata sandi minimal 6 karakter.')
  const updated: User = { ...target, nama: n, email: e, username: u, password: password || target.password }
  commit({ ...s, users: s.users.map((x) => (x.id === userId ? updated : x)) })
  return ok(updated)
}

/* ---------------------------- progres, kuis, poin (EDU-02, GAME-01..03) ---------------------------- */

export function progressOf(s: State, userId: string): Progress {
  return s.progress[userId] ?? EMPTY
}

export function poinOf(p: Progress) {
  const bagian = Object.values(p.bagian).reduce((t, l) => t + l.length, 0)
  const kuis = Object.values(p.kuis).reduce((t, n) => t + n, 0)
  return (bagian + kuis) * POIN_PER_AKSI
}

export function kuisBest(p: Progress, kuisId: string) {
  return p.kuis[kuisId] ?? 0
}

export function markBagian(materiId: string, index: number) {
  const s = learnStore.state
  const user = currentUserOf(s)
  if (!user) return
  const p = progressOf(s, user.id)
  const daftar = p.bagian[materiId] ?? []
  if (daftar.includes(index)) return
  const next: Progress = { ...p, bagian: { ...p.bagian, [materiId]: [...daftar, index] } }
  commit({ ...s, progress: { ...s.progress, [user.id]: next } })
}

export function submitKuis(kuis: Kuis, jawaban: number[]): Result<{ benar: number; total: number; skor: number }> {
  const s = learnStore.state
  const user = currentUserOf(s)
  if (!user) return fail('Silakan masuk terlebih dahulu.')
  const benar = kuis.soal.filter((soal, i) => jawaban[i] === soal.jawaban).length
  const total = kuis.soal.length
  const p = progressOf(s, user.id)
  const next: Progress = { ...p, kuis: { ...p.kuis, [kuis.id]: Math.max(benar, kuisBest(p, kuis.id)) } }
  commit({ ...s, progress: { ...s.progress, [user.id]: next } })
  return ok({ benar, total, skor: Math.round((benar / total) * 100) })
}

/* ---------------------------- admin (ADM-01, ADM-02) ---------------------------- */

export function saveMateri(input: { id?: string; judul: string; topik: string; bagian: Bagian[] }): Result {
  const s = learnStore.state
  const judul = input.judul.trim()
  const topik = input.topik.trim()
  if (!judul || !topik) return fail('Judul dan topik wajib diisi.')
  if (!input.bagian.length) return fail('Isi minimal satu bagian dengan format Judul|Isi.')
  if (input.id) {
    if (!s.materi.some((m) => m.id === input.id)) return fail('Materi tidak ditemukan.')
    commit({
      ...s,
      materi: s.materi.map((m) => (m.id === input.id ? { ...m, judul, topik, bagian: input.bagian } : m)),
    })
  } else {
    const m: Materi = { id: uid('m'), judul, topik, bagian: input.bagian }
    const k: Kuis = { id: uid('k'), materiId: m.id, judul: `Kuis ${judul}`, soal: [] }
    commit({ ...s, materi: [...s.materi, m], kuis: [...s.kuis, k] })
  }
  return ok(undefined)
}

export function deleteMateri(id: string) {
  const s = learnStore.state
  commit({ ...s, materi: s.materi.filter((m) => m.id !== id), kuis: s.kuis.filter((k) => k.materiId !== id) })
}

export function saveSoal(kuisId: string, soal: Soal, index: number | null): Result {
  const s = learnStore.state
  if (!s.kuis.some((k) => k.id === kuisId)) return fail('Kuis tidak ditemukan.')
  if (!soal.pertanyaan.trim()) return fail('Pertanyaan wajib diisi.')
  if (soal.pilihan.length < 2) return fail('Minimal dua pilihan jawaban.')
  if (!(soal.jawaban >= 0 && soal.jawaban < soal.pilihan.length)) return fail('Nomor jawaban benar tidak valid.')
  commit({
    ...s,
    kuis: s.kuis.map((k) => {
      if (k.id !== kuisId) return k
      const list = [...k.soal]
      if (index === null) list.push(soal)
      else list[index] = soal
      return { ...k, soal: list }
    }),
  })
  return ok(undefined)
}

export function deleteSoal(kuisId: string, index: number) {
  const s = learnStore.state
  commit({
    ...s,
    kuis: s.kuis.map((k) => (k.id === kuisId ? { ...k, soal: k.soal.filter((_, i) => i !== index) } : k)),
  })
}

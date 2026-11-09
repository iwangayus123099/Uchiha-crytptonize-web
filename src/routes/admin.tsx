import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import {
  deleteMateri,
  deleteSoal,
  saveMateri,
  saveSoal,
  useCurrentUser,
  useLearn,
  type Kuis,
  type Materi,
  type Soal,
} from '@/lib/learn'
import { toast } from '@/lib/store'
import { Field, PageHeader, btnCls, btnDangerCls, btnGhostCls, fieldCls } from '@/components/ui'

export const Route = createFileRoute('/admin')({
  head: () => ({ meta: [{ title: 'Admin · Cryptonize' }] }),
  component: AdminPage,
})

function AdminPage() {
  const user = useCurrentUser()
  const materi = useLearn((s) => s.materi)
  const kuis = useLearn((s) => s.kuis)
  if (!user || user.role !== 'admin') {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-ink-400">Halaman ini hanya untuk admin.</p>
      </main>
    )
  }
  return (
    <main className="mx-auto max-w-[1100px] space-y-8 px-4 py-8 sm:px-6">
      <PageHeader title="Panel Admin" sub="Kelola materi edukasi dan soal kuis. Perubahan langsung tampil di halaman pengguna." />
      <MateriAdmin materi={materi} />
      <KuisAdmin materi={materi} kuis={kuis} />
    </main>
  )
}

/* ---------------------------- ADM-01: materi ---------------------------- */

const bagianToText = (m: Materi) => m.bagian.map((b) => `${b.judul}|${b.isi}`).join('\n')
const textToBagian = (t: string) =>
  t
    .split('\n')
    .map((line) => {
      const [j, ...r] = line.split('|')
      return { judul: (j ?? '').trim(), isi: r.join('|').trim() }
    })
    .filter((b) => b.judul && b.isi)

function MateriAdmin({ materi }: { materi: Materi[] }) {
  const [editing, setEditing] = useState<Materi | null>(null)
  const [error, setError] = useState('')

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const res = saveMateri({
      id: editing?.id,
      judul: String(f.get('judul') ?? ''),
      topik: String(f.get('topik') ?? ''),
      bagian: textToBagian(String(f.get('bagian') ?? '')),
    })
    if (!res.ok) return setError(res.error)
    setError('')
    setEditing(null)
    e.currentTarget.reset()
    toast('Materi tersimpan.', 'success')
  }

  const onDelete = (m: Materi) => {
    if (!confirm(`Hapus materi "${m.judul}" beserta kuisnya?`)) return
    deleteMateri(m.id)
    if (editing?.id === m.id) setEditing(null)
    toast('Materi dihapus.', 'info')
  }

  return (
    <section className="panel space-y-5 p-5">
      <h2 className="font-semibold">Kelola materi</h2>
      <form key={editing?.id ?? 'baru'} onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Judul">
          <input name="judul" required defaultValue={editing?.judul ?? ''} className={fieldCls} />
        </Field>
        <Field label="Topik">
          <input name="topik" required placeholder="Dasar / Aset / Keamanan / Risiko" defaultValue={editing?.topik ?? ''} className={fieldCls} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Bagian (satu per baris, format Judul|Isi)">
            <textarea name="bagian" rows={5} required defaultValue={editing ? bagianToText(editing) : ''} className={fieldCls} />
          </Field>
        </div>
        {error && <p className="text-sm text-bear sm:col-span-2">{error}</p>}
        <div className="flex gap-2 sm:col-span-2">
          <button type="submit" className={btnCls}>
            {editing ? 'Simpan perubahan' : 'Tambah materi'}
          </button>
          {editing && (
            <button type="button" onClick={() => setEditing(null)} className={btnGhostCls}>
              Batal
            </button>
          )}
        </div>
      </form>

      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wider text-ink-400">
          <tr>
            <th className="py-2">Topik</th>
            <th className="py-2">Judul</th>
            <th className="py-2">Bagian</th>
            <th className="py-2 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-700/60">
          {materi.map((m) => (
            <tr key={m.id}>
              <td className="py-2 text-ink-300">{m.topik}</td>
              <td className="py-2">{m.judul}</td>
              <td className="num py-2">{m.bagian.length}</td>
              <td className="space-x-2 py-2 text-right">
                <button onClick={() => setEditing(m)} className={btnGhostCls}>
                  Ubah
                </button>
                <button onClick={() => onDelete(m)} className={btnDangerCls}>
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

/* ---------------------------- ADM-02: soal kuis ---------------------------- */

function KuisAdmin({ materi, kuis }: { materi: Materi[]; kuis: Kuis[] }) {
  const [kuisId, setKuisId] = useState<string>(kuis[0]?.id ?? '')
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!kuis.some((k) => k.id === kuisId)) setKuisId(kuis[0]?.id ?? '')
  }, [kuis, kuisId])

  const current = kuis.find((k) => k.id === kuisId)
  const editSoal: Soal | null = current && editIndex !== null ? (current.soal[editIndex] ?? null) : null
  const judulMateri = (materiId: string) => materi.find((m) => m.id === materiId)?.judul ?? '-'

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!current) return
    const f = new FormData(e.currentTarget)
    const soal: Soal = {
      pertanyaan: String(f.get('pertanyaan') ?? '').trim(),
      pilihan: String(f.get('pilihan') ?? '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      jawaban: Number(f.get('jawaban') ?? 0) - 1,
    }
    const res = saveSoal(current.id, soal, editIndex)
    if (!res.ok) return setError(res.error)
    setError('')
    setEditIndex(null)
    e.currentTarget.reset()
    toast('Soal tersimpan.', 'success')
  }

  return (
    <section className="panel space-y-5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">Kelola soal kuis</h2>
        <select value={kuisId} onChange={(e) => { setKuisId(e.target.value); setEditIndex(null) }} className={`${fieldCls} w-auto`}>
          {kuis.map((k) => (
            <option key={k.id} value={k.id}>
              {k.judul} ({judulMateri(k.materiId)})
            </option>
          ))}
        </select>
      </div>

      {current && (
        <>
          <form key={`${current.id}-${editIndex}`} onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Pertanyaan">
                <input name="pertanyaan" required defaultValue={editSoal?.pertanyaan ?? ''} className={fieldCls} />
              </Field>
            </div>
            <Field label="Pilihan jawaban (satu per baris, minimal 2)">
              <textarea name="pilihan" rows={4} required defaultValue={editSoal?.pilihan.join('\n') ?? ''} className={fieldCls} />
            </Field>
            <Field label="Nomor jawaban benar (1 = pilihan pertama)">
              <input name="jawaban" type="number" min={1} required defaultValue={editSoal ? editSoal.jawaban + 1 : ''} className={fieldCls} />
            </Field>
            {error && <p className="text-sm text-bear sm:col-span-2">{error}</p>}
            <div className="flex gap-2 sm:col-span-2">
              <button type="submit" className={btnCls}>
                {editIndex !== null ? 'Simpan perubahan' : 'Tambah soal'}
              </button>
              {editIndex !== null && (
                <button type="button" onClick={() => setEditIndex(null)} className={btnGhostCls}>
                  Batal
                </button>
              )}
            </div>
          </form>

          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-ink-400">
              <tr>
                <th className="py-2">No</th>
                <th className="py-2">Pertanyaan</th>
                <th className="py-2">Jawaban benar</th>
                <th className="py-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-700/60">
              {current.soal.map((s, i) => (
                <tr key={i}>
                  <td className="num py-2">{i + 1}</td>
                  <td className="py-2">{s.pertanyaan}</td>
                  <td className="py-2 text-ink-300">{s.pilihan[s.jawaban] ?? '-'}</td>
                  <td className="space-x-2 py-2 text-right">
                    <button onClick={() => setEditIndex(i)} className={btnGhostCls}>
                      Ubah
                    </button>
                    <button
                      onClick={() => {
                        if (!confirm('Hapus soal ini?')) return
                        deleteSoal(current.id, i)
                        if (editIndex === i) setEditIndex(null)
                      }}
                      className={btnDangerCls}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!current.soal.length && <p className="text-sm text-ink-400">Belum ada soal.</p>}
        </>
      )}
      {!kuis.length && <p className="text-sm text-ink-400">Belum ada kuis. Tambahkan materi terlebih dahulu.</p>}
    </section>
  )
}

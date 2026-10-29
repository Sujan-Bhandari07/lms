'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { I } from './Icon'
import MetricCard from './MetricCard'
import Modal from './Modal'
import StatusBadge, { Status } from './StatusBadge'
import Thumb from './Thumb'
import { Queue, adminActivity, adminStats, queue as seed } from '@/src/lib/admin'

type Action = 'approve' | 'reject' | 'changes'
const COPY: Record<Action, { title: string; body: string; cta: string; note?: string; cls: string; toast: string }> = {
  approve: { title: 'Approve this course?', body: 'The course will be published to the catalog and the instructor will be notified.', cta: 'Approve & publish', cls: 'btn-p', toast: 'approved and published' },
  changes: { title: 'Request changes', body: 'The instructor will be asked to update the course and resubmit it for review.', cta: 'Send request', note: 'What needs to change?', cls: 'btn-p', toast: 'sent back for changes' },
  reject: { title: 'Reject this course?', body: 'The course will not be published. The instructor will see your reason.', cta: 'Reject course', note: 'Reason for rejection', cls: 'btn-p !bg-error !text-white', toast: 'rejected' },
}
const COLS = 'md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_120px_170px_auto]'

function Menu({ onPick }: { onPick: (a: Action) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const c = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', c); document.addEventListener('keydown', k)
    return () => { document.removeEventListener('mousedown', c); document.removeEventListener('keydown', k) }
  }, [open])
  const item = 'flex h-10 w-full cursor-pointer items-center gap-2 rounded-ui px-3 text-left text-sm hover:bg-surface'
  return (
    <div className="relative" ref={ref}>
      <button className="btn btn-s h-9 !px-2.5" aria-haspopup="menu" aria-expanded={open} aria-label="More actions" onClick={() => setOpen(!open)}><I n="more" c="size-4" /></button>
      {open && (
        <div role="menu" className="absolute right-0 z-10 mt-2 w-52 rounded-card border border-line bg-page p-2 shadow-md">
          <button role="menuitem" className={item} onClick={() => { setOpen(false); onPick('changes') }}><I n="refresh" c="size-4" />Request changes</button>
          <div className="my-1 h-px bg-line" />
          <button role="menuitem" className={`${item} text-error`} onClick={() => { setOpen(false); onPick('reject') }}><I n="x" c="size-4" />Reject</button>
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const [rows, setRows] = useState<Queue[]>(seed)
  const [pending, setPending] = useState<{ row: Queue; action: Action } | null>(null)
  const [note, setNote] = useState('')
  const [noteErr, setNoteErr] = useState(false)
  const [toast, setToast] = useState('')
  const copy = pending ? COPY[pending.action] : null

  const close = () => { setPending(null); setNote(''); setNoteErr(false) }
  function confirm() {
    if (!pending) return
    if (copy!.note && !note.trim()) { setNoteErr(true); return }
    const { row, action } = pending
    if (action === 'approve' || action === 'reject') setRows((r) => r.filter((x) => x.id !== row.id))
    else setRows((r) => r.map((x) => (x.id === row.id ? { ...x, status: 'Changes Requested' as Status } : x)))
    setToast(`“${row.title}” ${COPY[action].toast}.`)
    setTimeout(() => setToast(''), 4000)
    close()
  }

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 lg:py-10">
      <p className="over">Admin console</p>
      <h1 className="t-h1 mt-2">Platform overview</h1>
      <p className="mt-2 text-base text-muted">Monitor growth and keep course quality high.</p>

      <section aria-label="Summary" className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {adminStats.map((s, i) => <div key={s.label} className={i === 4 ? 'max-lg:col-span-2 lg:max-xl:col-span-1' : ''}><MetricCard label={s.label} value={i === 4 ? String(rows.length) : s.value} note={s.note} icon={s.icon} accent={i === 4} /></div>)}
      </section>

      <section id="approvals" className="mt-12 scroll-mt-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2"><h2 className="t-h3 !text-[22px] !leading-[30px]">Course approval queue</h2><span className="text-sm text-muted">{rows.length} awaiting action</span></div>
        {rows.length === 0 ? (
          <div className="rounded-card border border-dashed border-line bg-surface px-6 py-14 text-center"><span className="mx-auto grid size-12 place-items-center rounded-full bg-page text-ok"><I n="okc" /></span><h3 className="t-h4 mt-4 !text-lg">You’re all caught up</h3><p className="mt-2 text-sm text-muted">New submissions will appear here for review.</p></div>
        ) : (
          <div role="table" aria-label="Course approval queue" className="card overflow-hidden">
            <div role="row" className={`hidden items-center gap-4 border-b border-line bg-surface px-5 py-3 text-xs font-semibold tracking-[0.08em] text-muted uppercase md:grid ${COLS}`}>
              <span>Course</span><span>Instructor</span><span>Submitted</span><span>Status</span><span className="sr-only">Actions</span>
            </div>
            {rows.map((r) => (
              <div role="row" key={r.id} className={`grid items-center gap-x-4 gap-y-3 border-t border-line px-4 py-4 first:border-t-0 md:px-5 ${COLS}`}>
                <div role="cell" className="flex min-w-0 items-center gap-4"><Thumb i={r.id} icon={r.icon} /><div className="min-w-0"><b className="block truncate text-[15px] leading-6 font-semibold">{r.title}</b><span className="text-[13px] text-muted">{r.category}</span></div></div>
                <div role="cell" className="text-sm"><span className="text-muted md:hidden">Instructor: </span>{r.instructor}</div>
                <div role="cell" className="text-sm text-muted"><span className="md:hidden">Submitted: </span>{r.submitted}</div>
                <div role="cell"><StatusBadge status={r.status} /></div>
                <div role="cell" className="flex flex-wrap items-center gap-2">
                  <Link href="/courses/nestjs-backend-development" className="btn btn-g h-9"><I n="eye" c="size-4" />View</Link>
                  <button className="btn btn-p h-9" onClick={() => setPending({ row: r, action: 'approve' })}><I n="check" c="size-4" />Approve</button>
                  <Menu onPick={(a) => setPending({ row: r, action: a })} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="t-h3 mb-5 !text-[22px] !leading-[30px]">Recent activity</h2>
        <div role="table" aria-label="Recent activity" className="card overflow-hidden">
          <div role="row" className="hidden grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,2fr)_150px] gap-4 border-b border-line bg-surface px-5 py-3 text-xs font-semibold tracking-[0.08em] text-muted uppercase md:grid"><span>Event</span><span>User</span><span>Details</span><span className="text-right">When</span></div>
          {adminActivity.map((a) => (
            <div role="row" key={a.detail + a.when} className="grid gap-1 border-t border-line px-4 py-4 first:border-t-0 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,2fr)_150px] md:items-center md:gap-4 md:px-5">
              <div role="cell" className="flex items-center gap-3 text-sm font-medium"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface text-muted"><I n={a.icon} c="size-4" /></span>{a.event}</div>
              <div role="cell" className="text-sm md:block">{a.who}</div>
              <div role="cell" className="truncate text-sm text-muted">{a.detail}</div>
              <div role="cell" className="text-xs text-muted md:text-right">{a.when}</div>
            </div>
          ))}
        </div>
      </section>

      <Modal open={!!pending} onClose={close} title={copy?.title ?? ''} footer={<><button className="btn btn-s h-11" onClick={close}>Cancel</button><button className={`btn h-11 ${copy?.cls}`} onClick={confirm}>{copy?.cta}</button></>}>
        {pending && <>
          <p><b className="text-ink">{pending.row.title}</b> by {pending.row.instructor}</p>
          <p className="mt-2">{copy!.body}</p>
          {copy!.note && (
            <div className="mt-4">
              <label htmlFor="note" className="mb-2 block text-sm font-medium text-ink">{copy!.note} <span className="text-error">*</span></label>
              <textarea id="note" rows={4} value={note} onChange={(e) => { setNote(e.target.value); setNoteErr(false) }} aria-invalid={noteErr} className={`w-full resize-y rounded-ui border bg-page p-3 text-base text-ink outline-none focus:border-ink focus:ring-2 focus:ring-gold ${noteErr ? 'border-error' : 'border-line'}`} />
              {noteErr && <p role="alert" className="mt-2 flex gap-2 text-[13px] text-error"><I n="alert" c="mt-px size-4" />Add a note so the instructor knows what to do next.</p>}
            </div>
          )}
        </>}
      </Modal>

      {toast && <div role="status" className="fixed bottom-6 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-ui bg-[#111] px-4 py-3 text-sm text-white shadow-lg dark:border dark:border-line"><I n="okc" c="size-5 text-gold" />{toast}</div>}
    </main>
  )
}

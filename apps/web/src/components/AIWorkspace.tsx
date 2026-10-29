'use client'
import Link from 'next/link'
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from 'react'
import Avatar from './Avatar'
import { I } from './Icon'
import { Logo } from './Header'
import { ACTIONS, Msg, aiCourses, answer, history, initialDocs } from '@/src/lib/ai'

const AIMark = ({ size = 'size-8' }: { size?: string }) => <span className={`grid ${size} shrink-0 place-items-center rounded-full bg-btn text-gold`}><I n="spark" c="size-4" /></span>

export default function AIWorkspace() {
  const [convos, setConvos] = useState(history)
  const [active, setActive] = useState('c1')
  const [courseId, setCourseId] = useState('nest')
  const [docs, setDocs] = useState(initialDocs)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [left, setLeft] = useState(false)
  const [right, setRight] = useState(false)
  const [q, setQ] = useState('')
  const [drag, setDrag] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const convo = convos.find((c) => c.id === active)
  const msgs = convo?.msgs ?? []
  const course = aiCourses.find((c) => c.id === courseId)!
  const useDoc = docs.some((d) => d.use && d.status === 'ready')

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs.length, loading])

  const patch = (fn: (m: Msg[]) => Msg[]) => setConvos((cs) => cs.map((c) => (c.id === active ? { ...c, msgs: fn(c.msgs) } : c)))
  function ask(text: string) {
    const t = text.trim()
    if (!t || loading) return
    patch((m) => [...m, { role: 'user', text: t }]); setDraft(''); setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const fail = t.toLowerCase().includes('error') // demo hook for the error state
      patch((m) => [...m, fail ? { role: 'ai', text: 'Something went wrong while searching your materials. Your question wasn’t lost. Please try again.', error: true } : answer(t, courseId, useDoc)])
    }, 1300)
  }
  function retry() { const last = [...msgs].reverse().find((m) => m.role === 'user'); patch((m) => m.filter((x) => !x.error).slice(0, -1)); if (last) setTimeout(() => ask(last.text.replace(/error/gi, '')), 0) }
  function newChat() {
    const id = 'n' + Date.now()
    setConvos((cs) => [{ id, title: 'New chat', group: 'Today', course: courseId, msgs: [] }, ...cs]); setActive(id); setLeft(false)
  }
  function addFiles(files: FileList | null) {
    if (!files) return
    Array.from(files).forEach((f, i) => {
      const id = Date.now() + i
      const okType = /\.(pdf|docx?|txt)$/i.test(f.name)
      setDocs((d) => [{ id, name: f.name, meta: okType ? 'Processing…' : 'Unsupported file type. Use PDF, DOC, DOCX or TXT.', status: okType ? 'processing' : 'error', use: false }, ...d])
      if (okType) setTimeout(() => setDocs((d) => d.map((x) => (x.id === id ? { ...x, status: 'ready', meta: `${Math.max(1, Math.round(f.size / 1024))} KB · ready`, use: true } : x))), 1600)
    })
  }
  const onDrop = (e: DragEvent) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files) }
  const groups = ['Today', 'Yesterday', 'Previous 7 days']
  const shown = convos.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="flex h-dvh flex-col bg-page">
      <header className="z-40 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-page px-3 sm:px-5">
        <button className="grid size-11 cursor-pointer place-items-center rounded-ui hover:bg-surface lg:hidden" onClick={() => setLeft(true)} aria-label="Open conversation history"><I n="panel" /></button>
        <Logo href="/dashboard" />
        <span className="hidden h-6 w-px bg-line sm:block" />
        <span className="hidden items-center gap-2 text-sm font-semibold sm:flex">AI Workspace<span className="bdg bdg-gold">AI</span></span>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/dashboard" className="btn btn-g h-10 max-sm:hidden"><I n="cl" c="s" />Dashboard</Link>
          <button className="btn btn-s h-10 xl:hidden" onClick={() => setRight(true)}><I n="info" c="s" /><span className="max-sm:hidden">Context</span></button>
          <Avatar name="Aarav Khadka" className="size-9 text-xs" ring={false} />
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        {/* History */}
        {left && <div className="fixed inset-x-0 top-16 bottom-0 z-20 bg-[rgba(17,17,17,.48)] lg:hidden" onClick={() => setLeft(false)} />}
        <aside aria-label="Conversation history" className={`fixed top-16 bottom-0 left-0 z-30 flex w-[288px] max-w-[88vw] flex-col border-r border-line bg-surface transition-transform duration-200 ease-ujyalo lg:static lg:z-auto lg:translate-x-0 ${left ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="grid gap-3 p-4">
            <button className="btn btn-p h-11 w-full" onClick={newChat}><I n="plus" c="s" />New chat</button>
            <div className="relative"><I n="search" c="size-4 pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search conversations" placeholder="Search chats" className="h-10 w-full rounded-ui border border-line bg-page pr-3 pl-9 text-sm outline-none focus:border-ink focus:ring-2 focus:ring-gold" /></div>
          </div>
          <nav className="flex-1 overflow-y-auto px-2 pb-4" aria-label="Chats">
            {groups.map((g) => {
              const items = shown.filter((c) => c.group === g)
              return items.length ? (
                <div key={g} className="mb-4"><p className="over px-3 pb-2 !text-muted">{g}</p>
                  {items.map((c) => (
                    <button key={c.id} onClick={() => { setActive(c.id); setCourseId(c.course); setLeft(false) }} aria-current={c.id === active} className={`relative flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-ui px-3 py-2 text-left text-sm ${c.id === active ? 'bg-page font-medium shadow-sm before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-gold' : 'text-muted hover:bg-page/60 hover:text-ink'}`}>
                      <I n="msg" c="size-4" /><span className="min-w-0 flex-1 truncate">{c.title}</span>
                    </button>
                  ))}
                </div>
              ) : null
            })}
            {shown.length === 0 && <p className="px-3 py-6 text-center text-sm text-muted">No chats match “{q}”.</p>}
          </nav>
        </aside>

        {/* Chat */}
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3 sm:px-6">
            <label htmlFor="ctx" className="text-[13px] font-medium text-muted">Course context</label>
            <select id="ctx" value={courseId} onChange={(e) => setCourseId(e.target.value)} className="select-arrow h-10 min-w-0 max-w-full cursor-pointer appearance-none rounded-ui border border-line bg-page pr-9 pl-3 text-sm font-medium outline-none hover:border-[#CFCCC4] focus:border-ink focus:ring-2 focus:ring-gold">
              {aiCourses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            {course.slug && <Link href={`/learn/${course.slug}`} className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">Open course<I n="arrow" c="s" /></Link>}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6" aria-live="polite">
            <div className="mx-auto max-w-[760px]">
              {msgs.length === 0 && !loading ? (
                <div className="py-8 text-center sm:py-14">
                  <span className="mx-auto grid size-14 place-items-center rounded-full bg-btn text-gold"><I n="spark" c="l" /></span>
                  <h1 className="t-h2 mt-5 !text-[26px]">What would you like to study?</h1>
                  <p className="mx-auto mt-2 max-w-[460px] text-muted">Ask about {course.id === 'all' ? 'any of your courses' : course.title} or upload your own materials. I’ll point you to the exact lesson or page.</p>
                  <div className="mx-auto mt-8 grid max-w-[560px] gap-3 text-left sm:grid-cols-2">
                    {ACTIONS.map((a) => <button key={a.label} onClick={() => ask(a.prompt)} className="card lift flex cursor-pointer items-center gap-3 p-4 text-sm font-medium"><span className="grid size-9 place-items-center rounded-ui bg-surface text-gold-deep"><I n={a.icon} c="s" /></span>{a.label}</button>)}
                  </div>
                </div>
              ) : (
                <div className="grid gap-6">
                  {msgs.map((m, i) => m.role === 'user' ? (
                    <div key={i} className="ml-auto max-w-[85%] rounded-xl border border-line bg-page px-4 py-3 text-[15px] leading-6">{m.text}</div>
                  ) : (
                    <div key={i} className="flex gap-3">
                      <AIMark />
                      <div className="min-w-0 max-w-[88%]">
                        <div className={`rounded-xl px-4 py-3 text-[15px] leading-6 whitespace-pre-line ${m.error ? 'border border-error/40 bg-error/10' : 'bg-surface'}`}>
                          {m.error && <I n="alert" c="mr-2 inline size-4 align-[-3px] text-error" />}{m.text}
                          {m.error && <div className="mt-3"><button onClick={retry} className="btn btn-s h-9"><I n="refresh" c="size-4" />Try again</button></div>}
                        </div>
                        {m.sources && (
                          <div className="mt-2 flex flex-wrap items-center gap-1.5"><span className="text-xs text-muted">Sources</span>
                            {m.sources.map((s) => <span key={s.label} className="inline-flex items-center gap-1 rounded-full bg-gold-tint px-2.5 py-0.5 text-xs font-semibold text-gold-deep"><I n={s.kind === 'doc' ? 'doc' : 'play'} c="size-3" />{s.label}</span>)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-3" role="status"><AIMark />
                      <div className="rounded-xl bg-surface px-4 py-3 text-sm text-muted"><span className="mr-3 inline-flex gap-1 align-middle">{[0, 150, 300].map((d) => <i key={d} style={{ animationDelay: `${d}ms` }} className="size-1.5 animate-pulse rounded-full bg-gold" />)}</span>Searching your course materials…</div>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-line px-4 py-4 sm:px-6">
            <div className="mx-auto max-w-[760px]">
              {msgs.length > 0 && <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">{ACTIONS.map((a) => <button key={a.label} onClick={() => ask(a.prompt)} disabled={loading} className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-line px-3.5 text-[13px] font-medium whitespace-nowrap hover:bg-surface disabled:opacity-40"><I n={a.icon} c="size-3.5 text-gold-deep" />{a.label}</button>)}</div>}
              <form onSubmit={(e) => { e.preventDefault(); ask(draft) }} className="flex items-end gap-2 rounded-card border border-line bg-page p-2 focus-within:border-ink focus-within:ring-2 focus-within:ring-gold">
                <button type="button" onClick={() => fileRef.current?.click()} aria-label="Attach a document" className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-ui text-muted hover:bg-surface hover:text-ink"><I n="clip" /></button>
                <textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(draft) } }} rows={1} aria-label="Ask a question" placeholder={`Ask about ${course.id === 'all' ? 'your courses' : course.title}…`} className="max-h-40 min-h-11 flex-1 resize-none bg-transparent py-2.5 text-base outline-none placeholder:text-muted" />
                <button className="btn btn-p size-11 shrink-0 !px-0" disabled={!draft.trim() || loading} aria-label="Send"><I n="send" c="s" /></button>
              </form>
              <p className="mt-2 text-center text-[11px] text-muted">Ujyalo AI is a learning aid and can make mistakes. Check important answers against your lessons.</p>
            </div>
          </div>
        </main>

        {/* Context panel */}
        {right && <div className="fixed inset-x-0 top-16 bottom-0 z-20 bg-[rgba(17,17,17,.48)] xl:hidden" onClick={() => setRight(false)} />}
        <aside aria-label="Context" className={`fixed top-16 right-0 bottom-0 z-30 flex w-[340px] max-w-[92vw] flex-col overflow-y-auto border-l border-line bg-page transition-transform duration-200 ease-ujyalo xl:static xl:z-auto xl:w-[320px] xl:translate-x-0 ${right ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between p-5 pb-0 xl:hidden"><h2 className="t-h4 !text-base">Context</h2><button onClick={() => setRight(false)} aria-label="Close context" className="grid size-10 cursor-pointer place-items-center"><I n="x" /></button></div>
          <section className="p-5">
            <h2 className="over !text-muted">Selected course</h2>
            <div className="card mt-3 p-4">
              <b className="block text-[15px] leading-6 font-semibold">{course.title}</b>
              <p className="mt-1 text-[13px] text-muted">{course.lesson}</p>
              {course.pct > 0 && <><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface"><i className="block h-full rounded-full bg-gold" style={{ width: `${course.pct}%` }} /></div><p className="mt-1.5 text-xs text-muted">{course.pct}% complete</p></>}
              {course.slug && <Link href={`/learn/${course.slug}`} className="btn btn-s mt-4 h-10 w-full">Go to lesson<I n="arrow" c="s" /></Link>}
            </div>
            <p className="mt-3 text-xs leading-[18px] text-muted">The assistant supports your learning. Use the course player to watch lessons and track progress.</p>
          </section>
          <section className="border-t border-line p-5">
            <h2 className="over !text-muted">Documents</h2>
            <div onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)} onDrop={onDrop} className={`mt-3 rounded-card border border-dashed p-5 text-center transition-colors ${drag ? 'border-gold bg-gold-tint' : 'border-line bg-surface'}`}>
              <I n="upload" c="mx-auto text-muted" />
              <p className="mt-2 text-sm font-medium">Drop files here</p>
              <p className="text-xs text-muted">PDF, DOC, DOCX or TXT · up to 20 MB</p>
              <button onClick={() => fileRef.current?.click()} className="btn btn-s mt-3 h-9">Browse files</button>
              <input ref={fileRef} type="file" multiple accept=".pdf,.doc,.docx,.txt" className="sr-only" onChange={(e: ChangeEvent<HTMLInputElement>) => { addFiles(e.target.files); e.target.value = '' }} aria-label="Upload documents" />
            </div>
            <ul className="mt-4 grid gap-2">
              {docs.map((d) => (
                <li key={d.id} className={`flex items-start gap-3 rounded-ui border p-3 ${d.status === 'error' ? 'border-error/40 bg-error/10' : 'border-line'}`}>
                  <I n={d.status === 'error' ? 'alert' : 'doc'} c={`mt-0.5 size-4 ${d.status === 'error' ? 'text-error' : 'text-muted'}`} />
                  <div className="min-w-0 flex-1"><b className="block truncate text-[13px] leading-5 font-medium">{d.name}</b>
                    <span className="flex items-center gap-1.5 text-xs text-muted">{d.status === 'processing' && <i className="size-3 animate-spin rounded-full border-2 border-line border-t-gold" />}{d.meta}</span>
                    {d.status === 'ready' && <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs"><input type="checkbox" checked={d.use} onChange={() => setDocs((x) => x.map((y) => (y.id === d.id ? { ...y, use: !y.use } : y)))} className="size-4 accent-btn" />Use in answers</label>}
                  </div>
                  <button aria-label={`Remove ${d.name}`} onClick={() => setDocs((x) => x.filter((y) => y.id !== d.id))} className="grid size-8 shrink-0 cursor-pointer place-items-center text-muted hover:text-ink"><I n="x" c="size-4" /></button>
                </li>
              ))}
              {docs.length === 0 && <li className="py-3 text-center text-sm text-muted">No documents yet.</li>}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}

'use client'
import Link from 'next/link'
import { KeyboardEvent, useEffect, useRef, useState } from 'react'
import Avatar from './Avatar'
import { I } from './Icon'
import { ChatMsg, Thread, instructorThreads, studentThreads } from '@/src/lib/messages'

export default function Messenger({ role }: { role: 'student' | 'instructor' }) {
  const [threads, setThreads] = useState<Thread[]>(role === 'student' ? studentThreads : instructorThreads)
  const [activeId, setActiveId] = useState<string | null>(threads[0].id)
  const [view, setView] = useState<'list' | 'thread'>('list') // mobile only
  const [q, setQ] = useState('')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [draft, setDraft] = useState('')
  const [file, setFile] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const t = threads.find((x) => x.id === activeId) ?? null
  const unreadTotal = threads.reduce((a, x) => a + x.unread, 0)
  const list = threads.filter((x) => (!unreadOnly || x.unread) && `${x.name} ${x.course}`.toLowerCase().includes(q.toLowerCase()))
  const preview = (x: Thread) => (x.msgs.length ? `${x.msgs[x.msgs.length - 1].from === 'me' ? 'You: ' : ''}${x.msgs[x.msgs.length - 1].file ? '📎 ' + x.msgs[x.msgs.length - 1].file!.split(' · ')[0] : x.msgs[x.msgs.length - 1].text}` : 'No messages yet')

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }) }, [activeId, t?.msgs.length, view])

  const open = (id: string) => { setActiveId(id); setView('thread'); setThreads((ts) => ts.map((x) => (x.id === id ? { ...x, unread: 0 } : x))) }
  function send() {
    if (!t || (!draft.trim() && !file)) return
    const m: ChatMsg = { from: 'me', day: 'Today', at: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), text: draft.trim() || 'Sent an attachment.', file: file ?? undefined }
    setThreads((ts) => ts.map((x) => (x.id === t.id ? { ...x, msgs: [...x.msgs, m], when: m.at } : x)))
    setDraft(''); setFile(null)
  }
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }
  const courseHref = t ? (role === 'student' ? `/learn/${t.slug}` : `/courses/${t.slug}`) : '#'

  return (
    <main className="grid h-[calc(100dvh-4rem)] md:h-dvh md:grid-cols-[340px_minmax(0,1fr)]">
      {/* Conversation list */}
      <section aria-label="Conversations" className={`min-h-0 flex-col border-r border-line bg-page md:flex ${view === 'list' ? 'flex' : 'hidden'}`}>
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between"><h1 className="t-h3 !text-[22px]">Messages</h1>{unreadTotal > 0 && <span className="bdg bdg-dark">{unreadTotal} unread</span>}</div>
          <div className="relative mt-4"><I n="search" c="size-4 pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} type="search" aria-label="Search conversations" placeholder={role === 'student' ? 'Search instructors or courses' : 'Search students or courses'} className="h-11 w-full rounded-ui border border-line bg-page pr-3 pl-10 text-sm outline-none hover:border-[#CFCCC4] focus:border-ink focus:ring-2 focus:ring-gold" /></div>
          <div className="mt-3 flex gap-2" role="group" aria-label="Filter">
            {[['All', false], ['Unread', true]].map(([l, v]) => <button key={l as string} aria-pressed={unreadOnly === v} onClick={() => setUnreadOnly(v as boolean)} className={`h-8 cursor-pointer rounded-full border px-3.5 text-[13px] font-medium ${unreadOnly === v ? 'border-ink bg-btn text-btn-fg' : 'border-line text-muted hover:text-ink'}`}>{l as string}</button>)}
          </div>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto border-t border-line">
          {list.map((x) => (
            <li key={x.id}>
              <button onClick={() => open(x.id)} aria-current={x.id === activeId} className={`relative flex w-full cursor-pointer items-start gap-3 border-b border-line px-4 py-4 text-left transition-colors ${x.id === activeId ? 'bg-surface md:before:absolute md:before:inset-y-0 md:before:left-0 md:before:w-[3px] md:before:bg-gold' : 'hover:bg-surface/60'}`}>
                <Avatar name={x.name} ring={false} className="size-11 text-sm" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2"><b className={`truncate text-[15px] leading-6 ${x.unread ? 'font-semibold' : 'font-medium'}`}>{x.name}</b><span className="shrink-0 text-xs text-muted">{x.when}</span></span>
                  <span className="mt-0.5 block truncate text-xs font-medium text-gold-deep">{x.course}</span>
                  <span className="mt-1 flex items-center gap-2"><span className={`block min-w-0 flex-1 truncate text-[13px] ${x.unread ? 'font-medium text-ink' : 'text-muted'}`}>{preview(x)}</span>
                    {x.unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-btn px-1.5 text-[11px] font-semibold text-btn-fg" aria-label={`${x.unread} unread`}>{x.unread}</span>}</span>
                </span>
              </button>
            </li>
          ))}
          {list.length === 0 && (
            <li className="px-6 py-14 text-center"><span className="mx-auto grid size-12 place-items-center rounded-full bg-surface text-muted"><I n="search" /></span><h2 className="t-h4 mt-4 !text-base">No conversations found</h2><p className="mt-1 text-sm text-muted">{unreadOnly ? 'You’re all caught up.' : 'Try a different name or course.'}</p></li>
          )}
        </ul>
      </section>

      {/* Thread */}
      <section aria-label="Conversation" className={`min-h-0 min-w-0 flex-col bg-page md:flex ${view === 'thread' ? 'flex' : 'hidden'}`}>
        {!t ? (
          <div className="m-auto max-w-[360px] p-8 text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-surface text-muted"><I n="msg" c="l" /></span><h2 className="t-h3 mt-5">Select a conversation</h2><p className="mt-2 text-muted">Choose a conversation to read messages about your courses.</p></div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-line px-3 py-3 sm:px-5">
              <button className="grid size-11 cursor-pointer place-items-center rounded-ui hover:bg-surface md:hidden" onClick={() => setView('list')} aria-label="Back to conversations"><I n="cl" /></button>
              <Avatar name={t.name} ring={false} className="size-10 text-sm" />
              <div className="min-w-0 flex-1"><b className="block truncate text-[15px] leading-5 font-semibold">{t.name}</b><span className="text-xs text-muted">{t.role}</span></div>
              <Link href={courseHref} className="hidden max-w-[320px] items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] hover:bg-line/50 sm:inline-flex"><I n="bookopen" c="size-4 shrink-0 text-gold-deep" /><span className="truncate">{t.course}</span></Link>
            </header>
            <div className="border-b border-line bg-surface px-4 py-2.5 text-[13px] sm:hidden"><Link href={courseHref} className="flex items-center gap-2"><I n="bookopen" c="size-4 shrink-0 text-gold-deep" /><span className="truncate font-medium">{t.course}</span><I n="cr" c="size-4 ml-auto shrink-0 text-muted" /></Link></div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6" aria-live="polite">
              {t.msgs.length === 0 ? (
                <div className="m-auto max-w-[380px] py-16 text-center"><Avatar name={t.name} className="mx-auto size-16 text-lg" /><h2 className="t-h4 mt-5">Start the conversation</h2><p className="mt-2 text-sm text-muted">Ask {t.name.split(' ')[0]} a question about <b className="text-ink">{t.course}</b>. Replies usually arrive within one business day.</p></div>
              ) : (
                <div className="mx-auto grid max-w-[760px] gap-3">
                  {t.lesson && <p className="mx-auto mb-2 inline-flex items-center gap-2 rounded-full bg-gold-tint px-3 py-1 text-xs font-semibold text-gold-deep"><I n="play" c="size-3" />{t.lesson}</p>}
                  {t.msgs.map((m, i) => (
                    <div key={i} className="grid gap-3">
                      {(i === 0 || t.msgs[i - 1].day !== m.day) && <p className="my-2 text-center text-xs font-medium text-muted">{m.day}</p>}
                      <div className={`flex flex-col ${m.from === 'me' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] rounded-xl px-4 py-3 text-[15px] leading-6 sm:max-w-[75%] ${m.from === 'me' ? 'bg-btn text-btn-fg' : 'bg-surface'}`}>
                          {m.text}
                          {m.file && <div className={`mt-2 flex items-center gap-2 rounded-ui border px-3 py-2 text-[13px] ${m.from === 'me' ? 'border-white/25' : 'border-line bg-page'}`}><I n="doc" c="size-4 shrink-0" /><span className="truncate">{m.file}</span></div>}
                        </div>
                        <span className="mt-1 text-[11px] text-muted">{m.at}</span>
                      </div>
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>
              )}
            </div>

            <div className="border-t border-line px-3 py-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] sm:px-5">
              <div className="mx-auto max-w-[760px]">
                {file && <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1 pr-1 pl-3 text-[13px]"><I n="doc" c="size-4" />{file}<button onClick={() => setFile(null)} aria-label="Remove attachment" className="grid size-7 cursor-pointer place-items-center text-muted hover:text-ink"><I n="x" c="size-4" /></button></div>}
                <div className="flex items-end gap-2 rounded-card border border-line bg-page p-2 focus-within:border-ink focus-within:ring-2 focus-within:ring-gold">
                  <button type="button" onClick={() => fileRef.current?.click()} aria-label="Attach a file" className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-ui text-muted hover:bg-surface hover:text-ink"><I n="clip" /></button>
                  <input ref={fileRef} type="file" className="sr-only" aria-label="Attach file" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(`${f.name} · ${Math.max(1, Math.round(f.size / 1024))} KB`); e.target.value = '' }} />
                  <textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={onKey} rows={1} aria-label={`Message ${t.name}`} placeholder={`Message ${t.name.split(' ')[0]}…`} className="max-h-36 min-h-11 flex-1 resize-none bg-transparent py-2.5 text-base outline-none placeholder:text-muted" />
                  <button onClick={send} disabled={!draft.trim() && !file} className="btn btn-p size-11 shrink-0 !px-0" aria-label="Send message"><I n="send" c="s" /></button>
                </div>
                <p className="mt-2 text-[11px] text-muted">Messages are about your course. For live help, use the lesson Q&amp;A or the AI Workspace.</p>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  )
}

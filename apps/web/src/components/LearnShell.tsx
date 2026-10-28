'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import Avatar from './Avatar'
import { I } from './Icon'
import { Logo } from './Header'
import { Course, curriculum, fmtDur } from '@/src/lib/courses'
import { COMPLETED, START, clock, courseMaterials, flat, overview, qa, resourcesFor, seedNotes } from '@/src/lib/learning'

const TABS = ['Overview', 'Notes', 'Resources', 'Q&A'] as const
type Tab = (typeof TABS)[number]
const SPEEDS = [1, 1.25, 1.5, 2]
const SUGGEST = ['Summarize this lesson', 'Explain guards vs. interceptors', 'Quiz me on this lesson']
const NAME = 'Aarav Khadka'

function Status({ state }: { state: 'done' | 'current' | 'todo' }) {
  if (state === 'done') return <span className="grid size-5 shrink-0 place-items-center rounded-full bg-btn text-btn-fg"><I n="check" c="size-3" /></span>
  if (state === 'current') return <span className="grid size-5 shrink-0 place-items-center rounded-full border-2 border-gold"><i className="size-1.5 rounded-full bg-gold" /></span>
  return <span className="size-5 shrink-0 rounded-full border border-line bg-page" />
}

export default function LearnShell({ course }: { course: Course }) {
  const [cur, setCur] = useState(START)
  const [done, setDone] = useState(new Set(COMPLETED))
  const [openSec, setOpenSec] = useState(() => curriculum.map((_, i) => i === flat[START].si))
  const [side, setSide] = useState(false)
  const [ai, setAi] = useState(false)
  const [tab, setTab] = useState<Tab>('Overview')
  const [playing, setPlaying] = useState(false)
  const [pos, setPos] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [cc, setCc] = useState(true)
  const [notes, setNotes] = useState(seedNotes)
  const [noteText, setNoteText] = useState('')
  const [msgs, setMsgs] = useState<{ from: 'ai' | 'me'; text: string; refs?: string[] }[]>([
    { from: 'ai', text: 'Hi Aarav! I can answer questions about this course and point you to the exact lesson moment. What would you like to know?' },
  ])
  const [draft, setDraft] = useState('')
  const barRef = useRef<HTMLDivElement>(null)
  const lesson = flat[cur]
  const total = lesson.min * 60
  const pct = Math.round((done.size / flat.length) * 100)
  const isDone = done.has(cur)
  const ov = overview(lesson.title)

  useEffect(() => { if (window.innerWidth >= 1024) setSide(true) }, [])
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setPos((p) => { if (p >= 100) { setPlaying(false); return 100 } return Math.min(100, p + 0.35 * speed) }), 250)
    return () => clearInterval(id)
  }, [playing, speed])

  const go = (i: number) => {
    if (i < 0 || i >= flat.length) return
    setCur(i); setPos(0); setPlaying(false)
    setOpenSec((o) => o.map((v, j) => (j === flat[i].si ? true : v)))
    if (window.innerWidth < 1024) setSide(false)
  }
  const complete = () => setDone((d) => { const n = new Set(d); n.has(cur) ? n.delete(cur) : n.add(cur); return n })
  const seek = (ratio: number) => setPos(Math.max(0, Math.min(100, ratio * 100)))
  const addNote = () => { if (noteText.trim()) { setNotes([{ t: Math.round((pos / 100) * total), text: noteText.trim() }, ...notes]); setNoteText('') } }
  const send = (text: string) => {
    if (!text.trim()) return
    setMsgs((m) => [...m, { from: 'me', text }]); setDraft('')
    setTimeout(() => setMsgs((m) => [...m, { from: 'ai', text: 'Guards decide whether a request may continue (for example, checking a JWT and role). Interceptors wrap the handler to transform what goes in or out. Guards always run first.', refs: ['Lesson 17 · 04:12', 'Lesson 11 · 12:40'] }]), 600)
  }
  const tabBtn = (t: Tab) => `-mb-px cursor-pointer border-b-2 py-3.5 text-sm leading-[22px] font-medium whitespace-nowrap transition-colors ${tab === t ? 'border-gold text-ink' : 'border-transparent text-muted hover:text-ink'}`


  return (
    <div className="flex h-dvh flex-col bg-page">
      {/* Top bar */}
      <header className="z-40 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-page px-3 sm:gap-4 sm:px-5">
        <button className="grid size-11 cursor-pointer place-items-center rounded-ui hover:bg-surface" onClick={() => setSide(!side)} aria-label={side ? 'Hide curriculum' : 'Show curriculum'} aria-expanded={side}><I n="panel" /></button>
        <Logo href="/dashboard" />
        <span className="hidden h-6 w-px bg-line md:block" />
        <Link href={`/courses/${course.slug}`} className="hidden min-w-0 flex-1 truncate text-sm font-medium md:block">{course.title}</Link>
        <div className="ml-auto flex items-center gap-3 sm:gap-4 md:ml-0">
          <div className="hidden items-center gap-3 sm:flex" title={`${done.size} of ${flat.length} lessons complete`}>
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-surface"><i className="block h-full rounded-full bg-gold transition-[width] duration-300" style={{ width: `${pct}%` }} /></div>
            <span className="text-sm font-semibold tabular-nums">{pct}%</span>
          </div>
          <button className={`btn h-10 ${ai ? 'btn-p' : 'btn-s'}`} onClick={() => setAi(!ai)} aria-pressed={ai}><I n="spark" c={`size-4 ${ai ? 'text-gold' : 'text-gold-deep'}`} /><span className="max-sm:hidden">AI Assistant</span></button>
          <Avatar name={NAME} className="size-9 text-xs" ring={false} />
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        {/* Curriculum sidebar */}
        {side && <div className="fixed inset-x-0 top-16 bottom-0 z-20 bg-[rgba(17,17,17,.48)] lg:hidden" onClick={() => setSide(false)} />}
        <aside aria-label="Course curriculum" className={`fixed top-16 bottom-0 left-0 z-30 flex w-[340px] max-w-[88vw] flex-col border-r border-line bg-surface transition-transform duration-200 ease-ujyalo lg:static lg:z-auto lg:max-w-none lg:shrink-0 ${side ? 'translate-x-0' : '-translate-x-full lg:hidden'}`}>
          <div className="border-b border-line p-5">
            <h2 className="t-h4 !text-base">Course content</h2>
            <p className="mt-1 text-[13px] text-muted">{done.size} of {flat.length} lessons · {fmtDur(flat.reduce((a, l) => a + l.min, 0))}</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line"><i className="block h-full rounded-full bg-gold" style={{ width: `${pct}%` }} /></div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {curriculum.map((s, si) => {
              const ls = flat.filter((l) => l.si === si)
              const dn = ls.filter((l) => done.has(l.no - 1)).length
              return (
                <div key={s.title} className="border-b border-line">
                  <button className="flex w-full cursor-pointer items-start gap-3 px-5 py-4 text-left hover:bg-line/40" aria-expanded={openSec[si]} onClick={() => setOpenSec(openSec.map((v, j) => (j === si ? !v : v)))}>
                    <span className="min-w-0 flex-1"><span className="block text-sm leading-5 font-semibold">Section {si + 1}: {s.title}</span><span className="mt-1 block text-xs text-muted">{dn}/{ls.length} complete · {fmtDur(ls.reduce((a, l) => a + l.min, 0))}</span></span>
                    <I n="chev" c={`mt-0.5 size-4 text-muted transition-transform ${openSec[si] ? 'rotate-180' : ''}`} />
                  </button>
                  {openSec[si] && (
                    <ul className="pb-2">
                      {ls.map((l) => {
                        const i = l.no - 1
                        const state = done.has(i) ? 'done' : i === cur ? 'current' : 'todo'
                        return (
                          <li key={l.no}>
                            <button onClick={() => go(i)} aria-current={i === cur ? 'true' : undefined}
                              className={`relative flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left text-sm leading-5 transition-colors ${i === cur ? 'bg-page before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-gold' : 'hover:bg-line/40'}`}>
                              <Status state={state} />
                              <span className="min-w-0 flex-1"><span className={`block ${i === cur ? 'font-semibold' : state === 'todo' ? 'text-muted' : ''}`}>{l.no}. {l.title}</span>
                                <span className="mt-0.5 flex items-center gap-1 text-xs text-muted"><I n="vid" c="size-3" />{l.min} min</span></span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </aside>

        {/* Main */}
        <main className={`min-w-0 flex-1 overflow-y-auto transition-[margin] duration-200 ${ai ? 'xl:mr-[360px]' : ''}`}>
          <div className="mx-auto max-w-[1100px] px-4 py-5 sm:px-8 sm:py-8">
            {/* Player */}
            <div className="overflow-hidden rounded-card bg-[#161616] text-white">
              <div className="relative grid aspect-video place-items-center">
                <svg className="absolute inset-0 size-full text-white"><rect width="100%" height="100%" fill="url(#dots)" opacity=".5" /></svg>
                {!playing && (
                  <button onClick={() => setPlaying(true)} aria-label="Play lesson" className="relative grid size-20 cursor-pointer place-items-center rounded-full bg-white text-[#111] transition-transform duration-200 ease-ujyalo hover:scale-105"><I n="tri" c="l" /></button>
                )}
                <p className="absolute inset-x-0 top-4 px-4 text-center text-xs tracking-[0.08em] text-white/60 uppercase">Lesson {lesson.no} · {lesson.min} min</p>
                {cc && playing && <p className="absolute inset-x-6 bottom-20 mx-auto max-w-[560px] rounded-ui bg-black/70 px-3 py-1.5 text-center text-sm">Guards implement CanActivate and return true or false.</p>}
              </div>
              <div className="flex flex-col gap-2 bg-[rgba(17,17,17,.8)] px-4 pt-2 pb-3">
                <div ref={barRef} role="slider" tabIndex={0} aria-label="Seek" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pos)} className="group relative h-4 cursor-pointer py-1.5"
                  onClick={(e) => { const r = barRef.current!.getBoundingClientRect(); seek((e.clientX - r.left) / r.width) }}
                  onKeyDown={(e) => { if (e.key === 'ArrowRight') seek((pos + 5) / 100); if (e.key === 'ArrowLeft') seek((pos - 5) / 100) }}>
                  <div className="h-1 rounded-full bg-white/25 transition-[height] group-hover:h-1.5"><i className="relative block h-full rounded-full bg-gold" style={{ width: `${pos}%` }}><b className="absolute top-1/2 right-0 size-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-gold" /></i></div>
                </div>
                <div className="flex items-center gap-1 text-sm sm:gap-2">
                  <button className="grid size-10 cursor-pointer place-items-center rounded-ui hover:bg-white/10" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause' : 'Play'}><I n={playing ? 'pause' : 'tri'} /></button>
                  <button className="grid size-10 cursor-pointer place-items-center rounded-ui hover:bg-white/10 max-sm:hidden" aria-label="Volume"><I n="vol" /></button>
                  <span className="px-1 text-[13px] tabular-nums text-white/80">{clock((pos / 100) * total)} / {clock(total)}</span>
                  <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
                    <button className="h-10 min-w-10 cursor-pointer rounded-ui px-2 text-[13px] font-semibold hover:bg-white/10" onClick={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])} aria-label={`Playback speed ${speed}x`}>{speed}×</button>
                    <button className={`grid size-10 cursor-pointer place-items-center rounded-ui hover:bg-white/10 ${cc ? 'text-gold' : ''}`} onClick={() => setCc(!cc)} aria-pressed={cc} aria-label="Captions"><I n="cc" /></button>
                    <button className="h-10 cursor-pointer rounded-ui px-2 text-[13px] font-semibold hover:bg-white/10 max-sm:hidden" aria-label="Quality 1080p">1080p</button>
                    <button className="grid size-10 cursor-pointer place-items-center rounded-ui hover:bg-white/10" onClick={() => setTab('Notes')} aria-label="Open notes"><I n="doc" /></button>
                    <button className="grid size-10 cursor-pointer place-items-center rounded-ui hover:bg-white/10" aria-label="Fullscreen"><I n="max" /></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Title + actions */}
            <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="over">Section {lesson.si + 1} · Lesson {lesson.no} of {flat.length}</p>
                <h1 className="t-h2 mt-2 !text-2xl !leading-8 sm:!text-[28px] sm:!leading-9">{lesson.title}</h1>
              </div>
              <button className={`btn btn-lg shrink-0 ${isDone ? 'btn-s' : 'btn-p'}`} onClick={complete} aria-pressed={isDone}>
                <I n={isDone ? 'okc' : 'check'} c={isDone ? 'size-5 text-ok' : 'size-5'} />{isDone ? 'Completed' : 'Mark as Complete'}
              </button>
            </div>
            <div className="mt-4 flex gap-3 border-b border-line pb-6 max-sm:*:flex-1">
              <button className="btn btn-s h-11" disabled={cur === 0} onClick={() => go(cur - 1)}><I n="cl" c="s" />Previous Lesson</button>
              <button className={`btn h-11 ${isDone ? 'btn-p' : 'btn-s'}`} disabled={cur === flat.length - 1} onClick={() => go(cur + 1)}>Next Lesson<I n="cr" c="s" /></button>
            </div>

            {/* Tabs */}
            <div role="tablist" aria-label="Lesson details" className="mt-2 flex gap-8 overflow-x-auto border-b border-line [scrollbar-width:none]">
              {TABS.map((t) => <button key={t} role="tab" id={`tab-${t}`} aria-selected={tab === t} aria-controls="panel" className={tabBtn(t)} onClick={() => setTab(t)}>{t}{t === 'Notes' && notes.length ? <span className="ml-1.5 text-xs text-muted">{notes.length}</span> : null}</button>)}
            </div>
            <div id="panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="py-8">
              {tab === 'Overview' && (
                <div className="max-w-[720px]">
                  <h2 className="t-h4">About this lesson</h2>
                  <p className="mt-3 text-muted">{ov.text}</p>
                  <h3 className="t-h4 mt-8 !text-base">In this lesson you’ll</h3>
                  <ul className="mt-3 grid gap-3">{ov.points.map((p) => <li key={p} className="flex gap-3 text-[15px] leading-6"><I n="check" c="mt-0.5 text-gold-deep" />{p}</li>)}</ul>
                  {cur < flat.length - 1 && (
                    <button onClick={() => go(cur + 1)} className="card lift mt-8 flex w-full cursor-pointer items-center gap-4 p-4 text-left">
                      <span className="grid size-10 place-items-center rounded-full bg-surface"><I n="play" /></span>
                      <span className="min-w-0 flex-1"><span className="over block !text-muted">Up next</span><span className="block truncate text-[15px] font-medium">{flat[cur + 1].no}. {flat[cur + 1].title}</span></span>
                      <span className="text-[13px] text-muted">{flat[cur + 1].min} min</span>
                    </button>
                  )}
                </div>
              )}
              {tab === 'Notes' && (
                <div className="max-w-[720px]">
                  <label htmlFor="note" className="mb-2 block text-sm font-medium">Add a note at {clock((pos / 100) * total)}</label>
                  <textarea id="note" value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={3} placeholder="Write something you want to remember…" className="w-full resize-y rounded-ui border border-line bg-page p-4 text-base outline-none hover:border-[#CFCCC4] focus:border-ink focus:ring-2 focus:ring-gold" />
                  <button className="btn btn-p mt-3" onClick={addNote} disabled={!noteText.trim()}><I n="plus" c="s" />Save note</button>
                  <ul className="mt-8 grid gap-4">
                    {notes.map((nt, i) => (
                      <li key={i} className="flex gap-4 rounded-card border border-line p-4">
                        <button className="h-6 shrink-0 cursor-pointer rounded-full bg-gold-tint px-2.5 text-xs font-semibold text-gold-deep" onClick={() => seek(nt.t / total)} aria-label={`Jump to ${clock(nt.t)}`}>{clock(nt.t)}</button>
                        <p className="text-[15px] leading-6">{nt.text}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tab === 'Resources' && (
                <div className="grid max-w-[720px] gap-8">
                  {[['Lesson resources', resourcesFor(lesson.title)], ['Course materials', courseMaterials]].map(([h, files]) => (
                    <div key={h as string}>
                      <h2 className="t-h4 mb-4 !text-base">{h as string}</h2>
                      <ul className="overflow-hidden rounded-card border border-line">
                        {(files as ReturnType<typeof resourcesFor>).map((f) => (
                          <li key={f.name} className="flex items-center gap-4 border-t border-line p-4 first:border-t-0">
                            <span className="grid size-10 shrink-0 place-items-center rounded-ui bg-surface"><I n="doc" /></span>
                            <span className="min-w-0 flex-1"><span className="block truncate text-[15px] font-medium">{f.name}</span><span className="text-[13px] text-muted">{f.kind} · {f.size}</span></span>
                            <a href="#" download className="btn btn-s h-10" aria-label={`Download ${f.name}`}><I n="dl" c="s" /><span className="max-sm:hidden">Download</span></a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              {tab === 'Q&A' && (
                <div className="max-w-[720px]">
                  <label htmlFor="q" className="mb-2 block text-sm font-medium">Ask a question about this lesson</label>
                  <div className="flex gap-3 max-sm:flex-col"><input id="q" placeholder="What are you stuck on?" className="h-12 flex-1 rounded-ui border border-line bg-page px-4 outline-none hover:border-[#CFCCC4] focus:border-ink focus:ring-2 focus:ring-gold" /><button className="btn btn-p h-12">Post question</button></div>
                  <p className="mt-2 text-[13px] text-muted">Instructors and the community reply when they can. For instant help, try the AI Assistant.</p>
                  <ul className="mt-8">
                    {qa.map((x) => (
                      <li key={x.q} className="border-t border-line py-6 first:border-t-0 first:pt-0">
                        <h3 className="text-base leading-6 font-semibold">{x.q}</h3>
                        <p className="mt-1 text-[13px] text-muted">{x.by} · {x.when} · {x.votes} found this helpful</p>
                        {x.a ? <div className="mt-4 rounded-card bg-surface p-4"><p className="text-[15px] leading-6">{x.a}</p><p className="mt-2 text-[13px] font-medium text-gold-deep">{x.who}</p></div> : <p className="mt-3 text-[13px] text-muted">No answers yet.</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* AI assistant panel */}
        {ai && <div className="fixed inset-x-0 top-16 bottom-0 z-30 bg-[rgba(17,17,17,.48)] xl:hidden" onClick={() => setAi(false)} />}
        <aside aria-label="AI course assistant" className={`fixed top-16 right-0 bottom-0 z-40 flex w-[360px] max-w-full flex-col border-l border-line bg-page shadow-lg transition-transform duration-200 ease-ujyalo xl:shadow-none ${ai ? 'visible translate-x-0' : 'invisible translate-x-full'}`}>
          <div className="flex items-center gap-3 border-b border-line p-4">
            <span className="grid size-9 place-items-center rounded-full bg-btn text-gold"><I n="spark" c="s" /></span>
            <div className="min-w-0 flex-1"><b className="flex items-center gap-2 text-[15px] font-semibold">Ujyalo AI <span className="bdg bdg-gold">AI</span></b><span className="block truncate text-xs text-muted">Answers from this course · Lesson {lesson.no}</span></div>
            <button className="grid size-10 cursor-pointer place-items-center rounded-ui text-muted hover:bg-surface" onClick={() => setAi(false)} aria-label="Close assistant"><I n="x" /></button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={`max-w-[90%] rounded-xl px-4 py-3 text-sm leading-[22px] ${m.from === 'me' ? 'ml-auto border border-line bg-page' : 'bg-surface'}`}>
                {m.text}
                {m.refs && <div className="mt-2 flex flex-wrap gap-1.5">{m.refs.map((r) => <span key={r} className="inline-flex items-center gap-1 rounded-full bg-gold-tint px-2.5 py-0.5 text-xs font-semibold text-gold-deep"><I n="play" c="size-3" />{r}</span>)}</div>}
              </div>
            ))}
          </div>
          <div className="border-t border-line p-4">
            <div className="mb-3 flex flex-wrap gap-2">{SUGGEST.map((s) => <button key={s} onClick={() => send(s)} className="cursor-pointer rounded-full border border-line px-3 py-1 text-xs font-medium hover:bg-surface">{s}</button>)}</div>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); send(draft) }}>
              <input value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Ask the AI assistant" placeholder="Ask about this course…" className="h-11 min-w-0 flex-1 rounded-ui border border-line bg-page px-3.5 text-sm outline-none focus:border-ink focus:ring-2 focus:ring-gold" />
              <button className="btn btn-p size-11 !px-0" aria-label="Send"><I n="send" c="s" /></button>
            </form>
            <p className="mt-2 text-[11px] text-muted">AI can make mistakes. It’s a learning aid, not a tutor.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

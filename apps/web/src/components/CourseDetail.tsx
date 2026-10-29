'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Avatar from './Avatar'
import { I, Stars } from './Icon'
import { Content, Course, curriculum, fmtDur, reviews } from '@/src/lib/courses'
import { formatNpr } from '@/src/lib/currency'

const BARS: [number, number][] = [[5, 84], [4, 13], [3, 2], [2, 1], [1, 0]]
const TABS: [string, string][] = [['overview', 'Overview'], ['curriculum', 'Curriculum'], ['instructor', 'Instructor'], ['reviews', 'Reviews']]
const SEC = 'pt-12 sm:pt-14'
const H2 = 't-h2 mb-6 !text-2xl !leading-8 sm:!text-[28px] sm:!leading-9'

export default function CourseDetail({ c, content }: { c: Course; content: Content }) {
  const [enrolled, setEnrolled] = useState(false)
  const [modal, setModal] = useState(false)
  const [saved, setSaved] = useState(false)
  const [revs, setRevs] = useState(3)
  const [open, setOpen] = useState<boolean[]>(curriculum.map((_, i) => i === 0))
  const allOpen = open.every(Boolean)
  const lessons = curriculum.reduce((a, s) => a + s.lessons.length, 0)
  const total = curriculum.reduce((a, s) => a + s.lessons.reduce((x, l) => x + l[1], 0), 0)
  const off = c.was ? Math.round((1 - c.price / c.was) * 100) : 0
  const title = c.id === 'nestjs-backend-development' ? 'NestJS Backend Development: Build Production-Ready APIs' : c.title
  const price = c.price ? formatNpr(c.price) : 'Free'

  useEffect(() => {
    if (!modal) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setModal(false)
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [modal])

  /** The single gold accent per page: Enroll Now. Turns into "Go to Course" once enrolled. */
  const cta = (cls: string) => enrolled
    ? <Link className={`btn btn-p ${cls}`} href={`/learn/${c.id}`}>Go to Course</Link>
    : <button className={`btn btn-a ${cls}`} onClick={() => setModal(true)}>Enroll Now</button>

  return (
    <>
      <main>
        <div className="wrap grid pt-8 pb-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-x-10 lg:pt-10 xl:grid-cols-[minmax(0,1fr)_384px] xl:gap-x-16">
          {/* ---- Header block ---- */}
          <div className="lg:col-start-1 lg:row-start-1">
            <nav className="mb-6 flex flex-wrap gap-2 text-[13px] text-muted" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-ink">Home</Link>/<Link href="/courses" className="hover:text-ink">Explore Courses</Link>/<Link href="/courses" className="hover:text-ink">{c.category}</Link>/<span className="text-ink">{c.title}</span>
            </nav>
            <span className="over">{c.category}</span>
            <div className="mt-3 mb-5 flex flex-wrap gap-2">{c.badge && <span className="bdg bdg-gold">{c.badge}</span>}<span className="bdg bdg-out">{c.level}</span></div>
            <h1 className="t-h1">{title}</h1>
            <p className="mt-4 max-w-[680px] text-base leading-[26px] text-muted sm:text-lg sm:leading-[30px]">{content.subtitle}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-muted">
              <span className="inline-flex items-center gap-2"><b className="font-semibold text-ink">{c.rating.toFixed(1)}</b><Stars />(2,184 ratings)</span>
              <span className="inline-flex items-center gap-2"><I n="users" c="s" /><b className="font-semibold text-ink">{c.students.toLocaleString('en-US')}</b> students enrolled</span>
              <span className="inline-flex items-center gap-2"><I n="globe" c="s" />English</span>
              <span className="inline-flex items-center gap-2"><I n="clock" c="s" />Updated September 2026</span>
            </div>
            <div className="mt-6 flex items-center gap-3 border-t border-line pt-6">
              <Avatar name={c.instructor} />
              <div><small className="block text-xs leading-4 text-muted">Created by</small><b className="text-[15px] font-semibold">{c.instructor}</b></div>
            </div>
            <nav className="mt-10 flex gap-8 overflow-x-auto border-b border-line [scrollbar-width:none]" aria-label="Page sections">
              {TABS.map(([id, l], i) => <a key={id} href={`#${id}`} className={`-mb-px border-b-2 py-3.5 text-sm leading-[22px] font-medium whitespace-nowrap hover:text-ink ${i === 0 ? 'border-gold text-ink' : 'border-transparent text-muted'}`}>{l}</a>)}
            </nav>
          </div>

          {/* ---- Enrollment card ---- */}
          <aside aria-label="Enrollment" className="mt-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:sticky lg:top-24 lg:self-start">
            <div className="card max-w-[560px] p-3 pb-7 shadow-md">
              <button aria-label="Play course preview" className="group relative grid aspect-video w-full cursor-pointer place-items-center overflow-hidden rounded-xl bg-ph2 text-ink">
                <svg className="absolute inset-0 size-full"><rect width="100%" height="100%" fill="url(#dots)" /></svg>
                <span className="relative grid size-16 place-items-center rounded-full bg-btn text-btn-fg transition-transform duration-200 ease-ujyalo group-hover:scale-105"><I n="tri" c="l" /></span>
                <span className="absolute inset-x-0 bottom-3 text-center text-[13px] font-medium">Preview this course</span>
              </button>
              <div className="px-5 pt-6">
                <div className="flex flex-wrap items-baseline gap-2.5">
                  <b className="font-display text-4xl leading-[44px] font-bold tracking-[-0.02em]">{price}</b>
                  {c.was && <s className="text-muted">{formatNpr(c.was)}</s>}
                  {off > 0 && <span className="bdg bdg-gold ml-auto">{off}% off</span>}
                </div>
                <div className="mt-5 hidden lg:block">{cta('btn-lg w-full')}</div>
                <button className="btn btn-s btn-lg mt-5 w-full lg:mt-3" aria-pressed={saved} onClick={() => setSaved(!saved)}>
                  <I n="heart" c={saved ? 'fill-ink' : ''} /><span>{saved ? 'Saved to Wishlist' : 'Add to Wishlist'}</span>
                </button>
                <p className="mt-4 text-center text-[13px] text-muted">30-day money-back guarantee</p>
                {enrolled && (
                  <div className="mt-4 text-[13px] text-muted"><div>0% complete · 0 of {lessons} lessons</div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface"><i className="block h-full w-0 bg-gold" /></div></div>
                )}
                <ul className="mt-6 grid gap-3.5 border-t border-line pt-6">
                  <li><h4 className="t-h4 !text-base">This course includes</h4></li>
                  {[['clock', 'Course duration', fmtDur(c.minutes)], ['vid', 'Video lessons', `${lessons} lessons`], ['chart', 'Difficulty', c.level], ['globe', 'Language', 'English'], ['dl', 'Downloadable resources', '18 files'], ['award', 'Certificate of completion', 'Included'], ['spark', 'Ujyalo AI assistant', 'Included']].map(([ic, l, v]) => (
                    <li key={l} className="flex items-center gap-3 text-sm"><I n={ic} c="text-muted" />{l}<span className="ml-auto font-medium">{v}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* ---- Main content ---- */}
          <div className="lg:col-start-1 lg:row-start-2">
            <section id="overview" className="pt-12">
              <h2 className={H2}>What you’ll learn</h2>
              <ul className="m-0 grid list-none gap-x-8 gap-y-4 rounded-card bg-surface p-6 sm:grid-cols-2 sm:p-8">
                {content.outcomes.map((o) => <li key={o} className="flex gap-3 text-[15px] leading-6"><I n="check" c="mt-0.5 text-gold-deep" />{o}</li>)}
              </ul>
            </section>
            <section className={SEC}>
              <h2 className={H2}>Requirements</h2>
              <ul className="grid list-none gap-3 p-0">{content.requirements.map((r) => <li key={r} className="flex gap-3 text-[15px] leading-6 before:mt-2.5 before:size-1.5 before:shrink-0 before:rounded-full before:bg-gold before:content-['']">{r}</li>)}</ul>
            </section>
            <section className={`${SEC} [&_p]:mb-4 [&_p]:max-w-[680px] [&_p]:text-muted`}>
              <h2 className={H2}>About this course</h2>
              {content.about.map((p) => <p key={p}>{p}</p>)}
              <h3 className="t-h4 mt-8 mb-3">Who this course is for</h3><p>{content.audience}</p>
            </section>

            <section id="curriculum" className={SEC}>
              <h2 className={H2}>Course curriculum</h2>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4 text-sm text-muted">
                <span>{curriculum.length} sections · {lessons} lessons · {fmtDur(total)} total length</span>
                <button className="link-gold py-2 text-sm font-medium text-ink" onClick={() => setOpen(open.map(() => !allOpen))}>{allOpen ? 'Collapse all sections' : 'Expand all sections'}</button>
              </div>
              <div className="overflow-hidden rounded-card border border-line">
                {curriculum.map((s, i) => {
                  let n = curriculum.slice(0, i).reduce((a, x) => a + x.lessons.length, 0)
                  return (
                    <details key={s.title} open={open[i]} className="group border-t border-line first:border-t-0" onToggle={(e) => { const o = (e.currentTarget as HTMLDetailsElement).open; setOpen((p) => (p[i] === o ? p : p.map((v, j) => (j === i ? o : v)))) }}>
                      <summary className="flex min-h-[60px] cursor-pointer list-none items-center gap-3 bg-surface px-4 py-4 hover:bg-line/50 sm:px-6 [&::-webkit-details-marker]:hidden">
                        <h3 className="flex-1 font-display text-base leading-6 font-semibold">{i + 1}. {s.title}</h3>
                        <small className="text-[13px] whitespace-nowrap text-muted max-sm:hidden">{s.lessons.length} lessons · {fmtDur(s.lessons.reduce((a, l) => a + l[1], 0))}</small>
                        <I n="chev" c="text-muted transition-transform duration-200 ease-ujyalo group-open:rotate-180" />
                      </summary>
                      <ul className="m-0 list-none bg-page py-2 pl-0">
                        {s.lessons.map(([t, m, free]) => (
                          <li key={t} className="flex items-center gap-3.5 px-4 py-3 text-[15px] hover:bg-surface sm:px-6">
                            <I n={enrolled || free ? 'play' : 'lock'} c={enrolled || free ? 'text-ink' : 'text-muted'} />
                            <span className="min-w-0 flex-1">{++n}. {t}</span>
                            {free && !enrolled && <span className="bdg bdg-gold !h-[22px]">Free preview</span>}
                            <span className="text-[13px] whitespace-nowrap text-muted">{m} min</span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )
                })}
              </div>
            </section>

            <section id="instructor" className={SEC}>
              <h2 className={H2}>Your instructor</h2>
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-6">
                <Avatar name={c.instructor} className="size-24 text-[28px] !shadow-[0_0_0_4px_var(--bg),0_0_0_5px_var(--gold)]" />
                <div>
                  <h3 className="t-h3 !text-[22px] !leading-[30px]">{c.instructor}</h3><p className="text-[15px] text-muted">Senior Backend Engineer</p>
                  <div className="my-4 flex flex-wrap gap-8">{[['4.9', 'Instructor rating'], ['6', 'Courses'], ['31,000', 'Students'], ['8,420', 'Reviews']].map(([b, l]) => <div key={l} className="text-[13px] text-muted"><b className="block text-lg leading-[26px] font-semibold text-ink">{b}</b>{l}</div>)}</div>
                  <p className="max-w-[640px] text-muted">{c.instructor.split(' ')[0]} has spent twelve years building and scaling API platforms for fintech and logistics companies. He leads backend architecture at a Series C startup and teaches the practical patterns he uses every day, with a focus on clean structure and testable code.</p>
                  <Link className="link-gold mt-3 inline-block py-2 text-sm font-medium" href="/courses">View all courses by {c.instructor.split(' ')[0]}</Link>
                </div>
              </div>
            </section>

            <section id="reviews" className={SEC}>
              <h2 className={H2}>Student reviews</h2>
              <div className="mb-2 grid items-center gap-6 rounded-card bg-surface p-6 sm:grid-cols-[200px_1fr] sm:gap-12 sm:p-8">
                <div className="text-center"><b className="block font-display text-[56px] leading-16 font-bold tracking-[-0.03em]">{c.rating.toFixed(1)}</b><div className="my-1 flex justify-center"><Stars /></div><small className="text-[13px] text-muted">Course rating</small></div>
                <div className="grid gap-2">{BARS.map(([s, p]) => (
                  <div key={s} className="grid grid-cols-[44px_1fr_40px] items-center gap-3 text-[13px] text-muted"><span>{s} stars</span><span className="h-1.5 overflow-hidden rounded-full bg-line"><i className="block h-full rounded-full bg-gold" style={{ width: `${p}%` }} /></span><span>{p}%</span></div>
                ))}</div>
              </div>
              {reviews.slice(0, revs).map((r) => (
                <article key={r.name} className="border-b border-line py-7">
                  <div className="mb-3 flex items-center gap-3"><Avatar name={r.name} ring={false} className="size-10 text-[13px]" /><div><b className="block text-[15px] leading-5 font-semibold">{r.name}</b><small className="text-[13px] text-muted">{r.when}</small></div></div>
                  <Stars /><p className="mt-2 max-w-[680px] text-muted">{r.text}</p>
                </article>
              ))}
              {revs < reviews.length && <button className="btn btn-s mt-6" onClick={() => setRevs(reviews.length)}>Show more reviews</button>}
            </section>
          </div>
        </div>
      </main>

      {/* Sticky mobile enrollment bar */}
      <div className="fixed inset-x-0 bottom-0 z-[15] flex items-center gap-4 border-t border-line bg-page/90 px-6 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] backdrop-blur-[12px] lg:hidden">
        <b className="font-display text-[22px]">{enrolled ? 'Enrolled' : price}</b>{cta('h-12 flex-1')}
      </div>
      <div className="h-[72px] lg:hidden" />

      {/* Enroll modal */}
      {modal && (
        <div className="fixed inset-0 z-40 grid place-items-end bg-[rgba(17,17,17,.48)] backdrop-blur-[2px] sm:place-items-center sm:p-5" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="mt" className="relative w-full animate-[up_.2s_var(--ease-ujyalo)] rounded-t-card bg-page p-6 pb-[calc(24px+env(safe-area-inset-bottom,0px))] shadow-lg sm:max-w-[440px] sm:rounded-card sm:p-8">
            <button className="absolute top-3 right-3 grid size-11 cursor-pointer place-items-center text-muted" aria-label="Close" onClick={() => setModal(false)}><I n="x" /></button>
            {!enrolled ? (
              <>
                <h3 id="mt" className="t-h3 mb-2 pr-8">Enroll in this course</h3><p className="text-[15px] text-muted">{title}</p>
                <div className="my-6 grid gap-2 rounded-ui border border-line p-4 text-sm text-muted">
                  {c.was ? <><div className="flex justify-between"><span>Course price</span><span>{formatNpr(c.was)}</span></div><div className="flex justify-between"><span>Discount ({off}%)</span><span>−{formatNpr(c.was - c.price)}</span></div></> : null}
                  <div className="flex justify-between border-t border-line pt-2 font-semibold text-ink"><span>Total</span><span>{formatNpr(c.price)}</span></div>
                </div>
                <div className="flex justify-end gap-3"><button className="btn btn-s h-11 max-sm:flex-1" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-p h-11 max-sm:flex-1" autoFocus onClick={() => setEnrolled(true)}>Confirm enrollment</button></div>
              </>
            ) : (
              <>
                <div className="mb-5 grid size-14 place-items-center rounded-full bg-gold-tint text-gold-deep"><I n="check" c="l" /></div>
                <h3 id="mt" className="t-h3 mb-2">You’re enrolled!</h3>
                <p className="text-[15px] text-muted">Lifetime access is unlocked. Start with lesson 1 whenever you’re ready, and ask Ujyalo AI if you get stuck.</p>
                <div className="mt-7 flex justify-end gap-3"><button className="btn btn-s h-11 max-sm:flex-1" onClick={() => setModal(false)}>Stay on this page</button><Link className="btn btn-p h-11 max-sm:flex-1" href={`/learn/${c.id}`}>Go to Course</Link></div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

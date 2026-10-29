import type { Metadata } from 'next'
import Link from 'next/link'
import Avatar from '@/src/components/Avatar'
import CourseCard from '@/src/components/CourseCard'
import { I } from '@/src/components/Icon'
import MyCourses from '@/src/components/MyCourses'
import { categoryIcon, courses } from '@/src/lib/courses'
import { activity, certificates, enrolled, goals, interests, progressOf, recentLessons, recommendedids, stats, student } from '@/src/lib/student'

export const metadata: Metadata = { title: 'Dashboard' }

const TONES = ['bg-ph1', 'bg-ph2', 'bg-ph3']

function Section({ title, link, href = '#', children, className = '' }: { title: string; link?: string; href?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={className}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="t-h3 !text-[22px] !leading-[30px]">{title}</h2>
        {link && <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">{link}<I n="arrow" c="s" /></Link>}
      </div>
      {children}
    </section>
  )
}

export default function Dashboard() {
  const inProgress = enrolled.filter((e) => progressOf(e) < 100).slice(0, 3)
  const recommended = recommendedids.map((s) => courses.find((c) => c.id === s)!)
  return (
    <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 lg:py-10">
      {/* Welcome */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="over">Dashboard</p>
          <h1 className="t-h1 mt-2">Good morning, {student.first}</h1>
          <p className="mt-2 text-base text-muted">You’re on a 12-day learning streak. Pick up where you left off.</p>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Link href="#" className="relative grid size-11 place-items-center rounded-ui border border-line hover:bg-surface" aria-label="Notifications, 3 unread"><I n="bell" /><i className="absolute top-2.5 right-2.5 size-2 rounded-full bg-gold" /></Link>
          <Link href="/courses" className="btn btn-s h-11"><I n="compass" c="s" />Explore courses</Link>
        </div>
      </div>

      {/* Overview */}
      <section aria-label="Learning overview" className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-muted">{s.label}</span>
              <span className={`grid size-9 place-items-center rounded-ui ${s.icon === 'flame' ? 'bg-gold-tint text-gold-deep' : 'bg-surface text-muted'}`}><I n={s.icon} c="s" /></span>
            </div>
            <p className="mt-3 font-display text-[32px] leading-10 font-bold tracking-[-0.02em]">{s.value}<span className="text-lg font-semibold text-muted">{s.unit}</span></p>
            <p className="mt-1 text-xs text-muted">{s.note}</p>
          </div>
        ))}
      </section>

      {/* Continue learning */}
      <Section title="Continue Learning" link="View all" className="mt-12">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {inProgress.map((e, i) => {
            const p = progressOf(e)
            return (
              <article key={e.id} className={`card lift flex flex-col p-3 pb-5 ${i === 0 ? 'ring-1 ring-gold/60' : ''}`}>
                <div className={`relative grid aspect-video place-items-center overflow-hidden rounded-xl text-muted ${TONES[e.order % 3]}`}>
                  <svg className="absolute inset-0 size-full text-ink"><rect width="100%" height="100%" fill="url(#dots)" /></svg>
                  <I n={categoryIcon[e.category] ?? 'code'} c="relative size-9 [stroke-width:1.25]" />
                  <span className="bdg absolute top-3 left-3 bg-page/90">{e.last}</span>
                </div>
                <div className="flex flex-1 flex-col px-3 pt-5">
                  <span className="over">{e.category}</span>
                  <h3 className="t-h4 mt-1.5 !text-lg !leading-[26px]">{e.title}</h3>
                  <p className="mt-2 flex items-start gap-2 text-sm text-muted"><I n="play" c="mt-0.5 size-4 shrink-0" />Lesson {e.currentNo}: {e.current}</p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface"><i className="block h-full rounded-full bg-gold" style={{ width: `${p}%` }} /></div>
                    <span className="text-[13px] font-semibold tabular-nums">{p}%</span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted">{e.done} of {e.total} lessons complete</p>
                  <Link href={`/learn/${e.id}`} className="btn btn-p mt-auto w-full !mt-5">Continue Learning<I n="arrow" c="s" /></Link>
                </div>
              </article>
            )
          })}
        </div>
      </Section>

      {/* My courses */}
      <Section title="My Courses" link="My Learning" className="mt-12"><MyCourses /></Section>

      {/* Recommended */}
      <Section title="Recommended for You" link="Explore all" href="/courses" className="mt-12">
        <p className="-mt-2 mb-5 flex flex-wrap items-center gap-2 text-sm text-muted">Based on your interests:{interests.map((t) => <span key={t} className="bdg bdg-out">{t}</span>)}</p>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{recommended.map((c) => <CourseCard key={c.id} c={c} />)}</div>
      </Section>

      {/* Recent lessons + goals */}
      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <Section title="Recently Viewed Lessons">
          <ul className="card divide-y divide-line overflow-hidden">
            {recentLessons.map((l) => (
              <li key={l.title}>
                <Link href={`/learn/${l.id}`} className="flex items-center gap-4 p-4 transition-colors hover:bg-surface">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface"><I n="play" /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[15px] leading-6 font-medium">{l.title}</span><span className="block truncate text-[13px] text-muted">{l.course} · {l.when}</span></span>
                  <span className="w-12 shrink-0"><span className="block h-1 overflow-hidden rounded-full bg-surface"><i className="block h-full rounded-full bg-gold" style={{ width: `${l.pct}%` }} /></span></span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Learning Goals" link="Edit goals">
          <ul className="card divide-y divide-line">
            {goals.map((g) => (
              <li key={g.title} className="flex items-center gap-4 p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-muted"><I n="target" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] leading-6 font-medium">{g.title}</p>
                  <div className="mt-2 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface"><i className="block h-full rounded-full bg-gold" style={{ width: `${g.pct}%` }} /></div><span className="text-xs text-muted">{g.meta}</span></div>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* Certificates + activity */}
      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <Section title="Certificates Earned" link="View all">
          <div className="grid gap-4 sm:grid-cols-2">
            {certificates.map((c) => (
              <article key={c.id} className="card p-2">
                <div className="rounded-xl border border-gold/70 p-1"><div className="rounded-lg border border-gold/40 px-4 py-5 text-center">
                  <I n="award" c="l mx-auto text-gold-deep" />
                  <p className="over mt-2 !text-muted">Certificate of completion</p>
                  <h3 className="t-h4 mt-2 !text-base !leading-6">{c.title}</h3>
                  <p className="mt-1 text-xs text-muted">{c.date} · {c.id}</p>
                </div></div>
                <Link href="#" className="btn btn-g mt-2 h-10 w-full text-muted hover:text-ink"><I n="dl" c="s" />Download PDF</Link>
              </article>
            ))}
          </div>
        </Section>
        <Section title="Recent Activity">
          <ul className="card divide-y divide-line">
            {activity.map((a) => (
              <li key={a.title + a.meta} className="flex items-center gap-4 p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface text-muted"><I n={a.icon} c="s" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm leading-5 font-medium">{a.title}</span><span className="block truncate text-[13px] text-muted">{a.meta}</span></span>
                <span className="shrink-0 text-xs text-muted">{a.when}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </main>
  )
}

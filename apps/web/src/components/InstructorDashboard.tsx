'use client'
import Link from 'next/link'
import { useState } from 'react'
import { I } from './Icon'
import MetricCard from './MetricCard'
import StatusBadge from './StatusBadge'
import Thumb from './Thumb'
import { instructor, instructorActivity, instructorStats, myCourses } from '@/src/lib/instructor'

const COLS = 'md:grid-cols-[minmax(0,2.4fr)_110px_150px_170px_auto]'

function Empty({ icon, title, text, action }: { icon: string; title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-surface px-6 py-12 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-page text-muted"><I n={icon} /></span>
      <h3 className="t-h4 mt-4 !text-lg">{title}</h3>
      <p className="mx-auto mt-2 max-w-[420px] text-sm text-muted">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export default function InstructorDashboard() {
  const [empty, setEmpty] = useState(false)
  const create = <Link href="/instructor/courses/new" className="btn btn-p btn-lg max-sm:w-full"><I n="plus" c="s" />Create Course</Link>

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 lg:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="over">Instructor workspace</p>
          <h1 className="t-h1 mt-2">{empty ? `Welcome, ${instructor.first}` : `Welcome back, ${instructor.first}`}</h1>
          <p className="mt-2 text-base text-muted">{empty ? 'Share your expertise with learners around the world.' : 'Here’s how your courses are performing.'}</p>
        </div>
        {create}
      </div>

      {/* Design preview control */}
      <div className="mt-6 inline-flex items-center gap-3 rounded-ui border border-line bg-surface p-1 text-[13px]" role="group" aria-label="Preview state">
        <span className="pl-3 text-muted">Preview:</span>
        {[['Active instructor', false], ['New instructor', true]].map(([l, v]) => (
          <button key={l as string} aria-pressed={empty === v} onClick={() => setEmpty(v as boolean)} className={`h-8 cursor-pointer rounded-[6px] px-3 font-medium transition-colors ${empty === v ? 'bg-page text-ink shadow-sm' : 'text-muted hover:text-ink'}`}>{l as string}</button>
        ))}
      </div>

      <section aria-label="Summary" className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {instructorStats.map((s, i) => (
          <MetricCard key={s.label} label={s.label} icon={s.icon} accent={i === 3} value={empty ? (i === 3 ? '$0' : '0') : s.value} note={empty ? 'No data yet' : s.note} />
        ))}
      </section>

      {empty && (
        <section className="mt-8 grid items-center gap-8 rounded-card bg-surface p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="over">Get started</span>
            <h2 className="t-h2 mt-3">Create your first course</h2>
            <p className="mt-3 max-w-[480px] text-muted">Build a structured course from recorded video lessons, resources and quizzes. We’ll guide you through each step and review it before it goes live.</p>
            <div className="mt-6">{create}</div>
          </div>
          <ol className="grid gap-4">
            {[['Plan', 'Define your audience, outcomes and curriculum.'], ['Record', 'Upload video lessons, slides and downloads.'], ['Submit', 'Our team reviews your course, usually in 2–3 days.']].map(([t, d], i) => (
              <li key={t} className="flex gap-4 rounded-card border border-line bg-page p-4"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-btn text-sm font-semibold text-btn-fg">{i + 1}</span><span><b className="block text-[15px] font-semibold">{t}</b><span className="text-sm text-muted">{d}</span></span></li>
            ))}
          </ol>
        </section>
      )}

      <section id="courses" className="mt-12 scroll-mt-8">
        <div className="mb-5 flex items-end justify-between gap-4"><h2 className="t-h3 !text-[22px] !leading-[30px]">My Courses</h2>{!empty && <span className="text-sm text-muted">{myCourses.length} courses</span>}</div>
        {empty ? (
          <Empty icon="bookopen" title="No courses yet" text="Your courses will appear here with their enrollments, status and last-updated date." action={<Link href="/instructor/courses/new" className="btn btn-s"><I n="plus" c="s" />Create your first course</Link>} />
        ) : (
          <div role="table" aria-label="My courses" className="card overflow-hidden">
            <div role="row" className={`hidden items-center gap-4 border-b border-line bg-surface px-5 py-3 text-xs font-semibold tracking-[0.08em] text-muted uppercase md:grid ${COLS}`}>
              <span role="columnheader">Course</span><span role="columnheader">Enrollments</span><span role="columnheader">Last updated</span><span role="columnheader">Status</span><span role="columnheader" className="sr-only">Actions</span>
            </div>
            {myCourses.map((c, i) => (
              <div role="row" key={c.title} className={`grid items-center gap-x-4 gap-y-3 border-t border-line px-4 py-4 first:border-t-0 hover:bg-surface/60 md:px-5 ${COLS} ${i === 0 ? 'md:border-t-0' : ''}`}>
                <div role="cell" className="flex min-w-0 items-center gap-4">
                  <Thumb i={c.order} icon={c.icon} />
                  <div className="min-w-0"><b className="block truncate text-[15px] leading-6 font-semibold">{c.title}</b><span className="block truncate text-[13px] text-muted">{c.note ?? c.category}</span></div>
                </div>
                <div role="cell" className="text-sm md:text-[15px]"><span className="text-muted md:hidden">Enrollments: </span><b className="font-semibold">{c.students ? c.students.toLocaleString('en-US') : '—'}</b></div>
                <div role="cell" className="text-sm text-muted"><span className="md:hidden">Updated: </span>{c.updated}</div>
                <div role="cell"><StatusBadge status={c.status} /></div>
                <div role="cell" className="flex gap-2">
                  <Link href="/instructor/courses/new" className="btn btn-s h-9"><I n="pencil" c="size-4" />{c.status === 'Draft' ? 'Continue' : 'Edit'}</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="t-h3 mb-5 !text-[22px] !leading-[30px]">Recent Activity</h2>
        {empty ? (
          <Empty icon="clock" title="Nothing to show yet" text="Enrollments, reviews, student questions and review updates will show up here once your course is live." />
        ) : (
          <ul className="card divide-y divide-line">
            {instructorActivity.map((a) => (
              <li key={a.text} className="flex items-center gap-4 p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface text-muted"><I n={a.icon} c="s" /></span>
                <span className="min-w-0 flex-1 text-sm leading-[22px]">{a.text}</span>
                <span className="shrink-0 text-xs text-muted">{a.when}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

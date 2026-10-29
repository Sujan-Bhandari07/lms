'use client'
import Link from 'next/link'
import { useState } from 'react'
import { I } from './Icon'
import { categoryIcon } from '@/src/lib/courses'
import { enrolled, progressOf } from '@/src/lib/student'

const FILTERS = ['All', 'In Progress', 'Completed'] as const
const TONES = ['bg-ph1', 'bg-ph2', 'bg-ph3']

export default function MyCourses() {
  const [f, setF] = useState<(typeof FILTERS)[number]>('All')
  const list = enrolled.filter((e) => (f === 'All' ? true : f === 'Completed' ? progressOf(e) === 100 : progressOf(e) < 100))
  const count = (x: (typeof FILTERS)[number]) => enrolled.filter((e) => (x === 'All' ? true : x === 'Completed' ? progressOf(e) === 100 : progressOf(e) < 100)).length
  return (
    <div>
      <div role="tablist" aria-label="Filter my courses" className="mb-5 flex gap-6 border-b border-line">
        {FILTERS.map((x) => (
          <button key={x} role="tab" aria-selected={f === x} onClick={() => setF(x)} className={`-mb-px cursor-pointer border-b-2 py-3 text-sm font-medium transition-colors ${f === x ? 'border-gold text-ink' : 'border-transparent text-muted hover:text-ink'}`}>
            {x} <small className="ml-0.5 text-xs text-muted">{count(x)}</small>
          </button>
        ))}
      </div>
      <ul className="card divide-y divide-line overflow-hidden">
        {list.map((e) => {
          const p = progressOf(e), full = p === 100
          return (
            <li key={e.id} className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
              <div className={`relative grid h-16 w-24 shrink-0 place-items-center overflow-hidden rounded-xl text-muted ${TONES[e.order % 3]}`}>
                <svg className="absolute inset-0 size-full text-ink"><rect width="100%" height="100%" fill="url(#dots)" /></svg>
                <I n={categoryIcon[e.category] ?? 'code'} c="relative size-6 [stroke-width:1.25]" />
              </div>
              <div className="min-w-0 flex-1 basis-[calc(100%-7rem)] sm:basis-auto">
                <Link href={`/courses/${e.id}`} className="block truncate text-[15px] leading-6 font-semibold hover:underline hover:decoration-gold hover:underline-offset-4">{e.title}</Link>
                <p className="text-[13px] text-muted">{e.instructor} · {e.done}/{e.total} lessons</p>
              </div>
              <div className="flex w-full items-center gap-3 sm:w-52">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface"><i className="block h-full rounded-full bg-gold" style={{ width: `${p}%` }} /></div>
                <span className="w-9 text-right text-[13px] font-semibold tabular-nums">{p}%</span>
              </div>
              {full
                ? <Link href="#" className="btn btn-s h-10 max-sm:w-full"><I n="award" c="s" />Certificate</Link>
                : <Link href={`/learn/${e.id}`} className="btn btn-p h-10 max-sm:w-full">Continue</Link>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

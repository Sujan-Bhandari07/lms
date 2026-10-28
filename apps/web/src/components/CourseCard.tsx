'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Course, categoryIcon, fmtDur } from '@/src/lib/courses'
import { I } from './Icon'

const TONES = ['bg-ph1', 'bg-ph2', 'bg-ph3']

export default function CourseCard({ c }: { c: Course }) {
  const [saved, setSaved] = useState(false)
  const href = `/courses/${c.id}`
  const badge = c.badge === 'New' ? 'bdg-dark' : c.badge === 'Free' ? '' : 'bdg-gold'
  return (
    <article className="card lift flex flex-col p-3 pb-5">
      <div className={`relative grid aspect-video place-items-center overflow-hidden rounded-xl text-muted ${TONES[c.order % 3]}`}>
        <svg className="absolute inset-0 size-full text-ink"><rect width="100%" height="100%" fill="url(#dots)" /></svg>
        <I n={categoryIcon[c.category] ?? 'code'} c="relative size-8 [stroke-width:1.25]" />
        {c.badge && <span className={`bdg absolute top-3 left-3 ${badge}`}>{c.badge}</span>}
        <button className="absolute top-2 right-2 grid size-11 cursor-pointer place-items-center text-ink" aria-pressed={saved} aria-label={`Save ${c.title} to wishlist`} onClick={() => setSaved(!saved)}>
          <span className="grid size-8 place-items-center rounded-full border border-line bg-page transition hover:scale-105"><I n="heart" c={saved ? 'size-4 fill-ink' : 'size-4'} /></span>
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-3 pt-5">
        <span className="over">{c.category}</span>
        <h4 className="t-h4 !text-lg !leading-[26px]"><Link href={href} className="decoration-gold underline-offset-4 hover:underline">{c.title}</Link></h4>
        <p className="text-sm text-muted">{c.instructor}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm font-medium"><I n="star" c="size-4 fill-gold stroke-gold" />{c.rating.toFixed(1)}</div>
          <span className="bdg bdg-out">{c.level}</span>
        </div>
        <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[13px] text-muted">
          <span className="inline-flex items-center gap-1.5"><I n="users" c="s" />{c.students.toLocaleString('en-US')} students</span>
          <span className="inline-flex items-center gap-1.5"><I n="clock" c="s" />{fmtDur(c.minutes)}</span>
        </div>
        <div className="group mt-auto flex items-center justify-between border-t border-line pt-4">
          <span className="font-display text-xl leading-none font-bold">{c.price ? <>${c.price}{c.was && <s className="ml-1.5 font-sans text-sm font-normal text-muted">${c.was}</s>}</> : 'Free'}</span>
          <Link href={href} className="inline-flex items-center gap-1.5 py-2 text-sm font-medium">View course<I n="arrow" c="size-4 transition-transform duration-200 ease-ujyalo group-hover:translate-x-[3px]" /></Link>
        </div>
      </div>
    </article>
  )
}

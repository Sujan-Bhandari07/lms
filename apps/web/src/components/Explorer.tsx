'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import CourseCard from './CourseCard'
import { I } from './Icon'
import Search from './Search'
import { Course, categories, courses } from '@/src/lib/courses'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const PRICE: [string, string, (c: Course) => boolean][] = [
  ['any', 'Any price', () => true], ['free', 'Free', (c) => c.price === 0], ['u50', 'Under रु 50', (c) => c.price > 0 && c.price < 50],
  ['m', 'रु 50 – रु 75', (c) => c.price >= 50 && c.price <= 75], ['o', 'Over रु 75', (c) => c.price > 75],
]
const RATING: [string, string][] = [['0', 'Any rating'], ['4.5', '4.5 & up'], ['4.0', '4.0 & up']]
const DUR: [string, string, (c: Course) => boolean][] = [
  ['s', 'Under 8 hours', (c) => c.minutes < 480], ['m', '8 – 15 hours', (c) => c.minutes >= 480 && c.minutes <= 900], ['l', 'Over 15 hours', (c) => c.minutes > 900],
]
const SORTS: Record<string, (a: Course, b: Course) => number> = {
  pop: (a, b) => b.students - a.students, rat: (a, b) => b.rating - a.rating || b.students - a.students,
  new: (a, b) => b.order - a.order, pa: (a, b) => a.price - b.price, pd: (a, b) => b.price - a.price,
}
const toggle = (s: Set<string>, v: string) => { const n = new Set(s); n.has(v) ? n.delete(v) : n.add(v); return n }

const FIELDSET = 'min-w-0 border-0 border-t border-line py-5'
const LEGEND = 'float-left mb-3 w-full p-0 text-sm leading-[22px] font-semibold'
const ROW = 'clear-both flex min-h-[34px] cursor-pointer items-center gap-3 text-sm'
const INPUT = 'size-[18px] shrink-0 accent-btn'

function Check({ label, on, onChange, n }: { label: string; on: boolean; onChange: () => void; n?: number }) {
  return <label className={ROW}><input className={INPUT} type="checkbox" checked={on} onChange={onChange} />{label}{n != null && <span className="ml-auto text-[13px] text-muted">{n}</span>}</label>
}
function Radio({ name, value, label, cur, set }: { name: string; value: string; label: string; cur: string; set: () => void }) {
  return <label className={ROW}><input className={INPUT} type="radio" name={name} checked={cur === value} onChange={set} />{label}</label>
}

export default function Explorer({ initialQuery, initialCategory }: { initialQuery: string; initialCategory: string }) {
  const [q, setQ] = useState(initialQuery)
  const [cats, setCats] = useState<Set<string>>(new Set(categories.some(([n]) => n === initialCategory) ? [initialCategory] : []))
  const [lv, setLv] = useState<Set<string>>(new Set())
  const [du, setDu] = useState<Set<string>>(new Set())
  const [pr, setPr] = useState('any')
  const [rt, setRt] = useState('0')
  const [sort, setSort] = useState('pop')
  const [show, setShow] = useState(9)
  const [drawer, setDrawer] = useState(false)
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(false); addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [])

  const pass = (c: Course, skipCat = false) =>
    (!q || `${c.title} ${c.instructor} ${c.category}`.toLowerCase().includes(q.toLowerCase())) &&
    (skipCat || !cats.size || cats.has(c.category)) && (!lv.size || lv.has(c.level)) &&
    PRICE.find((p) => p[0] === pr)![2](c) && c.rating >= parseFloat(rt) &&
    (!du.size || DUR.some((d) => du.has(d[0]) && d[2](c)))
  const list = useMemo(() => courses.filter((c) => pass(c)).sort(SORTS[sort]), [q, cats, lv, du, pr, rt, sort]) 
  const count = (cat?: string) => courses.filter((c) => (!cat || c.category === cat) && pass(c, true)).length
  const visible = list.slice(0, show)
  const reset = () => { setQ(''); setCats(new Set()); setLv(new Set()); setDu(new Set()); setPr('any'); setRt('0'); setShow(9) }
  const on = (fn: () => void) => () => { fn(); setShow(9) }
  const tab = (active: boolean) => `-mb-px flex cursor-pointer items-center gap-2 border-b-2 py-3.5 text-sm leading-[22px] font-medium whitespace-nowrap transition-colors ${active ? 'border-gold text-ink' : 'border-transparent text-muted hover:text-ink'}`

  return (
    <>
      <section className="bg-linear-to-b from-surface to-page pt-10 sm:pt-16"><div className="wrap">
        <nav className="flex gap-2 text-[13px] text-muted" aria-label="Breadcrumb"><Link href="/" className="hover:text-ink">Home</Link><span>/</span><span className="text-ink">Explore Courses</span></nav>
        <h1 className="t-h1 mt-3 mb-3">Explore Courses</h1>
        <p className="t-lead max-w-[600px]">Browse structured, self-paced courses in programming, web development, AI, design and business. Learn from recorded lessons, earn certificates and get help from Ujyalo AI.</p>
        <Search value={q} onChange={(v) => { setQ(v); setShow(9) }} placeholder="Search by course, topic or instructor" />
        <nav className="mt-10 flex gap-8 overflow-x-auto border-b border-line [scrollbar-width:none]" aria-label="Course categories">
          <button className={tab(!cats.size)} onClick={() => { setCats(new Set()); setShow(9) }}>All courses <small className="text-xs font-medium text-muted">{count()}</small></button>
          {categories.map(([n]) => (
            <button key={n} className={tab(cats.size === 1 && cats.has(n))} onClick={() => { setCats(new Set([n])); setShow(9) }}>{n} <small className="text-xs font-medium text-muted">{count(n)}</small></button>
          ))}
        </nav>
      </div></section>

      <section className="pt-8 sm:pt-12"><div className="wrap grid items-start lg:grid-cols-[272px_1fr] lg:gap-12">
        <aside
          aria-label="Filters"
          className={`fixed inset-x-0 bottom-0 z-[31] max-h-[86vh] overflow-auto rounded-t-card bg-page px-6 shadow-lg transition-transform duration-[250ms] ease-ujyalo ${drawer ? 'visible translate-y-0' : 'invisible translate-y-[105%]'} lg:visible lg:sticky lg:top-24 lg:max-h-none lg:translate-y-0 lg:overflow-visible lg:rounded-none lg:bg-transparent lg:p-0 lg:pr-2 lg:shadow-none`}
        >
          <div className="sticky top-0 z-[1] flex items-center justify-between bg-page pt-5 pb-3 lg:hidden">
            <h3 className="t-h4">Filters</h3>
            <button onClick={() => setDrawer(false)} aria-label="Close filters" className="-mr-3 grid size-11 cursor-pointer place-items-center"><I n="x" /></button>
          </div>
          <div className="mb-2 hidden items-center justify-between lg:flex">
            <h3 className="t-h4">Filters</h3><button className="cursor-pointer text-sm font-medium text-muted underline decoration-gold underline-offset-4 hover:text-ink" onClick={reset}>Clear all</button>
          </div>
          <fieldset className={FIELDSET}><legend className={LEGEND}>Category</legend>{categories.map(([n]) => <Check key={n} label={n} on={cats.has(n)} onChange={on(() => setCats(toggle(cats, n)))} n={count(n)} />)}</fieldset>
          <fieldset className={FIELDSET}><legend className={LEGEND}>Level</legend>{LEVELS.map((l) => <Check key={l} label={l} on={lv.has(l)} onChange={on(() => setLv(toggle(lv, l)))} />)}</fieldset>
          <fieldset className={FIELDSET}><legend className={LEGEND}>Price</legend>{PRICE.map(([v, l]) => <Radio key={v} name="pr" value={v} label={l} cur={pr} set={on(() => setPr(v))} />)}</fieldset>
          <fieldset className={FIELDSET}><legend className={LEGEND}>Rating</legend>{RATING.map(([v, l]) => <Radio key={v} name="rt" value={v} label={l} cur={rt} set={on(() => setRt(v))} />)}</fieldset>
          <fieldset className={FIELDSET}><legend className={LEGEND}>Duration</legend>{DUR.map(([v, l]) => <Check key={v} label={l} on={du.has(v)} onChange={on(() => setDu(toggle(du, v)))} />)}</fieldset>
          <div className="sticky bottom-0 flex gap-3 border-t border-line bg-page py-4 pb-[calc(16px+env(safe-area-inset-bottom,0px))] lg:hidden">
            <button className="btn btn-s h-12 flex-1" onClick={reset}>Clear all</button>
            <button className="btn btn-p h-12 flex-1" onClick={() => setDrawer(false)}>Show {list.length} course{list.length === 1 ? '' : 's'}</button>
          </div>
        </aside>
        <div onClick={() => setDrawer(false)} className={`fixed inset-0 z-30 bg-[rgba(17,17,17,.48)] backdrop-blur-[2px] transition-opacity duration-200 lg:hidden ${drawer ? 'opacity-100' : 'pointer-events-none opacity-0'}`} />

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 sm:mb-8">
            <p className="text-[15px] text-muted" aria-live="polite"><b className="mr-1 font-display text-xl font-semibold text-ink">{list.length}</b>{list.length === 1 ? 'course' : 'courses'}</p>
            <div className="flex w-full items-center gap-3 sm:w-auto max-sm:*:flex-1">
              <button className="btn btn-s h-11 lg:hidden" onClick={() => setDrawer(true)}><I n="sliders" c="s" />Filters</button>
              <select
                value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort courses"
                className="select-arrow h-11 cursor-pointer appearance-none rounded-ui border border-line bg-page pr-9 pl-3.5 text-sm font-medium text-ink hover:border-[#CFCCC4] focus:border-ink focus:ring-2 focus:ring-gold focus:outline-none"
              >
                <option value="pop">Sort: Most popular</option><option value="rat">Sort: Highest rated</option><option value="new">Sort: Newest</option>
                <option value="pa">Sort: Price, low to high</option><option value="pd">Sort: Price, high to low</option>
              </select>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visible.length ? visible.map((c) => <CourseCard key={c.id} c={c} />) : (
              <div className="col-span-full rounded-card border border-line bg-surface px-6 py-20 text-center">
                <I n="search" c="l mx-auto" /><h3 className="t-h3 mt-3 mb-2">No courses match your filters</h3>
                <p className="mb-6 text-muted">Try removing a filter or searching with a different keyword.</p>
                <button className="btn btn-s" onClick={reset}>Clear all filters</button>
              </div>
            )}
          </div>
          {visible.length > 0 && (
            <div className="mt-14 text-center">
              <p className="text-sm text-muted">Showing {visible.length} of {list.length} courses</p>
              <div className="mx-auto mt-3 mb-6 h-1.5 w-[200px] overflow-hidden rounded-full bg-surface" role="progressbar" aria-valuemin={0} aria-valuemax={list.length} aria-valuenow={visible.length}>
                <i className="block h-full rounded-full bg-gold transition-[width] duration-300 ease-ujyalo" style={{ width: `${(visible.length / list.length) * 100}%` }} />
              </div>
              {visible.length < list.length && <button className="btn btn-s btn-lg" onClick={() => setShow(show + 9)}>Load more courses</button>}
            </div>
          )}
        </div>
      </div></section>

      <div className="mt-16 border-t border-line bg-surface py-16 sm:mt-24"><div className="wrap flex flex-wrap items-center justify-between gap-8">
        <div><span className="over">For instructors</span><h2 className="t-h3 mt-2 max-w-[520px] !text-2xl max-sm:!text-[24px]">Have expertise worth sharing? Publish a course on Ujyalo.</h2></div>
        <Link className="btn btn-p btn-lg max-sm:w-full" href="#">Become an Instructor</Link>
      </div></div>
    </>
  )
}

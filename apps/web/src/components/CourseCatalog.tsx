'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import LiveCourseCard from './LiveCourseCard'
import { I } from './Icon'
import { useGetPublicCoursesQuery } from '@/src/services/api/Userapi'
import { getApiErrorMessage, getApiSuccessMessage } from '@/src/lib/apiFeedback'
import { toast } from 'sonner'

const SORTS = [
  ['newest', 'Newest'],
  ['popular', 'Most popular'],
  ['rating', 'Highest rated'],
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
]

export default function CourseCatalog() {
  const [q, setQ] = useState('')
  const [price, setPrice] = useState<'all' | 'free'>('all')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const requestStarted = useRef(false)
  const minPrice = price === 'free' ? 0 : undefined
  const maxPrice = price === 'free' ? 0 : undefined
  const { data, isLoading, isFetching, isError, error, refetch } = useGetPublicCoursesQuery({
    q: q.trim() || undefined,
    page,
    limit: 9,
    sort,
    minPrice,
    maxPrice,
  })
  const pageData = data?.payload
  const courses = pageData?.items ?? []

  useEffect(() => {
    if (isLoading || isFetching) {
      if (!requestStarted.current) toast.loading('Loading courses…', { id: 'public-courses' })
      requestStarted.current = true
      return
    }
    if (!requestStarted.current) return
    requestStarted.current = false
    if (isError) {
      toast.error(getApiErrorMessage(error), { id: 'public-courses' })
    } else if (data) {
      toast.success(getApiSuccessMessage(data, `${pageData?.total ?? 0} courses found.`), { id: 'public-courses' })
    }
  }, [data, error, isError, isFetching, isLoading, pageData?.total])

  function changeFilters(change: () => void) {
    change()
    setPage(1)
  }

  return (
    <main>
      <section className="bg-linear-to-b from-surface to-page pt-10 pb-8 sm:pt-16">
        <div className="wrap">
          <nav className="flex gap-2 text-[13px] text-muted" aria-label="Breadcrumb"><Link href="/" className="hover:text-ink">Home</Link><span>/</span><span className="text-ink">Explore courses</span></nav>
          <div className="mt-4 max-w-[720px]">
            <p className="over">Ujyalo learning catalog</p>
            <h1 className="t-h1 mt-2">Explore courses</h1>
            <p className="t-lead mt-3">Find approved courses taught by Ujyalo tutors. Course content and ratings come directly from the catalog.</p>
          </div>
          <label className="relative mt-7 block max-w-[660px]">
            <span className="sr-only">Search courses</span>
            <I n="search" c="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={q}
              onChange={(event) => changeFilters(() => setQ(event.target.value))}
              placeholder="Search course, topic, or tutor"
              className="h-14 w-full rounded-ui border border-line bg-page pr-4 pl-12 text-base outline-none focus:border-ink focus:ring-2 focus:ring-gold"
            />
          </label>
        </div>
      </section>

      <section className="wrap py-8 sm:py-12" aria-labelledby="results-heading">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="results-heading" className="t-h3">Available courses</h2>
            <p className="mt-1 text-sm text-muted">{pageData ? `${pageData.total} course${pageData.total === 1 ? '' : 's'}` : 'Browse the course catalog'}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="grid gap-1 text-xs font-medium text-muted">
              Price
              <select value={price} onChange={(event) => changeFilters(() => setPrice(event.target.value as typeof price))} className="h-10 min-w-32 rounded-ui border border-line bg-page px-3 text-sm text-ink">
                <option value="all">Any price</option>
                <option value="free">Free</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs font-medium text-muted">
              Sort by
              <select value={sort} onChange={(event) => changeFilters(() => setSort(event.target.value))} className="h-10 min-w-40 rounded-ui border border-line bg-page px-3 text-sm text-ink">
                {SORTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          </div>
        </div>

        {isError && (
          <div className="rounded-card border border-error/40 bg-error/10 p-5 text-sm" role="alert">
            <p>We couldn’t load courses. Check the notification for details and try again.</p>
            <button type="button" className="btn btn-s mt-4" onClick={() => void refetch()}>Try again</button>
          </div>
        )}
        {isLoading && <div role="status" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="card h-[360px] animate-pulse bg-surface" />)}</div>}
        {!isLoading && !isError && courses.length === 0 && (
          <div className="rounded-card border border-dashed border-line bg-surface px-6 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-page text-muted"><I n="search" /></span>
            <h3 className="t-h4 mt-4">No courses found</h3>
            <p className="mt-2 text-sm text-muted">Try another search or choose a different price filter.</p>
          </div>
        )}
        {!isError && courses.length > 0 && (
          <>
            <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? 'opacity-60' : ''}`}>
              {courses.map((course) => <LiveCourseCard key={course._id} course={course} />)}
            </div>
            {pageData && pageData.pages > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Course pages">
                <button type="button" disabled={page <= 1 || isFetching} onClick={() => setPage((current) => current - 1)} className="btn btn-s disabled:opacity-40">Previous</button>
                <span className="text-sm text-muted">Page {pageData.page} of {pageData.pages}</span>
                <button type="button" disabled={page >= pageData.pages || isFetching} onClick={() => setPage((current) => current + 1)} className="btn btn-s disabled:opacity-40">Next</button>
              </nav>
            )}
          </>
        )}
      </section>
    </main>
  )
}

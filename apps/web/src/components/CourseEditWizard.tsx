'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { I } from './Icon'
import { useAppSelector } from '@/src/lib/hooks'
import { useGetCoursesByTutorQuery, useUpdateCourseMutation } from '@/src/services/api/Userapi'
import { getApiErrorMessage, getApiSuccessMessage } from '@/src/lib/apiFeedback'
import { toast } from 'sonner'

const INPUT = 'w-full rounded-ui border border-line bg-page px-4 text-base text-ink outline-none transition placeholder:text-muted focus:border-ink focus:ring-2 focus:ring-gold'

export default function CourseEditWizard() {
  const { id } = useParams<{ id: string }>()
  const profile = useAppSelector((state) => state.user)
  const coursesQuery = useGetCoursesByTutorQuery(undefined, { skip: !profile })
  const [updateCourse, updateState] = useUpdateCourseMutation()
  const course = coursesQuery.data?.payload?.find((item) => item._id === id)
  const [coursename, setCoursename] = useState('')
  const [desc, setDesc] = useState('')
  const [techstack, setTechstack] = useState('')
  const [price, setPrice] = useState('')
  const [discount, setDiscount] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [error, setError] = useState('')
  const requestStarted = useRef(false)

  useEffect(() => {
    if (!course) return
    setCoursename(course.coursename)
    setDesc(course.desc)
    setTechstack(course.techstack)
    setPrice(String(course.price))
    setDiscount(String(course.discount))
  }, [course])

  useEffect(() => {
    if (updateState.isLoading) {
      toast.loading('Saving course changes…', { id: 'course-update' })
      return
    }
    if (updateState.isError) {
      toast.error(getApiErrorMessage(updateState.error), { id: 'course-update' })
      return
    }
    if (!updateState.isSuccess) return
    if (!updateState.data.success) {
      toast.error(updateState.data.message || 'Course could not be updated.', { id: 'course-update' })
      return
    }
    toast.success(getApiSuccessMessage(updateState.data, 'Course updated.'), { id: 'course-update' })
  }, [updateState.data, updateState.error, updateState.isError, updateState.isLoading, updateState.isSuccess])

  useEffect(() => {
    if (coursesQuery.isLoading || coursesQuery.isFetching) {
      requestStarted.current = true
      return
    }
    if (!requestStarted.current) return
    requestStarted.current = false
    if (coursesQuery.isError) toast.error(getApiErrorMessage(coursesQuery.error), { id: 'course-edit-load' })
  }, [coursesQuery.error, coursesQuery.isError, coursesQuery.isFetching, coursesQuery.isLoading])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!course) return
    const parsedPrice = Number(price)
    const parsedDiscount = Number(discount)
    if (!coursename.trim() || !desc.trim() || !techstack.trim()) {
      setError('Course name, description, and technology stack are required.')
      return
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0 || !Number.isFinite(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 100) {
      setError('Enter a non-negative course price and a discount between 0 and 100.')
      return
    }
    if (photo && (!photo.type.startsWith('image/') || photo.size > 500 * 1024 * 1024)) {
      setError('Choose a course image up to 500 MB.')
      return
    }
    updateCourse({
      courseid: course._id,
      coursename: coursename.trim(),
      desc: desc.trim(),
      techstack: techstack.trim(),
      price: parsedPrice,
      discount: parsedDiscount,
      photo: photo ?? undefined,
    })
  }

  if (coursesQuery.isLoading) return <main className="mx-auto max-w-[900px] px-5 py-12 text-sm text-muted" role="status">Loading course details…</main>
  if (coursesQuery.isError || !course) {
    return (
      <main className="mx-auto max-w-[900px] px-5 py-12">
        <div className="rounded-card border border-error/40 bg-error/10 p-6" role="alert">
          <h1 className="t-h3">Course not found</h1>
          <p className="mt-2 text-sm text-muted">This course may not belong to your tutor account.</p>
          <Link href="/instructor" className="btn btn-s mt-4">Back to workspace</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-[900px] px-5 py-8 sm:px-8 lg:py-10">
      <nav className="flex gap-2 text-[13px] text-muted" aria-label="Breadcrumb"><Link href="/instructor" className="hover:text-ink">Tutor workspace</Link><span>/</span><span className="text-ink">Edit course</span></nav>
      <h1 className="t-h1 mt-3">Edit course</h1>
      <p className="mt-2 text-sm text-muted">Changes are saved to the course record. Course deletion is not available.</p>
      <form onSubmit={submit} className="card mt-8 grid gap-5 p-5 sm:p-8">
        {error && <div role="alert" className="flex gap-3 rounded-ui border border-error/40 bg-error/10 p-4 text-sm"><I n="alert" c="text-error" /><p>{error}</p></div>}
        <label className="grid gap-2 text-sm font-medium">Course name<input required value={coursename} onChange={(event) => setCoursename(event.target.value)} className={`${INPUT} h-12`} /></label>
        <label className="grid gap-2 text-sm font-medium">Description<textarea required rows={6} value={desc} onChange={(event) => setDesc(event.target.value)} className={`${INPUT} resize-y py-3`} /></label>
        <label className="grid gap-2 text-sm font-medium">Topics or technology stack<input required value={techstack} onChange={(event) => setTechstack(event.target.value)} className={`${INPUT} h-12`} /></label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">Stored course price<input type="number" min="0" step="0.01" required value={price} onChange={(event) => setPrice(event.target.value)} className={`${INPUT} h-12`} /></label>
          <label className="grid gap-2 text-sm font-medium">Discount (%)<input type="number" min="0" max="100" step="0.01" required value={discount} onChange={(event) => setDiscount(event.target.value)} className={`${INPUT} h-12`} /></label>
        </div>
        <label className="grid gap-2 text-sm font-medium">Replace course photo (optional)<input type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} className="rounded-ui border border-line bg-page p-3 text-sm font-normal file:mr-3 file:rounded-md file:border-0 file:bg-surface file:px-3 file:py-2" /></label>
        <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-5">
          <Link href="/instructor" className="btn btn-s h-11">Cancel</Link>
          <button type="submit" disabled={updateState.isLoading} className="btn btn-p h-11 px-6 disabled:opacity-50">{updateState.isLoading ? 'Saving…' : 'Save changes'}</button>
        </div>
      </form>
    </main>
  )
}

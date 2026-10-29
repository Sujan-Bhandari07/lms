'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { I } from './Icon'
import { useCreateCourseMutation } from '@/src/services/api/Userapi'
import { useAppSelector } from '@/src/lib/hooks'
import { getApiErrorMessage, getApiSuccessMessage, isApiFailure } from '@/src/lib/apiFeedback'
import { toast } from 'sonner'

const INPUT = 'w-full rounded-ui border border-line bg-page px-4 text-base text-ink outline-none transition placeholder:text-muted hover:border-[#CFCCC4] focus:border-ink focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-page'

export default function CourseWizard() {
  const profile = useAppSelector((state) => state.user)
  const [createCourse, createCourseState] = useCreateCourseMutation()
  const [coursename, setCoursename] = useState('')
  const [desc, setDesc] = useState('')
  const [techstack, setTechstack] = useState('')
  const [price, setPrice] = useState('0')
  const [discount, setDiscount] = useState('0')
  const [photo, setPhoto] = useState<File | null>(null)
  const [error, setError] = useState('')
  const isLoading = createCourseState.isLoading

  useEffect(() => {
    if (createCourseState.isLoading) {
      toast.loading('Creating your course…', { id: 'create-course-request' })
      return
    }
    if (createCourseState.isError) {
      toast.error(getApiErrorMessage(createCourseState.error), { id: 'create-course-request' })
      return
    }
    if (!createCourseState.isSuccess) return
    if (isApiFailure(createCourseState.data)) {
      toast.error(getApiSuccessMessage(createCourseState.data, 'The course could not be created.'), { id: 'create-course-request' })
      return
    }
    toast.success(getApiSuccessMessage(createCourseState.data, 'Course created successfully.'), { id: 'create-course-request' })
    setCoursename('')
    setDesc('')
    setTechstack('')
    setPrice('0')
    setDiscount('0')
    setPhoto(null)
    const photoInput = document.getElementById('photo')
    if (photoInput instanceof HTMLInputElement) photoInput.value = ''
  }, [
    createCourseState.data,
    createCourseState.error,
    createCourseState.isError,
    createCourseState.isLoading,
    createCourseState.isSuccess,
  ])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const parsedPrice = Number(price)
    const parsedDiscount = Number(discount)
    if (!profile || profile.role !== 'tutor') {
      setError('A signed-in tutor account is required to create a course.')
      return
    }
    if (!coursename.trim() || !desc.trim() || !techstack.trim() || !photo) {
      setError('Complete all required course fields.')
      return
    }
    if (!photo.type.startsWith('image/')) {
      setError('Choose an image file for the course photo.')
      return
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0 || !Number.isFinite(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 100) {
      setError('Enter a non-negative price and a discount between 0 and 100.')
      return
    }

    createCourse({
      coursename: coursename.trim(),
      desc: desc.trim(),
      techstack: techstack.trim(),
      tutor: { tutorid: profile._id, tutorname: profile.fullname },
      price: parsedPrice,
      discount: parsedDiscount,
      photo,
    })
  }

  return (
    <main className="mx-auto max-w-[900px] px-5 py-8 sm:px-8 lg:py-10">
      <nav className="flex gap-2 text-[13px] text-muted" aria-label="Breadcrumb"><Link href="/instructor" className="hover:text-ink">Tutor workspace</Link><span>/</span><span className="text-ink">Create course</span></nav>
      <h1 className="t-h1 mt-3">Create a course</h1>
      <p className="mt-2 max-w-[620px] text-base text-muted">Only fields accepted by the course API are shown. Newly created courses remain unavailable to learners until approved.</p>

      <form onSubmit={submit} className="card mt-8 grid gap-6 p-5 sm:p-8">
        {error && <div role="alert" className="flex gap-3 rounded-ui border border-error/40 bg-error/10 p-4 text-sm"><I n="alert" c="text-error" /><p>{error}</p></div>}

        <div>
          <label htmlFor="coursename" className="mb-2 block text-sm font-medium">Course name</label>
          <input id="coursename" required value={coursename} onChange={(event) => setCoursename(event.target.value)} className={`${INPUT} h-12`} />
        </div>
        <div>
          <label htmlFor="photo" className="mb-2 block text-sm font-medium">Course photo</label>
          <input
            id="photo"
            name="photo"
            type="file"
            accept="image/*"
            required
            onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
            className={`${INPUT} cursor-pointer py-3 file:mr-4 file:rounded-md file:border-0 file:bg-surface file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink`}
          />
          {photo && <p className="mt-2 text-sm text-muted">Selected: {photo.name}</p>}
        </div>
        <div>
          <label htmlFor="desc" className="mb-2 block text-sm font-medium">Description</label>
          <textarea id="desc" required rows={6} value={desc} onChange={(event) => setDesc(event.target.value)} className={`${INPUT} resize-y py-3`} />
        </div>
        <div>
          <label htmlFor="techstack" className="mb-2 block text-sm font-medium">Topics or technology stack</label>
          <input id="techstack" required value={techstack} onChange={(event) => setTechstack(event.target.value)} placeholder="e.g. NestJS, PostgreSQL, REST APIs" className={`${INPUT} h-12`} />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="price" className="mb-2 block text-sm font-medium">Price</label>
            <input id="price" type="number" min="0" step="0.01" required value={price} onChange={(event) => setPrice(event.target.value)} className={`${INPUT} h-12`} />
          </div>
          <div>
            <label htmlFor="discount" className="mb-2 block text-sm font-medium">Discount (%)</label>
            <input id="discount" type="number" min="0" max="100" step="0.01" value={discount} onChange={(event) => setDiscount(event.target.value)} className={`${INPUT} h-12`} />
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-5">
          <Link href="/instructor" className="btn btn-s h-12">Cancel</Link>
          <button type="submit" disabled={isLoading} className="btn btn-p h-12 px-8">
            {isLoading ? 'Creating…' : 'Create course'}
          </button>
        </div>
      </form>
    </main>
  )
}

'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { I } from './Icon'
import Avatar from './Avatar'
import { getApiErrorMessage, getApiSuccessMessage } from '@/src/lib/apiFeedback'
import {
  useGetPublicCourseByIdQuery,
  useLazyGetEnrollmentsQuery,
  useEnrollCourseMutation,
  useInitiatePaymentMutation,
  usePostCourseCommentMutation,
  usePostCourseRatingMutation,
} from '@/src/services/api/Userapi'
import { toast } from 'sonner'
import { formatNpr } from '@/src/lib/currency'

export default function CourseOverview() {
  const { slug } = useParams<{ slug: string }>()
  const courseid = decodeURIComponent(slug)
  const router = useRouter()
  const { data, isLoading, isError, error, refetch } = useGetPublicCourseByIdQuery(courseid)
  const [getEnrollments] = useLazyGetEnrollmentsQuery()
  const [enroll, enrollState] = useEnrollCourseMutation()
  const [initiatePayment, paymentState] = useInitiatePaymentMutation()
  const [postComment, commentState] = usePostCourseCommentMutation()
  const [postRating, ratingState] = usePostCourseRatingMutation()
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(5)
  const [startingEnrollment, setStartingEnrollment] = useState(false)
  const course = data?.payload

  useEffect(() => {
    if (isLoading) toast.loading('Loading course details…', { id: 'course-detail' })
    else if (isError) toast.error(getApiErrorMessage(error), { id: 'course-detail' })
    else if (course) toast.success(getApiSuccessMessage(data, 'Course details loaded.'), { id: 'course-detail' })
  }, [course, data, error, isError, isLoading])

  async function enterCourse() {
    if (!course || startingEnrollment || enrollState.isLoading || paymentState.isLoading) return
    setStartingEnrollment(true)
    toast.loading('Checking your enrollment…', { id: 'course-enrollment' })
    try {
      const current = await getEnrollments().unwrap()
      if (current.payload?.some((item) => item._id === course._id)) {
        toast.success('Opening your course.', { id: 'course-enrollment' })
        router.push(`/learn/${course._id}`)
        return
      }
      if (course.price > 0) {
        const transaction_uuid = crypto.randomUUID()
        const checkout = await initiatePayment({
          courseid: course._id,
          transaction_uuid,
        }).unwrap()
        const details = checkout.payload
        if (!checkout.success || !details?.signature) {
          throw new Error(checkout.message || 'The payment service could not prepare checkout.')
        }
        const failureParams = new URLSearchParams({
          courseid: course._id,
          transaction_uuid: details.transaction_uuid,
          product_code: details.product_code,
          total_amount: String(details.total_amount),
        })
        const values: Record<string, string> = {
          amount: String(details.amount),
          failure_url: `${window.location.origin}/payment/failed?${failureParams}`,
          product_delivery_charge: '0',
          product_service_charge: '0',
          product_code: details.product_code,
          signature: details.signature,
          signed_field_names: 'total_amount,transaction_uuid,product_code',
          success_url: `${window.location.origin}/payment/success`,
          tax_amount: '0',
          total_amount: String(details.total_amount),
          transaction_uuid: details.transaction_uuid,
        }
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = details.gateway_url
        for (const [name, value] of Object.entries(values)) {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = name
          input.value = value
          form.appendChild(input)
        }
        document.body.appendChild(form)
        form.submit()
        return
      }
      const result = await enroll({ courseid: course._id }).unwrap()
      if (!result.success) {
        toast.error(result.message || 'Enrollment could not be completed.', { id: 'course-enrollment' })
        return
      }
      toast.success(getApiSuccessMessage(result, 'You are enrolled.'), { id: 'course-enrollment' })
      router.push(`/learn/${course._id}`)
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError), { id: 'course-enrollment' })
    } finally {
      setStartingEnrollment(false)
    }
  }

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!comment.trim()) return
    toast.loading('Posting your comment…', { id: 'course-comment' })
    try {
      const result = await postComment({ courseid, comment: comment.trim() }).unwrap()
      if (!result.success) {
        toast.error(result.message || 'The comment could not be posted.', { id: 'course-comment' })
        return
      }
      toast.success(getApiSuccessMessage(result, 'Comment posted.'), { id: 'course-comment' })
      setComment('')
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError), { id: 'course-comment' })
    }
  }

  async function submitRating() {
    toast.loading('Submitting your rating…', { id: 'course-rating' })
    try {
      const result = await postRating({ courseid, rating }).unwrap()
      if (!result.success) {
        toast.error(result.message || 'The rating could not be submitted.', { id: 'course-rating' })
        return
      }
      toast.success(getApiSuccessMessage(result, 'Rating submitted.'), { id: 'course-rating' })
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError), { id: 'course-rating' })
    }
  }

  if (isLoading && !course) {
    return <main className="wrap grid min-h-[65vh] place-items-center text-sm text-muted" role="status">Loading course…</main>
  }
  if (isError || !course) {
    return (
      <main className="wrap grid min-h-[65vh] content-center">
        <div className="max-w-lg rounded-card border border-error/40 bg-error/10 p-6" role="alert">
          <h1 className="t-h3">Course unavailable</h1>
          <p className="mt-2 text-sm text-muted">This course may not exist or may not have been approved for the catalog.</p>
          <div className="mt-5 flex gap-3"><button className="btn btn-s" onClick={() => void refetch()}>Try again</button><Link className="btn btn-p" href="/courses">Browse courses</Link></div>
        </div>
      </main>
    )
  }

  return (
    <main className="wrap py-8 sm:py-12">
      <nav className="mb-6 flex gap-2 text-[13px] text-muted" aria-label="Breadcrumb"><Link href="/" className="hover:text-ink">Home</Link><span>/</span><Link href="/courses" className="hover:text-ink">Courses</Link><span>/</span><span className="truncate text-ink">{course.coursename}</span></nav>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
        <div>
          <p className="over">{course.techstack}</p>
          <h1 className="t-h1 mt-2">{course.coursename}</h1>
          <p className="mt-4 max-w-[760px] text-base leading-7 text-muted">{course.desc}</p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <span className="inline-flex items-center gap-2"><I n="star" c="size-4 fill-gold stroke-gold" /><b className="text-ink">{(course.averageRating ?? 0).toFixed(1)}</b> · {course.ratings?.length ?? 0} ratings</span>
            <span><b className="text-ink">{course.enrollmentCount ?? 0}</b> enrolled</span>
            <span className="inline-flex items-center gap-2">
              <Avatar name={course.tutor.tutorname} profilepic={course.tutor.profilepic} ring={false} className="size-7 text-[10px]" />
              By <b className="text-ink">{course.tutor.tutorname}</b>
            </span>
            {course.isverified && <span className="bdg bdg-ok">Approved</span>}
          </div>
          <div className="mt-8 aspect-video overflow-hidden rounded-card bg-surface">
            {course.title
              ? <div role="img" aria-label={`${course.coursename} course photo`} className="size-full bg-cover bg-center" style={{ backgroundImage: `url("${course.title.replaceAll('"', '%22')}")` }} />
              : <div className="grid size-full place-items-center text-muted"><I n="bookopen" c="l" /></div>}
          </div>

          <section className="mt-10" aria-labelledby="curriculum-heading">
            <h2 id="curriculum-heading" className="t-h2">Course content</h2>
            <p className="mt-2 text-sm text-muted">{course.parts.length} video {course.parts.length === 1 ? 'part' : 'parts'}</p>
            {course.parts.length ? (
              <ol className="mt-4 divide-y divide-line rounded-card border border-line">
                {course.parts.map((part, index) => (
                  <li key={`${part.title}-${index}`} className="flex items-start gap-3 p-4">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface text-muted"><I n="play" c="size-4" /></span>
                    <div><h3 className="text-sm font-semibold">{part.title}</h3><p className="mt-1 text-sm text-muted">{part.partdesc}</p></div>
                  </li>
                ))}
              </ol>
            ) : <p className="mt-4 rounded-ui bg-surface p-4 text-sm text-muted">Course videos will be added by the tutor.</p>}
          </section>

          <section className="mt-12" aria-labelledby="reviews-heading">
            <h2 id="reviews-heading" className="t-h2">Learner feedback</h2>
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              <form onSubmit={submitComment} className="grid gap-3 rounded-card border border-line p-5">
                <label htmlFor="course-comment" className="text-sm font-semibold">Share a course comment</label>
                <textarea id="course-comment" required maxLength={2000} rows={3} value={comment} onChange={(event) => setComment(event.target.value)} className="rounded-ui border border-line bg-page p-3 text-sm outline-none focus:border-ink focus:ring-2 focus:ring-gold" />
                <button disabled={commentState.isLoading || !comment.trim()} className="btn btn-p justify-self-end disabled:opacity-40">Post comment</button>
              </form>
              <div className="grid content-start gap-3 rounded-card border border-line p-5">
                <label htmlFor="course-rating" className="text-sm font-semibold">Rate this course</label>
                <div className="flex gap-3">
                  <select id="course-rating" value={rating} onChange={(event) => setRating(Number(event.target.value))} className="h-10 rounded-ui border border-line bg-page px-3 text-sm">
                    {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} / 5</option>)}
                  </select>
                  <button type="button" disabled={ratingState.isLoading} onClick={() => void submitRating()} className="btn btn-s disabled:opacity-40">Submit rating</button>
                </div>
                <p className="text-xs text-muted">Only enrolled students can review or rate this course.</p>
              </div>
            </div>
            <ul className="mt-5 grid gap-3">
              {(course.comments ?? []).map((item, index) => (
                <li key={`${item.studentname}-${index}`} className="rounded-card bg-surface p-4">
                  <p className="text-sm leading-6">{item.comment}</p>
                  <p className="mt-2 text-xs font-medium text-muted">{item.studentname}</p>
                </li>
              ))}
              {!course.comments?.length && <li className="text-sm text-muted">No comments yet.</li>}
            </ul>
          </section>
        </div>

        <aside className="h-fit rounded-card border border-line bg-page p-6 shadow-md lg:sticky lg:top-24">
          <div className="aspect-video overflow-hidden rounded-ui bg-surface">
            {course.title
              ? <div role="img" aria-label={`${course.coursename} course photo`} className="size-full bg-cover bg-center" style={{ backgroundImage: `url("${course.title.replaceAll('"', '%22')}")` }} />
              : <div className="grid size-full place-items-center text-muted"><I n="bookopen" c="l" /></div>}
          </div>
          <p className="mt-5 font-display text-3xl font-bold">{course.price === 0 ? 'Free' : formatNpr(course.price)}</p>
          {course.discount > 0 && <p className="mt-1 text-sm text-muted">{course.discount}% discount applied</p>}
          <button type="button" onClick={() => void enterCourse()} disabled={startingEnrollment || enrollState.isLoading || paymentState.isLoading} className="btn btn-p btn-lg mt-5 w-full disabled:opacity-50">
            {startingEnrollment || enrollState.isLoading || paymentState.isLoading
              ? 'Preparing…'
              : course.price > 0 ? 'Pay with eSewa' : 'Enroll for free'}
          </button>
          {course.price > 0 && <p className="mt-3 text-center text-xs leading-5 text-muted">You’ll be enrolled after eSewa confirms your payment.</p>}
          <div className="mt-6 border-t border-line pt-5">
            <h2 className="text-sm font-semibold">What’s included</h2>
            <ul className="mt-3 grid gap-3 text-sm text-muted">
              <li className="flex gap-2"><I n="play" c="s" />{course.parts.length} video parts</li>
              <li className="flex gap-2"><I n="users" c="s" />{course.enrollmentCount ?? 0} enrolled learners</li>
              <li className="flex gap-2"><I n="check" c="s" />{course.providecompletionoption ? 'Completion tracking enabled' : 'Completion tracking unavailable'}</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  )
}

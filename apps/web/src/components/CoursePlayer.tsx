'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { I } from './Icon'
import { getApiErrorMessage, getApiSuccessMessage } from '@/src/lib/apiFeedback'
import {
  useGetCertificatesQuery,
  useGetEnrollmentsQuery,
  useCompleteEnrolledCourseMutation,
  useCreateCertificateMutation,
} from '@/src/services/api/Userapi'
import { toast } from 'sonner'

export default function CoursePlayer() {
  const { id } = useParams<{ id: string }>()
  const enrollments = useGetEnrollmentsQuery()
  const course = enrollments.data?.payload?.find((item) => item._id === id)
  const certificates = useGetCertificatesQuery(undefined, { skip: !course?.iscompleted })
  const [complete, completeState] = useCompleteEnrolledCourseMutation()
  const [createCertificate, certificateState] = useCreateCertificateMutation()
  const requestStarted = useRef(false)
  const certificate = certificates.data?.payload?.find((item) => item.courseid === id)

  useEffect(() => {
    if (enrollments.isLoading || enrollments.isFetching) {
      if (!requestStarted.current) toast.loading('Loading your enrolled courses…', { id: 'course-player' })
      requestStarted.current = true
      return
    }
    if (!requestStarted.current) return
    requestStarted.current = false
    if (enrollments.isError) toast.error(getApiErrorMessage(enrollments.error), { id: 'course-player' })
    else if (enrollments.data) toast.success(getApiSuccessMessage(enrollments.data, 'Your courses are ready.'), { id: 'course-player' })
  }, [enrollments.data, enrollments.error, enrollments.isError, enrollments.isFetching, enrollments.isLoading])

  async function markComplete() {
    toast.loading('Saving course completion…', { id: 'course-completion' })
    try {
      const result = await complete({ courseid: id }).unwrap()
      if (!result.success) {
        toast.error(result.message || 'Course completion could not be saved.', { id: 'course-completion' })
        return
      }
      toast.success(getApiSuccessMessage(result, 'Course completed.'), { id: 'course-completion' })
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError), { id: 'course-completion' })
    }
  }

  async function requestCertificate() {
    toast.loading('Creating your certificate record…', { id: 'certificate-request' })
    try {
      const result = await createCertificate({ courseid: id }).unwrap()
      if (!result.success) {
        toast.error(result.message || 'Certificate could not be created.', { id: 'certificate-request' })
        return
      }
      toast.success(getApiSuccessMessage(result, 'Certificate record created.'), { id: 'certificate-request' })
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError), { id: 'certificate-request' })
    }
  }

  if (enrollments.isLoading) {
    return <main className="grid min-h-dvh place-items-center text-sm text-muted" role="status">Checking course access…</main>
  }
  if (enrollments.isError) {
    return (
      <main className="mx-auto grid min-h-[65vh] max-w-[720px] content-center px-5">
        <div className="rounded-card border border-error/40 bg-error/10 p-6" role="alert">
          <h1 className="t-h3">Course access could not be checked</h1>
          <p className="mt-2 text-sm text-muted">Check the notification for details, then retry.</p>
          <button type="button" className="btn btn-s mt-5" onClick={() => void enrollments.refetch()}>Try again</button>
        </div>
      </main>
    )
  }
  if (!course) {
    return (
      <main className="mx-auto grid min-h-[65vh] max-w-[720px] content-center px-5">
        <h1 className="t-h2">This course isn’t in your enrollments</h1>
        <p className="mt-3 text-muted">Enroll in an available course before opening its lessons.</p>
        <Link href="/courses" className="btn btn-p mt-6 w-max">Browse courses</Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8 lg:py-12">
      <nav className="flex gap-2 text-[13px] text-muted" aria-label="Breadcrumb"><Link href="/dashboard" className="hover:text-ink">Dashboard</Link><span>/</span><Link href={`/courses/${course._id}`} className="hover:text-ink">{course.coursename}</Link><span>/</span><span className="text-ink">Course player</span></nav>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div><p className="over">Course player</p><h1 className="t-h1 mt-2">{course.coursename}</h1><p className="mt-2 text-sm text-muted">Instructor: {course.tutor.tutorname}</p></div>
        {course.iscompleted && <span className="bdg bdg-ok"><I n="check" c="size-4" />Course completed</span>}
      </div>

      <section className="mt-8" aria-labelledby="lessons-heading">
        <h2 id="lessons-heading" className="sr-only">Course videos</h2>
        {course.parts.length === 0 ? (
          <div className="rounded-card border border-dashed border-line bg-surface px-6 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-page text-muted"><I n="play" /></span>
            <h2 className="t-h3 mt-4">Lessons are being prepared</h2>
            <p className="mt-2 text-sm text-muted">Your tutor hasn’t uploaded course parts yet.</p>
          </div>
        ) : (
          <ol className="grid gap-5">
            {course.parts.map((part, index) => (
              <li key={`${part.title}-${index}`} className="card overflow-hidden">
                <div className="aspect-video bg-black">
                  {part.videourl ? (
                    <video controls playsInline preload="metadata" className="size-full" src={part.videourl}>
                      Your browser does not support embedded video.
                    </video>
                  ) : <div className="grid size-full place-items-center text-sm text-white">This lesson has no video available.</div>}
                </div>
                <div className="p-5">
                  <p className="over">Part {index + 1}</p>
                  <h2 className="t-h3 mt-1 !text-xl">{part.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">{part.partdesc}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-card border border-line p-5">
        <div>
          <h2 className="text-base font-semibold">Course completion</h2>
          <p className="mt-1 text-sm text-muted">{course.providecompletionoption ? 'Your completion will be recorded on your student profile.' : 'The tutor has not enabled completion for this course.'}</p>
        </div>
        {course.providecompletionoption && (
          <button type="button" onClick={() => void markComplete()} disabled={course.iscompleted || completeState.isLoading} className="btn btn-p disabled:opacity-40">
            {course.iscompleted ? 'Completed' : completeState.isLoading ? 'Saving…' : 'Mark course complete'}
          </button>
        )}
      </section>

      {course.iscompleted && (
        <section className="mt-5 rounded-card border border-line p-5">
          <h2 className="text-base font-semibold">Certificate</h2>
          {certificates.isLoading && <p className="mt-2 text-sm text-muted">Checking certificate records…</p>}
          {certificate && <p className="mt-2 text-sm text-muted">Certificate record exists for {certificate.coursename}. A downloadable certificate is not available from the current API.</p>}
          {!certificate && !certificates.isLoading && (
            <button type="button" onClick={() => void requestCertificate()} disabled={certificateState.isLoading} className="btn btn-s mt-3 disabled:opacity-40">
              {certificateState.isLoading ? 'Creating…' : 'Create certificate record'}
            </button>
          )}
        </section>
      )}
    </main>
  )
}

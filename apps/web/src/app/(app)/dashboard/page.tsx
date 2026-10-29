'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { I } from '@/src/components/Icon'
import Avatar from '@/src/components/Avatar'
import { useAppSelector } from '@/src/lib/hooks'
import { useGetCertificatesQuery, useGetEnrollmentsQuery } from '@/src/services/api/Userapi'
import { getApiErrorMessage, getApiSuccessMessage } from '@/src/lib/apiFeedback'
import { toast } from 'sonner'

export default function Dashboard() {
  const profile = useAppSelector((state) => state.user)
  const enrollments = useGetEnrollmentsQuery()
  const certificates = useGetCertificatesQuery()
  const enrollmentToastStarted = useRef(false)
  const certificateToastStarted = useRef(false)
  const courses = enrollments.data?.payload ?? []
  const completed = courses.filter((course) => course.iscompleted).length

  useEffect(() => {
    if (enrollments.isLoading || enrollments.isFetching) {
      if (!enrollmentToastStarted.current) toast.loading('Loading your learning dashboard…', { id: 'student-enrollments' })
      enrollmentToastStarted.current = true
      return
    }
    if (!enrollmentToastStarted.current) return
    enrollmentToastStarted.current = false
    if (enrollments.isError) toast.error(getApiErrorMessage(enrollments.error), { id: 'student-enrollments' })
    else if (enrollments.data) toast.success(getApiSuccessMessage(enrollments.data, 'Your learning data is up to date.'), { id: 'student-enrollments' })
  }, [enrollments.data, enrollments.error, enrollments.isError, enrollments.isFetching, enrollments.isLoading])

  useEffect(() => {
    if (certificates.isLoading || certificates.isFetching) {
      if (!certificateToastStarted.current) toast.loading('Loading certificates…', { id: 'student-certificates' })
      certificateToastStarted.current = true
      return
    }
    if (!certificateToastStarted.current) return
    certificateToastStarted.current = false
    if (certificates.isError) toast.error(getApiErrorMessage(certificates.error), { id: 'student-certificates' })
    else if (certificates.data) toast.success(getApiSuccessMessage(certificates.data, 'Certificates loaded.'), { id: 'student-certificates' })
  }, [certificates.data, certificates.error, certificates.isError, certificates.isFetching, certificates.isLoading])

  return (
    <main className="mx-auto max-w-[1000px] px-5 py-8 sm:px-8 lg:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="over">Student account</p>
          <h1 className="t-h1 mt-2">Welcome, {profile?.fullname ?? 'student'}</h1>
          <p className="mt-3 max-w-[640px] text-base text-muted">Continue your enrolled courses and track completions saved to your account.</p>
        </div>
        <Link href="/courses" className="btn btn-p btn-lg"><I n="search" c="s" />Explore courses</Link>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-3" aria-label="Learning summary">
        {[
          ['Enrolled courses', String(courses.length), 'bookopen'],
          ['Completed courses', String(completed), 'check'],
          ['Certificates', String(certificates.data?.payload?.length ?? 0), 'award'],
        ].map(([label, value, icon]) => (
          <article key={label} className="card flex items-center gap-4 p-5">
            <span className="grid size-11 place-items-center rounded-full bg-surface text-gold-deep"><I n={icon} /></span>
            <div><p className="text-sm text-muted">{label}</p><p className="mt-1 font-display text-2xl font-bold">{value}</p></div>
          </article>
        ))}
      </section>

      <section className="mt-10" aria-labelledby="student-courses-heading">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 id="student-courses-heading" className="t-h3">Your courses</h2>
          <Link href="/courses" className="text-sm font-medium underline decoration-gold underline-offset-4">Browse catalog</Link>
        </div>
        {enrollments.isLoading && <p className="card p-6 text-sm text-muted" role="status">Loading your courses…</p>}
        {enrollments.isError && <div role="alert" className="rounded-card border border-error/40 bg-error/10 p-5 text-sm">Your courses could not be loaded. See the notification for details and refresh to retry.</div>}
        {!enrollments.isLoading && !enrollments.isError && courses.length === 0 && (
          <div className="rounded-card border border-dashed border-line bg-surface px-6 py-12 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-page text-muted"><I n="bookopen" /></span>
            <h3 className="t-h4 mt-4">Your learning starts here</h3>
            <p className="mt-2 text-sm text-muted">Explore approved courses and enroll in a free course to get started.</p>
            <Link href="/courses" className="btn btn-p mt-5">Explore courses</Link>
          </div>
        )}
        {courses.length > 0 && (
          <ul className="grid gap-4">
            {courses.map((course) => (
              <li key={course._id} className="card flex flex-wrap items-center gap-4 p-5">
                <div
                  role={course.title ? 'img' : undefined}
                  aria-label={course.title ? `${course.coursename} course photo` : undefined}
                  className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-ui bg-surface bg-cover bg-center text-muted"
                  style={{ backgroundImage: course.title ? `url("${course.title.replaceAll('"', '%22')}")` : undefined }}
                >
                  {!course.title && <I n="bookopen" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold">{course.coursename}</h3>
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                    <Avatar name={course.tutor.tutorname} profilepic={course.tutor.profilepic} ring={false} className="size-7 text-[10px]" />
                    {course.tutor.tutorname} · {course.parts.length} video parts
                  </p>
                  <p className="mt-2 text-xs text-muted">{course.iscompleted ? 'Course completed' : 'In progress · completion is recorded for the whole course'}</p>
                  {course.isDevelopmentEnrollment && (
                    <p className="mt-1 text-xs text-muted">Development enrollment · eSewa payment was not confirmed.</p>
                  )}
                </div>
                <span className={`bdg ${course.isDevelopmentEnrollment ? 'bdg-gold' : course.iscompleted ? 'bdg-ok' : 'bdg-gold'}`}>
                  {course.isDevelopmentEnrollment ? 'Development enrollment' : course.iscompleted ? 'Completed' : 'Enrolled'}
                </span>
                <Link href={`/learn/${course._id}`} className="btn btn-s h-10 max-sm:w-full">{course.iscompleted ? 'Review course' : 'Continue learning'}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10" aria-labelledby="certificates-heading">
        <h2 id="certificates-heading" className="t-h3 mb-5">Certificates</h2>
        {certificates.isError && <p role="alert" className="text-sm text-error">Certificates could not be loaded. See the notification for details.</p>}
        {!certificates.isLoading && !certificates.isError && certificates.data?.payload?.length === 0 && <p className="rounded-ui bg-surface p-5 text-sm text-muted">Certificates will appear here after you complete an eligible course and create its certificate record.</p>}
        {certificates.data?.payload && certificates.data.payload.length > 0 && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {certificates.data.payload.map((certificate) => (
              <li key={certificate.courseid} className="card flex items-center gap-3 p-4">
                <span className="grid size-10 place-items-center rounded-full bg-gold-tint text-gold-deep"><I n="award" /></span>
                <div><h3 className="text-sm font-semibold">{certificate.coursename}</h3><p className="mt-1 text-xs text-muted">Certificate record · course {certificate.courseid}</p></div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

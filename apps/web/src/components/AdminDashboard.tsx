'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { I } from './Icon'
import Avatar from './Avatar'
import {
  useApproveCourseMutation,
  useGetPendingCoursesQuery,
  useGetPendingTutorsQuery,
  useVerifyTutorApplicationMutation,
} from '@/src/services/api/Userapi'
import { getApiErrorMessage, getApiSuccessMessage } from '@/src/lib/apiFeedback'

function submittedDate(value?: string) {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
}

export default function AdminDashboard() {
  const requestStarted = useRef(false)
  const tutorRequestStarted = useRef(false)
  const { data, isLoading, isFetching, isError, error, refetch } = useGetPendingCoursesQuery()
  const {
    data: tutorData,
    isLoading: tutorsLoading,
    isFetching: tutorsFetching,
    isError: tutorsError,
    error: tutorError,
    refetch: refetchTutors,
  } = useGetPendingTutorsQuery()
  const [approveCourse] = useApproveCourseMutation()
  const [verifyTutor, tutorVerificationState] = useVerifyTutorApplicationMutation()
  const courses = data?.payload ?? []
  const tutors = tutorData?.payload ?? []

  useEffect(() => {
    if (isLoading || isFetching) {
      if (!requestStarted.current) {
        toast.loading('Loading course review queue…', { id: 'admin-course-queue' })
      }
      requestStarted.current = true
      return
    }
    if (!requestStarted.current) return
    requestStarted.current = false
    if (isError) {
      toast.error(getApiErrorMessage(error), { id: 'admin-course-queue' })
    } else if (data) {
      toast.success(
        getApiSuccessMessage(data, `${courses.length} courses awaiting review.`),
        { id: 'admin-course-queue' },
      )
    }
  }, [courses.length, data, error, isError, isFetching, isLoading])

  useEffect(() => {
    if (tutorsLoading || tutorsFetching) {
      if (!tutorRequestStarted.current) {
        toast.loading('Loading tutor verification queue…', { id: 'admin-tutor-queue' })
      }
      tutorRequestStarted.current = true
      return
    }
    if (!tutorRequestStarted.current) return
    tutorRequestStarted.current = false
    if (tutorsError) {
      toast.error(getApiErrorMessage(tutorError), { id: 'admin-tutor-queue' })
    } else if (tutorData) {
      toast.success(
        getApiSuccessMessage(tutorData, `${tutors.length} tutors awaiting verification.`),
        { id: 'admin-tutor-queue' },
      )
    }
  }, [tutorData, tutorError, tutors.length, tutorsError, tutorsFetching, tutorsLoading])

  function approve(courseid: string, coursename: string) {
    void toast.promise(approveCourse({ courseid }).unwrap(), {
      loading: `Approving ${coursename}…`,
      success: (result) => getApiSuccessMessage(result, 'Course approved and published.'),
      error: getApiErrorMessage,
    })
  }

  function decideTutor(userid: string, fullname: string, decision: 'approve' | 'reject') {
    const action = decision === 'approve' ? 'Approving' : 'Rejecting'
    void toast.promise(verifyTutor({ userid, decision }).unwrap(), {
      loading: `${action} ${fullname}…`,
      success: (result) =>
        getApiSuccessMessage(
          result,
          decision === 'approve' ? 'Tutor application approved.' : 'Tutor application rejected.',
        ),
      error: getApiErrorMessage,
    })
  }

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 lg:py-10">
      <p className="over">Admin console</p>
      <h1 className="t-h1 mt-2">Course review</h1>
      <p className="mt-2 text-base text-muted">
        Review real course submissions and approve courses for the public catalog.
      </p>

      <section id="approvals" className="mt-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="t-h3 !text-[22px] !leading-[30px]">Awaiting approval</h2>
            <p className="mt-1 text-sm text-muted">
              {isError ? 'The review queue is unavailable.' : `${courses.length} pending`}
            </p>
          </div>
          <button type="button" className="btn btn-s h-10" onClick={() => void refetch()} disabled={isFetching}>
            <I n="refresh" c="size-4" />
            Refresh
          </button>
        </div>

        {isError && (
          <div className="rounded-card border border-error/40 bg-error/10 p-5 text-sm" role="alert">
            <p>We couldn’t load the review queue. Check the notification for details and try again.</p>
            <button type="button" className="btn btn-s mt-4" onClick={() => void refetch()}>
              Try again
            </button>
          </div>
        )}

        {isLoading && (
          <div className="grid gap-4" role="status" aria-label="Loading courses">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="card h-52 animate-pulse bg-surface" />
            ))}
          </div>
        )}

        {!isLoading && !isError && courses.length === 0 && (
          <div className="rounded-card border border-dashed border-line bg-surface px-6 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-page text-ok">
              <I n="okc" />
            </span>
            <h3 className="t-h4 mt-4 !text-lg">You’re all caught up</h3>
            <p className="mt-2 text-sm text-muted">New unapproved courses will appear here.</p>
          </div>
        )}

        {!isError && courses.length > 0 && (
          <div className={`grid gap-4 ${isFetching ? 'opacity-60' : ''}`}>
            {courses.map((course) => (
              <article key={course._id} className="card grid gap-5 p-4 sm:grid-cols-[200px_minmax(0,1fr)] sm:p-5">
                <div
                  role={course.title ? 'img' : undefined}
                  aria-label={course.title ? `${course.coursename} course photo` : undefined}
                  className="aspect-video rounded-ui bg-surface bg-cover bg-center sm:aspect-auto sm:min-h-40"
                  style={course.title ? { backgroundImage: `url("${course.title.replaceAll('"', '%22')}")` } : undefined}
                >
                  {!course.title && <span className="grid size-full place-items-center text-muted"><I n="bookopen" c="l" /></span>}
                </div>
                <div className="flex min-w-0 flex-col">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="over line-clamp-1">{course.techstack}</p>
                      <h3 className="t-h4 mt-1">{course.coursename}</h3>
                    </div>
                    <span className="bdg bdg-gold">Awaiting review</span>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted">{course.desc}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
                    <span>Instructor: <b className="text-ink">{course.tutor.tutorname}</b></span>
                    <span>Submitted: {submittedDate(course.createdAt)}</span>
                    <span>Price: <b className="text-ink">{course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}</b></span>
                  </div>
                  <div className="mt-5 flex justify-end border-t border-line pt-4">
                    <button
                      type="button"
                      className="btn btn-p h-10"
                      onClick={() => approve(course._id, course.coursename)}
                      disabled={isFetching}
                    >
                      <I n="check" c="size-4" />
                      Approve and publish
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="tutor-verification" className="mt-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="t-h3 !text-[22px] !leading-[30px]">Tutor verification</h2>
            <p className="mt-1 text-sm text-muted">
              {tutorsError ? 'The tutor queue is unavailable.' : `${tutors.length} awaiting verification`}
            </p>
          </div>
          <button type="button" className="btn btn-s h-10" onClick={() => void refetchTutors()} disabled={tutorsFetching}>
            <I n="refresh" c="size-4" />
            Refresh
          </button>
        </div>

        {tutorsError && (
          <div className="rounded-card border border-error/40 bg-error/10 p-5 text-sm" role="alert">
            <p>We couldn’t load tutor applications. Check the notification for details and try again.</p>
            <button type="button" className="btn btn-s mt-4" onClick={() => void refetchTutors()}>
              Try again
            </button>
          </div>
        )}

        {tutorsLoading && (
          <div className="grid gap-4" role="status" aria-label="Loading tutor applications">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="card h-40 animate-pulse bg-surface" />
            ))}
          </div>
        )}

        {!tutorsLoading && !tutorsError && tutors.length === 0 && (
          <div className="rounded-card border border-dashed border-line bg-surface px-6 py-12 text-center">
            <h3 className="t-h4">No tutor applications awaiting review</h3>
            <p className="mt-2 text-sm text-muted">New tutor applications will appear here.</p>
          </div>
        )}

        {!tutorsError && tutors.length > 0 && (
          <div className={`grid gap-4 ${tutorsFetching ? 'opacity-60' : ''}`}>
            {tutors.map((tutor) => (
              <article key={tutor.userid} className="card p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-4">
                  <Avatar name={tutor.fullname} profilepic={tutor.profilepic} ring={false} className="size-14 text-lg" />
                  <div className="min-w-0 flex-1">
                    <h3 className="t-h4">{tutor.fullname}</h3>
                    <a className="mt-1 block break-all text-sm text-muted underline decoration-gold underline-offset-2" href={`mailto:${tutor.email}`}>{tutor.email}</a>
                  </div>
                  <span className="bdg bdg-gold">Awaiting verification</span>
                </div>
                <dl className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Academic qualifications</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-sm">{tutor.acedemics || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Experience</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-sm">{tutor.experience || 'Not provided'}</dd>
                  </div>
                </dl>
                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">Submitted certificates</h4>
                  {tutor.certificates.length ? (
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {tutor.certificates.map((certificate, index) => (
                        <li key={`${certificate}-${index}`}>
                          <a className="btn btn-s h-9" href={certificate} target="_blank" rel="noreferrer">View certificate {index + 1}</a>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="mt-1 text-sm text-muted">No certificates submitted.</p>}
                </div>
                <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-line pt-4">
                  <button
                    type="button"
                    className="btn btn-s h-10"
                    onClick={() => decideTutor(tutor.userid, tutor.fullname, 'reject')}
                    disabled={tutorsFetching || tutorVerificationState.isLoading}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    className="btn btn-p h-10"
                    onClick={() => decideTutor(tutor.userid, tutor.fullname, 'approve')}
                    disabled={tutorsFetching || tutorVerificationState.isLoading}
                  >
                    <I n="check" c="size-4" />
                    Approve
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

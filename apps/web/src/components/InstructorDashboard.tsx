'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useRef } from 'react'
import { I } from './Icon'
import {
  useGetCoursesByTutorQuery,
  useGetTutorStudentsQuery,
  useToggleCourseCompletionOptionMutation,
  useUploadCoursePartMutation,
} from '@/src/services/api/Userapi'
import { useAppSelector } from '@/src/lib/hooks'
import { getApiErrorMessage, getApiSuccessMessage, isApiFailure } from '@/src/lib/apiFeedback'
import { toast } from 'sonner'

export default function InstructorDashboard() {
  const profile = useAppSelector((state) => state.user)
  const { data, isLoading, isFetching, isSuccess, isError, error, refetch } = useGetCoursesByTutorQuery(undefined, {
    skip: !profile,
  })
  const [toggleCompletionOption, toggleState] = useToggleCourseCompletionOptionMutation()
  const [uploadPart, uploadState] = useUploadCoursePartMutation()
  const studentsQuery = useGetTutorStudentsQuery()
  const courses = data?.payload ?? []
  const requestStarted = useRef(false)

  useEffect(() => {
    if (isLoading || isFetching) {
      if (!requestStarted.current) toast.loading('Loading your courses…', { id: 'tutor-courses-request' })
      requestStarted.current = true
      return
    }
    if (!requestStarted.current) return
    requestStarted.current = false
    if (isError) {
      toast.error(getApiErrorMessage(error), { id: 'tutor-courses-request' })
    } else if (isSuccess && data) {
      if (isApiFailure(data)) {
        toast.error(getApiSuccessMessage(data, 'Your courses could not be loaded.'), { id: 'tutor-courses-request' })
      } else {
        toast.success(getApiSuccessMessage(data, 'Courses loaded.'), { id: 'tutor-courses-request' })
      }
    }
  }, [data, error, isError, isFetching, isLoading, isSuccess])

  useEffect(() => {
    if (toggleState.isLoading) {
      toast.loading('Updating course settings…', { id: 'course-completion-option' })
      return
    }
    if (toggleState.isError) {
      toast.error(getApiErrorMessage(toggleState.error), { id: 'course-completion-option' })
      return
    }
    if (!toggleState.isSuccess) return
    if (isApiFailure(toggleState.data)) {
      toast.error(getApiSuccessMessage(toggleState.data, 'Course settings could not be updated.'), { id: 'course-completion-option' })
      return
    }
    toast.success(getApiSuccessMessage(toggleState.data, 'Course settings updated.'), { id: 'course-completion-option' })
  }, [toggleState.data, toggleState.error, toggleState.isError, toggleState.isLoading, toggleState.isSuccess])

  useEffect(() => {
    if (uploadState.isLoading) {
      toast.loading('Uploading course part…', { id: 'course-part-upload' })
      return
    }
    if (uploadState.isError) {
      toast.error(getApiErrorMessage(uploadState.error), { id: 'course-part-upload' })
      return
    }
    if (!uploadState.isSuccess) return
    if (isApiFailure(uploadState.data)) {
      toast.error(getApiSuccessMessage(uploadState.data, 'The course part could not be uploaded.'), { id: 'course-part-upload' })
      return
    }
    toast.success(getApiSuccessMessage(uploadState.data, 'Course part uploaded.'), { id: 'course-part-upload' })
  }, [uploadState.data, uploadState.error, uploadState.isError, uploadState.isLoading, uploadState.isSuccess])

  useEffect(() => {
    if (studentsQuery.isLoading || studentsQuery.isFetching) {
      toast.loading('Loading your enrolled students…', { id: 'tutor-students' })
      return
    }
    if (studentsQuery.isError) {
      toast.error(getApiErrorMessage(studentsQuery.error), { id: 'tutor-students' })
    } else if (studentsQuery.data) {
      toast.success(getApiSuccessMessage(studentsQuery.data, 'Student roster loaded.'), { id: 'tutor-students' })
    }
  }, [studentsQuery.data, studentsQuery.error, studentsQuery.isError, studentsQuery.isFetching, studentsQuery.isLoading])

  function submitPart(courseid: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const part = form.get('part')
    if (!(part instanceof File)) {
      toast.error('Choose a video file to upload.')
      return
    }
    if (!part.type.startsWith('video/') || part.size > 500 * 1024 * 1024) {
      toast.error('Choose a video file up to 500 MB.')
      return
    }

    uploadPart({
      courseid,
      title: String(form.get('title') ?? '').trim(),
      partdesc: String(form.get('partdesc') ?? '').trim(),
      part,
    })
  }

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8 lg:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="over">Tutor workspace</p>
          <h1 className="t-h1 mt-2">Welcome, {profile?.fullname ?? 'tutor'}</h1>
          <p className="mt-2 text-base text-muted">Manage the courses you have submitted to Ujyalo.</p>
        </div>
        <Link href="/instructor/courses/new" className="btn btn-p btn-lg max-sm:w-full"><I n="plus" c="s" />Create course</Link>
      </div>

      <section className="mt-10" aria-labelledby="courses-heading">
        <h2 id="courses-heading" className="t-h3 mb-5">Your courses</h2>
        {isLoading && <p className="card p-6 text-sm text-muted" role="status">Loading your courses…</p>}
        {isError && (
          <div className="rounded-card border border-error/40 bg-error/10 p-5 text-sm" role="alert">
            <p>Courses could not be loaded. Check the notification for details and try again.</p>
            <button type="button" className="btn btn-s mt-4" onClick={() => void refetch()}>Try again</button>
          </div>
        )}
        {!isLoading && !isError && courses.length === 0 && (
          <div className="rounded-card border border-dashed border-line bg-surface px-6 py-12 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-page text-muted"><I n="bookopen" /></span>
            <h3 className="t-h4 mt-4">No courses yet</h3>
            <p className="mx-auto mt-2 max-w-[420px] text-sm text-muted">Create your first course. Its approval status will appear here.</p>
            <Link href="/instructor/courses/new" className="btn btn-p mt-6"><I n="plus" c="s" />Create course</Link>
          </div>
        )}
        {courses.length > 0 && (
          <ul className="card divide-y divide-line overflow-hidden">
            {courses.map((course) => (
              <li key={course._id} className="flex flex-wrap items-center gap-4 p-5">
                <span
                  role={course.title ? 'img' : undefined}
                  aria-label={course.title ? `${course.coursename} course photo` : undefined}
                  className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-ui bg-surface bg-cover bg-center text-muted"
                  style={course.title ? { backgroundImage: `url("${course.title.replaceAll('"', '%22')}")` } : undefined}
                >
                  {!course.title && <I n="bookopen" />}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[15px] font-semibold">{course.coursename}</h3>
                  <p className="mt-1 text-sm text-muted">{course.desc}</p>
                  <p className="mt-1 text-xs text-muted">Course ID: {course._id}</p>
                </div>
                <Link href={`/instructor/courses/${course._id}/edit`} className="btn btn-s h-10">Edit course</Link>
                <span className={`bdg ${course.isverified ? 'bdg-ok' : 'bdg-gold'}`}>{course.isverified ? 'Approved' : 'Awaiting review'}</span>
                <span className="text-sm text-muted">{course.totalenrolledstudents?.length ?? 0} enrollments</span>
                <div className="w-full border-t border-line pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted">
                      {course.parts?.length ?? 0} course parts · Completion option {course.providecompletionoption ? 'enabled' : 'disabled'}
                    </p>
                    <button
                      type="button"
                      disabled={toggleState.isLoading}
                      onClick={() => toggleCompletionOption({ courseid: course._id })}
                      className="btn btn-s h-10 disabled:opacity-50"
                    >
                      {course.providecompletionoption ? 'Disable completion' : 'Enable completion'}
                    </button>
                  </div>
                  <details className="mt-4 rounded-ui border border-line bg-page p-4">
                    <summary className="cursor-pointer text-sm font-medium">Add a video part</summary>
                    {!course.isverified ? (
                      <p className="mt-3 text-sm text-muted">Video parts can be added after this course is approved.</p>
                    ) : (
                      <form onSubmit={(event) => submitPart(course._id, event)} className="mt-4 grid gap-4 sm:grid-cols-2">
                        <label className="grid gap-2 text-sm font-medium">
                          Part title
                          <input name="title" required className="h-11 rounded-ui border border-line bg-surface px-3 font-normal outline-none focus:border-ink focus:ring-2 focus:ring-gold" />
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                          Part description
                          <input name="partdesc" required className="h-11 rounded-ui border border-line bg-surface px-3 font-normal outline-none focus:border-ink focus:ring-2 focus:ring-gold" />
                        </label>
                        <label className="grid gap-2 text-sm font-medium sm:col-span-2">
                          Video file
                          <input name="part" type="file" accept="video/*" required className="rounded-ui border border-line bg-surface p-3 text-sm font-normal file:mr-3 file:rounded-md file:border-0 file:bg-page file:px-3 file:py-2" />
                          <span className="text-xs font-normal text-muted">Video files up to 500 MB are accepted.</span>
                        </label>
                        <button type="submit" disabled={uploadState.isLoading} className="btn btn-p h-10 sm:col-span-2 sm:justify-self-end disabled:opacity-50">
                          {uploadState.isLoading ? 'Uploading…' : 'Upload part'}
                        </button>
                      </form>
                    )}
                  </details>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12" aria-labelledby="student-roster-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div><h2 id="student-roster-heading" className="t-h3">Enrolled students</h2><p className="mt-1 text-sm text-muted">Students enrolled across your courses.</p></div>
        </div>
        {studentsQuery.isError && <p role="alert" className="rounded-ui border border-error/40 bg-error/10 p-4 text-sm">Student roster could not be loaded. See the notification for details.</p>}
        {!studentsQuery.isLoading && !studentsQuery.isError && (studentsQuery.data?.payload?.length ?? 0) === 0 && <p className="rounded-ui bg-surface p-5 text-sm text-muted">No students are enrolled in your courses yet.</p>}
        {studentsQuery.data?.payload && studentsQuery.data.payload.length > 0 && (
          <ul className="card divide-y divide-line">
            {studentsQuery.data.payload.map((student) => (
              <li key={student.userid} className="flex items-center gap-3 p-4">
                <span className="grid size-9 place-items-center rounded-full bg-surface text-muted"><I n="user" c="s" /></span>
                <span className="text-sm font-medium">{student.username}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

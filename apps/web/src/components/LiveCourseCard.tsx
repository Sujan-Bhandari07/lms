import Link from 'next/link'
import { I } from './Icon'
import Avatar from './Avatar'
import type { Course } from '@/src/services/api/Userapi'

export default function LiveCourseCard({ course }: { course: Course }) {
  return (
    <article className="card lift flex flex-col overflow-hidden p-3">
      <Link
        href={`/courses/${course._id}`}
        aria-label={`View ${course.coursename}`}
        className="relative block aspect-video overflow-hidden rounded-xl bg-surface"
      >
        {course.title && (
          <div
            role="img"
            aria-label={`${course.coursename} course photo`}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${course.title.replaceAll('"', '%22')}")` }}
          />
        )}
        {!course.title && <div className="absolute inset-0 grid place-items-center text-muted"><I n="bookopen" c="l" /></div>}
      </Link>
      <div className="flex flex-1 flex-col gap-2 px-3 pt-5 pb-2">
        <p className="over line-clamp-1">{course.techstack}</p>
        <h2 className="t-h4 !text-lg !leading-[26px]">
          <Link href={`/courses/${course._id}`} className="decoration-gold underline-offset-4 hover:underline">
            {course.coursename}
          </Link>
        </h2>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Avatar name={course.tutor.tutorname} profilepic={course.tutor.profilepic} ring={false} className="size-7 text-[10px]" />
          <span>{course.tutor.tutorname}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <I n="star" c="size-4 fill-gold stroke-gold" />
          <span className="font-medium text-ink">{(course.averageRating ?? 0).toFixed(1)}</span>
          <span>({course.ratings?.length ?? 0} ratings)</span>
          <span className="ml-auto">{course.enrollmentCount ?? 0} learners</span>
        </div>
        <p className="line-clamp-2 min-h-12 text-sm leading-6 text-muted">{course.desc}</p>
        <div className="mt-auto flex items-center justify-between border-t border-line pt-4">
          <span className="font-display text-xl leading-none font-bold">
            {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
          </span>
          <Link href={`/courses/${course._id}`} className="btn btn-s h-9">View course</Link>
        </div>
      </div>
    </article>
  )
}

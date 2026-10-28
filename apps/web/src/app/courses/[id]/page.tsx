import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CourseDetail from '@/src/components/CourseDetail'
import { contentFor, courses, getCourse } from '@/src/lib/courses'

type P = { params: Promise<{ id: string }> | { id: string } }

export const generateStaticParams = () => courses.map((c) => ({ id: c.id }))

export async function generateMetadata(props: P): Promise<Metadata> {
  const c = getCourse((await props.params).id)
  return { title: c?.title ?? 'Course', description: c ? contentFor(c).subtitle : undefined }
}

export default async function CoursePage(props: P) {
  const c = getCourse((await props.params).id)
  if (!c) notFound()
  return <CourseDetail c={c} content={contentFor(c)} />
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CourseDetail from '@/src/components/CourseDetail'
import { contentFor, courses, getCourse } from '@/src/lib/courses'

type P = { params: Promise<{ slug: string }> | { slug: string } }

export const generateStaticParams = () => courses.map((c) => ({ slug: c.slug }))

export async function generateMetadata(props: P): Promise<Metadata> {
  const c = getCourse((await props.params).slug)
  return { title: c?.title ?? 'Course', description: c ? contentFor(c).subtitle : undefined }
}

export default async function CoursePage(props: P) {
  const c = getCourse((await props.params).slug)
  if (!c) notFound()
  return <CourseDetail c={c} content={contentFor(c)} />
}

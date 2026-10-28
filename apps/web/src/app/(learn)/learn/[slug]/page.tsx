import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LearnShell from '@/src/components/LearnShell'
import { courses, getCourse } from '@/src/lib/courses'

type P = { params: Promise<{ slug: string }> | { slug: string } }

export const generateStaticParams = () => courses.map((c) => ({ slug: c.slug }))

export async function generateMetadata(props: P): Promise<Metadata> {
  const c = getCourse((await props.params).slug)
  return { title: c ? `Learning: ${c.title}` : 'Learning' }
}

export default async function LearnPage(props: P) {
  const c = getCourse((await props.params).slug)
  if (!c) notFound()
  return <LearnShell course={c} />
}

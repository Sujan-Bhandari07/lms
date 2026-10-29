import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LearnShell from '@/src/components/LearnShell'
import { courses, getCourse } from '@/src/lib/courses'

type P = { params: Promise<{ id: string }> | { id: string } }

export const generateStaticParams = () => courses.map((c) => ({ id: c.id }))

export async function generateMetadata(props: P): Promise<Metadata> {
  const c = getCourse((await props.params).id)
  return { title: c ? `Learning: ${c.title}` : 'Learning' }
}

export default async function LearnPage(props: P) {
  const c = getCourse((await props.params).id)
  if (!c) notFound()
  return <LearnShell course={c} />
}

import type { Metadata } from 'next'
import Explorer from '@/src/components/Explorer'

export const metadata: Metadata = { title: 'Explore Courses' }

type SP = { q?: string; category?: string }

export default async function CoursesPage(props: { searchParams?: Promise<SP> | SP }) {
  const sp = (await props.searchParams) ?? {}
  return <Explorer initialQuery={sp.q ?? ''} initialCategory={sp.category ?? ''} />
}

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCourse } from '@/lib/courses'

// Placeholder for the learning interface (video player, curriculum sidebar, quizzes, AI assistant).
export default async function Learn(props: { params: Promise<{ slug: string }> | { slug: string } }) {
  const c = getCourse((await props.params).slug)
  if (!c) notFound()
  return (
    <main className="wrap py-24 text-center">
      <span className="over">Learning interface</span>
      <h1 className="t-h1 my-3">{c.title}</h1>
      <p className="mb-8 text-muted">The course player will live here. Design it next to complete the flow.</p>
      <Link className="btn btn-s btn-lg" href={`/courses/${c.slug}`}>Back to course</Link>
    </main>
  )
}

import Link from 'next/link'
import type { Metadata } from 'next'
import { I } from '@/src/components/Icon'

export const metadata: Metadata = { title: 'Learn with Ujyalo' }

export default function Home() {
  return (
    <main className="wrap grid min-h-[calc(100dvh-72px)] content-center py-16">
      <section className="max-w-[760px]">
        <span className="bdg bdg-gold"><I n="check" c="size-4" />Real courses, real progress</span>
        <h1 className="t-display mt-6">Learn with Ujyalo.</h1>
        <p className="t-lead mt-6 max-w-[640px]">
          Explore approved courses, learn from tutor-uploaded videos, and keep track of course completions saved to your account. Tutors can build and manage their courses.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="btn btn-p btn-lg" href="/courses">Explore courses<I n="arrow" c="s" /></Link>
          <Link className="btn btn-p btn-lg" href="/register">Create account<I n="arrow" c="s" /></Link>
          <Link className="btn btn-s btn-lg" href="/login">Sign in</Link>
        </div>
      </section>
    </main>
  )
}

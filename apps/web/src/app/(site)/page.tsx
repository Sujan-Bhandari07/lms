import Link from 'next/link'
import type { Metadata } from 'next'
import { I } from '@/src/components/Icon'

export const metadata: Metadata = { title: 'Learn with Ujyalo' }

export default function Home() {
  return (
    <main className="wrap grid min-h-[calc(100dvh-72px)] content-center py-16">
      <section className="max-w-[760px]">
        <span className="bdg bdg-gold"><I n="check" c="size-4" />Student and tutor accounts</span>
        <h1 className="t-display mt-6">Learning that starts with your account.</h1>
        <p className="t-lead mt-6 max-w-[640px]">
          Sign in as a student or tutor. Tutors can create courses and review their submission status. Course browsing and student enrollment are not currently exposed by the API gateway.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="btn btn-p btn-lg" href="/register">Create account<I n="arrow" c="s" /></Link>
          <Link className="btn btn-s btn-lg" href="/login">Sign in</Link>
        </div>
      </section>
    </main>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { I } from '@/src/components/Icon'
import { Logo } from '@/src/components/Header'
import LoginForm from '@/src/components/LoginForm'

export const metadata: Metadata = { title: 'Sign in' }

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <section className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
        <Logo />
        <div className="m-auto w-full max-w-[400px] py-12">
          <h1 className="t-h1">Welcome back</h1>
          <p className="mt-3 mb-8 text-base text-muted">Sign in to continue your courses and pick up right where you left off.</p>
          <LoginForm />
          <p className="mt-8 text-center text-sm text-muted">
            New to Ujyalo? <Link href="#" className="font-medium text-ink underline decoration-gold underline-offset-4">Create an account</Link>
          </p>
        </div>
        <p className="text-center text-xs text-muted lg:text-left">© 2026 Ujyalo · <Link href="#" className="hover:text-ink">Privacy</Link> · <Link href="#" className="hover:text-ink">Terms</Link></p>
      </section>

      {/* Restrained visual: abstract progress composition on ivory */}
      <aside aria-hidden="true" className="relative hidden overflow-hidden bg-surface lg:block">
        <svg className="absolute inset-0 size-full text-ink"><rect width="100%" height="100%" fill="url(#dots)" /></svg>
        <div className="absolute inset-0 grid place-items-center p-12">
          <div className="relative w-full max-w-[460px]">
            <div className="card p-6 shadow-md">
              <div className="flex items-center justify-between"><span className="over">Continue learning</span><span className="bdg bdg-gold">64%</span></div>
              <h2 className="t-h4 mt-4">NestJS Backend Development</h2>
              <p className="mt-1 text-sm text-muted">Lesson 17 · Guards and role-based access</p>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-surface"><i className="block h-full w-[64%] rounded-full bg-gold" /></div>
              <div className="mt-5 flex items-center gap-3 border-t border-line pt-5 text-[13px] text-muted">
                <span className="inline-flex items-center gap-1.5"><I n="vid" c="s" />25 lessons</span>
                <span className="inline-flex items-center gap-1.5"><I n="clock" c="s" />14h 20m</span>
                <span className="ml-auto inline-flex items-center gap-1.5 text-ink"><I n="spark" c="size-4 text-gold-deep" />AI assistant</span>
              </div>
            </div>
            <div className="card absolute -right-6 -bottom-12 flex items-center gap-3 p-4 shadow-md">
              <div className="grid size-10 place-items-center rounded-full bg-gold-tint text-gold-deep"><I n="award" /></div>
              <div><strong className="block text-sm leading-[22px] font-semibold">Certificate earned</strong><small className="text-xs text-muted">Python for AI</small></div>
            </div>
          </div>
        </div>
        <p className="absolute inset-x-12 bottom-10 max-w-[420px] font-display text-xl leading-7 font-semibold tracking-[-0.01em]">Learn skills that move you forward, one structured lesson at a time.</p>
      </aside>
    </main>
  )
}

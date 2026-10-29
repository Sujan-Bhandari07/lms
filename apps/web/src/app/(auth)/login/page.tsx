import type { Metadata } from 'next'
import Link from 'next/link'
import LoginForm from '@/src/components/LoginForm'
import { Logo } from '@/src/components/Header'

export const metadata: Metadata = { title: 'Sign in' }

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-10">
      <section className="w-full max-w-[440px]">
        <Logo />
        <div className="card mt-10 p-6 sm:p-8">
          <h1 className="t-h1">Welcome back</h1>
          <p className="mt-3 mb-8 text-base text-muted">Sign in with your Ujyalo account.</p>
          <LoginForm />
          <p className="mt-8 text-center text-sm text-muted">
            New to Ujyalo? <Link href="/register" className="font-medium text-ink underline decoration-gold underline-offset-4">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  )
}

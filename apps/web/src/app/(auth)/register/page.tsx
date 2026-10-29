import type { Metadata } from 'next'
import Link from 'next/link'
import LoginForm from '@/src/components/LoginForm'
import { Logo } from '@/src/components/Header'

export const metadata: Metadata = { title: 'Create account' }

export default function RegisterPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-10">
      <section className="w-full max-w-[440px]">
        <Logo />
        <div className="card mt-10 p-6 sm:p-8">
          <h1 className="t-h1">Create your account</h1>
          <p className="mt-3 mb-8 text-base text-muted">Register as a student or tutor to get started.</p>
          <LoginForm mode="register" />
          <p className="mt-8 text-center text-sm text-muted">
            Already registered? <Link href="/login" className="font-medium text-ink underline decoration-gold underline-offset-4">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  )
}

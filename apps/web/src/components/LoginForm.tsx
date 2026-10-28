'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useRef, useState } from 'react'
import { I } from './Icon'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const validate = (email: string, pw: string) => ({
  email: !email.trim() ? 'Enter your email address.' : !EMAIL_RE.test(email.trim()) ? 'Enter a valid email, like name@example.com.' : '',
  password: !pw ? 'Enter your password.' : pw.length < 8 ? 'Your password must be at least 8 characters.' : '',
})

const FIELD = 'h-12 w-full rounded-ui border bg-page px-4 text-base text-ink outline-none transition placeholder:text-muted hover:border-[#CFCCC4] focus:border-ink focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-page'

function FieldError({ id, msg }: { id: string; msg: string }) {
  return msg ? <p id={id} role="alert" className="mt-2 flex items-start gap-2 text-[13px] leading-5 text-error"><I n="alert" c="mt-px size-4" />{msg}</p> : null
}

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [touched, setTouched] = useState({ email: false, password: false })
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const emailRef = useRef<HTMLInputElement>(null)
  const pwRef = useRef<HTMLInputElement>(null)
  const err = validate(email, pw)
  const showErr = { email: touched.email && err.email, password: touched.password && err.password }

  function submit(e: FormEvent) {
    e.preventDefault()
    setTouched({ email: true, password: true })
    setFormError('')
    if (err.email) return emailRef.current?.focus()
    if (err.password) return pwRef.current?.focus()
    setLoading(true)
    // Demo only: replace with your auth call (e.g. signIn / POST /api/auth/login).
    setTimeout(() => {
      if (email.trim().toLowerCase() === 'error@ujyalo.com') {
        setLoading(false)
        setFormError('We couldn’t sign you in. Check your email and password, then try again.')
      } else router.push('/dashboard')
    }, 900)
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      {formError && (
        <div role="alert" className="flex gap-3 rounded-ui border border-error/40 bg-error/10 p-4 text-sm leading-[22px] text-ink">
          <I n="alert" c="mt-0.5 text-error" /><p>{formError}</p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-2 block text-sm leading-[22px] font-medium">Email address</label>
        <input
          ref={emailRef} id="email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          aria-invalid={!!showErr.email} aria-describedby={showErr.email ? 'email-err' : undefined}
          className={`${FIELD} ${showErr.email ? 'border-error' : 'border-line'}`}
        />
        <FieldError id="email-err" msg={showErr.email as string} />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="password" className="text-sm leading-[22px] font-medium">Password</label>
          <Link href="#" className="text-[13px] font-medium text-muted underline decoration-gold underline-offset-4 hover:text-ink">Forgot password?</Link>
        </div>
        <div className="relative">
          <input
            ref={pwRef} id="password" name="password" type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password"
            value={pw} onChange={(e) => setPw(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            aria-invalid={!!showErr.password} aria-describedby={showErr.password ? 'pw-err' : undefined}
            className={`${FIELD} pr-12 ${showErr.password ? 'border-error' : 'border-line'}`}
          />
          <button type="button" onClick={() => setShow(!show)} aria-pressed={show} aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute top-1/2 right-1 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-ui text-muted hover:text-ink">
            <I n={show ? 'eyeoff' : 'eye'} />
          </button>
        </div>
        <FieldError id="pw-err" msg={showErr.password as string} />
      </div>

      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-[18px] accent-btn" />
        Keep me signed in on this device
      </label>

      <button type="submit" disabled={loading} aria-busy={loading} className="btn btn-p btn-lg w-full">
        {loading ? <><span className="size-4 animate-spin rounded-full border-2 border-btn-fg/30 border-t-btn-fg" />Signing in…</> : 'Sign In'}
      </button>
    </form>
  )
}

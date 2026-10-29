'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLoginMutation, useRegisterMutation, type UserProfile } from '@/src/services/api/Userapi'
import { useAppDispatch } from '@/src/lib/hooks'
import { setuser } from '@/src/services/slices/Userslice'
import { getApiErrorMessage } from '@/src/lib/apiFeedback'
import { toast } from 'sonner'
import { I } from './Icon'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PASSWORD_RE = /^(?=(?:.*[a-z]){2,})(?=.*[A-Z])(?=(?:.*\d){2,})(?=.*[^A-Za-z0-9]).{6,}$/
const FIELD = 'h-12 w-full rounded-ui border border-line bg-page px-4 text-base text-ink outline-none transition placeholder:text-muted hover:border-[#CFCCC4] focus:border-ink focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-page'

export default function LoginForm({ mode = 'login' }: { mode?: 'login' | 'register' }) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [login, loginState] = useLoginMutation()
  const [register, registerState] = useRegisterMutation()
  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'student' | 'tutor'>('student')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')
  const request = mode === 'register' ? registerState : loginState
  const busy = request.isLoading

  useEffect(() => {
    if (request.isLoading) {
      toast.loading(mode === 'register' ? 'Creating your account…' : 'Signing you in…', { id: 'auth-request' })
      return
    }

    if (request.isError) {
      toast.error(getApiErrorMessage(request.error), { id: 'auth-request' })
      return
    }

    if (!request.isSuccess) return
    const response = request.data
    if (!response?.success || !response.payload) {
      toast.error(response?.message || 'The server response did not include your account profile.', { id: 'auth-request' })
      return
    }

    dispatch(setuser(response.payload))
    toast.success(response.message || (mode === 'register' ? 'Account created.' : 'Signed in.'), { id: 'auth-request' })
    router.replace(
      response.payload.role === 'admin'
        ? '/admin'
        : response.payload.role === 'tutor'
          ? '/instructor'
          : '/dashboard',
    )
  }, [dispatch, mode, request.data, request.error, request.isError, request.isLoading, request.isSuccess, router])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    if (mode === 'register' && !fullname.trim()) {
      setFormError('Enter your full name.')
      return
    }
    if (!EMAIL_RE.test(email.trim())) {
      setFormError('Enter a valid email address.')
      return
    }
    if (!PASSWORD_RE.test(password)) {
      setFormError('Use at least 6 characters, including 2 lowercase letters, 1 uppercase letter, 2 numbers, and 1 symbol.')
      return
    }

    if (mode === 'register') {
      register({ fullname: fullname.trim(), email: email.trim(), password, role })
    } else {
      login({ email: email.trim(), password })
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      {formError && (
        <div role="alert" className="flex gap-3 rounded-ui border border-error/40 bg-error/10 p-4 text-sm leading-[22px] text-ink">
          <I n="alert" c="mt-0.5 text-error" /><p>{formError}</p>
        </div>
      )}

      {mode === 'register' && (
        <div>
          <label htmlFor="fullname" className="mb-2 block text-sm font-medium">Full name</label>
          <input id="fullname" name="fullname" autoComplete="name" required value={fullname} onChange={(event) => setFullname(event.target.value)} className={FIELD} />
        </div>
      )}
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium">Email address</label>
        <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className={FIELD} />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium">Password</label>
        <div className="relative">
          <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} required value={password} onChange={(event) => setPassword(event.target.value)} className={`${FIELD} pr-12`} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} aria-pressed={showPassword} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute top-1/2 right-1 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-ui text-muted hover:text-ink">
            <I n={showPassword ? 'eyeoff' : 'eye'} />
          </button>
        </div>
        {mode === 'register' && <p className="mt-2 text-xs text-muted">At least 6 characters, 2 lowercase letters, 1 uppercase letter, 2 numbers, and 1 symbol.</p>}
      </div>
      {mode === 'register' && (
        <div>
          <label htmlFor="role" className="mb-2 block text-sm font-medium">Account type</label>
          <select id="role" value={role} onChange={(event) => setRole(event.target.value as 'student' | 'tutor')} className={`${FIELD} cursor-pointer`}>
            <option value="student">Student</option>
            <option value="tutor">Tutor</option>
          </select>
        </div>
      )}
      <button type="submit" disabled={busy} aria-busy={busy} className="btn btn-p btn-lg w-full">
        {busy ? <><span className="size-4 animate-spin rounded-full border-2 border-btn-fg/30 border-t-btn-fg" />{mode === 'register' ? 'Creating account…' : 'Signing in…'}</> : mode === 'register' ? 'Create account' : 'Sign in'}
      </button>
    </form>
  )
}

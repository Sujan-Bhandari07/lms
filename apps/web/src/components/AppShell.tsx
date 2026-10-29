'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Avatar from './Avatar'
import { I } from './Icon'
import { Logo } from './Header'
import type { ShellConfig } from '@/src/lib/nav'
import { useLogoutMutation, useGetProfileQuery, userApi } from '@/src/services/api/Userapi'
import { useAppDispatch } from '@/src/lib/hooks'
import { setuser } from '@/src/services/slices/Userslice'
import { getApiErrorMessage, getApiSuccessMessage, isApiFailure } from '@/src/lib/apiFeedback'
import { toast } from 'sonner'

function isUnauthorized(error: unknown) {
  return typeof error === 'object' && error !== null && 'status' in error && error.status === 401
}

export default function AppShell({ nav, role, home, children }: ShellConfig & { children: React.ReactNode }) {
  const path = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { data, isLoading, isFetching, isSuccess, isError, error, refetch } = useGetProfileQuery()
  const [logout, logoutState] = useLogoutMutation()
  const [open, setOpen] = useState(false)
  const profileRequestStarted = useRef(false)
  const profile = data?.payload

  useEffect(() => {
    if (profile) dispatch(setuser(profile))
  }, [dispatch, profile])
  useEffect(() => {
    if (isLoading || isFetching) {
      if (!profileRequestStarted.current) toast.loading('Checking your session…', { id: 'profile-request' })
      profileRequestStarted.current = true
      return
    }
    if (!profileRequestStarted.current) return
    profileRequestStarted.current = false
    if (isError) {
      toast.error(getApiErrorMessage(error), { id: 'profile-request' })
    } else if (isSuccess && data) {
      if (isApiFailure(data)) {
        toast.error(getApiSuccessMessage(data, 'Your session could not be verified.'), { id: 'profile-request' })
      } else {
        toast.success(getApiSuccessMessage(data, 'Session verified.'), { id: 'profile-request' })
      }
    }
  }, [data, error, isError, isFetching, isLoading, isSuccess])
  useEffect(() => {
    if (logoutState.isLoading) {
      toast.loading('Signing you out…', { id: 'logout-request' })
      return
    }
    if (logoutState.isError) {
      toast.error(getApiErrorMessage(logoutState.error), { id: 'logout-request' })
      return
    }
    if (!logoutState.isSuccess) return
    toast.success(getApiSuccessMessage(logoutState.data, 'Signed out.'), { id: 'logout-request' })
    dispatch(setuser(null))
    dispatch(userApi.util.resetApiState())
    router.replace('/login')
  }, [dispatch, logoutState.data, logoutState.error, logoutState.isError, logoutState.isLoading, logoutState.isSuccess, router])
  useEffect(() => {
    if ((isError && isUnauthorized(error)) || (profile && profile.role !== role)) {
      router.replace('/login')
    }
  }, [error, isError, profile, role, router])
  useEffect(() => setOpen(false), [path])
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    addEventListener('keydown', handleKey)
    return () => removeEventListener('keydown', handleKey)
  }, [])

  function signOut() { logout() }

  if (isLoading || (profile && profile.role !== role) || (isError && isUnauthorized(error))) {
    return <main className="grid min-h-dvh place-items-center text-sm text-muted" aria-live="polite">Checking your session…</main>
  }
  if (isError) {
    return (
      <main className="grid min-h-dvh place-items-center px-5">
        <div className="max-w-md rounded-card border border-error/40 bg-error/10 p-6 text-sm" role="alert">
          <p>We could not verify your session. Check the notification for details and try again.</p>
          <button type="button" className="btn btn-s mt-4" onClick={() => void refetch()}>Try again</button>
        </div>
      </main>
    )
  }
  if (!profile) {
    return <main className="grid min-h-dvh place-items-center px-5 text-sm text-error" role="alert">The server response did not include your account profile.</main>
  }

  const label = 'md:max-lg:hidden'

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-line bg-page/90 px-3 backdrop-blur-[12px] md:hidden">
        <button className="grid size-11 cursor-pointer place-items-center" onClick={() => setOpen(true)} aria-label="Open navigation" aria-expanded={open}><I n="menu" c="l" /></button>
        <Logo href={home} />
        <Avatar name={profile.fullname} profilepic={profile.profilepic} ring={false} className="ml-auto size-9 text-xs" />
      </header>

      {open && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-[rgba(17,17,17,.48)] md:hidden" onClick={() => setOpen(false)} />}
      <aside aria-label="Application" className={`fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col border-r border-line bg-surface p-4 transition-transform duration-200 ease-ujyalo md:z-30 md:w-[72px] md:translate-x-0 lg:w-[264px] ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-10 items-center justify-between px-2 md:max-lg:justify-center md:max-lg:px-0">
          <span className="md:max-lg:hidden"><Logo href={home} /></span>
          <span className="hidden md:max-lg:block"><Logo href={home} /></span>
          <button className="grid size-10 cursor-pointer place-items-center md:hidden" onClick={() => setOpen(false)} aria-label="Close navigation"><I n="x" /></button>
        </div>
        <p className={`over mt-8 mb-2 px-3 !text-muted ${label}`}>{role === 'admin' ? 'Admin menu' : role === 'tutor' ? 'Tutor menu' : 'Student menu'}</p>
        <nav className="mt-4 grid gap-1 lg:mt-0" aria-label="Main">
          {nav.map(([text, href, icon]) => {
            const on = href === path
            return (
              <Link key={text} href={href} title={text} aria-current={on ? 'page' : undefined}
                className={`relative flex h-11 items-center gap-3 rounded-ui border px-3 text-sm font-medium transition-colors md:max-lg:justify-center ${on ? 'border-line bg-page text-ink before:absolute before:inset-y-2 before:-left-px before:w-[3px] before:rounded-full before:bg-gold' : 'border-transparent text-muted hover:bg-page/60 hover:text-ink'}`}>
                <I n={icon} />
                <span className={`flex-1 ${label}`}>{text}</span>
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto grid gap-3 pt-6">
          <div className="flex items-center gap-3 border-t border-line pt-4 md:max-lg:justify-center">
            <Avatar name={profile.fullname} profilepic={profile.profilepic} ring={false} className="size-9 text-xs" />
            <div className={`min-w-0 flex-1 ${label}`}><b className="block truncate text-sm leading-5 font-semibold">{profile.fullname}</b><span className="text-xs capitalize text-muted">{profile.role}</span></div>
            <button type="button" onClick={signOut} disabled={logoutState.isLoading} aria-label="Sign out" className={`grid size-9 place-items-center text-muted hover:text-ink disabled:opacity-50 ${label}`}><I n="logout" c="s" /></button>
          </div>
        </div>
      </aside>

      <div className="md:pl-[72px] lg:pl-[264px]">{children}</div>
    </div>
  )
}

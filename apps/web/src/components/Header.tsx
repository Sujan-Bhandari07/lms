'use client'

import Link from 'next/link'
import { I } from './Icon'
import Avatar from './Avatar'
import { useGetProfileQuery } from '@/src/services/api/Userapi'

export function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} aria-label="Ujyalo home" className="flex items-center gap-2.5 font-display text-[22px] leading-none font-bold tracking-[-0.02em]">
      <b className="relative grid size-7 place-items-center rounded-ui bg-btn text-[15px] text-btn-fg after:absolute after:top-[5px] after:right-[5px] after:size-[5px] after:rounded-full after:bg-gold after:content-['']">U</b>
      Ujyalo
    </Link>
  )
}

export default function Header() {
  const { data } = useGetProfileQuery()
  const profile = data?.payload
  const dashboard =
    profile?.role === 'admin'
      ? '/admin'
      : profile?.role === 'tutor'
        ? '/instructor'
        : '/dashboard'

  return (
    <header className="sticky top-0 z-20 h-[72px] border-b border-line bg-page/90 backdrop-blur-[12px]">
      <div className="wrap flex h-full items-center">
        <Logo />
        <nav className="ml-auto flex items-center gap-2" aria-label="Account">
          <Link className="btn btn-g max-sm:hidden" href="/courses">Explore courses</Link>
          {profile ? (
            <Link href={dashboard} aria-label={`${profile.fullname} dashboard`} title={profile.fullname}>
              <Avatar name={profile.fullname} profilepic={profile.profilepic} ring={false} className="size-10 text-xs" />
            </Link>
          ) : (
            <>
              <Link className="btn btn-g" href="/login">Sign in</Link>
              <Link className="btn btn-p" href="/register"><span className="hidden sm:inline">Create account</span><span className="sm:hidden">Join</span><I n="arrow" c="s" /></Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

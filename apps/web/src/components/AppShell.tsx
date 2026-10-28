'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Avatar from './Avatar'
import { I } from './Icon'
import { Logo } from './Header'
import { student } from '@/src/lib/student'

const NAV: [label: string, href: string, icon: string, count?: number][] = [
  ['Dashboard', '/dashboard', 'grid'], ['Explore Courses', '/courses', 'compass'], ['My Learning', '#', 'bookopen'], ['AI Workspace', '#', 'spark'],
  ['Certificates', '#', 'award'], ['Messages', '#', 'msg', 2], ['Notifications', '#', 'bell', 3], ['Settings', '#', 'gear'],
]

/** Authenticated app chrome: 264px sidebar, 72px icon rail on tablet, slide-over drawer on mobile. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [path])
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false); addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [])
  const label = 'md:max-lg:hidden'

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-line bg-page/90 px-3 backdrop-blur-[12px] md:hidden">
        <button className="grid size-11 cursor-pointer place-items-center" onClick={() => setOpen(true)} aria-label="Open navigation" aria-expanded={open}><I n="menu" c="l" /></button>
        <Logo href="/dashboard" />
        <Avatar name={student.name} ring={false} className="ml-auto size-9 text-xs" />
      </header>

      {open && <div className="fixed inset-0 z-30 bg-[rgba(17,17,17,.48)] md:hidden" onClick={() => setOpen(false)} />}
      <aside aria-label="Application" className={`fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col border-r border-line bg-surface p-4 transition-transform duration-200 ease-ujyalo md:z-30 md:w-[72px] md:translate-x-0 lg:w-[264px] ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-10 items-center justify-between px-2 md:max-lg:justify-center md:max-lg:px-0">
          <span className="md:max-lg:hidden"><Logo href="/dashboard" /></span>
          <span className="hidden md:max-lg:block"><Logo href="/dashboard" /></span>
          <button className="grid size-10 cursor-pointer place-items-center md:hidden" onClick={() => setOpen(false)} aria-label="Close navigation"><I n="x" /></button>
        </div>
        <p className={`over mt-8 mb-2 px-3 !text-muted ${label}`}>Menu</p>
        <nav className="mt-4 grid gap-1 md:mt-4 lg:mt-0" aria-label="Main">
          {NAV.map(([text, href, icon, count]) => {
            const on = href === path
            return (
              <Link key={text} href={href} title={text} aria-current={on ? 'page' : undefined}
                className={`relative flex h-11 items-center gap-3 rounded-ui border px-3 text-sm font-medium transition-colors md:max-lg:justify-center ${on ? 'border-line bg-page text-ink before:absolute before:inset-y-2 before:-left-px before:w-[3px] before:rounded-full before:bg-gold' : 'border-transparent text-muted hover:bg-page/60 hover:text-ink'}`}>
                <I n={icon} />
                <span className={`flex-1 ${label}`}>{text}</span>
                {count ? <span className={`grid h-5 min-w-5 place-items-center rounded-full bg-btn px-1.5 text-[11px] font-semibold text-btn-fg ${label}`}>{count}</span> : null}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto grid gap-3">
          <div className={`rounded-card border border-line bg-page p-4 ${label}`}>
            <p className="text-[13px] font-medium">Weekly goal</p>
            <p className="mt-0.5 text-xs text-muted">3 of 5 lessons completed</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface"><i className="block h-full w-[60%] rounded-full bg-gold" /></div>
          </div>
          <div className="flex items-center gap-3 border-t border-line pt-4 md:max-lg:justify-center">
            <Avatar name={student.name} ring={false} className="size-9 text-xs" />
            <div className={`min-w-0 flex-1 ${label}`}><b className="block truncate text-sm leading-5 font-semibold">{student.name}</b><span className="text-xs text-muted">Student</span></div>
            <Link href="/login" aria-label="Sign out" className={`grid size-9 place-items-center text-muted hover:text-ink ${label}`}><I n="logout" c="s" /></Link>
          </div>
        </div>
      </aside>

      <div className="md:pl-[72px] lg:pl-[264px]">{children}</div>
    </div>
  )
}

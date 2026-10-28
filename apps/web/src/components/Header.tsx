'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { I } from './Icon'

export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Explore Courses', href: '/courses' },
  { label: 'Categories', href: '/#categories' },
  { label: 'AI Learning', href: '/#ai' },
  { label: 'Become an Instructor', href: '/#instructors' },
]

export function Logo() {
  return (
    <Link href="/" aria-label="Ujyalo home" className="flex items-center gap-2.5 font-display text-[22px] leading-none font-bold tracking-[-0.02em]">
      <b className="relative grid size-7 place-items-center rounded-ui bg-btn text-[15px] text-btn-fg after:absolute after:top-[5px] after:right-[5px] after:size-[5px] after:rounded-full after:bg-gold after:content-['']">U</b>
      Ujyalo
    </Link>
  )
}

export default function Header() {
  const path = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 8)
    f()
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  useEffect(() => setOpen(false), [path])
  const active = (h: string) => (h === '/' ? path === '/' : h === '/courses' ? path.startsWith('/courses') : false)

  return (
    <>
      <header className={`sticky top-[env(safe-area-inset-top,0px)] z-20 h-[72px] border-b border-line transition-colors ${scrolled ? 'bg-page/80 backdrop-blur-[12px]' : 'bg-page'}`}>
        <div className="wrap flex h-[72px] items-center gap-8">
          <Logo />
          <nav className="ml-auto hidden gap-7 lg:flex" aria-label="Primary">
            {NAV.map((n) => (
              <Link
                key={n.label} href={n.href} aria-current={active(n.href) ? 'page' : undefined}
                className={`border-b-2 pt-6 pb-[21px] text-sm font-medium transition-colors ${active(n.href) ? 'border-gold text-ink' : 'border-transparent text-muted hover:text-ink'}`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            <Link className="btn btn-g" href="#">Login</Link>
            <Link className="btn btn-p" href="#">Get Started</Link>
          </div>
          <button className="ml-auto grid size-11 cursor-pointer place-items-center lg:hidden" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            <I n={open ? 'x' : 'menu'} c="l" />
          </button>
        </div>
      </header>
      <div className={`fixed inset-x-0 top-[72px] bottom-0 z-[18] flex-col gap-1 bg-surface p-6 lg:hidden ${open ? 'flex' : 'hidden'}`}>
        {NAV.map((n) => <Link key={n.label} href={n.href} className="border-b border-line py-4 text-lg leading-none font-medium">{n.label}</Link>)}
        <Link href="#" className="border-b border-line py-4 text-lg leading-none font-medium">Login</Link>
        <Link className="btn btn-p btn-lg mt-4" href="#">Get Started</Link>
      </div>
    </>
  )
}

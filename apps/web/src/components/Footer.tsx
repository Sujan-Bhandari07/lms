import Link from 'next/link'
import { Logo } from './Header'

const COLS: [string, [string, string][]][] = [
  ['Platform', [['Explore Courses', '/courses'], ['Categories', '/#categories'], ['AI Learning', '/#ai'], ['Certificates', '#']]],
  ['Teach', [['Become an Instructor', '/#instructors'], ['Publish a Course', '#'], ['Instructor Guidelines', '#']]],
  ['Company', [['About', '#'], ['Careers', '#'], ['Blog', '#'], ['Contact', '#']]],
  ['Support', [['Help Center', '#'], ['Privacy Policy', '#'], ['Terms of Service', '#']]],
]

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-line pt-14 pb-8 sm:mt-24 sm:pt-20">
      <div className="wrap">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 xl:grid-cols-[1.6fr_repeat(4,1fr)] xl:gap-12 md:grid-cols-3">
          <div className="col-span-full xl:col-span-1">
            <Logo />
            <p className="mt-4 max-w-[280px] text-sm leading-[22px] text-muted">A premium learning platform for structured, self-paced courses, recorded video lessons, certificates and AI-powered support.</p>
          </div>
          {COLS.map(([h, links]) => (
            <div key={h}>
              <h4 className="mb-5 font-sans text-xs leading-4 font-semibold tracking-[0.08em] text-muted uppercase">{h}</h4>
              <ul className="grid gap-3">
                {links.map(([l, href]) => <li key={l}><Link href={href} className="text-sm decoration-gold underline-offset-4 hover:underline">{l}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-wrap justify-between gap-4 border-t border-line pt-6 text-[13px] text-muted">
          <span>© 2026 Ujyalo. All rights reserved.</span>
          <div className="flex gap-6"><a href="#">Twitter / X</a><a href="#">LinkedIn</a><a href="#">YouTube</a></div>
        </div>
      </div>
    </footer>
  )
}

import Link from 'next/link'
import { I } from './Icon'

export default function SectionHead({ over, title, link, href = '/courses' }: { over: string; title: string; link?: string; href?: string }) {
  return (
    <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
      <div>
        <span className="over">{over}</span>
        <h2 className="t-h2 mt-3 max-w-[560px]">{title}</h2>
      </div>
      {link && (
        <Link href={href} className="inline-flex items-center gap-2 border-b border-ink pb-0.5 text-sm font-medium">
          {link}<I n="arrow" c="s" />
        </Link>
      )}
    </div>
  )
}

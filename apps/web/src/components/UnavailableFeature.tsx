import Link from 'next/link'
import { I } from './Icon'

export default function UnavailableFeature({ feature }: { feature: string }) {
  return (
    <main className="mx-auto grid min-h-[55vh] max-w-[760px] content-center px-5 py-16 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-surface text-muted"><I n="bookopen" c="l" /></span>
      <h1 className="t-h1 mt-6">{feature} is not available yet</h1>
      <p className="mt-4 text-base leading-7 text-muted">
        The current API gateway does not expose this feature, so this page is hidden rather than showing sample data.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-s btn-lg">Home</Link>
        <Link href="/login" className="btn btn-p btn-lg">Sign in</Link>
      </div>
    </main>
  )
}

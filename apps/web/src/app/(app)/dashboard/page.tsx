'use client'

import { useAppSelector } from '@/src/lib/hooks'

export default function Dashboard() {
  const profile = useAppSelector((state) => state.user)

  return (
    <main className="mx-auto max-w-[1000px] px-5 py-8 sm:px-8 lg:py-10">
      <p className="over">Student account</p>
      <h1 className="t-h1 mt-2">Welcome, {profile?.fullname ?? 'student'}</h1>
      <p className="mt-3 max-w-[640px] text-base text-muted">Your account is connected to the backend. Course enrollment and student learning data are not currently exposed by the gateway.</p>
      {profile && (
        <section className="card mt-8 max-w-[640px] p-6" aria-labelledby="account-heading">
          <h2 id="account-heading" className="t-h3">Account details</h2>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-[140px_1fr]">
            <dt className="text-muted">Full name</dt><dd className="font-medium">{profile.fullname}</dd>
            <dt className="text-muted">Email</dt><dd className="font-medium">{profile.email}</dd>
            <dt className="text-muted">Account type</dt><dd className="font-medium capitalize">{profile.role}</dd>
          </dl>
        </section>
      )}
    </main>
  )
}

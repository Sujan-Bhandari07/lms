'use client'

import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getApiErrorMessage } from '@/src/lib/apiFeedback'
import { useVerifyPaymentMutation } from '@/src/services/api/Userapi'

function PaymentSuccessContent() {
  const params = useSearchParams()
  const data = params.get('data')
  const [verifyPayment] = useVerifyPaymentMutation()
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<
    | { status: 'verifying' }
    | { status: 'verified'; courseid: string }
    | { status: 'development'; courseid: string; paymentStatus: 'pending' | 'failed' }
    | { status: 'error'; message: string }
  >({ status: 'verifying' })

  useEffect(() => {
    let active = true
    if (!data) {
      setState({
        status: 'error',
        message: 'The payment response is missing. No enrollment has been created.',
      })
      return () => {
        active = false
      }
    }

    setState({ status: 'verifying' })
    void verifyPayment({ data })
      .unwrap()
      .then((result) => {
        if (!result.success || !result.payload?.courseid) {
          throw new Error(result.message || 'Payment could not be verified.')
        }
        if (active) {
          setState(
            result.payload.enrollmentSource === 'development'
              ? {
                  status: 'development',
                  courseid: result.payload.courseid,
                  paymentStatus: result.payload.paymentStatus === 'failed' ? 'failed' : 'pending',
                }
              : { status: 'verified', courseid: result.payload.courseid },
          )
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            status: 'error',
            message: getApiErrorMessage(error),
          })
        }
      })

    return () => {
      active = false
    }
  }, [attempt, data, verifyPayment])

  return (
    <main className="wrap grid min-h-[70vh] place-items-center py-12">
      <section className="card w-full max-w-xl p-6 text-center sm:p-9" aria-live="polite">
        {state.status === 'verifying' && (
          <>
            <div className="mx-auto size-10 animate-spin rounded-full border-4 border-line border-t-gold" />
            <h1 className="t-h2 mt-5">Verifying your payment</h1>
            <p className="mt-2 text-sm text-muted">We’re checking the transaction with eSewa. Please keep this page open.</p>
          </>
        )}
        {state.status === 'verified' && (
          <>
            <h1 className="t-h2">Payment confirmed</h1>
            <p className="mt-2 text-sm text-muted">Your enrollment is ready.</p>
            <Link className="btn btn-p mt-6" href={`/learn/${encodeURIComponent(state.courseid)}`}>Open course</Link>
          </>
        )}
        {state.status === 'development' && (
          <>
            <h1 className="t-h2">Development enrollment granted</h1>
            <p className="mt-3 text-sm text-muted">
              You can access the course for development testing. eSewa did not confirm payment
              (recorded payment status: {state.paymentStatus}); this is not a successful payment.
            </p>
            <Link className="btn btn-p mt-6" href={`/learn/${encodeURIComponent(state.courseid)}`}>Open course</Link>
          </>
        )}
        {state.status === 'error' && (
          <>
            <h1 className="t-h2">Unable to verify payment</h1>
            <p className="mt-3 text-sm text-muted" role="alert">{state.message}</p>
            <p className="mt-3 text-sm text-muted">Your payment outcome may still be pending. No enrollment is granted until the server verifies payment. Retry verification, and contact support if you were charged and verification continues to fail.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {data && <button type="button" className="btn btn-s" onClick={() => setAttempt((value) => value + 1)}>Retry verification</button>}
              <Link className="btn btn-p" href="/courses">Browse courses</Link>
            </div>
          </>
        )}
      </section>
    </main>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<main className="wrap grid min-h-[70vh] place-items-center text-sm text-muted">Loading payment status…</main>}>
      <PaymentSuccessContent />
    </Suspense>
  )
}

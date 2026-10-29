'use client'

import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getApiErrorMessage } from '@/src/lib/apiFeedback'
import { useVerifyPaymentMutation } from '@/src/services/api/Userapi'

type PaymentState =
  | { status: 'checking' }
  | { status: 'verified'; courseid: string }
  | { status: 'development'; courseid: string; paymentStatus: 'pending' | 'failed' }
  | { status: 'failed'; message: string }
  | { status: 'error'; message: string }

function PaymentFailedContent() {
  const params = useSearchParams()
  const courseid = params.get('courseid')
  const callbackData = params.get('data')
  const transaction_uuid = params.get('transaction_uuid')
  const product_code = params.get('product_code')
  const total_amount = params.get('total_amount')
  const data = callbackData || (
    transaction_uuid && product_code && total_amount
      ? btoa(JSON.stringify({ transaction_uuid, product_code, total_amount }))
      : null
  )
  const [verifyPayment] = useVerifyPaymentMutation()
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<PaymentState>(
    data ? { status: 'checking' } : {
      status: 'error',
      message: 'eSewa returned a failure redirect without a transaction response to verify.',
    },
  )

  useEffect(() => {
    let active = true
    if (!data) return () => { active = false }

    setState({ status: 'checking' })
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
        if (!active) return
        const message = getApiErrorMessage(error)
        if (message.startsWith('Payment is not complete (eSewa status:')) {
          setState({ status: 'failed', message })
        } else {
          setState({ status: 'error', message })
        }
      })

    return () => {
      active = false
    }
  }, [attempt, data, verifyPayment])

  return (
    <main className="wrap grid min-h-[70vh] place-items-center py-12" aria-live="polite">
      <section className="card w-full max-w-xl p-6 text-center sm:p-9">
        {state.status === 'checking' && (
          <>
            <div className="mx-auto size-10 animate-spin rounded-full border-4 border-line border-t-gold" />
            <h1 className="t-h2 mt-5">Checking payment status</h1>
            <p className="mt-2 text-sm text-muted">We’re confirming the transaction with eSewa before updating your enrollment.</p>
          </>
        )}
        {state.status === 'verified' && (
          <>
            <h1 className="t-h2">Payment confirmed</h1>
            <p className="mt-3 text-sm text-muted">Your enrollment is ready.</p>
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
        {state.status === 'failed' && (
          <>
            <h1 className="t-h2">Payment was not completed</h1>
            <p className="mt-3 text-sm text-muted" role="alert">{state.message}</p>
            <p className="mt-3 text-sm text-muted">No enrollment was created. You can safely start a new payment attempt.</p>
          </>
        )}
        {state.status === 'error' && (
          <>
            <h1 className="t-h2">Unable to verify payment</h1>
            <p className="mt-3 text-sm text-muted" role="alert">{state.message}</p>
            <p className="mt-3 text-sm text-muted">Your payment outcome may still be pending. No enrollment is granted until the server verifies payment. If you were charged, contact support before starting another payment.</p>
            {data && <button type="button" className="btn btn-s mt-6" onClick={() => setAttempt((value) => value + 1)}>Retry verification</button>}
          </>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {courseid && <Link className="btn btn-p" href={`/courses/${encodeURIComponent(courseid)}`}>Return to course</Link>}
          <Link className="btn btn-s" href="/courses">Browse courses</Link>
        </div>
      </section>
    </main>
  )
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<main className="wrap grid min-h-[70vh] place-items-center text-sm text-muted">Loading payment status…</main>}>
      <PaymentFailedContent />
    </Suspense>
  )
}

'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { I } from './Icon'
import { useGetTutorProfileQuery, useSaveTutorProfileMutation } from '@/src/services/api/Userapi'
import { getApiErrorMessage, getApiSuccessMessage } from '@/src/lib/apiFeedback'
import { toast } from 'sonner'

export default function TutorProfileSettings() {
  const { data, isLoading, isError, error, refetch } = useGetTutorProfileQuery()
  const [saveProfile, saveState] = useSaveTutorProfileMutation()
  const [acedemics, setAcedemics] = useState('')
  const [experience, setExperience] = useState('')
  const requestStarted = useRef(false)
  const tutor = data?.payload

  useEffect(() => {
    if (tutor) {
      setAcedemics(tutor.acedemics ?? '')
      setExperience(tutor.experience ?? '')
    }
  }, [tutor])

  useEffect(() => {
    if (isLoading) {
      if (!requestStarted.current) toast.loading('Loading tutor profile…', { id: 'tutor-profile' })
      requestStarted.current = true
      return
    }
    if (!requestStarted.current) return
    requestStarted.current = false
    if (isError) toast.error(getApiErrorMessage(error), { id: 'tutor-profile' })
    else if (data) toast.success(getApiSuccessMessage(data, 'Tutor profile loaded.'), { id: 'tutor-profile' })
  }, [data, error, isError, isLoading])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    toast.loading('Saving tutor profile…', { id: 'tutor-profile-save' })
    try {
      const result = await saveProfile({ acedemics: acedemics.trim(), experience: experience.trim() }).unwrap()
      if (!result.success) {
        toast.error(result.message || 'Tutor profile could not be updated.', { id: 'tutor-profile-save' })
        return
      }
      toast.success(getApiSuccessMessage(result, 'Tutor profile updated.'), { id: 'tutor-profile-save' })
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError), { id: 'tutor-profile-save' })
    }
  }

  if (isLoading) return <main className="mx-auto max-w-[820px] px-5 py-12 text-sm text-muted" role="status">Loading tutor profile…</main>
  if (isError || !tutor) {
    return (
      <main className="mx-auto max-w-[820px] px-5 py-12">
        <div className="rounded-card border border-error/40 bg-error/10 p-6" role="alert">
          <h1 className="t-h3">Tutor profile unavailable</h1>
          <p className="mt-2 text-sm text-muted">Check the notification for details and retry.</p>
          <button type="button" className="btn btn-s mt-4" onClick={() => void refetch()}>Try again</button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-[820px] px-5 py-8 sm:px-8 lg:py-10">
      <p className="over">Tutor account</p>
      <h1 className="t-h1 mt-2">Tutor profile</h1>
      <p className="mt-2 text-base text-muted">Share your academic background and teaching experience with learners.</p>

      <section className="card mt-8 p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-surface"><I n="user" /></span>
            <div><h2 className="font-semibold">{tutor.fullname}</h2><p className="mt-1 text-sm text-muted">Tutor profile</p></div>
          </div>
          <span className={`bdg ${tutor.isverified ? 'bdg-ok' : 'bdg-gold'}`}>{tutor.isverified ? 'Verified tutor' : 'Verification pending'}</span>
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-5">
          <label className="grid gap-2 text-sm font-medium">
            Academics
            <textarea required rows={4} maxLength={4000} value={acedemics} onChange={(event) => setAcedemics(event.target.value)} className="rounded-ui border border-line bg-page p-4 font-normal outline-none focus:border-ink focus:ring-2 focus:ring-gold" placeholder="Education, qualifications, or relevant study" />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Experience
            <textarea required rows={5} maxLength={4000} value={experience} onChange={(event) => setExperience(event.target.value)} className="rounded-ui border border-line bg-page p-4 font-normal outline-none focus:border-ink focus:ring-2 focus:ring-gold" placeholder="Teaching and professional experience" />
          </label>
          <div className="flex justify-end border-t border-line pt-5">
            <button type="submit" disabled={saveState.isLoading} className="btn btn-p h-11 px-6 disabled:opacity-50">
              {saveState.isLoading ? 'Saving…' : 'Save tutor profile'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import Avatar from './Avatar'
import { useAppDispatch, useAppSelector } from '@/src/lib/hooks'
import { getApiErrorMessage, getApiSuccessMessage, isApiFailure } from '@/src/lib/apiFeedback'
import { useUpdateProfileMutation } from '@/src/services/api/Userapi'
import { setuser } from '@/src/services/slices/Userslice'
import { toast } from 'sonner'

export default function ProfileSettings() {
  const profile = useAppSelector((state) => state.user)
  const dispatch = useAppDispatch()
  const [updateProfile, request] = useUpdateProfileMutation()
  const [fullname, setFullname] = useState(profile?.fullname ?? '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [error, setError] = useState('')
  const photoInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profile) setFullname(profile.fullname)
  }, [profile])

  useEffect(() => {
    if (request.isLoading) {
      toast.loading('Saving your profile…', { id: 'profile-update' })
      return
    }
    if (request.isError) {
      toast.error(getApiErrorMessage(request.error), { id: 'profile-update' })
      return
    }
    if (!request.isSuccess) return
    if (isApiFailure(request.data)) {
      toast.error(getApiSuccessMessage(request.data, 'Your profile could not be updated.'), { id: 'profile-update' })
      return
    }
    toast.success(getApiSuccessMessage(request.data, 'Profile updated successfully.'), { id: 'profile-update' })
    if (request.data.payload) dispatch(setuser(request.data.payload))
    setPassword('')
    setConfirmPassword('')
    setPhoto(null)
    if (photoInput.current) photoInput.current.value = ''
  }, [dispatch, request.data, request.error, request.isError, request.isLoading, request.isSuccess])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!profile) {
      setError('Sign in before updating your profile.')
      return
    }
    if (password && password !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }
    if (photo && (!photo.type.startsWith('image/') || photo.size > 5 * 1024 * 1024)) {
      setError('Choose an image up to 5 MB.')
      return
    }
    const trimmedName = fullname.trim()
    const fullnameChanged = trimmedName !== profile.fullname
    if (!fullnameChanged && !password && !photo) {
      setError('Make a change before saving your profile.')
      return
    }
    const body = new FormData()
    if (fullnameChanged) body.append('fullname', trimmedName)
    if (password) body.append('password', password)
    if (photo) body.append('profile', photo)
    updateProfile(body)
  }

  return (
    <main className="mx-auto max-w-[820px] px-5 py-8 sm:px-8 lg:py-10">
      <p className="over">Account</p>
      <h1 className="t-h1 mt-2">Profile settings</h1>
      <p className="mt-2 text-base text-muted">Update the account details supported by your profile API.</p>

      <section className="card mt-8 p-5 sm:p-8">
        <div className="flex items-center gap-4 border-b border-line pb-6">
          <Avatar name={profile?.fullname ?? 'Account'} profilepic={profile?.profilepic} ring={false} className="size-14 text-lg" />
          <div>
            <h2 className="text-base font-semibold">{profile?.fullname ?? 'Your account'}</h2>
            <p className="mt-1 text-sm text-muted">{profile?.email}</p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-5">
          {error && <p className="rounded-ui border border-error/40 bg-error/10 p-3 text-sm text-error" role="alert">{error}</p>}
          <label className="grid gap-2 text-sm font-medium">
            Full name
            <input
              required
              value={fullname}
              onChange={(event) => setFullname(event.target.value)}
              className="h-12 rounded-ui border border-line bg-page px-4 font-normal outline-none focus:border-ink focus:ring-2 focus:ring-gold"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            New password
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 rounded-ui border border-line bg-page px-4 font-normal outline-none focus:border-ink focus:ring-2 focus:ring-gold"
            />
            <span className="text-xs font-normal text-muted">Use at least 6 characters, including uppercase, lowercase, numbers, and a symbol.</span>
          </label>
          {password && (
            <label className="grid gap-2 text-sm font-medium">
              Confirm new password
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-12 rounded-ui border border-line bg-page px-4 font-normal outline-none focus:border-ink focus:ring-2 focus:ring-gold"
              />
            </label>
          )}
          <label className="grid gap-2 text-sm font-medium">
            Profile photo
            <input
              ref={photoInput}
              type="file"
              accept="image/*"
              onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
              className="rounded-ui border border-line bg-page p-3 text-sm font-normal file:mr-3 file:rounded-md file:border-0 file:bg-surface file:px-3 file:py-2"
            />
            <span className="text-xs font-normal text-muted">Optional · images up to 5 MB.</span>
          </label>
          <div className="flex justify-end border-t border-line pt-5">
            <button type="submit" disabled={request.isLoading} className="btn btn-p h-11 px-6 disabled:opacity-50">
              {request.isLoading ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

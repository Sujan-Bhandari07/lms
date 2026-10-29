import type { Metadata } from 'next'
import ProfileSettings from '@/src/components/ProfileSettings'

export const metadata: Metadata = { title: 'Profile settings' }

export default function ProfilePage() {
  return <ProfileSettings />
}

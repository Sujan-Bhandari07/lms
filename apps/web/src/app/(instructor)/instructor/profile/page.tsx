import type { Metadata } from 'next'
import TutorProfileSettings from '@/src/components/TutorProfileSettings'

export const metadata: Metadata = { title: 'Profile settings' }

export default function InstructorProfilePage() {
  return <TutorProfileSettings />
}

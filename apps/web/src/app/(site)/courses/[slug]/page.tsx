import type { Metadata } from 'next'
import UnavailableFeature from '@/src/components/UnavailableFeature'

export const metadata: Metadata = { title: 'Course details' }

export default function CoursePage() {
  return <UnavailableFeature feature="Course details and enrollment" />
}

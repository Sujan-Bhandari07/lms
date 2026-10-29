import type { Metadata } from 'next'
import UnavailableFeature from '@/src/components/UnavailableFeature'

export const metadata: Metadata = { title: 'Course catalog' }

export default function CoursesPage() {
  return <UnavailableFeature feature="Course catalog" />
}

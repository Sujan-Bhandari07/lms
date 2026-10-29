import type { Metadata } from 'next'
import CourseOverview from '@/src/components/CourseOverview'

export const metadata: Metadata = { title: 'Course details' }

export default function CoursePage() {
  return <CourseOverview />
}

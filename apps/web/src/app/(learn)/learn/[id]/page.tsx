import type { Metadata } from 'next'
import CoursePlayer from '@/src/components/CoursePlayer'

export const metadata: Metadata = { title: 'Course player' }

export default function LearnPage() {
  return <CoursePlayer />
}

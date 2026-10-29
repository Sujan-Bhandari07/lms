import type { Metadata } from 'next'
import CourseEditWizard from '@/src/components/CourseEditWizard'

export const metadata: Metadata = { title: 'Edit course' }

export default function EditCoursePage() {
  return <CourseEditWizard />
}

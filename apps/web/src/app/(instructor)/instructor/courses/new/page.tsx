import type { Metadata } from 'next'
import CourseWizard from '@/src/components/CourseWizard'

export const metadata: Metadata = { title: 'Create Course' }
export default function Page() { return <CourseWizard /> }

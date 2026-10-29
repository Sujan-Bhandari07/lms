import type { Metadata } from 'next'
import CourseCatalog from '@/src/components/CourseCatalog'

export const metadata: Metadata = { title: 'Course catalog' }

export default function CoursesPage() {
  return <CourseCatalog />
}

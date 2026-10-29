import type { Metadata } from 'next'
import UnavailableFeature from '@/src/components/UnavailableFeature'

export const metadata: Metadata = { title: 'Course player' }

export default function LearnPage() {
  return <UnavailableFeature feature="Course player and lesson progress" />
}

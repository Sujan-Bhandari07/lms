import type { Metadata } from 'next'
import UnavailableFeature from '@/src/components/UnavailableFeature'

export const metadata: Metadata = { title: 'Admin dashboard' }

export default function AdminPage() {
  return <UnavailableFeature feature="Admin dashboard and course review queue" />
}

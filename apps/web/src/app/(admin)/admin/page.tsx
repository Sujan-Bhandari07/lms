import type { Metadata } from 'next'
import AdminDashboard from '@/src/components/AdminDashboard'

export const metadata: Metadata = { title: 'Admin dashboard' }

export default function AdminPage() {
  return <AdminDashboard />
}

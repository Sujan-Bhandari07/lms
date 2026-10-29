import type { Metadata } from 'next'
import InstructorDashboard from '@/src/components/InstructorDashboard'

export const metadata: Metadata = { title: 'Instructor Dashboard' }
export default function Page() { return <InstructorDashboard /> }

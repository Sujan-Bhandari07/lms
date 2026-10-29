import AppShell from '@/src/components/AppShell'
import { INSTRUCTOR } from '@/src/lib/nav'

/** Instructor workspace. */
export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return <AppShell {...INSTRUCTOR}>{children}</AppShell>
}

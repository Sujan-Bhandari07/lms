import AppShell from '@/src/components/AppShell'
import { STUDENT } from '@/src/lib/nav'

/** Authenticated student area. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell {...STUDENT}>{children}</AppShell>
}

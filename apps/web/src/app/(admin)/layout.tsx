import AppShell from '@/src/components/AppShell'
import { ADMIN } from '@/src/lib/nav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AppShell {...ADMIN}>{children}</AppShell>
}

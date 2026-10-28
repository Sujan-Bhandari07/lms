import AppShell from '@/src/components/AppShell'

/** Authenticated student area. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}

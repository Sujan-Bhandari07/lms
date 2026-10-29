import Header from '@/src/components/Header'

/** Public account pages and API availability notices. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  )
}

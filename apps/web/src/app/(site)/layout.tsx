import Footer from '@/src/components/Footer'
import Header from '@/src/components/Header'

/** Public marketing pages: landing, explore, course details. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}

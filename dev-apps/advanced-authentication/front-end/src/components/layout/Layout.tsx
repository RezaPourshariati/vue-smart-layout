import type { LayoutProps } from '@/types'
import Footer from '../footer/Footer'
import Header from '../header/Header'

function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <div className="max-w-full mx-auto px-5" style={{ minHeight: '80vh' }}>
        {children}
      </div>
      <Footer />
    </>
  )
}

export default Layout

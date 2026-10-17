import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Home from './pages/Home.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import OrnamentDetail from './pages/OrnamentDetail.jsx'
import EnquiryPage from './pages/EnquiryPage.jsx'
import StoreInfo from './pages/StoreInfo.jsx'
import SearchPage from './pages/SearchPage.jsx'
import RatesPage from './pages/RatesPage.jsx'
import WishlistPage from './pages/WishlistPage.jsx'
import NotFound from './pages/NotFound.jsx'
import RateBubbles from './components/RateBubbles.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import WhatsAppFab from './components/WhatsAppFab.jsx'
import { ToastProvider } from './components/Toasts.jsx'

function ScrollManager() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    let link = document.querySelector("link[rel='canonical']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = `${window.location.origin}${pathname}${search}`
  }, [pathname, search])
  return null
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <ToastProvider>
      <div className="app maxw">
        <ScrollManager />
        <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/ornament/:id" element={<OrnamentDetail />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/rates" element={<RatesPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/enquire" element={<EnquiryPage />} />
            <Route path="/store" element={<StoreInfo />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <RateBubbles />
        <WhatsAppFab />
      </div>
    </ToastProvider>
  )
}

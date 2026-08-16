import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Home from './pages/Home.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import OrnamentDetail from './pages/OrnamentDetail.jsx'
import EnquiryPage from './pages/EnquiryPage.jsx'
import StoreInfo from './pages/StoreInfo.jsx'
import RateBubbles from './components/RateBubbles.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className="app maxw">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/ornament/:id" element={<OrnamentDetail />} />
          <Route path="/enquire" element={<EnquiryPage />} />
          <Route path="/store" element={<StoreInfo />} />
        </Routes>
      </main>
      <Footer />
      <RateBubbles />
    </div>
  )
}

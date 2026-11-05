import { Route, Routes } from 'react-router-dom'
import Header from './components/Header/Header.jsx'
import Footer from './components/Footer/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import CompareTray from './components/CompareTray/CompareTray.jsx'
import Home from './pages/Home/Home.jsx'
import Catalog from './pages/Catalog/Catalog.jsx'
import Product from './pages/Product/Product.jsx'
import Comparison from './pages/Comparison/Comparison.jsx'
import Analyzer from './pages/Analyzer/Analyzer.jsx'
import Builder from './pages/Builder/Builder.jsx'
import Profile from './pages/Profile/Profile.jsx'
import About from './pages/About/About.jsx'
import NotFound from './pages/NotFound/NotFound.jsx'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/comparison" element={<Comparison />} />
        <Route path="/analyzer" element={<Analyzer />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <CompareTray />
    </>
  )
}

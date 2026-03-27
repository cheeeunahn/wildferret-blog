import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ArticlePage from './pages/ArticlePage'
import AboutPage from './pages/AboutPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/article/:slug" element={<ArticlePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>
    </Routes>
  )
}

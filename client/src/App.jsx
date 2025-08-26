import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './routes/Home'
import Login from './routes/Login'
import Register from './routes/Register'
import MyBookings from './routes/MyBookings'
import ProtectedRoute from './components/ProtectedRoute'

export default function App(){
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 bg-white/90 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand.pink rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zM6 20v-1c0-2.67 5.33-4 6-4s6 1.33 6 4v1" /></svg>
            </div>
            <span className="font-semibold text-lg text-brand.dark">Sua Manicure</span>
          </div>
          <nav className="hidden sm:flex gap-4">
            <Link to="/" className="text-sm text-gray-700">Início</Link>
            <Link to="/my" className="text-sm text-gray-700">Meus agend.</Link>
            <Link to="/login" className="text-sm text-gray-700">Entrar</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}

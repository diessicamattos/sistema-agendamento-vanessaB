//src/App.jsx

import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './routes/Home'
import Login from './routes/Login'
import Register from './routes/Register'
import MyBookings from './routes/MyBookings'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 bg-white/90 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-lg text-brand.dark">Sua Manicure</span>
          </div>
          
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

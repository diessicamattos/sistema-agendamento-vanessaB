// src/App.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './routes/Home'
import Login from './routes/Login'
import Register from './routes/Register'
import MyBookings from './routes/MyBookings'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './layouts/AppLayout'

export default function App() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rotas privadas com menu fixo */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/my" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
      </Route>
    </Routes>
  )
}

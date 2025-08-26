import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

export default function App(){
  return (
    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route path="/*" element={<Dashboard/>} />
      <Route path="*" element={<Navigate to="/login"/>} />
    </Routes>
  )
}

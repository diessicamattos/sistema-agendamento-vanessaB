// src/components/ProtectedRoute.jsx

import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../firebase'  // se o firebase.js está dentro de src/, esse caminho já funciona

export default function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <span className="text-gray-600 text-sm">Carregando...</span>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return children
}

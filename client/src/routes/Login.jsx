//src/route/Login.jsx

import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { useNavigate, useLocation, Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const navigate = useNavigate()
  const loc = useLocation()
  const next = loc.state?.next || '/'

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, pass)
      navigate(next)
    } catch (err) {
      alert('Erro no login: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#585B56] p-4">
      <div className="w-full max-w-md bg-[#000001] p-8 rounded-2xl shadow-lg border-4 border-[#D7AF70]">
        <h2 className="text-2xl font-bold mb-6 text-[#D7AF70] text-center">Entrar</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full px-4 py-2 rounded-xl border border-[#D7AF70] bg-[#585B56] text-[#D7AF70] focus:outline-none focus:ring-2 focus:ring-[#937D64]"
          />
          <input
            value={pass}
            onChange={e => setPass(e.target.value)}
            placeholder="Senha"
            type="password"
            className="w-full px-4 py-2 rounded-xl border border-[#D7AF70] bg-[#585B56] text-[#D7AF70] focus:outline-none focus:ring-2 focus:ring-[#937D64]"
          />
          <button
            type="submit"
            className="w-full bg-[#D7AF70] text-[#000001] px-4 py-2 rounded-xl font-semibold shadow hover:bg-[#937D64] transition"
          >
            Entrar
          </button>
        </form>
        <p className="text-sm mt-4 text-center text-[#937D64]">
          Ainda não tem conta?{' '}
          <Link to="/register" className="text-[#D7AF70] font-semibold hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}

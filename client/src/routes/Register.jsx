// src/routes/Register.jsx

import React, { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../firebase'
import { useNavigate, Link } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'

export default function Register() {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()

    // Validação simples
    if (!name || !email || !pass || !phone) {
      alert('Preencha todos os campos.')
      return
    }

    if (pass.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    try {
      // Cria usuário no Firebase Auth
      const userCred = await createUserWithEmailAndPassword(auth, email, pass)

      // Salva dados do usuário no Firestore
      await setDoc(doc(db, 'users', userCred.user.uid), {
        name,
        email,
        phone, // 👈 novo campo
        role: 'client'
      })

      // Redireciona para a tela de login
      navigate('/login')
    } catch (err) {
      alert('Erro: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000001] px-4">
      <div className="w-full max-w-md bg-[#1a1a1a] p-8 rounded-2xl shadow-xl border border-[#D7AF70]/40">
        
        {/* Título */}
        <h2 className="text-2xl font-bold text-center text-[#D7AF70] mb-6">
          Criar Conta
        </h2>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nome completo"
            className="w-full rounded-xl border border-[#D7AF70]/40 bg-[#2a2a2a] text-white placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D7AF70]"
          />

          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Telefone"
            type="tel"
            className="w-full rounded-xl border border-[#D7AF70]/40 bg-[#2a2a2a] text-white placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D7AF70]"
          />

          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full rounded-xl border border-[#D7AF70]/40 bg-[#2a2a2a] text-white placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D7AF70]"
          />

          <input
            value={pass}
            onChange={e => setPass(e.target.value)}
            placeholder="Senha"
            type="password"
            className="w-full rounded-xl border border-[#D7AF70]/40 bg-[#2a2a2a] text-white placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D7AF70]"
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#D7AF70] to-[#937D64] text-black font-semibold px-4 py-3 rounded-xl shadow-lg hover:opacity-90 transition"
          >
            Criar Conta
          </button>
        </form>

        {/* Link para login */}
        <p className="text-center text-gray-400 mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-[#D7AF70] hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}

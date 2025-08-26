import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email,setEmail]=useState('')
  const [pass,setPass]=useState('')
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    await signInWithEmailAndPassword(auth,email,pass)
    nav('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000001]">
      <div className="bg-[#585B56] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-[#D7AF70]">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#D7AF70]">
          Painel Admin
        </h2>
        <form onSubmit={submit} className="space-y-4">
          <input 
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
            placeholder="Email" 
            className="w-full rounded-xl border border-[#D7AF70] bg-transparent px-4 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D7AF70]"
          />
          <input 
            value={pass} 
            onChange={e=>setPass(e.target.value)} 
            type="password" 
            placeholder="Senha" 
            className="w-full rounded-xl border border-[#D7AF70] bg-transparent px-4 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D7AF70]"
          />
          <button 
            className="w-full bg-[#D7AF70] hover:bg-[#937D64] text-[#000001] font-semibold px-4 py-2 rounded-xl transition-all duration-300 shadow-lg"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}

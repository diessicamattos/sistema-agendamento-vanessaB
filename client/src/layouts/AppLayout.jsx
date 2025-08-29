// src/layouts/AppLayout.jsx
import React from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { FaHome, FaCalendarCheck, FaInstagram, FaSignOutAlt } from 'react-icons/fa'
import { auth } from '../firebase'

export default function AppLayout() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#585B56] text-[#D7AF70] pb-28">
      <Outlet /> {/* Aqui serão renderizadas as páginas como Home e MyBookings */}

      {/* Menu fixo */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#000001] border-t border-[#D7AF70] flex justify-around items-center py-3 shadow-lg z-50">
        
        {/* Botão Home */}
        <button 
          onClick={() => {
            if (window.location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' })
            } else {
              navigate('/')
            }
          }}
          className="flex flex-col items-center text-[#D7AF70] hover:text-[#8E443D] transition"
        >
          <FaHome className="text-2xl" />
          <span className="text-xs">Home</span>
        </button>

        {/* Botão Meus Agendamentos */}
        <Link to="/my" className="flex flex-col items-center text-[#D7AF70] hover:text-[#8E443D] transition">
          <FaCalendarCheck className="text-2xl" />
          <span className="text-xs">Meus</span>
        </Link>

        {/* Instagram */}
        <a 
          href="https://www.instagram.com/nailsbybrunalopes?igsh=NXJncnhvYTRzeXhw"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center text-[#D7AF70] hover:text-[#8E443D] transition"
        >
          <FaInstagram className="text-2xl" />
          <span className="text-xs">Instagram</span>
        </a>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="flex flex-col items-center text-[#D7AF70] hover:text-[#8E443D] transition"
        >
          <FaSignOutAlt className="text-2xl" />
          <span className="text-xs">Sair</span>
        </button>
      </nav>
    </div>
  )
}

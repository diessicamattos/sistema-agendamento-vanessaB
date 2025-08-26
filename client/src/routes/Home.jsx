//src/routes/Home.jsx

import React, { useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../firebase'
import CalendarModal from '../components/CalendarModal'
import { Link, useNavigate } from 'react-router-dom'

export default function Home() {
  const [selectedService, setSelectedService] = useState(null)
  const [openCalendar, setOpenCalendar] = useState(false)
  const [user] = useAuthState(auth)
  const navigate = useNavigate()

  // Serviços
  const services = [
    { id: 1, name: "Pé e mão tradicional", price: 62, duration: "2 horas", image: "./public/alongamento.jpg" },
    { id: 2, name: "Mão", price: 30, duration: "1 hora", image: "./public/alongamento.jpg" },
    { id: 3, name: "Pé", price: 36, duration: "1 hora", image: "./public/alongamento.jpg" },
    { id: 4, name: "Banho de gel", price: 150, duration: "1h30min", image: "./public/alongamento.jpg" },
    { id: 5, name: "Manutenção 15 dias (Gel)", price: 85, duration: "1h30min", image: "./public/alongamento.jpg" },
    { id: 6, name: "Manutenção 21 dias (Gel)", price: 100, duration: "1h30min", image: "./public/alongamento.jpg" },
    { id: 7, name: "Aplicação Alongamento", price: 180, duration: "2h30min", image: "./public/alongamento.jpg" },
    { id: 8, name: "Manutenção 15 dias (Alongamento)", price: 85, duration: "1 hora", image: "./public/alongamento.jpg" },
    { id: 9, name: "Manutenção 21 dias (Alongamento)", price: 100, duration: "1h30min", image: "./public/alongamento.jpg" },
    { id: 10, name: "Retoque de unha quebrada", price: 10, duration: "30 min", image: "./public/alongamento.jpg" },
    { id: 11, name: "Par de decoração", price: 10, duration: "30 min", image: "./public/alongamento.jpg" },
    { id: 12, name: "Encapsulada", price: 20, duration: "30 min", image: "./public/alongamento.jpg" },
    { id: 13, name: "Esmaltação em gel", price: 70, duration: "30 min", image: "./public/alongamento.jpg" },
  ]

  function handleAgendar(service) {
    if (!user) return navigate('/login', { state: { next: '/' } })
    setSelectedService(service)
    setOpenCalendar(true)
  }

  return (
    <div className="min-h-screen bg-[#585B56] text-[#D7AF70] p-4 md:p-6">
      {/* Banner */}
      <section className="flex flex-col md:flex-row items-center bg-[#000001] p-4 md:p-6 rounded-2xl shadow-lg gap-4">
        <img 
          src="./public/proprietaria.jpg" 
          alt="prestadora" 
          className="w-full md:w-1/2 h-auto rounded-2xl object-cover border-4 border-[#D7AF70]" 
        />
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Agende seu horário comigo</h1>
          <p className="mb-4 text-[#937D64]">Agende online o seu horário para atendimento</p>
          {user && (
            <Link 
              to="/my" 
              className="inline-block px-6 py-3 rounded-xl bg-[#D7AF70] text-[#000001] font-semibold shadow hover:bg-[#937D64] transition"
            >
              Meus agendamentos
            </Link>
          )}
        </div>
      </section>

      {!user ? (
        // Aviso para login
        <section className="mt-8 p-6 bg-[#000001] rounded-2xl shadow-lg text-center">
          <h2 className="text-xl font-bold">Crie sua conta para agendar</h2>
          <p className="mt-2 text-[#937D64]">Após se cadastrar e fazer login, você terá acesso aos serviços, horários disponíveis e recados da proprietária.</p>
          <Link 
            to="/register" 
            className="inline-block mt-4 px-6 py-3 rounded-xl bg-[#D7AF70] text-[#000001] font-semibold shadow hover:bg-[#937D64] transition"
          >
            Criar conta
          </Link>
        </section>
      ) : (
        <>
          {/* Recados */}
          <section className="mt-8 bg-[#000001] p-4 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-2">Recados da proprietária</h2>
            <p className="text-[#937D64]">✨ Não esqueça de chegar com 10 minutos de antecedência ao seu horário agendado. Obrigada! ✨</p>
          </section>

          {/* Serviços */}
          <section className="mt-8 md:mt-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Serviços</h2>
            <div className="flex flex-col gap-4">
              {services.map(s => (
                <div 
                  key={s.id} 
                  className="flex flex-row items-center bg-[#000001] p-4 rounded-2xl shadow-lg gap-4"
                >
                  <img 
                    src={s.image} 
                    alt={s.name} 
                    className="w-20 h-20 object-cover rounded-xl border-2 border-[#D7AF70]" 
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg md:text-xl">{s.name}</h3>
                    <p className="text-[#D7AF70]">R$ {s.price.toFixed(2)} • {s.duration}</p>
                  </div>
                  <button 
                    onClick={() => handleAgendar(s)} 
                    className="px-4 py-2 rounded-xl bg-[#D7AF70] text-[#000001] font-semibold shadow hover:bg-[#937D64] transition"
                  >
                    Agendar
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Calendar Modal */}
      {openCalendar && selectedService && (
        <CalendarModal 
          isOpen={openCalendar}
          onClose={() => setOpenCalendar(false)}
          service={selectedService}
          clientId={user?.uid}   
        />
      )}
    </div>
  )
}

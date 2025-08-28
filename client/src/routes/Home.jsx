// src/routes/Home.jsx

import React, { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../firebase'
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore'
import CalendarModal from '../components/CalendarModal'
import { Link, useNavigate } from 'react-router-dom'

export default function Home() {
  const [selectedService, setSelectedService] = useState(null)
  const [openCalendar, setOpenCalendar] = useState(false)
  const [user] = useAuthState(auth)
  const [userData, setUserData] = useState(null)
  const [bookings, setBookings] = useState([])
  const navigate = useNavigate()

  // Buscar dados do usuário no Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setUserData(docSnap.data())
        }
      }
    }
    fetchUserData()
  }, [user])

  // Listener em tempo real para agendamentos do usuário
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "bookings"),
      where("clientId", "==", user.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedBookings = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          serviceId: data.serviceId,
          date: data.date?.toDate ? data.date.toDate() : data.date,
          time: data.time,
        }
      })
      setBookings(updatedBookings)

      // Atualiza horários do modal caso o usuário esteja agendando
      if (selectedService) {
        const serviceBooking = updatedBookings.find(b => b.serviceId === selectedService.id)
        if (serviceBooking) {
          console.log("Horário atualizado:", serviceBooking.date, serviceBooking.time)
        }
      }
    })

    return () => unsubscribe()
  }, [user, selectedService])

  // Serviços
  const services = [
    { id: 1, name: "Pé e mão tradicional", price: 62, duration: "2 horas", image: "/alongamento.jpg" },
    { id: 2, name: "Mão", price: 30, duration: "1 hora", image: "/alongamento.jpg" },
    { id: 3, name: "Pé", price: 36, duration: "1 hora", image: "/alongamento.jpg" },
    { id: 4, name: "Banho de gel", price: 150, duration: "1h30min", image: "/alongamento.jpg" },
    { id: 5, name: "Manutenção 15 dias (Gel)", price: 85, duration: "1h30min", image: "/alongamento.jpg" },
    { id: 6, name: "Manutenção 21 dias (Gel)", price: 100, duration: "1h30min", image: "/alongamento.jpg" },
    { id: 7, name: "Aplicação Alongamento", price: 180, duration: "2h30min", image: "/alongamento.jpg" },
    { id: 8, name: "Manutenção 15 dias (Alongamento)", price: 85, duration: "1 hora", image: "/alongamento.jpg" },
    { id: 9, name: "Manutenção 21 dias (Alongamento)", price: 100, duration: "1h30min", image: "/alongamento.jpg" },
    { id: 10, name: "Retoque de unha quebrada", price: 10, duration: "30 min", image: "/alongamento.jpg" },
    { id: 11, name: "Par de decoração", price: 10, duration: "30 min", image: "/alongamento.jpg" },
    { id: 12, name: "Encapsulada", price: 20, duration: "30 min", image: "/alongamento.jpg" },
    { id: 13, name: "Esmaltação em gel", price: 70, duration: "30 min", image: "/alongamento.jpg" },
  ]

  function handleAgendar(service) {
    if (!user) return navigate('/login', { state: { next: '/' } })
    setSelectedService(service)
    setOpenCalendar(true)
  }

  async function handleLogout() {
    await auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#585B56] text-[#D7AF70] p-4 md:p-6">
      {/* Banner */}
      <section className="flex flex-col md:flex-row items-center bg-[#000001] p-4 md:p-6 rounded-2xl shadow-lg gap-4">
        <img 
          src="/proprietaria.jpg" 
          alt="prestadora" 
          className="w-full md:w-1/2 h-auto rounded-2xl object-cover border-4 border-[#D7AF70]" 
        />
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Agende seu horário comigo</h1>
          <p className="mb-4 text-[#937D64]">Agende online o seu horário para atendimento</p>
          {user && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link 
                to="/my" 
                className="px-6 py-3 rounded-xl bg-[#D7AF70] text-[#000001] font-semibold shadow hover:bg-[#8E443D] hover:text-[#D7AF70] transition"
              >
                Meus agendamentos
              </Link>
              <button 
                onClick={handleLogout} 
                className="px-6 py-3 rounded-xl bg-[#D7AF70] text-[#000001] font-semibold shadow hover:bg-[#8E443D] hover:text-[#D7AF70] transition"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Mensagem de boas-vindas */}
      {user && (
        <section className="mt-8 bg-[#000001] p-6 rounded-2xl shadow-lg text-center">
          <h2 className="text-2xl font-bold">
            Bem-vindo(a),{" "}
            <span className="text-[#D7AF70]">
              {userData?.name || user.email}
            </span>{" "}
            👋
          </h2>
          <p className="text-[#937D64] mt-2">É um prazer ter você aqui 💅</p>
        </section>
      )}

      {!user ? (
        // Aviso para login
        <section className="mt-8 p-6 bg-[#000001] rounded-2xl shadow-lg text-center">
          <h2 className="text-xl font-bold">Crie sua conta para agendar</h2>
          <p className="mt-2 text-[#937D64]">Após se cadastrar e fazer login, você terá acesso aos serviços, horários disponíveis e recados da proprietária.</p>
          <Link 
            to="/register" 
            className="inline-block mt-4 px-6 py-3 rounded-xl bg-[#D7AF70] text-[#000001] font-semibold shadow hover:bg-[#8E443D] hover:text-[#D7AF70] transition"
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
                    className="px-4 py-2 rounded-xl bg-[#D7AF70] text-[#000001] font-semibold shadow hover:bg-[#8E443D] hover:text-[#D7AF70] transition"
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
          bookings={bookings} // ✅ envia os horários atuais para o modal
        />
      )}
    </div>
  )
}

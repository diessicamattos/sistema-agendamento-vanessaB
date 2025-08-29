// client/src/routes/Home.jsx
import React, { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../firebase'
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore'
import CalendarModal from '../components/CalendarModal'
import { Link, useNavigate } from 'react-router-dom'
import { FaClock } from 'react-icons/fa'

export default function Home() {
  const [selectedService, setSelectedService] = useState(null)
  const [openCalendar, setOpenCalendar] = useState(false)
  const [user] = useAuthState(auth)
  const [userData, setUserData] = useState(null)
  const [bookings, setBookings] = useState([])
  const [notes, setNotes] = useState("")
  const [services, setServices] = useState([])
  const navigate = useNavigate()

  // Buscar dados do usuário
  useEffect(() => {
    if (!user) return
    const fetchUserData = async () => {
      const docRef = doc(db, "users", user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) setUserData(docSnap.data())
    }
    fetchUserData()
  }, [user])

  // Listener agendamentos do usuário
  useEffect(() => {
    if (!user) return
    const q = query(collection(db, "bookings"), where("clientId", "==", user.uid))
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
    })
    return () => unsubscribe()
  }, [user])

  // Listener recado global
  useEffect(() => {
    const docRef = doc(db, "notes", "global")
    const unsub = onSnapshot(docRef, snap => {
      if (snap.exists()) setNotes(snap.data().text)
      else setNotes("")
    })
    return () => unsub()
  }, [])

  // Listener serviços
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "services"), snap => {
      const srv = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setServices(srv)
    })
    return () => unsub()
  }, [])

  function handleAgendar(service) {
    if (!user) return navigate('/login', { state: { next: '/' } })
    setSelectedService(service)
    setOpenCalendar(true)
  }

  // Agrupar serviços por sessão/categoria
  const groupedServices = services.reduce((acc, service) => {
    const category = service.category || "Outros Serviços"
    if (!acc[category]) acc[category] = []
    acc[category].push(service)
    return acc
  }, {})

  // Ordenar categorias e serviços por nome
  const sortedGroupedServices = Object.keys(groupedServices)
    .sort()
    .reduce((acc, key) => {
      acc[key] = groupedServices[key].sort((a, b) => a.name.localeCompare(b.name))
      return acc
    }, {})

  // Função para rolar para o topo
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <div className="p-4 md:p-6">
      {/* Banner */}
      <section className="flex flex-col md:flex-row items-center bg-[#000001] p-4 md:p-6 rounded-2xl shadow-lg gap-4">
        <img 
          src="/proprietaria.jpg" 
          alt="prestadora" 
          className="w-full md:w-1/2 h-auto rounded-2xl object-cover border-4 border-[#D7AF70]" 
        />
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Agende seu horário comigo</h1>
        </div>
      </section>

      {/* Boas-vindas */}
      {user && (
        <section className="mt-8 bg-[#000001] p-6 rounded-2xl shadow-lg text-center">
          <h2 className="text-2xl font-bold">
            Bem-vindo(a), <span className="text-[#D7AF70]">{userData?.name || user.email}</span> 👋
          </h2>
          <p className="text-[#937D64] mt-2">É um prazer ter você aqui 💅</p>
        </section>
      )}

      {/* Aviso de login */}
      {!user && (
        <section className="mt-8 p-6 bg-[#000001] rounded-2xl shadow-lg text-center">
          <h2 className="text-xl font-bold">Crie sua conta para agendar</h2>
          <p className="mt-2 text-[#937D64]">Após se cadastrar e fazer login, você terá acesso aos serviços, horários disponíveis e recados da proprietária.</p>
          <Link 
            to="/register" 
            className="w-full sm:w-auto inline-block text-center mt-4 px-6 py-3 rounded-xl bg-[#D7AF70] text-[#000001] font-semibold shadow hover:bg-[#8E443D] hover:text-[#D7AF70] transition"
          >
            Criar conta
          </Link>
        </section>
      )}

      {/* Recados da proprietária */}
      {user && (
        <section className="mt-8 bg-[#000001] p-4 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Recados da proprietária</h2>
          <p className="text-[#937D64]">{notes || "✨Nenhum recado no momento. ✨"}</p>
        </section>
      )}

      {/* Serviços por sessão */}
      {user && Object.keys(sortedGroupedServices).length > 0 && (
        <section className="mt-8 md:mt-10">
          {Object.entries(sortedGroupedServices).map(([session, servicesList]) => (
            <div key={session} className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">{session}</h2>
              <div className="flex flex-col gap-4">
                {servicesList.map(s => (
                  <div key={s.id} className="flex flex-col sm:flex-row items-center bg-[#000001] p-4 rounded-2xl shadow-lg gap-4">
                    <img src={s.image || "/alongamento.jpg"} alt={s.name} className="w-20 h-20 object-cover rounded-xl border-2 border-[#D7AF70]" />
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-bold text-lg md:text-xl">{s.name}</h3>
                      <p className="text-[#D7AF70]">R$ {s.price?.toFixed(2)}</p>
                      <p className="text-[#D7AF70] flex items-center justify-center sm:justify-start gap-1"><FaClock /> {s.duration}</p>
                    </div>
                    <button onClick={() => handleAgendar(s)} className="w-full sm:w-auto text-center px-4 py-2 rounded-xl bg-[#D7AF70] text-[#000001] font-semibold shadow hover:bg-[#8E443D] hover:text-[#D7AF70] transition">
                      Agendar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Calendar Modal */}
      {openCalendar && selectedService && (
        <CalendarModal 
          isOpen={openCalendar}
          onClose={() => setOpenCalendar(false)}
          service={selectedService}
          bookings={bookings.filter(b => b.serviceId === selectedService.id)}
        />
      )}
    </div>
  )
}

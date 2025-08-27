// src/routes/MyBookings.jsx
import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc, getDoc } from 'firebase/firestore'
import { db, auth } from '../firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import { format, parseISO, differenceInHours } from 'date-fns'

export default function MyBookings() {
  const [user] = useAuthState(auth)
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    )

    const unsub = onSnapshot(q, async snap => {
      const data = await Promise.all(
        snap.docs.map(async d => {
          const booking = { id: d.id, ...d.data() }

          // Puxa dados do serviço da prestadora
          if (booking.serviceId) {
            const serviceDoc = await getDoc(doc(db, 'services', booking.serviceId))
            if (serviceDoc.exists()) {
              booking.serviceName = serviceDoc.data().name
              booking.price = serviceDoc.data().price
            } else {
              booking.serviceName = 'Serviço não disponível'
              booking.price = 0
            }
          }

          return booking
        })
      )

      setBookings(data)
    })

    return () => unsub()
  }, [user])

  const handleCancel = async (booking) => {
    const bookingDateTime = parseISO(`${booking.date}T${booking.time}`)
    const hoursDiff = differenceInHours(bookingDateTime, new Date())

    if (hoursDiff < 24) {
      alert('Você só pode cancelar o agendamento até 24 horas antes do horário marcado.')
      return
    }

    if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      await deleteDoc(doc(db, 'bookings', booking.id))
      alert('Agendamento cancelado com sucesso.')
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-[#D7AF70]">Meus agendamentos</h2>
      <p className="text-sm text-gray-400 mb-4">
        É possível cancelar os agendamentos apenas até 24 horas antes do horário marcado.
      </p>

      <div className="space-y-3">
        {bookings.map(b => {
          const bookingDateTime = parseISO(`${b.date}T${b.time}`)
          const canCancel = differenceInHours(bookingDateTime, new Date()) >= 24

          return (
            <div
              key={b.id}
              className="p-4 bg-[#1a1a1a] border border-[#D7AF70]/40 rounded-xl flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-white">{b.serviceName}</p>
                <p className="text-sm text-gray-400">{format(bookingDateTime, 'dd/MM/yyyy • HH:mm')}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-semibold text-[#D7AF70]">R$ {b.price?.toFixed(2)}</p>
                {canCancel && (
                  <button
                    onClick={() => handleCancel(b)}
                    className="bg-red-600 text-white px-3 py-1 rounded-lg hover:opacity-90 transition text-sm"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

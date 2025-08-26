import React, { useEffect, useState } from 'react'
import { collection, onSnapshot, addDoc } from 'firebase/firestore'
import { db } from '../firebase'

export default function BookingsManage(){
  const [bookings, setBookings] = useState([])

  useEffect(()=>{
    const unsub = onSnapshot(collection(db,'bookings'), snap => setBookings(snap.docs.map(d=>({id:d.id, ...d.data()}))))
    return ()=>unsub()
  },[])

  async function blockDay(){
    const date = prompt('Data para bloquear (YYYY-MM-DD):')
    if(!date) return
    await addDoc(collection(db,'blocked_slots'), { date, createdAt: new Date() })
    alert('Dia bloqueado')
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Agendamentos</h3>
        <div>
          <button onClick={blockDay} className="px-3 py-2 rounded-lg border">Bloquear dia</button>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {bookings.map(b=>(
          <div key={b.id} className="border rounded p-2">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{b.serviceName}</p>
                <p className="text-sm text-gray-500">{b.date} • {b.time}</p>
              </div>
              <div className="text-right">
                <p>R$ {b.price?.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

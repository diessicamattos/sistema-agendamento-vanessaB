import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db, auth } from '../firebase'
import { useAuthState } from 'react-firebase-hooks/auth'

export default function MyBookings(){
  const [user] = useAuthState(auth)
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    if(!user) return
    const q = query(collection(db,'bookings'), where('userId','==', user.uid), orderBy('date','desc'))
    const unsub = onSnapshot(q, snap => setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
    return () => unsub()
  }, [user])

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Meus agendamentos</h2>
      <div className="space-y-3">
        {bookings.map(b=>(
          <div key={b.id} className="p-4 bg-white rounded-xl border">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{b.serviceName}</p>
                <p className="text-sm text-gray-600">{b.date} • {b.time}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">R$ {b.price?.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

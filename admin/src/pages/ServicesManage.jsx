import React, { useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase'

export default function ServicesManage({ services = [] }){
  const [name,setName]=useState('')
  const [price,setPrice]=useState('')
  const [duration,setDuration]=useState('30')

  async function addService(e){
    e.preventDefault()
    await addDoc(collection(db,'services'), { name, price: Number(price), duration: Number(duration), createdAt: new Date() })
    setName(''); setPrice(''); setDuration('30')
    alert('Serviço criado')
  }

  return (
    <div>
      <form onSubmit={addService} className="space-y-2">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome" className="w-full rounded-xl border px-3 py-2"/>
        <div className="flex gap-2">
          <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="Preço" className="w-1/2 rounded-xl border px-3 py-2"/>
          <input value={duration} onChange={e=>setDuration(e.target.value)} placeholder="Duração (min)" className="w-1/2 rounded-xl border px-3 py-2"/>
        </div>
        <button className="px-4 py-2 rounded-xl bg-brand.gold">Adicionar</button>
      </form>

      <div className="mt-4 space-y-2">
        {services.map(s=>(
          <div key={s.id} className="flex justify-between items-center border rounded p-2">
            <div>
              <p className="font-semibold">{s.name}</p>
              <p className="text-sm text-gray-500">R$ {s.price} • {s.duration} min</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

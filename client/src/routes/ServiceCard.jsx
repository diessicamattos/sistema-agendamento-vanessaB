import React from 'react'

export default function ServiceCard({ service, onAgendar }){
  return (
    <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border">
      <div className="flex items-center gap-4">
        <img src={service.image || '/assets/service-placeholder.jpg'} alt={service.name} className="w-14 h-14 rounded-full object-cover"/>
        <div>
          <h3 className="font-semibold text-brand.dark">{service.name}</h3>
          <div className="flex gap-3 items-center text-sm">
            <span className="text-green-600 font-bold">R$ {service.price?.toFixed(2)}</span>
            <span className="text-gray-500">• {service.duration} min</span>
          </div>
        </div>
      </div>

      <div>
        <button onClick={onAgendar} className="px-4 py-2 rounded-lg bg-brand.dark text-white">Agendar</button>
      </div>
    </div>
  )
}

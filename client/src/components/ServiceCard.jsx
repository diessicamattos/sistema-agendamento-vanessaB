// src/components/ServiceCard.jsx
import { useState } from "react";
import CalendarModal from "./CalendarModal";

export default function ServiceCard({ service }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="cursor-pointer bg-white rounded-2xl shadow-md p-5 hover:shadow-xl transition duration-300 flex flex-col gap-3"
      >
        <h3 className="text-xl font-semibold text-gray-800">{service?.name}</h3>
        <p className="text-gray-600 text-sm">{service?.description}</p>
        <span className="text-lg font-bold text-pink-600">
          R$ {service?.price}
        </span>
        <button className="mt-2 bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition">
          Agendar
        </button>
      </div>

      {isOpen && (
        <CalendarModal
          service={service}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

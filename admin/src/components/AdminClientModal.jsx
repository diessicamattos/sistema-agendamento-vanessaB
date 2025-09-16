// src/pages/BookingsManage.jsx
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import moment from "moment";
import BookingCreate from "../components/BookingCreate";
import AdminClientModal from "../components/AdminClientModal";
import { useNavigate } from "react-router-dom";

export default function BookingsManage() {
  const [bookings, setBookings] = useState([]);
  const [showClientModal, setShowClientModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bookings"), (snap) =>
      setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, []);

  const removeBooking = async (id) => {
    if (confirm("Deseja remover este agendamento?")) {
      await deleteDoc(doc(db, "bookings", id));
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] p-4 space-y-6">
      {/* Header com botão voltar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-[#d4af37] text-[#2f2f2f] font-semibold px-4 py-2 rounded-xl shadow hover:bg-[#c9a233]"
        >
          ← Voltar
        </button>
        <h1 className="text-lg font-bold text-[#2f2f2f]">
          Gerenciar Agendamentos
        </h1>
      </div>

      {/* Botão cadastrar cliente */}
      <button
        onClick={() => setShowClientModal(true)}
        className="w-full py-3 rounded-xl bg-[#d4af37] text-[#2f2f2f] font-bold shadow hover:bg-[#c9a233] transition"
      >
        + Cadastrar Cliente
      </button>

      {/* Formulário para criar agendamento */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-[#e6e1da]">
        <h2 className="text-lg font-semibold text-[#2f2f2f] mb-3">
          Novo Agendamento
        </h2>
        <BookingCreate onCreated={() => console.log("Agendamento criado!")} />
      </div>

      {/* Lista de agendamentos */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-[#e6e1da]">
        <h2 className="text-lg font-semibold text-[#2f2f2f] mb-3">
          Agendamentos Criados
        </h2>
        <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {bookings.map((b) => (
            <li
              key={b.id}
              className="py-3 flex justify-between items-center hover:bg-[#f9f6f0] rounded-lg px-2 transition"
            >
              <div>
                <p className="font-medium text-[#2f2f2f]">
                  {b.clientName || "Cliente"}
                </p>
                <p className="text-sm text-gray-600">
                  {moment(b.date?.toDate ? b.date.toDate() : b.date).format(
                    "DD/MM/YYYY HH:mm"
                  )}{" "}
                  • {b.serviceName || ""} ({b.duration || "?"})
                </p>
              </div>
              <button
                onClick={() => removeBooking(b.id)}
                className="bg-red-600 text-white px-3 py-1 rounded-xl shadow hover:bg-red-700"
              >
                Excluir
              </button>
            </li>
          ))}
          {bookings.length === 0 && (
            <p className="text-gray-500 text-sm py-4 text-center">
              Nenhum agendamento encontrado.
            </p>
          )}
        </ul>
      </div>

      {/* Modal de cliente */}
      <AdminClientModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onCreated={() => console.log("Cliente cadastrado!")}
      />
    </div>
  );
}

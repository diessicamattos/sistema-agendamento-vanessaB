import React, { useEffect, useState } from "react";
import { collection, onSnapshot, deleteDoc, doc, getDoc } from "firebase/firestore"; // 👈 adicionei getDoc
import { db } from "../firebase";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import AdminBookingModal from "../components/AdminBookingModal";

export default function BookingsManage() {
  const [bookings, setBookings] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bookings"), async (snap) => {
      const bookingsData = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data();

          // 🔥 busca dados do cliente
          let clientName = "Cliente";
          let clientPhone = "Sem telefone";
          if (data.clientId) {
            const userSnap = await getDoc(doc(db, "users", data.clientId));
            if (userSnap.exists()) {
              const userData = userSnap.data();
              clientName = userData.name || "Cliente";
              clientPhone = userData.phone || "Sem telefone";
            }
          }

          return {
            id: d.id,
            ...data,
            clientName,
            clientPhone,
          };
        })
      );
      setBookings(bookingsData);
    });
    return () => unsub();
  }, []);

  const removeBooking = async (id) => {
    if (confirm("Deseja remover este agendamento?")) {
      await deleteDoc(doc(db, "bookings", id));
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] p-4 space-y-6">
      {/* Header */}
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
        <button
          onClick={() => setModalOpen(true)}
          className="bg-[#d4af37] text-[#2f2f2f] font-semibold px-4 py-2 rounded-xl shadow hover:bg-[#c9a233]"
        >
          + Novo
        </button>
      </div>

      {/* Modal */}
      <AdminBookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => console.log("Agendamento criado!")}
      />

      {/* Lista */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-[#e6e1da]">
        <h2 className="text-lg font-semibold text-[#2f2f2f] mb-3">
          Agendamentos Criados
        </h2>
        <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {bookings.map((b) => {
            const date = b.date?.toDate ? b.date.toDate() : b.date;
            const formattedDate = moment(date).format("DD/MM/YYYY HH:mm");
            return (
              <li
                key={b.id}
                className="py-3 flex justify-between items-center hover:bg-[#f9f6f0] rounded-lg px-2 transition"
              >
                <div>
                  <p className="font-medium text-[#2f2f2f]">
                    {b.clientName} • 📞 {b.clientPhone}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formattedDate} • {b.serviceName || ""}
                    {b.duration ? ` (${b.duration})` : ""} • R$ {b.price?.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => removeBooking(b.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded-xl shadow hover:bg-red-700"
                >
                  Excluir
                </button>
              </li>
            );
          })}
          {bookings.length === 0 && (
            <p className="text-gray-500 text-sm py-4 text-center">
              Nenhum agendamento encontrado.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
}

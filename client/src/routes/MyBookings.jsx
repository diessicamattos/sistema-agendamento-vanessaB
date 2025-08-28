// src/routes/MyBookings.jsx

import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import CalendarModal from "../components/CalendarModal";

export default function MyBookings() {
  const [user] = useAuthState(auth);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState(null);

  const navigate = useNavigate();

  // BUSCA AGENDAMENTOS DO USUÁRIO
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "bookings"),
      where("clientId", "==", user.uid),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          date: d.date?.toDate
            ? d.date.toDate().toLocaleDateString()
            : d.date,
          time: d.time || "",
        };
      });
      setBookings(data);
    });

    return () => unsubscribe();
  }, [user]);

  // CONFIRMAR CANCELAMENTO
  const confirmDelete = async () => {
    if (!bookingToCancel) return;

    try {
      await deleteDoc(doc(db, "bookings", bookingToCancel.id));
      setBookings((prev) =>
        prev.filter((b) => b.id !== bookingToCancel.id)
      );
      if (selectedBooking?.id === bookingToCancel.id) setSelectedBooking(null);

      setMessage("❌ Agendamento cancelado com sucesso!");
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    } catch (error) {
      console.error("Erro ao cancelar:", error);
      setMessage("❌ Erro ao cancelar o agendamento.");
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    } finally {
      setShowCancelConfirm(false);
      setBookingToCancel(null);
    }
  };

  // ABRIR CONFIRMAÇÃO DE CANCELAMENTO
  const handleCancelClick = (booking) => {
    setBookingToCancel(booking);
    setShowCancelConfirm(true);
  };

  // DETALHES DO AGENDAMENTO
  const handleDetails = async (id) => {
    const ref = doc(db, "bookings", id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const d = snap.data();
      setSelectedBooking({
        id: snap.id,
        serviceName: d.serviceName,
        price: d.price,
        duration: d.duration,
        date: d.date?.toDate ? d.date.toDate().toLocaleDateString() : d.date,
        time: d.time || "",
      });
    }
  };

  // ABRIR MODAL DE ALTERAR HORÁRIO
  const handleEditTime = (booking) => {
    setSelectedBooking(null); // fecha modal de detalhes
    setBookingToEdit(booking);
    setShowCalendar(true);
  };

  return (
    <div className="p-6 relative">
      {/* Mensagem de ação */}
      <div
        className={`absolute top-10 left-0 w-full p-3 rounded-xl bg-[#D7AF70] text-[#000001] font-bold text-center shadow-lg border-2 border-[#585B56] transition-opacity duration-500 ${
          showMessage ? "opacity-100" : "opacity-0"
        }`}
      >
        {message}
      </div>

      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-[#D7AF70]">
          Meus Agendamentos
        </h2>
        <button
          onClick={() => navigate("/")}
          className="bg-[#D7AF70] text-black px-3 py-1 rounded-lg hover:opacity-90 transition text-sm"
        >
          Voltar para Home
        </button>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        É possível cancelar os agendamentos apenas até 24 horas antes do horário marcado.
      </p>

      {/* Lista de agendamentos */}
      {bookings.length === 0 ? (
        <p className="text-gray-500">Você ainda não possui agendamentos.</p>
      ) : (
        <ul className="space-y-4">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className="p-4 bg-[#1a1a1a] border border-[#D7AF70]/40 rounded-xl flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-white">
                  {booking.serviceName || "Serviço"}
                </p>
                <p className="text-sm text-gray-400">
                  {booking.date} • {booking.time}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDetails(booking.id)}
                  className="bg-[#D7AF70] text-black px-3 py-1 rounded-lg hover:opacity-90 transition text-sm"
                >
                  Detalhes
                </button>
                <button
                  onClick={() => handleCancelClick(booking)}
                  className="bg-red-600 text-white px-3 py-1 rounded-lg hover:opacity-90 transition text-sm"
                >
                  Cancelar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal de detalhes */}
      {selectedBooking && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-[#1a1a1a] border-2 border-[#D7AF70] rounded-2xl p-6 w-80 text-center text-white">
            <h3 className="text-lg font-bold text-[#D7AF70] mb-3">
              Detalhes do Agendamento
            </h3>
            <p className="mb-2">
              <span className="font-semibold">Serviço:</span> {selectedBooking.serviceName}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Preço:</span> R${selectedBooking.price}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Duração:</span> {selectedBooking.duration || "Não informado"}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Data:</span> {selectedBooking.date}
            </p>
            <p className="mb-4">
              <span className="font-semibold">Hora:</span> {selectedBooking.time}
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleEditTime(selectedBooking)}
                className="bg-[#D7AF70] text-black px-3 py-1 rounded-lg hover:opacity-90 transition text-sm"
              >
                Alterar Horário
              </button>
              <button
                  onClick={() => {
                    setSelectedBooking(null); // fecha somente o modal de detalhes
                    setBookingToEdit(null);   // garante que não esteja editando
                    setShowCalendar(false);   // fecha calendário se estiver aberto
                  }}
                  className="bg-[#D7AF70] text-black px-3 py-1 rounded-lg hover:opacity-90 transition text-sm"
                >
                  Fechar
                </button>

            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de cancelamento */}
      {showCancelConfirm && bookingToCancel && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-[#1a1a1a] border-2 border-[#D7AF70] rounded-2xl p-6 w-80 text-center text-white">
            <h3 className="text-lg font-bold text-[#D7AF70] mb-4">
              Tem certeza que deseja cancelar este agendamento?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
              >
                Sim
              </button>
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  setBookingToCancel(null);
                }}
                className="bg-[#D7AF70] text-black px-4 py-2 rounded-lg hover:opacity-90 transition"
              >
                Não
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de alterar horário */}
      {bookingToEdit && (
        <CalendarModal
          isOpen={showCalendar} // ✅ importante!
          booking={bookingToEdit}
          onClose={() => {
            setShowCalendar(false);
            setBookingToEdit(null);
          }}
          onSave={async (newDate, newTime) => {
            const ref = doc(db, "bookings", bookingToEdit.id);
            await updateDoc(ref, { date: new Date(newDate), time: newTime });

            setBookings((prev) =>
              prev.map((b) =>
                b.id === bookingToEdit.id
                  ? { ...b, date: new Date(newDate).toLocaleDateString(), time: newTime }
                  : b
              )
            );

            setMessage("⏰ Horário alterado com sucesso!");
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 3000);

            setShowCalendar(false);
            setBookingToEdit(null);
          }}
        />
      )}
    </div>
  );
}

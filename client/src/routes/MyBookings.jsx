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
  Timestamp
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom"; // <-- import do useNavigate

export default function MyBookings() {
  const [user] = useAuthState(auth);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const navigate = useNavigate(); // <-- inicializa o navigate

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
          date: d.date?.toDate ? d.date.toDate().toLocaleDateString() : d.date,
          time: d.time || "",
        };
      });
      setBookings(data);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
      await deleteDoc(doc(db, "bookings", id));
      setBookings((prev) => prev.filter((b) => b.id !== id));
      if (selectedBooking?.id === id) setSelectedBooking(null);
    }
  };

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

  return (
    <div className="p-6">
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
                  onClick={() => handleDelete(booking.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded-lg hover:opacity-90 transition text-sm"
                >
                  Cancelar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

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

            <button
              onClick={() => setSelectedBooking(null)}
              className="bg-[#D7AF70] text-black px-4 py-2 rounded-lg hover:opacity-90 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

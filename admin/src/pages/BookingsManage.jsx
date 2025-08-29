import React, { useEffect, useState } from "react";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import moment from "moment";

export default function BookingsManage() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bookings"), (snap) =>
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, []);

  const removeBooking = async (id) => {
    if (confirm("Deseja remover este agendamento?")) {
      await deleteDoc(doc(db, "bookings", id));
    }
  };

  return (
    <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
      {bookings.map(b => (
        <li key={b.id} className="py-2 flex justify-between items-center">
          <div>
            <p className="font-medium">{b.clientName}</p>
            <p className="text-sm text-gray-600">
              {moment(b.date).format("DD/MM/YYYY HH:mm")} • {b.serviceName}
            </p>
          </div>
          <button onClick={() => removeBooking(b.id)} className="bg-red-600 text-white px-2 py-1 rounded">
            Excluir
          </button>
        </li>
      ))}
      {bookings.length === 0 && <p className="text-gray-500 text-sm">Nenhum agendamento.</p>}
    </ul>
  );
}

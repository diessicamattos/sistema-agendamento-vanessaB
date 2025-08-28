// src/components/CalendarModal.jsx
import React, { useEffect, useState } from "react";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import moment from "moment";
import "moment/locale/pt-br";
import { useAuthState } from "react-firebase-hooks/auth";

moment.locale("pt-br");

export default function CalendarModal({ isOpen, onClose, service, booking, onSave }) {
  const [user] = useAuthState(auth);
  const [selectedDate, setSelectedDate] = useState(
    booking?.date ? moment(booking.date, "YYYY-MM-DD") : moment()
  );
  const [selectedHour, setSelectedHour] = useState(
    booking?.time ? parseInt(booking.time.split(":")[0]) + parseInt(booking.time.split(":")[1])/60 : null
  );
  const [bookings, setBookings] = useState([]);
  const [availableHours, setAvailableHours] = useState([]);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  const nextDays = Array.from({ length: 14 }, (_, i) => moment().add(i, "days"));

  const parseDuration = (duration) => {
    if (!duration) return 1;
    let hours = 0, minutes = 0;
    const hMatch = duration.match(/(\d+)h/);
    const mMatch = duration.match(/(\d+)min/);
    const hrMatch = duration.match(/(\d+) horas?/);
    if (hMatch) hours = parseInt(hMatch[1]);
    if (hrMatch) hours = parseInt(hrMatch[1]);
    if (mMatch) minutes = parseInt(mMatch[1]);
    return hours + minutes / 60;
  };

  // Carrega todos os agendamentos futuros
  useEffect(() => {
    const loadBookings = async () => {
      const q = collection(db, "bookings");
      const snap = await getDocs(q);
      setBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    loadBookings();
  }, []);

  // Atualiza horários disponíveis
  useEffect(() => {
    const currentService = booking || service;
    if (!currentService) return;

    const duration = parseDuration(currentService.duration);
    const dayBookings = bookings
      .filter(b => b.date === selectedDate.format("YYYY-MM-DD") && b.id !== booking?.id)
      .map(b => {
        const start = parseFloat(b.time.split(":")[0]) + parseFloat(b.time.split(":")[1])/60;
        const end = start + parseDuration(b.duration || "1 hora");
        return { start, end };
      });

    const hours = Array.from({ length: 25 }, (_, i) => 8 + i*0.5).filter(hour => {
      const endTime = hour + duration;
      return !dayBookings.some(b => hour < b.end && endTime > b.start);
    });

    setAvailableHours(hours);
    if (!hours.includes(selectedHour)) setSelectedHour(null);
  }, [selectedDate, bookings, service, booking]);

  const handleConfirm = async () => {
    if (!user) {
      setConfirmationMessage("Você precisa estar logado.");
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
      return;
    }
    if (selectedHour == null) {
      setConfirmationMessage("Selecione um horário antes de confirmar.");
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
      return;
    }

    const hourStr = moment({ hour: Math.floor(selectedHour), minute: selectedHour % 1 === 0.5 ? 30 : 0 }).format("HH:mm");

    if (booking && onSave) {
      // Editando agendamento existente
      onSave(selectedDate.format("YYYY-MM-DD"), hourStr);
      setConfirmationMessage(`⏰ Horário alterado para ${selectedDate.format("DD/MM/YYYY")} às ${hourStr}`);
    } else if (service) {
      // Criando novo agendamento
      const docRef = doc(db, "bookings", `${selectedDate.format("YYYY-MM-DD")}-${hourStr}-${user.uid}`);
      await setDoc(docRef, {
        serviceName: service.name,
        price: service.price,
        duration: service.duration,
        date: selectedDate.format("YYYY-MM-DD"),
        time: hourStr,
        clientId: user.uid,
        createdAt: new Date().toISOString(),
      });
      setConfirmationMessage(`✅ Agendamento confirmado para ${selectedDate.format("DD/MM/YYYY")} às ${hourStr}`);
    }

    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
      onClose();
    }, 3000);
  };

  if (!isOpen) return null;

  const currentName = booking?.serviceName || service?.name;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-10 z-50 overflow-auto">
      <div className="bg-[#585B56] text-[#D7AF70] rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-lg relative">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg sm:text-xl font-bold">{booking ? `Alterar horário: ${currentName}` : `Agendar: ${currentName}`}</h2>
          <button
            onClick={onClose}
            className="text-[#000001] bg-[#D7AF70] px-2 py-1 rounded text-sm hover:bg-[#937D64] transition"
          >
            Fechar
          </button>
        </div>

        <div
          className={`absolute top-10 left-0 w-full p-3 rounded-xl bg-[#D7AF70] text-[#000001] font-bold text-center shadow-lg border-2 border-[#585B56] transition-opacity duration-500 ${showMessage ? "opacity-100" : "opacity-0"}`}
        >
          {confirmationMessage}
        </div>

        {/* Seleção de dias */}
        <div className="flex overflow-x-auto gap-2 mb-4">
          {nextDays.map(day => {
            const isSelected = day.isSame(selectedDate, "day");
            return (
              <button
                key={day.format("YYYY-MM-DD")}
                onClick={() => setSelectedDate(day)}
                className={`flex-shrink-0 w-14 h-14 flex flex-col items-center justify-center rounded-lg font-bold transition ${isSelected ? "bg-[#D7AF70] text-[#000001]" : "bg-[#585B56] text-[#D7AF70]"}`}
              >
                <span className="text-xs">{day.format("ddd")}</span>
                <span className="text-lg">{day.date()}</span>
              </button>
            );
          })}
        </div>

        {/* Seleção de horários */}
        <div className="overflow-x-auto flex gap-2 mb-4">
          {availableHours.map(hour => {
            const label = moment({ hour: Math.floor(hour), minute: hour % 1 === 0.5 ? 30 : 0 }).format("HH:mm");
            return (
              <button
                key={hour}
                onClick={() => setSelectedHour(hour)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-bold transition ${selectedHour === hour ? "bg-[#D7AF70] text-[#000001]" : "bg-[#585B56] text-[#D7AF70] hover:bg-[#D7AF70] hover:text-[#000001]"}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleConfirm}
          className="w-full py-3 rounded-xl bg-[#D7AF70] text-[#000001] font-bold shadow hover:bg-[#937D64] transition"
        >
          {booking ? "Salvar Alteração" : "Confirmar agendamento"}
        </button>
      </div>
    </div>
  );
}

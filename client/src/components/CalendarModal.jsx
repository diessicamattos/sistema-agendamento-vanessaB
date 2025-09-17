// src/components/CalendarModal.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import moment from "moment";
import "moment/locale/pt-br";
import { useAuthState } from "react-firebase-hooks/auth";

moment.updateLocale("pt-br", {
  weekdaysShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  weekdaysMin: ["D", "S", "T", "Q", "Q", "S", "S"],
});
moment.locale("pt-br");

export default function CalendarModal({ isOpen, onClose, service, booking, onSave }) {
  const [user] = useAuthState(auth);
  const [selectedDate, setSelectedDate] = useState(moment().add(1, "day"));
  const [selectedHour, setSelectedHour] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [availableHours, setAvailableHours] = useState([]);
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (booking) {
      const bookingDate = moment(booking.date);
      setSelectedDate(
        bookingDate.isBefore(moment().add(1, "day"), "day")
          ? moment().add(1, "day")
          : bookingDate
      );
      const [h, m] = booking.time.split(":");
      setSelectedHour(parseInt(h) + parseInt(m) / 60);
    } else if (service) {
      setSelectedDate(moment().add(1, "day"));
      setSelectedHour(null);
    }
  }, [booking, service]);

  const nextDays = Array.from({ length: 14 }, (_, i) =>
    moment().startOf("day").add(i + 1, "days")
  );

  const parseDuration = (duration) => {
    if (!duration) return 1;
    const [h, m] = duration.split(":");
    return parseInt(h) + parseInt(m) / 60;
  };

  useEffect(() => {
    const loadBookings = async () => {
      const snap = await getDocs(collection(db, "bookings"));
      setBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    loadBookings();
  }, []);

  useEffect(() => {
    const loadBlockedTimes = async () => {
      const docRef = doc(db, "blockedTimes", "global");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const dayBlocked = data[selectedDate.format("YYYY-MM-DD")] || [];
        const safeBlocked = dayBlocked.filter(i => i && i.start && i.end);
        setBlockedTimes(safeBlocked);
      } else {
        setBlockedTimes([]);
      }
    };
    loadBlockedTimes();
  }, [selectedDate]);

  useEffect(() => {
    const currentService = booking || service;
    if (!currentService) return;

    const duration = parseDuration(currentService.duration);

    const dayBookings = bookings
      .filter(b => {
        const bDate = moment(b.date?.toDate ? b.date.toDate() : b.date);
        return bDate.isSame(selectedDate, "day") && b.id !== booking?.id;
      })
      .map(b => {
        const [h, m] = b.time.split(":");
        const start = parseInt(h) + parseInt(m) / 60;
        const end = start + parseDuration(b.duration || "01:00");
        return { start, end };
      });

    const hours = Array.from({ length: 22 }, (_, i) => 9 + i * 0.5).filter(start => {
      const end = start + duration;
      const bookingStart = selectedDate
        .clone()
        .hour(Math.floor(start))
        .minute(start % 1 === 0.5 ? 30 : 0);

      const isPast = bookingStart.isBefore(moment());
      const isBooked = dayBookings.some(b => start < b.end && end > b.start);

      const isBlocked = blockedTimes.some(interval => {
        if (!interval || !interval.start || !interval.end) return false;
        const [blockStartH, blockStartM] = interval.start.split(":").map(Number);
        const [blockEndH, blockEndM] = interval.end.split(":").map(Number);
        const blockStart = blockStartH + blockStartM / 60;
        const blockEnd = blockEndH + blockEndM / 60;
        return start < blockEnd && end > blockStart;
      });

      return !isPast && !isBooked && !isBlocked;
    });

    setAvailableHours(hours);
    if (!hours.includes(selectedHour)) setSelectedHour(null);
  }, [selectedDate, bookings, service, booking, selectedHour, blockedTimes]);

  const handleConfirm = async () => {
    if (!user) return showTempMessage("Você precisa estar logado.");
    if (selectedHour == null) return showTempMessage("Selecione um horário antes de confirmar.");

    setIsSaving(true);

    const hourStr = moment({
      hour: Math.floor(selectedHour),
      minute: selectedHour % 1 === 0.5 ? 30 : 0,
    }).format("HH:mm");

    const combinedDateTime = moment(`${selectedDate.format("DD/MM/YYYY")} ${hourStr}`, "DD/MM/YYYY HH:mm").toDate();

    try {
      if (booking && onSave) {
        await onSave(selectedDate.format("YYYY-MM-DD"), hourStr);
        showTempMessage(`⏰ Horário alterado para ${selectedDate.format("DD/MM/YYYY")} às ${hourStr}`);
      } else if (service) {
        await addDoc(collection(db, "bookings"), {
          serviceName: service.name,
          price: service.price,
          duration: service.duration,
          date: combinedDateTime,
          time: hourStr,
          clientId: user.uid,
          createdAt: new Date().toISOString(),
        });
        showTempMessage(`✅ Agendamento confirmado para ${selectedDate.format("DD/MM/YYYY")} às ${hourStr}`);
      }
    } catch (err) {
      console.error(err);
      showTempMessage("Erro ao salvar agendamento. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const showTempMessage = msg => {
    setConfirmationMessage(msg);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
  };

  if (!isOpen) return null;

  const currentName = booking?.serviceName || service?.name;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-10 z-50 overflow-auto">
      <div className="bg-[#585B56] text-[#D7AF70] rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-lg relative">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg sm:text-xl font-bold">
            {booking ? `Alterar horário: ${currentName}` : `Agendar: ${currentName}`}
          </h2>
          <button
            onClick={onClose}
            className="text-[#000001] bg-[#D7AF70] px-2 py-1 rounded text-sm hover:bg-[#937D64] transition"
          >
            Fechar
          </button>
        </div>

        <div className={`absolute top-10 left-0 w-full p-3 rounded-xl bg-[#D7AF70] text-[#000001] font-bold text-center shadow-lg border-2 border-[#585B56] transition-opacity duration-500 ${showMessage ? "opacity-100" : "opacity-0"}`}>
          {confirmationMessage}
        </div>

        {/* Seleção de dias */}
        <div className="flex overflow-x-auto gap-2 mb-4">
          {nextDays
            .filter(day => day.isoWeekday() !== 7 && day.isoWeekday() !== 1) // bloqueia domingos (7) e segundas (1)
            .map(day => {
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

        {/* Horários disponíveis */}
        <div className="overflow-x-auto flex gap-2 mb-4">
          {availableHours.map(hour => {
            const label = moment({ hour: Math.floor(hour), minute: hour % 1 === 0.5 ? 30 : 0 }).format("HH:mm");
            return (
              <button
                key={hour}
                onClick={() => setSelectedHour(hour)}
                disabled={isSaving}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-bold transition ${selectedHour === hour ? "bg-[#D7AF70] text-[#000001]" : "bg-[#585B56] text-[#D7AF70] hover:bg-[#D7AF70] hover:text-[#000001]"}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleConfirm}
          disabled={isSaving}
          className="w-full py-3 rounded-xl bg-[#D7AF70] text-[#000001] font-bold shadow hover:bg-[#937D64] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Salvando..." : booking ? "Salvar Alteração" : "Confirmar agendamento"}
        </button>
      </div>
    </div>
  );
}

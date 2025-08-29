// admin/src/components/Calendar.jsx
import React, { useMemo, useState, useEffect } from "react";
import moment from "moment";
import "moment/locale/pt-br";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

moment.locale("pt-br");

export default function Calendar({
  currentMonth,
  setCurrentMonth,
  selectedDate,
  setSelectedDate,
  bookings,
  blockedWeekdays = [],
  blockedDates = [],
  showTimes = false
}) {
  const [blockedTimes, setBlockedTimes] = useState({}); // ex: { "2025-09-10": ["08:00", "09:00"] }

  const calendarDays = useMemo(() => {
    const startOfMonth = currentMonth.clone().startOf("month").startOf("week");
    const endOfMonth = currentMonth.clone().endOf("month").endOf("week");
    const days = [];
    let day = startOfMonth.clone();
    while (day.isBefore(endOfMonth, "day")) {
      days.push(day.clone());
      day.add(1, "day");
    }
    return days;
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(currentMonth.clone().subtract(1, "month"));
  const handleNextMonth = () => setCurrentMonth(currentMonth.clone().add(1, "month"));

  // Carregar horários bloqueados do Firestore ao selecionar uma data
  useEffect(() => {
    const loadBlockedTimes = async () => {
      const newBlockedTimes = {};
      for (let day of calendarDays) {
        const dayFormatted = day.format("YYYY-MM-DD");
        const docRef = doc(db, "blockedTimes", dayFormatted);
        const snap = await getDoc(docRef);
        if (snap.exists()) newBlockedTimes[dayFormatted] = snap.data().times;
      }
      setBlockedTimes(newBlockedTimes);
    };
    loadBlockedTimes();
  }, [calendarDays]);

  // Salvar horário bloqueado no Firestore
  const toggleBlockedTime = async (dayFormatted, hour) => {
    const current = blockedTimes[dayFormatted] || [];
    const updated = current.includes(hour)
      ? current.filter(h => h !== hour)
      : [...current, hour];

    setBlockedTimes(prev => ({ ...prev, [dayFormatted]: updated }));

    await setDoc(doc(db, "blockedTimes", dayFormatted), { times: updated });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button onClick={handlePrevMonth} className="px-2 py-1 rounded bg-gray-300 hover:bg-gray-400">{'<'}</button>
        <h3 className="font-bold text-gray-800">{currentMonth.format("MMMM YYYY")}</h3>
        <button onClick={handleNextMonth} className="px-2 py-1 rounded bg-gray-300 hover:bg-gray-400">{'>'}</button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2 text-center font-semibold text-gray-700">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(d => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(dayItem => {
          const isSelected = dayItem.isSame(selectedDate, "day");
          const isToday = dayItem.isSame(moment(), "day");
          const dayFormatted = dayItem.format("YYYY-MM-DD");

          const isBlocked =
            blockedWeekdays.includes(dayItem.day()) ||
            blockedDates.includes(dayFormatted);

          const hasBooking = bookings.some(
            b => moment(b.date?.toDate ? b.date.toDate() : b.date).isSame(dayItem, "day")
          );

          const baseClass = "h-12 flex items-center justify-center rounded cursor-pointer";
          let bgClass = isBlocked
            ? "bg-gray-400 text-gray-300 cursor-not-allowed"
            : "bg-gray-200 text-gray-700";

          if (isToday && !isBlocked) bgClass = "bg-blue-300 text-white";
          if (isSelected && !isBlocked) bgClass = "bg-blue-500 text-white";
          if (hasBooking && !isBlocked) bgClass = "bg-green-300 text-white";

          return (
            <div
              key={dayFormatted}
              onClick={() => !isBlocked && setSelectedDate(dayItem)}
              className={`${baseClass} ${bgClass}`}
            >
              {dayItem.date()}
              {showTimes && !isBlocked && (
                <div className="mt-1 flex flex-col text-xs gap-1">
                  {Array.from({ length: 10 }, (_, i) => {
                    const hour = `${8 + i}:00`; // horários 08:00-17:00
                    const isHourBlocked = blockedTimes[dayFormatted]?.includes(hour);
                    return (
                      <button
                        key={hour}
                        onClick={() => toggleBlockedTime(dayFormatted, hour)}
                        className={`text-xs rounded px-1 ${isHourBlocked ? "bg-red-400 text-white" : "bg-blue-200 hover:bg-blue-400 text-white"}`}
                      >
                        {hour}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

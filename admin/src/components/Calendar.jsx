import React, { useMemo } from "react";
import moment from "moment";
import "moment/locale/pt-br";

moment.locale("pt-br");

export default function Calendar({ currentMonth, setCurrentMonth, selectedDate, setSelectedDate, bookings }) {
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
          const hasBooking = bookings.some(b => b.date === dayItem.format("YYYY-MM-DD"));

          const baseClass = "h-12 flex items-center justify-center rounded cursor-pointer";
          let bgClass = "bg-gray-200 text-gray-700";
          if (isToday) bgClass = "bg-blue-300 text-white";
          if (isSelected) bgClass = "bg-blue-500 text-white";
          if (hasBooking) bgClass = "bg-green-300 text-white";

          return (
            <div
              key={dayItem.format("YYYY-MM-DD")}
              onClick={() => setSelectedDate(dayItem)}
              className={`${baseClass} ${bgClass}`}
            >
              {dayItem.date()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

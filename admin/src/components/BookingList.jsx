import React from "react";
import moment from "moment";
import "moment/locale/pt-br";

moment.locale("pt-br");

export default function BookingList({ bookings, showClientName = false }) {
  if (!bookings || bookings.length === 0) {
    return <p className="text-gray-500 text-sm">Nenhum agendamento encontrado.</p>;
  }

  return (
    <ul className="divide-y divide-gray-200 max-h-72 overflow-y-auto">
      {bookings.map((b) => {
        const bookingDate = b.date?.toDate ? moment(b.date.toDate()) : moment(b.date);
        return (
          <li key={b.id} className="py-2">
            {showClientName && <p className="font-medium text-gray-800">{b.clientName}</p>}
            <p className="text-sm text-gray-600">
              {bookingDate.format("DD/MM/YYYY HH:mm")} • {b.serviceName} • {b.duration} • R$ {b.price?.toFixed(2)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

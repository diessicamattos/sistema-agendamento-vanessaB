// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, setDoc, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { signOut } from "firebase/auth";
import ServicesManage from "./ServicesManage";
import BookingsManage from "./BookingsManage";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import moment from "moment";
import "moment/locale/pt-br";

moment.locale("pt-br");

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(moment());
  const [notes, setNotes] = useState("");
  const [blockedHours, setBlockedHours] = useState({});
  const nav = useNavigate();

  const periods = {
    "Manhã": Array.from({ length: 7 }, (_, i) => i + 6),
    "Tarde": Array.from({ length: 5 }, (_, i) => i + 13),
    "Noite": Array.from({ length: 6 }, (_, i) => i + 18),
  };

  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) =>
      setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "services"));
    const unsub = onSnapshot(q, (snap) =>
      setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const docRef = doc(db, "notes", selectedDate.format("YYYY-MM-DD"));
    const unsub = onSnapshot(docRef, (snap) => {
      setNotes(snap.exists() ? snap.data().text : "");
    });

    const blockRef = doc(db, "blockedHours", selectedDate.format("YYYY-MM-DD"));
    const unsubBlock = onSnapshot(blockRef, (snap) => {
      setBlockedHours(snap.exists() ? snap.data() : {});
    });

    return () => {
      unsub();
      unsubBlock();
    };
  }, [selectedDate]);

  async function toggleBlockHour(hour) {
    const docRef = doc(db, "blockedHours", selectedDate.format("YYYY-MM-DD"));
    const snap = await getDoc(docRef);
    const current = snap.exists() ? snap.data() : {};

    let newStatus;
    if (current[hour] === "owner") {
      newStatus = false;
    } else {
      newStatus = "owner";
    }

    const updatedHours = { ...current, [hour]: newStatus };
    setBlockedHours(updatedHours);
    await setDoc(docRef, updatedHours, { merge: true });
  }

  function handleLogout() {
    signOut(auth);
    nav("/login");
  }

  const chartData = bookings.slice(0, 7).map((b) => ({
    name: b.date,
    total: Number(b.price || 0),
  }));

  const startOfMonth = currentMonth.clone().startOf("month").startOf("week");
  const endOfMonth = currentMonth.clone().endOf("month").endOf("week");

  const calendarDays = [];
  let day = startOfMonth.clone();
  while (day.isBefore(endOfMonth, "day")) {
    calendarDays.push(day.clone());
    day.add(1, "day");
  }

  const handlePrevMonth = () => setCurrentMonth(currentMonth.clone().subtract(1, "month"));
  const handleNextMonth = () => setCurrentMonth(currentMonth.clone().add(1, "month"));

  const bookingsForSelectedDate = bookings.filter(
    (b) => b.date === selectedDate.format("YYYY-MM-DD")
  );

  const handleNoteChange = async (e) => {
    setNotes(e.target.value);
    const docRef = doc(db, "notes", selectedDate.format("YYYY-MM-DD"));
    await setDoc(docRef, { text: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#585B56] text-[#000001]">
      <nav className="bg-[#000001] border-b border-[#D7AF70] p-4 flex justify-between max-w-6xl mx-auto rounded-b-xl shadow-lg">
        <div className="flex items-center gap-4">
          <img src="./public/logo.jpg" className="w-12 h-12 rounded-full border-2 border-[#D7AF70]" />
          <h1 className="font-bold text-[#D7AF70] text-xl">Meu Painel</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg border-2 border-[#D7AF70] hover:bg-[#D7AF70] hover:text-[#000001] transition"
          >
            Sair
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <section className="bg-[#937D64] rounded-xl p-4 shadow-md">
          <h2 className="font-bold mb-2 text-[#D7AF70] text-lg">Resumo financeiro (rápido)</h2>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" stroke="#D7AF70" />
                <YAxis stroke="#D7AF70" />
                <Tooltip contentStyle={{ backgroundColor: "#8E443D", border: "none", color: "#D7AF70" }} />
                <Line type="monotone" dataKey="total" stroke="#D7AF70" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <div className="bg-[#8E443D] rounded-xl p-4 shadow-md">
            <h3 className="font-bold mb-2 text-[#D7AF70] text-lg">Agendamentos recentes</h3>
            <div className="space-y-2">
              {bookings.slice(0, 6).map((b) => (
                <div key={b.id} className="border border-[#D7AF70] rounded p-2 bg-[#585B56] flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-[#D7AF70]">{b.serviceName}</p>
                    <p className="text-sm text-[#000001]">{b.date} • {b.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#D7AF70]">R$ {b.price?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#8E443D] rounded-xl p-4 shadow-md">
            <h3 className="font-bold mb-2 text-[#D7AF70] text-lg">Gerenciar serviços</h3>
            <ServicesManage services={services} />
          </div>
        </section>

        <section className="bg-[#937D64] p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="text-[#D7AF70] font-bold text-lg px-2 py-1 rounded hover:bg-[#D7AF70] hover:text-[#000001] transition"
            >
              {"<"}
            </button>
            <h3 className="font-bold text-[#D7AF70] text-lg">{currentMonth.format("MMMM YYYY")}</h3>
            <button
              onClick={handleNextMonth}
              className="text-[#D7AF70] font-bold text-lg px-2 py-1 rounded hover:bg-[#D7AF70] hover:text-[#000001] transition"
            >
              {">"}
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
              <div key={d} className="text-center font-bold text-[#D7AF70]">{d}</div>
            ))}
            {calendarDays.map((dayItem) => {
              const isSelected = dayItem.isSame(selectedDate, "day");
              const isToday = dayItem.isSame(moment(), "day");
              const hasBooking = bookings.some(b => b.date === dayItem.format("YYYY-MM-DD"));
              return (
                <div
                  key={dayItem.format("YYYY-MM-DD")}
                  onClick={() => setSelectedDate(dayItem)}
                  className={`h-12 flex items-center justify-center rounded cursor-pointer transition ${
                    isSelected ? "bg-[#D7AF70] text-[#000001] border-2 border-[#8E443D]" :
                    isToday ? "bg-[#D7AF70] text-[#000001]" :
                    hasBooking ? "bg-[#8E443D] text-[#D7AF70]" :
                    "bg-[#585B56] text-[#D7AF70]"
                  }`}
                >
                  {dayItem.date()}
                </div>
              );
            })}
          </div>

          <div className="bg-[#8E443D] p-4 rounded shadow-md">
            <h4 className="text-[#D7AF70] font-bold mb-2">Horários de {selectedDate.format("DD/MM/YYYY")}</h4>

            {Object.entries(periods).map(([periodName, periodHours]) => (
              <div key={periodName} className="mb-4">
                <h5 className="font-bold text-[#D7AF70] mb-2">{periodName}</h5>

                {periodHours.map((hour) => {
                  const hourStr = `${hour}:00`;
                  const booked = bookingsForSelectedDate.some(b => b.time === hourStr);
                  const blockedStatus = blockedHours[hour];

                  let bgClass = "bg-[#585B56] text-[#D7AF70]";
                  let label = hourStr;

                  if (booked) {
                    bgClass = "bg-red-600 text-white";
                    label += " (Agendado)";
                  } else if (blockedStatus === "owner") {
                    bgClass = "bg-[#D7AF70] text-[#000001]";
                    label += " (Bloqueado pela proprietária)";
                  } else if (blockedStatus) {
                    bgClass = "bg-gray-700 text-[#D7AF70]";
                    label += " (Bloqueado)";
                  }

                  return (
                    <div key={hour} className="flex justify-between items-center mb-1">
                      <span className={`px-2 py-1 rounded ${bgClass}`}>{label}</span>
                      <button
                        onClick={() => toggleBlockHour(hour)}
                        className="px-2 py-1 text-sm border-2 border-[#D7AF70] rounded hover:bg-[#D7AF70] hover:text-[#000001] transition"
                      >
                        {blockedStatus ? "Desbloquear" : "Bloquear"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}

            <div className="mt-4">
              <label className="font-bold text-[#D7AF70] mb-1 block">Recado do dia:</label>
              <textarea
                value={notes}
                onChange={handleNoteChange}
                className="w-full p-2 rounded border-2 border-[#D7AF70] bg-[#585B56] text-[#D7AF70]"
                placeholder="Escreva algo para suas clientes..."
              />
            </div>
          </div>
        </section>

        <section className="bg-[#937D64] p-4 rounded-xl shadow-md">
          <BookingsManage />
        </section>
      </main>
    </div>
  );
}

// admin/src/pages/Dashboard.jsx

import React, { useState, useEffect } from "react";
import BookingList from "../components/BookingList";
import Calendar from "../components/Calendar";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate, NavLink } from "react-router-dom";
import { collection, onSnapshot, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import moment from "moment";

export default function Dashboard() {
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(moment());
  const [bookings, setBookings] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Bloqueios
  const [blockedTimes, setBlockedTimes] = useState({});
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [newBlockedStart, setNewBlockedStart] = useState("");
  const [newBlockedEnd, setNewBlockedEnd] = useState("");

  const nav = useNavigate();

  const blockedWeekdays = [0, 1]; // domingos (0) e segundas (1)
  const blockedDates = ["2025-09-07", "2025-12-25"]; // datas específicas

  // Fetch bookings
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bookings"), async (snap) => {
      const bookingsData = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data();
          const userSnap = await getDoc(doc(db, "users", data.clientId));
          const userData = userSnap.exists() ? userSnap.data() : {};
          return { id: d.id, ...data, clientName: userData.name || "Cliente" };
        })
      );
      setBookings(bookingsData);
    });
    return () => unsub();
  }, []);

  // Fetch notes
  useEffect(() => {
    const fetchNote = async () => {
      setLoadingNotes(true);
      const docRef = doc(db, "notes", selectedDate.format("YYYY-MM-DD"));
      const snap = await getDoc(docRef);
      setNotes(snap.exists() ? snap.data().text : "");
      setLoadingNotes(false);
    };
    fetchNote();
  }, [selectedDate]);

 // Fetch notes (recado global)
useEffect(() => {
  const unsub = onSnapshot(doc(db, "notes", "global"), (snap) => {
    if (snap.exists()) setNotes(snap.data().text);
    else setNotes("");
  });
  return () => unsub();
}, []);

  const handleLogout = () => {
    signOut(auth);
    nav("/login");
  };

  const handleNoteChange = (e) => setNotes(e.target.value);

const handlePostNote = async () => {
  if (!notes.trim()) return;
  const docRef = doc(db, "notes", "global"); // 🔥 salva sempre no doc global
  await setDoc(docRef, { text: notes });
  alert("Recado publicado!");
};

  // Adicionar horário bloqueado (intervalo)
  const handleAddBlockedTime = async () => {
    if (!newBlockedDate || !newBlockedStart || !newBlockedEnd) return;

    const updated = { ...blockedTimes };
    if (!updated[newBlockedDate]) updated[newBlockedDate] = [];

    updated[newBlockedDate].push({ start: newBlockedStart, end: newBlockedEnd });

    setBlockedTimes(updated);
    await setDoc(doc(db, "blockedTimes", "global"), updated, { merge: true });

    setNewBlockedStart("");
    setNewBlockedEnd("");
  };

  // Remover horário bloqueado
  const handleRemoveBlockedTime = async (date, interval) => {
    const updated = { ...blockedTimes };
    updated[date] = updated[date].filter(i => i.start !== interval.start || i.end !== interval.end);
    setBlockedTimes(updated);
    await setDoc(doc(db, "blockedTimes", "global"), updated, { merge: true });
  };

  // Verifica se o dia está bloqueado
  const isBlocked =
    blockedWeekdays.includes(selectedDate.day()) ||
    blockedDates.includes(selectedDate.format("YYYY-MM-DD"));

  // Filtra bookings
  const bookingsForSelectedDate = !isBlocked
    ? bookings.filter((b) => {
        const bookingDate = b.date?.toDate ? moment(b.date.toDate()) : moment(b.date);
        return bookingDate.isSame(selectedDate, "day");
      })
    : [];

  const blockedForDay = blockedTimes[selectedDate.format("YYYY-MM-DD")] || [];

  return (
    <div className="min-h-screen bg-[#fdfaf6]">
      {/* Header */}
      <header className="bg-[#2f2f2f] shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="Logo" className="w-12 h-12 object-contain rounded-full border-2 border-[#d4af37]" />
          <h1 className="text-2xl font-extrabold text-[#fdfaf6] tracking-wide">Painel Admin</h1>
        </div>

        {/* Menu Desktop */}
        <nav className="hidden md:flex gap-6">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? "text-[#d4af37] font-bold border-b-2 border-[#d4af37]"
                : "text-[#fdfaf6] hover:text-[#d4af37] transition"
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/bookings"
            className={({ isActive }) =>
              isActive
                ? "text-[#d4af37] font-bold border-b-2 border-[#d4af37]"
                : "text-[#fdfaf6] hover:text-[#d4af37] transition"
            }
          >
            Agendamentos
          </NavLink>
          <NavLink
            to="/services"
            className={({ isActive }) =>
              isActive
                ? "text-[#d4af37] font-bold border-b-2 border-[#d4af37]"
                : "text-[#fdfaf6] hover:text-[#d4af37] transition"
            }
          >
            Serviços
          </NavLink>
          <NavLink
            to="/finance"
            className={({ isActive }) =>
              isActive
                ? "text-[#d4af37] font-bold border-b-2 border-[#d4af37]"
                : "text-[#fdfaf6] hover:text-[#d4af37] transition"
            }
          >
            Financeiro
          </NavLink>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-3 py-1 rounded-xl ml-4"
          >
            Sair
          </button>
        </nav>

        {/* Botão hamburguer mobile */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-[#d4af37] text-3xl focus:outline-none"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </header>

      {/* Menu mobile */}
      {menuOpen && (
        <nav className="flex flex-col bg-[#2f2f2f] p-4 gap-4 md:hidden">
          <NavLink to="/dashboard" onClick={() => setMenuOpen(false)} className="text-[#fdfaf6] hover:text-[#d4af37]">Dashboard</NavLink>
          <NavLink to="/bookings" onClick={() => setMenuOpen(false)} className="text-[#fdfaf6] hover:text-[#d4af37]">Agendamentos</NavLink>
          <NavLink to="/services" onClick={() => setMenuOpen(false)} className="text-[#fdfaf6] hover:text-[#d4af37]">Serviços</NavLink>
          <NavLink to="/finance" onClick={() => setMenuOpen(false)} className="text-[#fdfaf6] hover:text-[#d4af37]">Financeiro</NavLink>
          <button onClick={handleLogout} className="bg-red-600 text-white px-3 py-2 rounded-xl">Sair</button>
        </nav>
      )}

      <main className="p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Booking List */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-[#e6e1da]">
            <h2 className="text-xl font-semibold mb-4 text-[#2f2f2f]">
              Agendamentos do dia{" "}
              <span className="text-[#d4af37]">{selectedDate.format("DD/MM/YYYY")}</span>
            </h2>
            {isBlocked ? (
              <p className="text-red-600 font-bold">Este dia está bloqueado para agendamentos.</p>
            ) : bookingsForSelectedDate.length === 0 ? (
              <p className="text-gray-500">Nenhum agendamento neste dia.</p>
            ) : (
              <BookingList
                bookings={bookingsForSelectedDate}
                showClientName
                blockedTimes={blockedForDay}
              />
            )}

            {/* Bloquear horários */}
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold mb-3 text-[#2f2f2f]">Bloquear horários</h3>
              <div className="flex flex-wrap gap-2 items-center">
                <input type="date" value={newBlockedDate} onChange={(e) => setNewBlockedDate(e.target.value)} className="border p-2 rounded-xl"/>
                <input type="time" value={newBlockedStart} onChange={(e) => setNewBlockedStart(e.target.value)} className="border p-2 rounded-xl"/>
                <input type="time" value={newBlockedEnd} onChange={(e) => setNewBlockedEnd(e.target.value)} className="border p-2 rounded-xl"/>
                <button onClick={handleAddBlockedTime} className="bg-[#d4af37] text-[#2f2f2f] font-semibold px-4 py-2 rounded-xl shadow">Adicionar</button>
              </div>

              <ul className="mt-3 divide-y divide-gray-200 max-h-32 overflow-y-auto">
                {blockedForDay.map((interval) => (
                  <li key={interval.start + interval.end} className="flex justify-between py-2">
                    <span className="text-sm">{interval.start} - {interval.end}</span>
                    <button onClick={() => handleRemoveBlockedTime(selectedDate.format("YYYY-MM-DD"), interval)} className="text-red-600 font-semibold">Remover</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Global Note */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-[#e6e1da]">
            <h2 className="text-xl font-semibold mb-4 text-[#2f2f2f]">Recado da proprietária</h2>
            <textarea
              value={notes}
              onChange={handleNoteChange}
              placeholder="Digite o recado..."
              className="w-full p-3 rounded-xl border border-gray-300 resize-none focus:ring-2 focus:ring-[#d4af37]"
              rows={4}
            />
            <button
              onClick={handlePostNote}
              className="mt-3 bg-[#d4af37] text-[#2f2f2f] font-semibold px-5 py-2 rounded-xl shadow hover:bg-[#c9a233]"
              disabled={loadingNotes}
            >
              Postar
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-[#e6e1da]">
          <h2 className="text-xl font-semibold mb-4 text-[#2f2f2f]">Calendário</h2>
          <Calendar
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            bookings={bookings}
            blockedWeekdays={blockedWeekdays}
            blockedDates={blockedDates}
            blockedTimes={blockedTimes}
          />
        </div>
      </main>
    </div>
  );
}

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

  const blockedWeekdays = [0]; // domingos
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

  // Fetch blocked times from Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "blockedTimes", "global"), (snap) => {
      if (snap.exists()) setBlockedTimes(snap.data());
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
    const docRef = doc(db, "notes", selectedDate.format("YYYY-MM-DD"));
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center md:flex-row flex-col md:gap-0 gap-2">
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-contain opacity-70" />
          <h1 className="text-2xl font-bold text-gray-800">Painel Admin</h1>
        </div>

        <div className="flex md:hidden justify-between w-full">
          <button className="bg-gray-200 px-3 py-1 rounded" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "Fechar Menu" : "Menu"}
          </button>
          <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">
            Sair
          </button>
        </div>

        <nav className="hidden md:flex gap-4">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "text-blue-600 font-bold" : "text-gray-600"}>Dashboard</NavLink>
          <NavLink to="/services" className={({ isActive }) => isActive ? "text-blue-600 font-bold" : "text-gray-600"}>Serviços</NavLink>
          <NavLink to="/finance" className={({ isActive }) => isActive ? "text-blue-600 font-bold" : "text-gray-600"}>Financeiro</NavLink>
        </nav>
      </header>

      {menuOpen && (
        <nav className="flex flex-col bg-white p-4 gap-2 md:hidden">
          <NavLink to="/dashboard" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "text-blue-600 font-bold" : "text-gray-600"}>Dashboard</NavLink>
          <NavLink to="/services" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "text-blue-600 font-bold" : "text-gray-600"}>Serviços</NavLink>
          <NavLink to="/finance" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "text-blue-600 font-bold" : "text-gray-600"}>Financeiro</NavLink>
          <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">Sair</button>
        </nav>
      )}

      <main className="p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Booking List */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-xl font-semibold mb-4">
              Agendamentos do dia {selectedDate.format("DD/MM/YYYY")}
            </h2>
            {isBlocked ? (
              <p className="text-red-500 font-bold">Este dia está bloqueado para agendamentos.</p>
            ) : bookingsForSelectedDate.length === 0 ? (
              <p className="text-gray-500">Nenhum agendamento neste dia.</p>
            ) : (
              <BookingList bookings={bookingsForSelectedDate} showClientName blockedTimes={blockedForDay} />
            )}

            {/* Bloquear horários */}
            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold mb-2">Bloquear horários</h3>
              <input type="date" value={newBlockedDate} onChange={(e) => setNewBlockedDate(e.target.value)} className="border p-1 rounded mb-2"/>
              <input type="time" value={newBlockedStart} onChange={(e) => setNewBlockedStart(e.target.value)} className="border p-1 rounded mb-2 ml-2"/>
              <input type="time" value={newBlockedEnd} onChange={(e) => setNewBlockedEnd(e.target.value)} className="border p-1 rounded mb-2 ml-2"/>
              <button onClick={handleAddBlockedTime} className="ml-2 bg-blue-600 text-white px-3 py-1 rounded">Adicionar</button>

              <ul className="mt-2 divide-y divide-gray-200 max-h-32 overflow-y-auto">
                {blockedForDay.map((interval) => (
                  <li key={interval.start + interval.end} className="flex justify-between py-1">
                    <span>{interval.start} - {interval.end}</span>
                    <button onClick={() => handleRemoveBlockedTime(selectedDate.format("YYYY-MM-DD"), interval)} className="text-red-500">Remover</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Global Note */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Recado da proprietária</h2>
            <textarea value={notes} onChange={handleNoteChange} placeholder="Digite o recado..." className="w-full p-2 rounded border border-gray-300 resize-none" rows={4}/>
            <button onClick={handlePostNote} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded" disabled={loadingNotes}>Postar</button>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Calendário</h2>
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

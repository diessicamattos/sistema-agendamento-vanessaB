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
  const nav = useNavigate();

  // Fetch bookings with client name
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

  // Fetch global notes for selected day
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

  const handleLogout = () => {
    signOut(auth);
    nav("/login");
  };

  const handleNoteChange = (e) => setNotes(e.target.value);

  const handlePostNote = async () => {
    if (!notes.trim()) return;
    const docRef = doc(db, "notes", selectedDate.format("YYYY-MM-DD"));
    await setDoc(docRef, { text: notes });
    alert("Recado publicado!"); // opcional
  };

  // Filter bookings by selected date
  const bookingsForSelectedDate = bookings.filter((b) => {
    const bookingDate = b.date?.toDate ? moment(b.date.toDate()) : moment(b.date);
    return bookingDate.isSame(selectedDate, "day");
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header + Mobile Menu */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center md:flex-row flex-col md:gap-0 gap-2">
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-contain opacity-70" />
          <h1 className="text-2xl font-bold text-gray-800">Painel Admin</h1>
        </div>

        <div className="flex md:hidden justify-between w-full">
          <button
            className="bg-gray-200 px-3 py-1 rounded"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "Fechar Menu" : "Menu"}
          </button>
          <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">
            Sair
          </button>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-4">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => isActive ? "text-blue-600 font-bold" : "text-gray-600"}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/services"
            className={({ isActive }) => isActive ? "text-blue-600 font-bold" : "text-gray-600"}
          >
            Serviços
          </NavLink>
          <NavLink
            to="/finance"
            className={({ isActive }) => isActive ? "text-blue-600 font-bold" : "text-gray-600"}
          >
            Financeiro
          </NavLink>
        </nav>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="flex flex-col bg-white p-4 gap-2 md:hidden">
          <NavLink
            to="/dashboard"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => isActive ? "text-blue-600 font-bold" : "text-gray-600"}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/services"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => isActive ? "text-blue-600 font-bold" : "text-gray-600"}
          >
            Serviços
          </NavLink>
          <NavLink
            to="/finance"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => isActive ? "text-blue-600 font-bold" : "text-gray-600"}
          >
            Financeiro
          </NavLink>
          <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">
            Sair
          </button>
        </nav>
      )}

      {/* Main Content */}
      <main className="p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Booking List */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-xl font-semibold mb-4">
              Agendamentos do dia {selectedDate.format("DD/MM/YYYY")}
            </h2>
            {bookingsForSelectedDate.length === 0 ? (
              <p className="text-gray-500">Nenhum agendamento neste dia.</p>
            ) : (
              <BookingList bookings={bookingsForSelectedDate} showClientName />
            )}
          </div>

          {/* Global Note */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Recado da proprietária</h2>
            <textarea
              value={notes}
              onChange={handleNoteChange}
              placeholder="Digite o recado..."
              className="w-full p-2 rounded border border-gray-300 resize-none"
              rows={4}
            />
            <button
              onClick={handlePostNote}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
              disabled={loadingNotes}
            >
              Postar
            </button>
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
          />
        </div>
      </main>
    </div>
  );
}

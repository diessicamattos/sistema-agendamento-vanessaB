// src/pages/Finance.jsx

import React, { useEffect, useState } from "react";
import { collection, onSnapshot, getDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { signOut } from "firebase/auth";
import { NavLink, useNavigate } from "react-router-dom";
import moment from "moment";
import "moment/locale/pt-br";

moment.locale("pt-br");

export default function Finance() {
  const [bookings, setBookings] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bookings"), async (snap) => {
      const bookingsData = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data();
          let clientName = "Cliente";
          if (data.clientId) {
            const userSnap = await getDoc(doc(db, "users", data.clientId));
            if (userSnap.exists()) clientName = userSnap.data().name;
          }
          return { id: d.id, ...data, clientName };
        })
      );
      setBookings(bookingsData);
    });
    return () => unsub();
  }, []);

  const handleLogout = () => {
    signOut(auth);
    nav("/login");
  };

  // Agrupa bookings por dia
  const bookingsByDay = bookings.reduce((acc, b) => {
    const day = moment(b.date?.toDate ? b.date.toDate() : b.date).format("DD/MM/YYYY");
    if (!acc[day]) acc[day] = [];
    acc[day].push(b);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-contain opacity-70" />
          <h1 className="text-2xl font-bold text-gray-800">Painel Admin</h1>
        </div>

        {/* Menu Desktop */}
        <nav className="hidden md:flex gap-6">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "text-blue-600 font-bold border-b-2 border-blue-600" : "text-gray-600"}>Dashboard</NavLink>
          <NavLink to="/services" className={({ isActive }) => isActive ? "text-blue-600 font-bold border-b-2 border-blue-600" : "text-gray-600"}>Serviços</NavLink>
          <NavLink to="/finance" className={({ isActive }) => isActive ? "text-blue-600 font-bold border-b-2 border-blue-600" : "text-gray-600"}>Financeiro</NavLink>
          <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded ml-4">Sair</button>
        </nav>

        {/* Botão hamburguer mobile */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-800 text-3xl focus:outline-none"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </header>

      {/* Menu Mobile */}
      {menuOpen && (
        <nav className="flex flex-col bg-white p-4 gap-4 md:hidden shadow-md">
          <NavLink to="/dashboard" onClick={() => setMenuOpen(false)} className="text-gray-800 hover:text-blue-600">Dashboard</NavLink>
          <NavLink to="/services" onClick={() => setMenuOpen(false)} className="text-gray-800 hover:text-blue-600">Serviços</NavLink>
          <NavLink to="/finance" onClick={() => setMenuOpen(false)} className="text-gray-800 hover:text-blue-600">Financeiro</NavLink>
          <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-2 rounded">Sair</button>
        </nav>
      )}

      {/* Conteúdo Financeiro */}
      <main className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Financeiro</h1>

        {Object.entries(bookingsByDay).length === 0 && (
          <p className="text-gray-500">Nenhum registro encontrado.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(bookingsByDay).map(([day, dayBookings]) => {
            const total = dayBookings.reduce((sum, b) => sum + Number(b.price || 0), 0);
            return (
              <div key={day} className="bg-white rounded-xl shadow p-4">
                <h2 className="font-bold text-lg mb-2">
                  {day} - Total: R$ {total.toFixed(2)}
                </h2>
                <ul className="divide-y divide-gray-200 max-h-72 overflow-y-auto">
                  {dayBookings.map((b) => (
                    <li key={b.id} className="py-2 flex justify-between">
                      <div>
                        <p className="font-medium">{b.clientName}</p>
                        <p className="text-sm text-gray-600">
                          {b.serviceName} • {b.duration}
                        </p>
                      </div>
                      <span className="font-semibold">R$ {Number(b.price || 0).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

// src/pages/ServicesManage.jsx

import React, { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate, NavLink } from "react-router-dom";

export default function ServicesManage() {
  const [services, setServices] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [session, setSession] = useState("Manicure Tradicional");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editHour, setEditHour] = useState("");
  const [editMinute, setEditMinute] = useState("");
  const [editSession, setEditSession] = useState("Manicure Tradicional");

  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "services"), (snap) => {
      setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleLogout = () => {
    signOut(auth);
    nav("/login");
  };

  const addService = async () => {
    if (!name || !price || hour === "" || minute === "" || !session)
      return alert("Preencha todos os campos");
    const duration = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
    await addDoc(collection(db, "services"), {
      name,
      price: Number(price),
      duration,
      category: session,
    });
    setName(""); setPrice(""); setHour(""); setMinute(""); setSession("Manicure Tradicional");
  };

  const removeService = async (id) => {
    if (confirm("Deseja remover este serviço?")) {
      await deleteDoc(doc(db, "services", id));
    }
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditName(s.name);
    setEditPrice(s.price);
    const [h, m] = s.duration.split(":");
    setEditHour(h);
    setEditMinute(m);
    setEditSession(s.category || "Manicure Tradicional");
  };

  const saveEdit = async (id) => {
    if (!editName || !editPrice || editHour === "" || editMinute === "" || !editSession)
      return alert("Preencha todos os campos");
    const duration = `${editHour.padStart(2, "0")}:${editMinute.padStart(2, "0")}`;
    await updateDoc(doc(db, "services", id), {
      name: editName,
      price: Number(editPrice),
      duration,
      category: editSession,
    });
    setEditingId(null);
    setEditName(""); setEditPrice(""); setEditHour(""); setEditMinute(""); setEditSession("Manicure Tradicional");
  };

  const sessions = ["Manicure Tradicional", "Alongamento", "Gel", "Outros Serviços"];

  return (
    <div className="min-h-screen bg-[#fdfaf6]">
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

      {/* Conteúdo principal */}
      <main className="p-6 space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#e6e1da]">
          <h2 className="text-xl font-bold text-[#2f2f2f] mb-4">Gerenciar Serviços</h2>

          {/* Adicionar serviço */}
          <div className="flex flex-col md:flex-row gap-2 mb-6">
            <input type="text" placeholder="Serviço" value={name} onChange={(e) => setName(e.target.value)} className="border p-2 rounded flex-1" />
            <input type="number" placeholder="Preço" value={price} onChange={(e) => setPrice(e.target.value)} className="border p-2 rounded w-24" />
            <input type="number" placeholder="Hora" value={hour} onChange={(e) => setHour(e.target.value)} className="border p-2 rounded w-16" />
            <input type="number" placeholder="Minuto" value={minute} onChange={(e) => setMinute(e.target.value)} className="border p-2 rounded w-16" />
            <select value={session} onChange={(e) => setSession(e.target.value)} className="border p-2 rounded">
              {sessions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={addService} className="bg-[#d4af37] text-[#2f2f2f] font-semibold px-4 py-2 rounded-xl shadow hover:bg-[#c9a233] transition">
              + Adicionar
            </button>
          </div>

          {/* Lista de serviços */}
          <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {services.map((s) => (
              <li key={s.id} className="py-3 flex justify-between items-center hover:bg-[#f9f6f0] rounded-lg px-2 transition">
                {editingId === s.id ? (
                  <div className="flex flex-col md:flex-row gap-2 flex-1">
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="border p-1 rounded flex-1" />
                    <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="border p-1 rounded w-20" />
                    <input type="number" placeholder="Hora" value={editHour} onChange={(e) => setEditHour(e.target.value)} className="border p-1 rounded w-16" />
                    <input type="number" placeholder="Minuto" value={editMinute} onChange={(e) => setEditMinute(e.target.value)} className="border p-1 rounded w-16" />
                    <select value={editSession} onChange={(e) => setEditSession(e.target.value)} className="border p-1 rounded">
                      {sessions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => saveEdit(s.id)} className="bg-green-600 text-white px-3 py-1 rounded">Salvar</button>
                    <button onClick={() => setEditingId(null)} className="bg-gray-500 text-white px-3 py-1 rounded">Cancelar</button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-medium text-[#2f2f2f]">
                        {s.name} <span className="text-sm text-gray-500">({s.category})</span>
                      </p>
                      <p className="text-sm text-gray-600">R$ {s.price} • {s.duration}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(s)} className="bg-yellow-500 text-white px-3 py-1 rounded">Editar</button>
                      <button onClick={() => removeService(s.id)} className="bg-red-600 text-white px-3 py-1 rounded">Excluir</button>
                    </div>
                  </>
                )}
              </li>
            ))}
            {services.length === 0 && (
              <p className="text-gray-500 text-sm py-4 text-center">Nenhum serviço cadastrado ainda.</p>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}

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
  const [session, setSession] = useState("Manicure Tradicional"); // Nova propriedade

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editHour, setEditHour] = useState("");
  const [editMinute, setEditMinute] = useState("");
  const [editSession, setEditSession] = useState("Manicure Tradicional"); // Para edição

  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useNavigate();

  // Carrega serviços em tempo real
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
    const duration = `${hour.padStart(2,"0")}:${minute.padStart(2,"0")}`;
    await addDoc(collection(db, "services"), {
      name,
      price: Number(price),
      duration,
      category: session // salva a sessão
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
    const duration = `${editHour.padStart(2,"0")}:${editMinute.padStart(2,"0")}`;
    await updateDoc(doc(db, "services", id), {
      name: editName,
      price: Number(editPrice),
      duration,
      category: editSession
    });
    setEditingId(null);
    setEditName(""); setEditPrice(""); setEditHour(""); setEditMinute(""); setEditSession("Manicure Tradicional");
  };

  const sessions = ["Manicure Tradicional", "Alongamento", "Gel", "Outros Serviços"];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header + Menu */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center md:flex-row flex-col md:gap-0 gap-2">
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-contain opacity-70" />
          <h1 className="text-2xl font-bold text-gray-800">Painel Admin</h1>
        </div>

        <div className="flex md:hidden justify-between w-full">
          <button className="bg-gray-200 px-3 py-1 rounded" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "Fechar Menu" : "Menu"}
          </button>
          <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">Sair</button>
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

      {/* Conteúdo principal */}
      <main className="p-4 space-y-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Gerenciar Serviços</h2>

          {/* Adicionar serviço */}
          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <input type="text" placeholder="Serviço" value={name} onChange={(e) => setName(e.target.value)} className="border p-2 rounded flex-1" />
            <input type="number" placeholder="Preço" value={price} onChange={(e) => setPrice(e.target.value)} className="border p-2 rounded w-24" />
            <input type="number" placeholder="Hora" value={hour} onChange={(e) => setHour(e.target.value)} className="border p-2 rounded w-16" />
            <input type="number" placeholder="Minuto" value={minute} onChange={(e) => setMinute(e.target.value)} className="border p-2 rounded w-16" />
            <select value={session} onChange={(e) => setSession(e.target.value)} className="border p-2 rounded">
              {sessions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={addService} className="bg-blue-600 text-white px-4 py-2 rounded">Adicionar</button>
          </div>

          {/* Lista de serviços */}
          <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {services.map((s) => (
              <li key={s.id} className="py-2 flex justify-between items-center">
                {editingId === s.id ? (
                  <div className="flex flex-col md:flex-row gap-2 flex-1">
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="border p-1 rounded flex-1" />
                    <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="border p-1 rounded w-20" />
                    <input type="number" placeholder="Hora" value={editHour} onChange={(e) => setEditHour(e.target.value)} className="border p-1 rounded w-16" />
                    <input type="number" placeholder="Minuto" value={editMinute} onChange={(e) => setEditMinute(e.target.value)} className="border p-1 rounded w-16" />
                    <select value={editSession} onChange={(e) => setEditSession(e.target.value)} className="border p-1 rounded">
                      {sessions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => saveEdit(s.id)} className="bg-green-600 text-white px-2 py-1 rounded">Salvar</button>
                    <button onClick={() => setEditingId(null)} className="bg-gray-500 text-white px-2 py-1 rounded">Cancelar</button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-medium">{s.name} <span className="text-sm text-gray-500">({s.category})</span></p>
                      <p className="text-sm text-gray-600">R$ {s.price} • {s.duration}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(s)} className="bg-yellow-500 text-white px-2 py-1 rounded">Editar</button>
                      <button onClick={() => removeService(s.id)} className="bg-red-600 text-white px-2 py-1 rounded">Excluir</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}

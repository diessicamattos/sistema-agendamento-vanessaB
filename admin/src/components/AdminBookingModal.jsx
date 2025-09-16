//src/components/AdminBookingModal.jsx

import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import moment from "moment";
import "moment/locale/pt-br";

moment.locale("pt-br");

export default function AdminBookingModal({ isOpen, onClose, onCreated }) {
  const [selectedDate, setSelectedDate] = useState(moment().add(1, "day"));
  const [selectedHour, setSelectedHour] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [availableHours, setAvailableHours] = useState([]);

  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedService, setSelectedService] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  // 🔎 estados de busca de cliente
  const [searchClient, setSearchClient] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // carrega serviços
  useEffect(() => {
    const loadData = async () => {
      const servicesSnap = await getDocs(collection(db, "services"));
      setServices(servicesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    loadData();
  }, []);

  // busca clientes conforme digita
  useEffect(() => {
    const fetchClients = async () => {
      if (searchClient.length < 2) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      const snap = await getDocs(collection(db, "users"));
      const allClients = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const filtered = allClients.filter((c) =>
        c.name?.toLowerCase().includes(searchClient.toLowerCase())
      );
      setSearchResults(filtered);
      setSearching(false);
    };

    fetchClients();
  }, [searchClient]);

  // função para cadastrar novo cliente rápido
  const handleCreateClient = async () => {
    if (!searchClient.trim()) return;
    const newClient = { name: searchClient, createdAt: new Date() };
    const docRef = await addDoc(collection(db, "users"), newClient);
    const created = { id: docRef.id, ...newClient };
    setSelectedClient(created);
    setSearchResults([]);
    setSearchClient("");
    alert("Cliente cadastrado com sucesso!");
  };

  // carrega bookings existentes
  useEffect(() => {
    const loadBookings = async () => {
      const snap = await getDocs(collection(db, "bookings"));
      setBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    loadBookings();
  }, []);

  // carrega horários bloqueados do dia
  useEffect(() => {
    const loadBlockedTimes = async () => {
      const docRef = doc(db, "blockedTimes", "global");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const dayBlocked = data[selectedDate.format("YYYY-MM-DD")] || [];
        setBlockedTimes(dayBlocked.filter(i => i && i.start && i.end));
      } else {
        setBlockedTimes([]);
      }
    };
    loadBlockedTimes();
  }, [selectedDate]);

  // gera horários disponíveis
  useEffect(() => {
    const service = services.find(s => s.id === selectedService);
    if (!service) return;

    const [h, m] = (service.duration || "01:00").split(":");
    const duration = parseInt(h) + parseInt(m) / 60;

    const dayBookings = bookings
      .filter(b => {
        const bDate = moment(b.date?.toDate ? b.date.toDate() : b.date);
        return bDate.isSame(selectedDate, "day");
      })
      .map(b => {
        const [bh, bm] = (b.time || "00:00").split(":");
        const start = parseInt(bh) + parseInt(bm) / 60;
        const end = start + (b.duration
          ? parseInt(b.duration.split(":")[0]) + parseInt(b.duration.split(":")[1]) / 60
          : 1);
        return { start, end };
      });

    const hours = Array.from({ length: 22 }, (_, i) => 9 + i * 0.5).filter(start => {
      const end = start + duration;
      const bookingStart = selectedDate.clone().hour(Math.floor(start)).minute(start % 1 === 0.5 ? 30 : 0);

      const isPast = bookingStart.isBefore(moment());
      const isBooked = dayBookings.some(b => start < b.end && end > b.start);
      const isBlocked = blockedTimes.some(interval => {
        const [blockStartH, blockStartM] = interval.start.split(":").map(Number);
        const [blockEndH, blockEndM] = interval.end.split(":").map(Number);
        const blockStart = blockStartH + blockStartM / 60;
        const blockEnd = blockEndH + blockEndM / 60;
        return start < blockEnd && end > blockStart;
      });

      return !isPast && !isBooked && !isBlocked;
    });

    setAvailableHours(hours);
    if (!hours.includes(selectedHour)) setSelectedHour(null);
  }, [selectedDate, bookings, services, selectedService, blockedTimes]);

  const handleConfirm = async () => {
    if (!selectedClient || !selectedService || selectedHour == null) return alert("Preencha todos os campos.");

    setIsSaving(true);

    const service = services.find(s => s.id === selectedService);

    const hourStr = moment({
      hour: Math.floor(selectedHour),
      minute: selectedHour % 1 === 0.5 ? 30 : 0,
    }).format("HH:mm");

    const combinedDateTime = moment(
      `${selectedDate.format("DD/MM/YYYY")} ${hourStr}`,
      "DD/MM/YYYY HH:mm"
    ).toDate();

    try {
      await addDoc(collection(db, "bookings"), {
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        serviceId: service.id,
        serviceName: service.name,
        duration: service.duration,
        price: service.price,
        date: combinedDateTime,
        time: hourStr,
        createdAt: new Date().toISOString(),
      });

      // atualizar bloqueios sem sobrescrever os existentes
      const blockedDocRef = doc(db, "blockedTimes", "global");
      const snap = await getDoc(blockedDocRef);
      const data = snap.exists() ? snap.data() : {};
      const key = selectedDate.format("YYYY-MM-DD");
      const dayBlocked = data[key] || [];

      const [dh, dm] = service.duration.split(":");
      const duration = parseInt(dh) + parseInt(dm) / 60;
      const endHour = selectedHour + duration;
      const endStr = moment({
        hour: Math.floor(endHour),
        minute: endHour % 1 === 0.5 ? 30 : 0,
      }).format("HH:mm");

      dayBlocked.push({ start: hourStr, end: endStr });

      await setDoc(blockedDocRef, { [key]: dayBlocked }, { merge: true });

      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar agendamento.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const nextDays = Array.from({ length: 14 }, (_, i) =>
    moment().startOf("day").add(i + 1, "days")
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-10 z-50 overflow-auto">
      <div className="bg-[#585B56] text-[#D7AF70] rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-lg relative">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">Novo Agendamento</h2>
          <button onClick={onClose} className="bg-[#D7AF70] text-black px-3 py-1 rounded">
            Fechar
          </button>
        </div>

        {/* Buscar cliente */}
        <input
          type="text"
          value={searchClient}
          onChange={(e) => setSearchClient(e.target.value)}
          placeholder="Digite para buscar cliente..."
          className="border p-2 rounded w-full text-black"
        />
        {searchResults.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedClient(c)}
            className="block w-full text-left px-2 py-1 hover:bg-gray-100 text-black"
          >
            {c.name}
          </button>
        ))}
        {/* botão para cadastrar rápido */}
        {!searching && searchClient.length > 2 && searchResults.length === 0 && (
          <button
            onClick={handleCreateClient}
            className="text-blue-600 font-semibold mt-2"
          >
            + Cadastrar novo cliente "{searchClient}"
          </button>
        )}
        {selectedClient && (
          <p className="mt-2 text-sm text-green-600">
            Cliente selecionado: {selectedClient.name}
          </p>
        )}

        {/* select serviço */}
        <select
          className="w-full mb-3 mt-4 p-2 rounded text-black"
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
        >
          <option value="">Selecione o serviço</option>
          {services.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} • {s.duration}
            </option>
          ))}
        </select>

        {/* dias */}
        <div className="flex overflow-x-auto gap-2 mb-4">
          {nextDays.map(day => {
            const isSelected = day.isSame(selectedDate, "day");
            return (
              <button
                key={day.format("YYYY-MM-DD")}
                onClick={() => setSelectedDate(day)}
                className={`flex-shrink-0 w-14 h-14 flex flex-col items-center justify-center rounded-lg font-bold transition ${
                  isSelected ? "bg-[#D7AF70] text-black" : "bg-[#585B56] text-[#D7AF70]"
                }`}
              >
                <span className="text-xs">{day.format("ddd")}</span>
                <span className="text-lg">{day.date()}</span>
              </button>
            );
          })}
        </div>

        {/* horários */}
        <div className="overflow-x-auto flex gap-2 mb-4">
          {availableHours.map(hour => {
            const label = moment({
              hour: Math.floor(hour),
              minute: hour % 1 === 0.5 ? 30 : 0,
            }).format("HH:mm");
            return (
              <button
                key={hour}
                onClick={() => setSelectedHour(hour)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-bold transition ${
                  selectedHour === hour
                    ? "bg-[#D7AF70] text-black"
                    : "bg-[#585B56] text-[#D7AF70] hover:bg-[#D7AF70] hover:text-black"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleConfirm}
          disabled={isSaving}
          className="w-full py-3 rounded-xl bg-[#D7AF70] text-black font-bold shadow hover:bg-[#937D64] transition disabled:opacity-50"
        >
          {isSaving ? "Salvando..." : "Confirmar Agendamento"}
        </button>
      </div>
    </div>
  );
}

// admin/src/components/BookingCreate.jsx

import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import moment from "moment";

export default function BookingCreate({ onCreated }) {
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [blockedTimes, setBlockedTimes] = useState({});

  const [selectedClient, setSelectedClient] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Buscar clientes
  useEffect(() => {
    const fetchClients = async () => {
      const snap = await getDocs(collection(db, "users"));
      setClients(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchClients();
  }, []);

  // Buscar serviços
  useEffect(() => {
    const fetchServices = async () => {
      const snap = await getDocs(collection(db, "services"));
      setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchServices();
  }, []);

  // Escutar agendamentos
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bookings"), (snap) => {
      setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Escutar bloqueios
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "blockedTimes", "global"), (snap) => {
      if (snap.exists()) setBlockedTimes(snap.data());
    });
    return () => unsub();
  }, []);

  // Gerar slots de horários disponíveis
  useEffect(() => {
    if (!date || !selectedService) {
      setAvailableSlots([]);
      return;
    }

    const service = services.find((s) => s.id === selectedService);
    if (!service || !service.duration) return;

    const serviceDuration = service.duration; // minutos
    const dayStart = moment(`${date} 09:00`, "YYYY-MM-DD HH:mm");
    const dayEnd = moment(`${date} 18:00`, "YYYY-MM-DD HH:mm");
    let slots = [];

    while (
      dayStart.clone().add(serviceDuration, "minutes").isSameOrBefore(dayEnd)
    ) {
      const startSlot = dayStart.clone();
      const endSlot = startSlot.clone().add(serviceDuration, "minutes");

      // Checar conflitos com agendamentos existentes
      const conflictBooking = bookings.some((b) => {
        const bookingDate = b.date?.toDate
          ? moment(b.date.toDate())
          : moment(b.date);
        if (!bookingDate.isSame(date, "day")) return false;

        const bStart = moment(b.start, "HH:mm");
        const bEnd = moment(b.end, "HH:mm");
        return (
          startSlot.isBefore(bEnd) &&
          endSlot.isAfter(bStart)
        );
      });

      // Checar conflitos com bloqueios manuais
      const blockedForDay = blockedTimes[date] || [];
      const conflictBlocked = blockedForDay.some((interval) => {
        const bStart = moment(interval.start, "HH:mm");
        const bEnd = moment(interval.end, "HH:mm");
        return (
          startSlot.isBefore(bEnd) &&
          endSlot.isAfter(bStart)
        );
      });

      if (!conflictBooking && !conflictBlocked) {
        slots.push({
          start: startSlot.format("HH:mm"),
          end: endSlot.format("HH:mm"),
        });
      }

      dayStart.add(30, "minutes");
    }

    setAvailableSlots(slots);
  }, [date, selectedService, bookings, blockedTimes, services]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClient || !date || !start || !end) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        clientId: selectedClient,
        serviceId: selectedService || null,
        date: moment(`${date} ${start}`, "YYYY-MM-DD HH:mm").toDate(),
        start,
        end,
        createdAt: new Date(),
      };

      await addDoc(collection(db, "bookings"), bookingData);

      // Bloqueia automaticamente o horário
      const blockedDocRef = doc(db, "blockedTimes", "global");
      const blockedDateKey = date;
      const blockedTimesUpdate = {
        [blockedDateKey]: [
          ...(blockedTimes[blockedDateKey] || []),
          { start, end },
        ],
      };

      await setDoc(blockedDocRef, blockedTimesUpdate, { merge: true });

      alert("Agendamento criado e horário bloqueado!");
      setDate("");
      setStart("");
      setEnd("");
      setSelectedClient("");
      setSelectedService("");
      setAvailableSlots([]);

      if (onCreated) onCreated();
    } catch (err) {
      console.error(err);
      alert("Erro ao criar agendamento!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-xl p-4">
      <h2 className="text-lg font-bold mb-4">Novo Agendamento</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Cliente */}
        <div>
          <label className="block font-medium">Cliente *</label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="border p-2 rounded w-full"
            required
          >
            <option value="">Selecione o cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || "Cliente sem nome"}
              </option>
            ))}
          </select>
        </div>

        {/* Serviço */}
        <div>
          <label className="block font-medium">Serviço *</label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="border p-2 rounded w-full"
            required
          >
            <option value="">Selecione o serviço</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.duration} min)
              </option>
            ))}
          </select>
        </div>

        {/* Data */}
        <div>
          <label className="block font-medium">Data *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        {/* Slots */}
        <div>
          <label className="block font-medium">Horário *</label>
          {availableSlots.length === 0 ? (
            <p className="text-gray-500">Nenhum horário disponível</p>
          ) : (
            <select
              value={start}
              onChange={(e) => {
                const slot = availableSlots.find(
                  (s) => s.start === e.target.value
                );
                setStart(slot.start);
                setEnd(slot.end);
              }}
              className="border p-2 rounded w-full"
              required
            >
              <option value="">Selecione um horário</option>
              {availableSlots.map((s) => (
                <option key={s.start} value={s.start}>
                  {s.start} - {s.end}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Salvando..." : "Criar Agendamento"}
        </button>
      </form>
    </div>
  );
}

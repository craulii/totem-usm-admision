import React, { useState } from 'react';
import Register from './Register';
import Ticket from '../components/Ticket';

// Standalone flow opened on the phone via the menu QR (?registro):
// Register form → generate ticket. NOT shown on the totem itself.

// Short human-readable code (no ambiguous chars) for the staff to eyeball.
function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

export default function RegisterPage() {
  const [ticket, setTicket] = useState(null); // { student, code }

  function handleSubmit(data) {
    const code = makeCode();
    // ponytail: Fase 2 reemplaza esto por un insert en Supabase (dedup por RUT).
    // Por ahora queda en localStorage del celular como registro provisional.
    try {
      const list = JSON.parse(localStorage.getItem('totem_registros') || '[]');
      list.push({ ...data, code, ts: new Date().toISOString() });
      localStorage.setItem('totem_registros', JSON.stringify(list));
    } catch { /* almacenamiento no disponible: igual mostramos el ticket */ }
    setTicket({ student: data, code });
  }

  if (ticket) {
    return <Ticket student={ticket.student} code={ticket.code} onDone={() => setTicket(null)} />;
  }
  return <Register onSubmit={handleSubmit} onCancel={() => window.location.reload()} />;
}

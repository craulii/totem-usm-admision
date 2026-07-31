import React, { useEffect, useState } from 'react';
import Register from './Register';
import Ticket from '../components/Ticket';
import { addRegistro, getComunas, getConfig } from '../lib/db';

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
  const [comunas, setComunas] = useState(null); // null = cargando
  const [coBrandLogo, setCoBrandLogo] = useState(null); // null = cargando
  const [ticket, setTicket] = useState(null); // { student, code }
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    getComunas({ applyFilter: true }).then(setComunas);
    getConfig().then(cfg => setCoBrandLogo(cfg.coBrandLogo));
  }, []);

  async function handleSubmit(data) {
    setSubmitting(true);
    setSubmitError('');
    const code = makeCode();
    try {
      await addRegistro({ ...data, code });
      setTicket({ student: data, code });
    } catch (err) {
      console.error('addRegistro failed', err);
      setSubmitError('No se pudo enviar tu registro. Revisa tu conexión e intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  if (ticket) {
    return <Ticket student={ticket.student} code={ticket.code} coBrandLogo={coBrandLogo} onDone={() => setTicket(null)} />;
  }
  if (!comunas || !coBrandLogo) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0f1e', color: 'rgba(255,255,255,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
      }}>Cargando…</div>
    );
  }
  return (
    <Register
      comunas={comunas}
      coBrandLogo={coBrandLogo}
      submitting={submitting}
      submitError={submitError}
      onSubmit={handleSubmit}
      onCancel={() => window.location.reload()}
    />
  );
}

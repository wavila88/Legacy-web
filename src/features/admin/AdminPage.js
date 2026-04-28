'use client';

import { useState, useEffect } from 'react';

const STATUS_LABEL = {
  draft:           { label: 'Borrador',    color: '#6B7280', bg: '#F3F4F6' },
  pending_payment: { label: 'Pago pend.', color: '#D97706', bg: '#FEF3C7' },
  scheduled:       { label: 'Programado', color: '#059669', bg: '#D1FAE5' },
  sent:            { label: 'Enviado',     color: '#7C3AED', bg: '#EDE9FE' },
  failed:          { label: 'Fallido',     color: '#DC2626', bg: '#FEE2E2' },
};

const TIPO_EMOJI = { Birthday: '🎂', Wedding: '💍', Anniversary: '🎊', General: '💌' };

function formatDate(str) {
  if (!str) return '—';
  const d       = new Date(str);
  const hasTime = str.includes('T');
  return d.toLocaleString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
    ...(hasTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ ...s.statCard, borderTop: `3px solid ${color}` }}>
      <p style={{ ...s.statValue, color }}>{value}</p>
      <p style={s.statLabel}>{label}</p>
    </div>
  );
}

export default function AdminPage() {
  const [messages,   setMessages]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('all');
  const [loggedOut,  setLoggedOut]  = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await fetch('/api/admin/messages');
      if (res.status === 401) { setLoggedOut(true); return; }
      if (!res.ok) throw new Error(`Error del servidor (${res.status})`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Admin load error:', err);
      setFetchError(err.message ?? 'Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setLoggedOut(true);
  };

  if (loggedOut) {
    return (
      <div style={s.centered}>
        <p style={{ color: '#6B7280', marginBottom: 16 }}>Sesión cerrada.</p>
        <button style={s.btn} onClick={() => window.location.reload()}>Volver a entrar</button>
      </div>
    );
  }

  const counts = {
    total:           messages.length,
    scheduled:       messages.filter(m => m.status === 'scheduled').length,
    pending_payment: messages.filter(m => m.status === 'pending_payment').length,
    sent:            messages.filter(m => m.status === 'sent' || m.delivered).length,
  };

  const filtered = filter === 'all' ? messages : messages.filter(m => m.status === filter);

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.headerTitle}>🛡️ Admin Panel</h1>
          <p style={s.headerSub}>OurLegacy — Panel de control</p>
        </div>
        <button style={s.logoutBtn} onClick={handleLogout}>Salir</button>
      </div>

      <div style={s.body}>
        {/* Stats */}
        <div style={s.statsRow}>
          <StatCard label="Total mensajes"  value={counts.total}           color="#5B21B6" />
          <StatCard label="Programados"     value={counts.scheduled}       color="#059669" />
          <StatCard label="Pago pendiente"  value={counts.pending_payment} color="#D97706" />
          <StatCard label="Enviados"        value={counts.sent}            color="#7C3AED" />
        </div>

        {/* Filter tabs */}
        <div style={s.tabs}>
          {['all', 'scheduled', 'pending_payment', 'sent', 'draft'].map((f) => (
            <button
              key={f}
              style={{ ...s.tab, ...(filter === f ? s.tabActive : {}) }}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Todos' : STATUS_LABEL[f]?.label ?? f}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div style={s.loadingBox}><div style={s.spinner} /></div>
        ) : fetchError ? (
          <div style={s.emptyBox}>
            <p style={{ ...s.emptyText, color: '#DC2626' }}>⚠️ {fetchError}</p>
            <button style={{ ...s.btn, marginTop: 12 }} onClick={load}>Reintentar</button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.emptyBox}><p style={s.emptyText}>No hay mensajes en este estado.</p></div>
        ) : (
          <div style={s.tableWrapper}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Tipo', 'De', 'Para', 'Teléfono', 'Entrega', 'Estado', 'Monto'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((msg) => {
                  const st = STATUS_LABEL[msg.status] ?? STATUS_LABEL.draft;
                  return (
                    <tr key={msg.id} style={s.tr}>
                      <td style={s.td}>{TIPO_EMOJI[msg.tipo_mensaje] ?? '💌'}</td>
                      <td style={s.td}>
                        <p style={s.name}>{msg.parent_name}</p>
                        <p style={s.sub}>{msg.client_email}</p>
                      </td>
                      <td style={s.td}>
                        <p style={s.name}>{msg.child_name}</p>
                        <p style={s.sub}>{msg.relationship}</p>
                      </td>
                      <td style={s.td}>
                        <p style={s.phone}>{msg.child_phone || <span style={{ color: '#D1D5DB' }}>Sin teléfono</span>}</p>
                      </td>
                      <td style={s.td}>
                        <p style={s.date}>{formatDate(msg.delivery_date)}</p>
                      </td>
                      <td style={s.td}>
                        <span style={{ ...s.badge, color: st.color, backgroundColor: st.bg }}>
                          {st.label}
                        </span>
                      </td>
                      <td style={s.td}>
                        <p style={s.amount}>
                          {msg.payment_amount ? `R$ ${Number(msg.payment_amount).toFixed(2)}` : '—'}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page:        { minHeight: '100dvh', backgroundColor: '#F5F3FF' },
  header:      { background: 'linear-gradient(135deg, #1E1B4B 0%, #5B21B6 100%)', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 800, color: '#FFFFFF', margin: 0 },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0, marginTop: 2 },
  logoutBtn:   { padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)', backgroundColor: 'transparent', color: '#FFFFFF', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  body:        { padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 },
  statsRow:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 },
  statCard:    { backgroundColor: '#FFFFFF', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  statValue:   { fontSize: 28, fontWeight: 800, margin: 0 },
  statLabel:   { fontSize: 12, color: '#6B7280', margin: 0, marginTop: 4 },
  tabs:        { display: 'flex', gap: 8, flexWrap: 'wrap' },
  tab:         { padding: '7px 16px', borderRadius: 20, border: '1.5px solid #D8B4FE', backgroundColor: 'transparent', color: '#5B21B6', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  tabActive:   { backgroundColor: '#7C3AED', color: '#FFFFFF', borderColor: '#7C3AED' },
  tableWrapper: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'auto', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  table:       { width: '100%', borderCollapse: 'collapse', minWidth: 680 },
  th:          { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #F3F4F6' },
  tr:          { borderBottom: '1px solid #F9FAFB' },
  td:          { padding: '12px 16px', verticalAlign: 'middle' },
  name:        { fontSize: 14, fontWeight: 600, color: '#1F2937', margin: 0 },
  sub:         { fontSize: 12, color: '#9CA3AF', margin: 0, marginTop: 2 },
  phone:       { fontSize: 13, color: '#374151', margin: 0, fontFamily: 'monospace' },
  date:        { fontSize: 13, color: '#374151', margin: 0, whiteSpace: 'nowrap' },
  amount:      { fontSize: 13, fontWeight: 700, color: '#5B21B6', margin: 0 },
  badge:       { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 },
  loadingBox:  { display: 'flex', justifyContent: 'center', padding: 40 },
  spinner:     { width: 32, height: 32, border: '3px solid #EDE9FE', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  emptyBox:    { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 40, textAlign: 'center' },
  emptyText:   { color: '#9CA3AF', fontSize: 15 },
  centered:    { minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  btn:         { padding: '12px 28px', borderRadius: 10, backgroundColor: '#7C3AED', color: '#FFF', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer' },
};

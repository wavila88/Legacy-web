'use client';

import { useState } from 'react';

export default function AdminLoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (res.ok) {
      onLogin();
    } else {
      setError('Usuario o contraseña incorrectos.');
      setPassword('');
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.icon}>🛡️</div>
        <h1 style={s.title}>Admin Panel</h1>
        <p style={s.sub}>OurLegacy — Acceso restringido</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.fieldGroup}>
            <label style={s.label}>Usuario</label>
            <input
              type="text"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={s.input}
              autoFocus
              autoCapitalize="none"
              required
            />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={s.input}
              required
            />
          </div>
          {error && <p style={s.error}>{error}</p>}
          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? 'Verificando…' : 'Entrar →'}
          </button>
        </form>
      </div>
    </div>
  );
}

const s = {
  page:       { minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E1B4B' },
  card:       { backgroundColor: '#FFFFFF', borderRadius: 20, padding: '40px 32px', width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  icon:       { fontSize: 48, marginBottom: 4 },
  title:      { fontSize: 24, fontWeight: 800, color: '#1F2937', margin: 0 },
  sub:        { fontSize: 13, color: '#9CA3AF', margin: 0, marginBottom: 12 },
  form:       { width: '100%', display: 'flex', flexDirection: 'column', gap: 14 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 5 },
  label:      { fontSize: 13, fontWeight: 600, color: '#374151' },
  input:      { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #D8B4FE', fontSize: 15, outline: 'none', boxSizing: 'border-box' },
  error:      { color: '#DC2626', fontSize: 13, margin: 0, textAlign: 'center' },
  btn:        { padding: '13px', borderRadius: 10, backgroundColor: '#7C3AED', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer', marginTop: 4 },
};

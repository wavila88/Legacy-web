'use client';

import { useState } from 'react';
import AdminLoginPage from './AdminLoginPage';
import AdminPage from './AdminPage';

export default function AdminRoot() {
  const [authed, setAuthed] = useState(false);
  return authed
    ? <AdminPage />
    : <AdminLoginPage onLogin={() => setAuthed(true)} />;
}

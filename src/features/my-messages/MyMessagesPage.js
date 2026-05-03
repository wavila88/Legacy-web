'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';

const STORAGE_KEY = 'legado_client_email';

const AVATAR = {
  Hija:     { emoji: '👧', bg: '#FDE8F0', color: '#BE185D' },
  Hijo:     { emoji: '👦', bg: '#DBEAFE', color: '#1D4ED8' },
  Esposa:   { emoji: '👩', bg: '#F3E8FF', color: '#7C3AED' },
  Esposo:   { emoji: '👨', bg: '#E0E7FF', color: '#4338CA' },
  Madre:    { emoji: '👵', bg: '#FEF3C7', color: '#B45309' },
  Padre:    { emoji: '👴', bg: '#D1FAE5', color: '#065F46' },
  Hermana:  { emoji: '👩', bg: '#FCE7F3', color: '#BE185D' },
  Hermano:  { emoji: '🧑', bg: '#DBEAFE', color: '#1E40AF' },
  Amiga:    { emoji: '😊', bg: '#FEF9C3', color: '#A16207' },
  Amigo:    { emoji: '😊', bg: '#CCFBF1', color: '#0F766E' },
  Amor:     { emoji: '💑', bg: '#FFE4E6', color: '#BE123C' },
  Otro:     { emoji: '💌', bg: '#F3F4F6', color: '#4B5563' },
};

function formatDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MyMessagesPage() {
  const t            = useTranslations('myMessages');
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [email,   setEmail]   = useState('');
  const [stage,   setStage]   = useState('idle');
  const [data,    setData]    = useState(null);
  const [errMsg,  setErrMsg]  = useState('');
  const [query,   setQuery]   = useState('');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    const urlEmail = searchParams.get('email');
    const urlError = searchParams.get('error');
    if (urlError) {
      setErrMsg(urlError === 'expired' ? t('errorExpired') : t('errorInvalid'));
      setStage('error');
      return;
    }
    const savedEmail = urlEmail || localStorage.getItem(STORAGE_KEY);
    if (savedEmail) { setEmail(savedEmail); loadMessages(savedEmail); }
  }, []);

  const loadMessages = async (emailToLoad) => {
    setStage('loading');
    try {
      const res  = await fetch(`/api/my-messages?email=${encodeURIComponent(emailToLoad)}`);
      const json = await res.json();
      if (!res.ok) { setErrMsg(json.error || t('errorInvalid')); setStage('error'); }
      else { localStorage.setItem(STORAGE_KEY, emailToLoad); setData(json); setStage('ready'); }
    } catch { setErrMsg(t('errorInvalid')); setStage('error'); }
  };

  const handleSendLink = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStage('sending'); setErrMsg('');
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) setStage('sent');
      else { const j = await res.json(); setErrMsg(j.error || t('errorInvalid')); setStage('error'); }
    } catch { setErrMsg(t('errorInvalid')); setStage('error'); }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData(null); setEmail(''); setStage('idle');
    router.replace('/my-messages');
  };

  const filteredRecipients = data?.recipients
    ? [...data.recipients]
        .filter(r => {
          if (!query) return true;
          const q = query.toLowerCase();
          return (r.nickname || '').toLowerCase().includes(q) || r.name.toLowerCase().includes(q);
        })
        .sort((a, b) => {
          const da = new Date(a.created_at), db2 = new Date(b.created_at);
          return sortAsc ? da - db2 : db2 - da;
        })
    : [];

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => router.push('/')}>{t('back')}</button>
        <div style={s.headerInner}>
          <div style={s.iconBox}>💌</div>
          <h1 style={s.title}>{t('title')}</h1>
          <p style={s.subtitle}>{t('subtitle')}</p>
        </div>
      </div>

      <div style={s.body}>

        {/* IDLE / ERROR — formulario */}
        {(stage === 'idle' || stage === 'error') && (
          <form onSubmit={handleSendLink} style={s.card}>
            <p style={s.cardTitle}>{t('emailTitle')}</p>
            <p style={s.cardSub}>{t('emailSub')}</p>
            <input style={s.input} type="email" placeholder={t('emailPlaceholder')}
              value={email} onChange={e => setEmail(e.target.value)} autoCapitalize="none" required />
            {errMsg && <p style={s.errorMsg}>{errMsg}</p>}
            <button type="submit" style={s.btnPrimary}>{t('sendLink')}</button>
          </form>
        )}

        {stage === 'sending' && (
          <div style={s.infoCard}><p style={s.infoText}>{t('sending')}</p></div>
        )}

        {stage === 'sent' && (
          <div style={s.infoCard}>
            <div style={s.sentIcon}>📬</div>
            <p style={s.infoTitle}>{t('sentTitle')}</p>
            <p style={s.infoText}>{t('sentText', { email })}</p>
            <button style={s.linkBtn} onClick={() => { setStage('idle'); setErrMsg(''); }}>
              {t('useOtherEmail')}
            </button>
          </div>
        )}

        {stage === 'loading' && (
          <div style={s.infoCard}><p style={s.infoText}>{t('loading')}</p></div>
        )}

        {stage === 'ready' && data && (
          <>
            {/* Saludo + controles */}
            <div style={s.topRow}>
              <p style={s.greeting}>{t('greeting', { name: data.client.nickname || data.client.name })}</p>
              <div style={s.controls}>
                <div style={s.searchWrap}>
                  <span style={s.searchIcon}>🔍</span>
                  <input style={s.searchInput} placeholder={t('search')}
                    value={query} onChange={e => setQuery(e.target.value)} />
                </div>
                <button style={s.sortBtn} onClick={() => setSortAsc(v => !v)}>
                  {sortAsc ? t('oldest') : t('newest')} ▾
                </button>
              </div>
            </div>

            {/* Lista de destinatarios */}
            <div style={s.list}>
              {filteredRecipients.map(r => {
                const av = AVATAR[r.relationship] ?? AVATAR.Otro;
                return (
                  <button key={r.id} style={s.recipientRow} onClick={() => router.push(`/my-messages/${r.id}`)}>
                    <div style={{ ...s.avatar, backgroundColor: av.bg }}>
                      <span style={s.avatarEmoji}>{av.emoji}</span>
                    </div>
                    <div style={s.rowInfo}>
                      <div style={s.rowTop}>
                        <span style={s.rowNickname}>{r.nickname || r.name}</span>
                        {r.relationship && (
                          <span style={{ ...s.badge, color: av.color, backgroundColor: av.bg }}>
                            {r.relationship}
                          </span>
                        )}
                      </div>
                      {r.nickname && r.nickname !== r.name && (
                        <p style={s.rowFullName}>{r.name}</p>
                      )}
                      <p style={s.rowDate}>📅 {t('createdOn')} {formatDate(r.created_at)}</p>
                    </div>
                    <div style={s.rowRight}>
                      <span style={s.countBadge}>
                        💬 {r.message_count} {Number(r.message_count) === 1 ? t('messageOne') : t('messageOther')}
                      </span>
                      <span style={s.arrow}>›</span>
                    </div>
                  </button>
                );
              })}

              {/* Card crear primer mensaje */}
              <div style={s.createCard}>
                <span style={s.createIcon}>💜</span>
                <div>
                  <p style={s.createTitle}>{t('createCardTitle')}</p>
                  <p style={s.createSub}>{t('createCardSub')}</p>
                </div>
                <button style={s.createBtn} onClick={() => router.push('/create')}>
                  {t('createBtnLabel')} +
                </button>
              </div>
            </div>

            <button style={s.btnPrimary} onClick={() => router.push('/create')}>
              {t('newMessage')}
            </button>

            <p style={s.footer}>🔒 {t('footer')}</p>

            <button style={s.logoutBtn} onClick={handleLogout}>{t('logout')}</button>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  page:       { minHeight: '100dvh', backgroundColor: '#F5F3FF', display: 'flex', flexDirection: 'column' },
  header:     { background: 'linear-gradient(160deg, #5B21B6 0%, #7C3AED 100%)', padding: '20px 24px 40px', textAlign: 'center', position: 'relative' },
  backBtn:    { position: 'absolute', top: 20, left: 20, background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 },
  headerInner:{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  iconBox:    { width: 72, height: 72, borderRadius: 20, backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, marginBottom: 4, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' },
  title:      { fontSize: 26, fontWeight: 800, color: '#FFFFFF', margin: 0 },
  subtitle:   { fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.5, maxWidth: 280 },
  body:       { flex: 1, padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 },
  topRow:     { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 4 },
  greeting:   { fontSize: 18, fontWeight: 700, color: '#1F2937', margin: 0 },
  controls:   { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  searchWrap: { display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '8px 12px' },
  searchIcon: { fontSize: 14 },
  searchInput:{ border: 'none', outline: 'none', fontSize: 13, color: '#374151', background: 'transparent', width: 140 },
  sortBtn:    { padding: '8px 14px', borderRadius: 10, border: '1.5px solid #E5E7EB', backgroundColor: '#FFFFFF', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap' },
  list:       { display: 'flex', flexDirection: 'column', gap: 10 },
  recipientRow: { display: 'flex', alignItems: 'center', gap: 14, backgroundColor: '#FFFFFF', borderRadius: 16, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' },
  avatar:     { width: 52, height: 52, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarEmoji:{ fontSize: 26 },
  rowInfo:    { flex: 1, minWidth: 0 },
  rowTop:     { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  rowNickname:{ fontSize: 16, fontWeight: 700, color: '#1F2937' },
  badge:      { fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 },
  rowFullName:{ fontSize: 13, color: '#6B7280', margin: '2px 0 0' },
  rowDate:    { fontSize: 12, color: '#9CA3AF', margin: '3px 0 0' },
  rowRight:   { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 },
  countBadge: { fontSize: 12, fontWeight: 600, color: '#7C3AED', backgroundColor: '#F3E8FF', padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap' },
  arrow:      { fontSize: 20, color: '#C4B5FD', fontWeight: 300 },
  createCard: { display: 'flex', alignItems: 'center', gap: 14, border: '2px dashed #DDD6FE', borderRadius: 16, padding: '16px', backgroundColor: '#FAFAFA' },
  createIcon: { fontSize: 28, flexShrink: 0 },
  createTitle:{ fontSize: 14, fontWeight: 700, color: '#1F2937', margin: 0 },
  createSub:  { fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' },
  createBtn:  { marginLeft: 'auto', flexShrink: 0, padding: '8px 14px', borderRadius: 10, border: '1.5px solid #7C3AED', backgroundColor: 'transparent', color: '#7C3AED', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' },
  btnPrimary: { padding: '14px 24px', borderRadius: 12, backgroundColor: '#7C3AED', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer' },
  footer:     { fontSize: 12, color: '#9CA3AF', textAlign: 'center', margin: 0 },
  logoutBtn:  { background: 'none', border: 'none', color: '#9CA3AF', fontWeight: 500, fontSize: 13, cursor: 'pointer', textDecoration: 'underline', padding: '4px 0', alignSelf: 'center' },
  card:       { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(124,58,237,0.08)', display: 'flex', flexDirection: 'column', gap: 12 },
  cardTitle:  { fontSize: 17, fontWeight: 700, color: '#1F2937', margin: 0 },
  cardSub:    { fontSize: 14, color: '#6B7280', margin: 0, lineHeight: 1.5 },
  input:      { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #D8B4FE', fontSize: 15, outline: 'none', boxSizing: 'border-box' },
  errorMsg:   { color: '#DC2626', fontSize: 14, margin: 0 },
  infoCard:   { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(124,58,237,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' },
  sentIcon:   { fontSize: 48, marginBottom: 4 },
  infoTitle:  { fontSize: 18, fontWeight: 700, color: '#1F2937', margin: 0 },
  infoText:   { fontSize: 15, color: '#6B7280', margin: 0, lineHeight: 1.6 },
  linkBtn:    { background: 'none', border: 'none', color: '#7C3AED', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginTop: 4 },
};

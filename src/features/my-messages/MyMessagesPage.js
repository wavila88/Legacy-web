'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';

const RELATIONSHIP_EMOJI = {
  Hija: '👧', Hijo: '👦', Esposa: '💑', Esposo: '👨',
  Madre: '👵', Padre: '👴', Hermana: '👩', Hermano: '🧑',
  Amiga: '😊', Amigo: '😊', Amor: '💌', Otro: '💌',
};

const STORAGE_KEY = 'legado_client_email';

export default function MyMessagesPage() {
  const t            = useTranslations('myMessages');
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [email,   setEmail]   = useState('');
  const [stage,   setStage]   = useState('idle'); // idle | sending | sent | loading | ready | error
  const [data,    setData]    = useState(null);
  const [errMsg,  setErrMsg]  = useState('');

  // Llega desde magic link (?email=xxx) o desde localStorage
  useEffect(() => {
    const urlEmail = searchParams.get('email');
    const urlError = searchParams.get('error');

    if (urlError) {
      setErrMsg(urlError === 'expired' ? t('errorExpired') : t('errorInvalid'));
      setStage('error');
      return;
    }

    const savedEmail = urlEmail || localStorage.getItem(STORAGE_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
      loadMessages(savedEmail);
    }
  }, []);

  const loadMessages = async (emailToLoad) => {
    setStage('loading');
    try {
      const res  = await fetch(`/api/my-messages?email=${encodeURIComponent(emailToLoad)}`);
      const json = await res.json();
      if (!res.ok) {
        setErrMsg(json.error || t('errorInvalid'));
        setStage('error');
      } else {
        localStorage.setItem(STORAGE_KEY, emailToLoad);
        setData(json);
        setStage('ready');
      }
    } catch {
      setErrMsg(t('errorInvalid'));
      setStage('error');
    }
  };

  const handleSendLink = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStage('sending');
    setErrMsg('');
    try {
      const res = await fetch('/api/auth/magic-link', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setStage('sent');
      } else {
        const json = await res.json();
        setErrMsg(json.error || t('errorInvalid'));
        setStage('error');
      }
    } catch {
      setErrMsg(t('errorInvalid'));
      setStage('error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData(null);
    setEmail('');
    setStage('idle');
    router.replace('/my-messages');
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.headerInner}>
          <div style={s.iconCircle}>💌</div>
          <h1 style={s.title}>{t('title')}</h1>
          <p style={s.subtitle}>{t('subtitle')}</p>
        </div>
      </div>

      <div style={s.body}>

        {/* STAGE: idle o error — mostrar formulario */}
        {(stage === 'idle' || stage === 'error') && (
          <form onSubmit={handleSendLink} style={s.card}>
            <p style={s.cardTitle}>{t('emailTitle')}</p>
            <p style={s.cardSub}>{t('emailSub')}</p>
            <input
              style={s.input}
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoCapitalize="none"
              required
            />
            {errMsg && <p style={s.errorMsg}>{errMsg}</p>}
            <button type="submit" style={s.btn}>
              {t('sendLink')}
            </button>
          </form>
        )}

        {/* STAGE: sending */}
        {stage === 'sending' && (
          <div style={s.infoCard}>
            <p style={s.infoText}>{t('sending')}</p>
          </div>
        )}

        {/* STAGE: sent */}
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

        {/* STAGE: loading */}
        {stage === 'loading' && (
          <div style={s.infoCard}>
            <p style={s.infoText}>{t('loading')}</p>
          </div>
        )}

        {/* STAGE: ready — mostrar destinatarios */}
        {stage === 'ready' && data && (
          <>
            <p style={s.greeting}>{t('greeting', { name: data.client.nickname || data.client.name })}</p>

            {data.recipients.length === 0 ? (
              <div style={s.emptyBox}>
                <p style={s.emptyText}>{t('emptyText')}</p>
                <button style={s.btn} onClick={() => router.push('/create')}>
                  {t('createFirst')}
                </button>
              </div>
            ) : (
              <>
                <div style={s.grid}>
                  {data.recipients.map((r) => (
                    <button
                      key={r.id}
                      style={s.recipientCard}
                      onClick={() => router.push(`/my-messages/${r.id}`)}
                    >
                      <div style={s.cardEmoji}>{RELATIONSHIP_EMOJI[r.relationship] ?? '💌'}</div>
                      <p style={s.cardName}>{r.nickname || r.name}</p>
                      {r.nickname && r.nickname !== r.name && (
                        <p style={s.cardRealName}>{r.name}</p>
                      )}
                      {r.relationship && <p style={s.cardRel}>{r.relationship}</p>}
                      <p style={s.cardCount}>
                        {r.message_count}{' '}
                        {Number(r.message_count) === 1 ? t('messageOne') : t('messageOther')}
                      </p>
                    </button>
                  ))}
                </div>
                <button style={s.btn} onClick={() => router.push('/create')}>
                  {t('newMessage')}
                </button>
              </>
            )}

            <button style={s.logoutBtn} onClick={handleLogout}>
              {t('logout')}
            </button>
          </>
        )}

      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100dvh', backgroundColor: '#F5F3FF', display: 'flex', flexDirection: 'column' },
  header: {
    background: 'linear-gradient(160deg, #5B21B6 0%, #7C3AED 100%)',
    padding: '56px 24px 48px',
    textAlign: 'center',
  },
  headerInner: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  iconCircle: {
    width: 76, height: 76, borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 34, marginBottom: 4,
  },
  title:    { fontSize: 26, fontWeight: 800, color: '#FFFFFF', margin: 0 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.5 },
  body: { flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16, marginTop: -20 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20,
    boxShadow: '0 2px 12px rgba(124,58,237,0.08)',
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  cardTitle: { fontSize: 17, fontWeight: 700, color: '#1F2937', margin: 0 },
  cardSub:   { fontSize: 14, color: '#6B7280', margin: 0, lineHeight: 1.5 },
  input: {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: '1.5px solid #D8B4FE', fontSize: 15, outline: 'none',
    boxSizing: 'border-box',
  },
  btn: {
    padding: '14px 24px', borderRadius: 12,
    backgroundColor: '#7C3AED', color: '#FFFFFF',
    border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer',
  },
  errorMsg: { color: '#DC2626', fontSize: 14, margin: 0 },
  infoCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 28,
    boxShadow: '0 2px 12px rgba(124,58,237,0.08)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    textAlign: 'center',
  },
  sentIcon:  { fontSize: 48, marginBottom: 4 },
  infoTitle: { fontSize: 18, fontWeight: 700, color: '#1F2937', margin: 0 },
  infoText:  { fontSize: 15, color: '#6B7280', margin: 0, lineHeight: 1.6 },
  linkBtn: {
    background: 'none', border: 'none', color: '#7C3AED',
    fontWeight: 600, fontSize: 14, cursor: 'pointer', marginTop: 4,
  },
  greeting: { fontSize: 16, color: '#1F2937', margin: 0 },
  logoutBtn: {
    background: 'none', border: 'none', color: '#9CA3AF',
    fontWeight: 500, fontSize: 13, cursor: 'pointer',
    textDecoration: 'underline', textDecorationColor: 'rgba(156,163,175,0.4)',
    padding: '8px 0', alignSelf: 'center', marginTop: 8,
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 },
  recipientCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: '20px 12px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    boxShadow: '0 2px 12px rgba(124,58,237,0.08)',
    border: '1.5px solid #EDE9FE', cursor: 'pointer',
  },
  cardEmoji: { fontSize: 36 },
  cardName:     { fontSize: 16, fontWeight: 700, color: '#1F2937', margin: 0, textAlign: 'center' },
  cardRealName: { fontSize: 12, color: '#6B7280', margin: 0, textAlign: 'center' },
  cardRel:      { fontSize: 12, color: '#7C3AED', fontWeight: 600, margin: 0 },
  cardCount: { fontSize: 13, color: '#6B7280', margin: 0 },
  emptyBox: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24,
    textAlign: 'center', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 12,
    boxShadow: '0 2px 12px rgba(124,58,237,0.08)',
  },
  emptyText: { fontSize: 15, color: '#6B7280', margin: 0 },
};

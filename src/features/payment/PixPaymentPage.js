'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

const EXPIRY_SECONDS = 10 * 60;

export default function PixPaymentPage({ messageId, priceDisplay }) {
  const t      = useTranslations('payment');
  const router = useRouter();

  const [pixCode,   setPixCode]   = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [stage,     setStage]     = useState('creating'); // creating | pending | approved | expired | error
  const [copied,    setCopied]    = useState(false);
  const [timeLeft,  setTimeLeft]  = useState(EXPIRY_SECONDS);
  const [isSimulate, setIsSimulate] = useState(false);

  const pollRef  = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => { createPayment(); }, []);

  useEffect(() => {
    if (stage !== 'pending') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          clearInterval(pollRef.current);
          setStage('expired');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'pending' || !paymentId) return;
    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`/api/payments/${paymentId}`);
        const data = await res.json();
        if (data.status === 'approved') {
          clearInterval(pollRef.current);
          clearInterval(timerRef.current);
          setStage('approved');
          setTimeout(() => router.push('/my-messages'), 3500);
        } else if (data.status === 'rejected' || data.status === 'cancelled') {
          clearInterval(pollRef.current);
          setStage('error');
        }
      } catch { /* ignore network errors during poll */ }
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [stage, paymentId]);

  const createPayment = async () => {
    setStage('creating');
    setTimeLeft(EXPIRY_SECONDS);
    try {
      const res  = await fetch('/api/payments/pix', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messageId }),
      });
      const data = await res.json();
      if (res.ok) {
        setPixCode(data.pixCode);
        setPaymentId(data.paymentId);
        setIsSimulate(!!data.simulate);
        setStage('pending');
      } else if (data.error === 'already_scheduled') {
        setStage('approved');
      } else {
        setStage('error');
      }
    } catch {
      setStage('error');
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert(pixCode);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (stage === 'creating') {
    return (
      <div style={s.centered}>
        <div style={s.spinner} />
        <p style={s.hint}>{t('creating')}</p>
      </div>
    );
  }

  if (stage === 'approved') {
    return (
      <div style={s.centered}>
        <div style={s.bigIcon}>✅</div>
        <h2 style={s.approvedTitle}>{t('approvedTitle')}</h2>
        <p style={s.approvedSub}>{t('approvedSub')}</p>
        <p style={s.hint}>{t('approvedRedirect')}</p>
      </div>
    );
  }

  if (stage === 'expired') {
    return (
      <div style={s.centered}>
        <div style={s.bigIcon}>⏰</div>
        <h2 style={s.expiredTitle}>{t('expiredTitle')}</h2>
        <p style={s.hint}>{t('expiredSub')}</p>
        <button style={s.retryBtn} onClick={createPayment}>{t('tryAgain')}</button>
      </div>
    );
  }

  if (stage === 'error') {
    return (
      <div style={s.centered}>
        <div style={s.bigIcon}>❌</div>
        <h2 style={s.expiredTitle}>{t('errorTitle')}</h2>
        <p style={s.hint}>{t('errorSub')}</p>
        <button style={s.retryBtn} onClick={createPayment}>{t('retry')}</button>
      </div>
    );
  }

  // stage === 'pending'
  const timerColor = timeLeft < 60 ? '#DC2626' : '#7C3AED';

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.headerInner}>
          <div style={s.pixCircle}>PIX</div>
          <h1 style={s.title}>{t('title')}</h1>
          <p style={s.subtitle}>{t('subtitle')}</p>
          <div style={s.amountBadge}>
            <span style={s.amountText}>R$ {priceDisplay}</span>
          </div>
        </div>
      </div>

      <div style={s.body}>

        <div className="card" style={s.codeCard}>
          <div style={s.codeBox}>
            <p style={s.codeText}>{pixCode}</p>
          </div>
          <button style={s.copyBtn} onClick={copyCode}>
            {copied ? t('copied') : t('copyBtn')}
          </button>
        </div>

        <div className="card" style={s.waitCard}>
          <div style={s.pulse} />
          <div style={s.waitText}>
            <p style={s.waitTitle}>{t('waitingTitle')}</p>
            <p style={s.waitHint}>{t('waitingHint')}</p>
          </div>
        </div>

        {isSimulate && (
          <button style={s.simBtn} onClick={async () => {
            await fetch(`/api/payments/${paymentId}/confirm`, { method: 'POST' });
            clearInterval(pollRef.current);
            clearInterval(timerRef.current);
            setStage('approved');
            setTimeout(() => router.push('/my-messages'), 3500);
          }}>
            {t('simulate')}
          </button>
        )}

        <div style={s.timerRow}>
          <span style={{ ...s.timerText, color: timerColor }}>
            {t('timeLeft', { time: formatTime(timeLeft) })}
          </span>
        </div>

        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100dvh', backgroundColor: '#F5F3FF', display: 'flex', flexDirection: 'column' },
  header: {
    background: 'linear-gradient(160deg, #00B1EA 0%, #00A0DC 100%)',
    padding: '56px 24px 44px',
    textAlign: 'center',
  },
  headerInner: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  pixCircle: {
    width: 72, height: 72, borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: 1,
  },
  title:    { fontSize: 24, fontWeight: 800, color: '#FFFFFF', margin: 0 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: 0 },
  amountBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50, padding: '6px 20px', marginTop: 4,
  },
  amountText: { fontSize: 20, fontWeight: 800, color: '#FFFFFF' },
  body: { flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14, marginTop: -20 },
  codeCard: { borderRadius: 16, gap: 12 },
  codeBox: {
    backgroundColor: '#EFF6FF', borderRadius: 10, padding: '14px 16px',
    maxHeight: 100, overflowY: 'auto',
  },
  codeText: {
    fontSize: 12, color: '#1D4ED8', fontFamily: 'monospace',
    wordBreak: 'break-all', margin: 0, lineHeight: 1.6,
  },
  copyBtn: {
    width: '100%', padding: '13px 16px', borderRadius: 50,
    backgroundColor: '#00B1EA', border: 'none',
    color: '#FFFFFF', fontSize: 15, fontWeight: 700, cursor: 'pointer',
  },
  waitCard: {
    borderRadius: 16, display: 'flex', alignItems: 'center', gap: 14,
  },
  pulse: {
    width: 14, height: 14, borderRadius: '50%',
    backgroundColor: '#10B981', flexShrink: 0,
    boxShadow: '0 0 0 0 rgba(16,185,129,0.4)',
    animation: 'pulseGreen 1.5s infinite',
  },
  waitText: { display: 'flex', flexDirection: 'column', gap: 2 },
  waitTitle: { fontSize: 15, fontWeight: 700, color: '#1F2937', margin: 0 },
  waitHint:  { fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.4 },
  timerRow: { display: 'flex', justifyContent: 'center', marginTop: 4 },
  timerText: { fontSize: 14, fontWeight: 600 },
  centered: {
    minHeight: '100dvh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: 16, backgroundColor: '#F5F3FF', padding: 28, textAlign: 'center',
  },
  spinner: {
    width: 48, height: 48, border: '4px solid #EDE9FE',
    borderTopColor: '#7C3AED', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  bigIcon:      { fontSize: 60, marginBottom: 4 },
  approvedTitle: { fontSize: 22, fontWeight: 800, color: '#059669', margin: 0 },
  approvedSub:   { fontSize: 15, color: '#374151', margin: 0 },
  expiredTitle:  { fontSize: 22, fontWeight: 800, color: '#1F2937', margin: 0 },
  hint: { fontSize: 14, color: '#6B7280', margin: 0 },
  retryBtn: {
    padding: '13px 32px', borderRadius: 12, border: 'none',
    backgroundColor: '#7C3AED', color: '#FFFFFF',
    fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 8,
  },
  simBtn: {
    padding: '12px 20px', borderRadius: 10, border: '2px dashed #6B7280',
    backgroundColor: '#F9FAFB', color: '#374151',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
};

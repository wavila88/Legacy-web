'use client';

import { useEffect, useState, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { Link } from '@/lib/navigation';
import { formatDate } from '../create-message/utils/dateUtils';

function SuccessContent() {
  const t       = useTranslations('success');
  const params  = useSearchParams();
  const router  = useRouter();
  const id      = params.get('id');

  const [message, setMessage] = useState(null);
  const [error,   setError]   = useState(false);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    if (!id) { router.replace('/'); return; }

    fetch(`/api/messages/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setMessage)
      .catch(() => setError(true));
  }, [id, router]);

  const privateLink = typeof window !== 'undefined'
    ? `${window.location.origin}/m/${id}`
    : `/m/${id}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(privateLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert(privateLink);
    }
  };

  if (!message && !error) {
    return (
      <div style={s.centered}>
        <div style={s.spinner} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={s.centered}>
        <p style={s.errorText}>{t('notFound')}</p>
        <Link href="/create" className="btn-primary" style={{ marginTop: 24, display: 'inline-flex', width: 'auto', paddingLeft: 32, paddingRight: 32 }}>
          {t('createNew')}
        </Link>
      </div>
    );
  }

  const displayName = message.nickname || message.child_name;

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <div style={s.heartCircle}>❤️</div>
        <h1 style={s.heroTitle}>{t('heroTitle')}</h1>
        <p style={s.heroSub}>{t('heroSub')}</p>
      </div>

      <div style={s.body}>
        <div className="card" style={s.summaryCard}>
          <div style={s.summaryRow}>
            <span style={s.summaryIcon}>👤</span>
            <div>
              <p style={s.summaryLabel}>{t('de')}</p>
              <p style={s.summaryValue}>{message.parent_name}</p>
            </div>
          </div>
          <div className="divider" />
          <div style={s.summaryRow}>
            <span style={s.summaryIcon}>💌</span>
            <div>
              <p style={s.summaryLabel}>{t('to')}</p>
              <p style={s.summaryValue}>{displayName}</p>
            </div>
          </div>
          <div className="divider" />
          <div style={s.summaryRow}>
            <span style={s.summaryIcon}>📅</span>
            <div>
              <p style={s.summaryLabel}>{t('deliveryDate')}</p>
              <p style={s.summaryValue}>{formatDate(message.delivery_date)}</p>
            </div>
          </div>
        </div>

        <div className="card" style={s.linkCard}>
          <p style={s.linkTitle}>{t('linkTitle')}</p>
          <p style={s.linkHint}>{t('linkHint')}</p>
          <div style={s.linkBox}>
            <span style={s.linkText}>/m/{id}</span>
          </div>
          <button style={s.copyBtn} onClick={copyLink}>
            {copied ? t('copied') : t('copy')}
          </button>
        </div>

        <Link href={`/m/${id}`} className="btn-primary">
          {t('viewMessage')}
        </Link>

        <Link href="/create" style={s.anotherLink}>
          {t('another')}
        </Link>

        <div style={{ height: 48 }} />
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={s.centered}><div style={s.spinner} /></div>}>
      <SuccessContent />
    </Suspense>
  );
}

const s = {
  page: {
    minHeight: '100dvh',
    backgroundColor: '#F5F3FF',
    display: 'flex',
    flexDirection: 'column',
  },
  hero: {
    background: 'linear-gradient(160deg, #7C3AED 0%, #5B21B6 100%)',
    padding: '56px 28px 40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    textAlign: 'center',
  },
  heartCircle: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 36,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: '#FFFFFF',
    lineHeight: 1.2,
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 1.5,
  },
  body: {
    flex: 1,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginTop: -20,
  },
  summaryCard: { borderRadius: 20 },
  summaryRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  summaryIcon: { fontSize: 24, flexShrink: 0 },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: 600,
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: 700,
    color: '#1F2937',
    marginTop: 2,
  },
  linkCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  linkTitle: { fontSize: 15, fontWeight: 700, color: '#5B21B6' },
  linkHint: { fontSize: 13, color: '#6B7280', lineHeight: 1.4 },
  linkBox: {
    backgroundColor: '#EDE9FE',
    borderRadius: 10,
    padding: '10px 14px',
    wordBreak: 'break-all',
  },
  linkText: {
    fontSize: 14,
    color: '#5B21B6',
    fontWeight: 600,
    fontFamily: 'monospace',
  },
  copyBtn: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: '2px solid #7C3AED',
    borderRadius: 50,
    color: '#7C3AED',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  },
  anotherLink: {
    textAlign: 'center',
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: 600,
    textDecoration: 'underline',
    padding: 8,
  },
  centered: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: '#F5F3FF',
    padding: 24,
  },
  spinner: {
    width: 40,
    height: 40,
    border: '4px solid #EDE9FE',
    borderTopColor: '#7C3AED',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
  },
};

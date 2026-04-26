import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/lib/navigation';
import { getMessage } from '@/lib/repository/messageRepository';
import { PRICE_BRL } from '@/lib/mercadopago';

function formatDate(dateStr, locale) {
  try {
    return new Date(dateStr).toLocaleDateString(
      locale === 'pt' ? 'pt-BR' : 'es-ES',
      { day: 'numeric', month: 'long', year: 'numeric' },
    );
  } catch {
    return dateStr;
  }
}

export default async function SchedulePage({ messageId }) {
  const [t, locale] = await Promise.all([getTranslations('schedule'), getLocale()]);
  const message = await getMessage(messageId);

  if (!message) {
    return (
      <div style={s.centered}>
        <p style={s.error}>{t('notFound')}</p>
        <Link href="/my-messages" style={s.backLink}>{t('back')}</Link>
      </div>
    );
  }

  if (message.status === 'scheduled') {
    return (
      <div style={s.centered}>
        <div style={{ fontSize: 56 }}>✅</div>
        <p style={s.alreadyTitle}>{t('alreadyScheduled')}</p>
        <Link href="/my-messages" style={s.backLink}>{t('back')}</Link>
      </div>
    );
  }

  const displayName  = message.nickname || message.child_name;
  const deliveryDate = formatDate(message.delivery_date, locale);
  const priceDisplay = PRICE_BRL.toFixed(2).replace('.', ',');

  return (
    <div style={s.page}>
      <div style={s.header}>
        <Link href="/my-messages" style={s.backBtn}>{t('back')}</Link>
        <div style={s.headerInner}>
          <div style={s.calCircle}>📅</div>
          <h1 style={s.title}>{t('title')}</h1>
          <p style={s.subtitle}>{t('subtitle')}</p>
        </div>
      </div>

      <div style={s.body}>

        <div className="card" style={s.card}>
          <p style={s.cardTitle}>{t('summaryTitle')}</p>
          <div className="divider" />
          <div style={s.row}>
            <span style={s.rowIcon}>💌</span>
            <div>
              <p style={s.rowLabel}>{t('for')}</p>
              <p style={s.rowValue}>{displayName}</p>
            </div>
          </div>
          <div style={s.row}>
            <span style={s.rowIcon}>📅</span>
            <div>
              <p style={s.rowLabel}>{t('sendDate')}</p>
              <p style={s.rowValue}>{deliveryDate}</p>
            </div>
          </div>
        </div>

        <div className="card" style={s.card}>
          <p style={s.cardTitle}>{t('guaranteeTitle')}</p>
          <div className="divider" />
          <p style={s.guarantee}>{t('guarantee1')}</p>
          <p style={s.guarantee}>{t('guarantee2')}</p>
          <p style={s.guarantee}>{t('guarantee3')}</p>
        </div>

        <div className="card" style={{ ...s.card, ...s.priceCard }}>
          <p style={s.priceLabel}>{t('priceTitle')}</p>
          <p style={s.priceAmount}>R$ {priceDisplay}</p>
          <p style={s.priceSub}>{t('priceSub')}</p>
        </div>

        <Link href={`/payment/${messageId}`} className="btn-primary" style={s.payBtn}>
          {t('payBtn')}
        </Link>

        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100dvh', backgroundColor: '#F5F3FF', display: 'flex', flexDirection: 'column' },
  header: {
    background: 'linear-gradient(160deg, #5B21B6 0%, #7C3AED 100%)',
    padding: '52px 20px 40px',
  },
  backBtn: {
    color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: 500,
    textDecoration: 'none', display: 'inline-block', marginBottom: 16,
  },
  headerInner: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' },
  calCircle: {
    width: 72, height: 72, borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.18)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
  },
  title:    { fontSize: 24, fontWeight: 800, color: '#FFFFFF', margin: 0 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: 0 },
  body: {
    flex: 1, padding: '20px 16px',
    display: 'flex', flexDirection: 'column', gap: 14, marginTop: -20,
  },
  card: { borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 10 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: '#5B21B6', margin: 0 },
  row: { display: 'flex', alignItems: 'center', gap: 12 },
  rowIcon: { fontSize: 22, flexShrink: 0 },
  rowLabel: { fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 600, margin: 0 },
  rowValue: { fontSize: 16, fontWeight: 700, color: '#1F2937', margin: 0 },
  guarantee: { fontSize: 14, color: '#374151', margin: 0, lineHeight: 1.5 },
  priceCard: { alignItems: 'center', textAlign: 'center', paddingTop: 20, paddingBottom: 20 },
  priceLabel:  { fontSize: 13, color: '#6B7280', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: 0.8 },
  priceAmount: { fontSize: 36, fontWeight: 800, color: '#5B21B6', margin: '4px 0 0' },
  priceSub:    { fontSize: 13, color: '#9CA3AF', margin: 0 },
  payBtn: { borderRadius: 14, fontSize: 17, fontWeight: 700 },
  centered: {
    minHeight: '100dvh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 16,
    backgroundColor: '#F5F3FF', padding: 24, textAlign: 'center',
  },
  alreadyTitle: { fontSize: 20, fontWeight: 700, color: '#1F2937' },
  backLink: { color: '#7C3AED', fontWeight: 600, fontSize: 15 },
  error: { fontSize: 16, color: '#DC2626' },
};

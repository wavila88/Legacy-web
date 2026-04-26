import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/lib/navigation';
import { getRecipient } from '../../lib/repository/recipientRepository';
import { getMessagesByRecipient } from '../../lib/repository/messageRepository';

const RELATIONSHIP_EMOJI = {
  Hija: '👧', Hijo: '👦', Esposa: '💑', Esposo: '👨',
  Madre: '👵', Padre: '👴', Hermana: '👩', Hermano: '🧑',
  Amiga: '😊', Amigo: '😊', Otro: '💌',
};

const TIPO_EMOJI = {
  Birthday:    '🎂',
  Wedding:     '💍',
  Anniversary: '🎊',
  General:     '💌',
};

function formatDate(dateStr, locale) {
  try {
    return new Date(dateStr).toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'es-ES', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default async function RecipientMessagesPage({ recipientId }) {
  const [t, tv, locale] = await Promise.all([
    getTranslations('recipient'),
    getTranslations('view'),
    getLocale(),
  ]);

  const recipient = await getRecipient(recipientId);
  if (!recipient) {
    return (
      <div style={s.centered}>
        <p style={s.notFoundText}>{t('notFound')}</p>
        <Link href="/my-messages" style={s.backLink}>{t('back')}</Link>
      </div>
    );
  }

  const messages = await getMessagesByRecipient(recipientId);
  const emoji = RELATIONSHIP_EMOJI[recipient.relationship] ?? '💌';
  const displayName = recipient.nickname || recipient.name;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <Link href="/my-messages" style={s.backBtn}>{t('back')}</Link>
        <div style={s.headerInner}>
          <div style={s.avatarCircle}>{emoji}</div>
          <h1 style={s.name}>{displayName}</h1>
          {recipient.relationship && <p style={s.rel}>{recipient.relationship}</p>}
          <p style={s.msgCount}>
            {messages.length}{' '}
            {messages.length === 1 ? t('messageOne') : t('messageOther')}
          </p>
        </div>
      </div>

      <div style={s.body}>
        {messages.length === 0 ? (
          <div style={s.emptyBox}>
            <p style={s.emptyText}>{t('empty', { name: displayName })}</p>
          </div>
        ) : (
          <div style={s.list}>
            {messages.map((msg) => {
              const msgStatus = msg.status ?? 'draft';
              return (
              <div key={msg.id} style={s.cardWrapper}>
                <Link href={`/m/${msg.id}`} style={s.card}>
                  <div style={s.cardLeft}>
                    <span style={s.tipoEmoji}>{TIPO_EMOJI[msg.tipo_mensaje] ?? '💌'}</span>
                  </div>
                  <div style={s.cardBody}>
                    <p style={s.tipoLabel}>{t(`tipos.${msg.tipo_mensaje}`) ?? 'Mensaje'}</p>
                    <p style={s.dateLabel}>📅 {formatDate(msg.delivery_date, locale)}</p>
                    {msg.file_type === 'audio' && <p style={s.attachTag}>{tv('audio')}</p>}
                    {msg.file_type === 'video' && <p style={s.attachTag}>{tv('video')}</p>}
                    {msg.message_text && (
                      <p style={s.preview}>
                        "{msg.message_text.length > 60
                          ? msg.message_text.slice(0, 60) + '…'
                          : msg.message_text}"
                      </p>
                    )}
                  </div>
                  <div style={s.cardRight}>
                    <span style={{ ...s.statusDot, backgroundColor: msg.delivered ? '#10B981' : '#D1D5DB' }} />
                    <span style={s.arrow}>›</span>
                  </div>
                </Link>

                {msgStatus === 'draft' && (
                  <Link href={`/schedule/${msg.id}`} style={s.scheduleBtn}>
                    📅 {t('scheduleBtn')}
                  </Link>
                )}
                {msgStatus === 'pending_payment' && (
                  <Link href={`/payment/${msg.id}`} style={s.pendingBtn}>
                    ⏳ {t('completePayment')}
                  </Link>
                )}
                {msgStatus === 'scheduled' && (
                  <div style={s.scheduledBadge}>✅ {t('scheduled')}</div>
                )}
              </div>
            );})}

          </div>
        )}

        <Link href={`/create?recipientId=${recipientId}`} style={s.newBtn}>
          {t('newBtn', { name: recipient.name })}
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
    position: 'relative',
  },
  backBtn: {
    color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: 500,
    textDecoration: 'none', display: 'inline-block', marginBottom: 16,
  },
  headerInner: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  avatarCircle: {
    width: 72, height: 72, borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.18)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 32,
  },
  name:     { fontSize: 24, fontWeight: 800, color: '#FFFFFF', margin: 0 },
  rel:      { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 600, margin: 0 },
  msgCount: { fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0 },
  body: {
    flex: 1, padding: '20px 16px',
    display: 'flex', flexDirection: 'column', gap: 12, marginTop: -20,
  },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  cardWrapper: { display: 'flex', flexDirection: 'column', gap: 6 },
  scheduleBtn: {
    display: 'block', textAlign: 'center', padding: '10px 16px',
    backgroundColor: 'transparent', color: '#7C3AED',
    border: '1.5px solid #7C3AED',
    fontWeight: 700, fontSize: 14, borderRadius: 10,
    textDecoration: 'none',
  },
  pendingBtn: {
    display: 'block', textAlign: 'center', padding: '10px 16px',
    backgroundColor: '#6B7280', color: '#FFFFFF',
    fontWeight: 700, fontSize: 14, borderRadius: 10,
    textDecoration: 'none',
  },
  scheduledBadge: {
    textAlign: 'center', padding: '8px 16px',
    backgroundColor: '#D1FAE5', color: '#065F46',
    fontWeight: 700, fontSize: 13, borderRadius: 10,
  },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: '14px 16px',
    display: 'flex', alignItems: 'center', gap: 12,
    boxShadow: '0 2px 10px rgba(124,58,237,0.07)',
    border: '1.5px solid #EDE9FE', textDecoration: 'none',
  },
  cardLeft:  { flexShrink: 0 },
  tipoEmoji: { fontSize: 28 },
  cardBody:  { flex: 1, display: 'flex', flexDirection: 'column', gap: 3 },
  tipoLabel: { fontSize: 15, fontWeight: 700, color: '#1F2937', margin: 0 },
  dateLabel: { fontSize: 13, color: '#6B7280', margin: 0 },
  attachTag: { fontSize: 12, color: '#7C3AED', fontWeight: 600, margin: 0 },
  preview:   { fontSize: 12, color: '#9CA3AF', margin: 0, fontStyle: 'italic' },
  cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 },
  statusDot: { width: 8, height: 8, borderRadius: '50%' },
  arrow:     { fontSize: 20, color: '#C4B5FD', fontWeight: 700 },
  emptyBox: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 24, textAlign: 'center',
    boxShadow: '0 2px 10px rgba(124,58,237,0.07)',
  },
  emptyText: { fontSize: 15, color: '#6B7280', margin: 0 },
  newBtn: {
    padding: '14px 24px', borderRadius: 12,
    backgroundColor: '#7C3AED', color: '#FFFFFF',
    textDecoration: 'none', fontWeight: 700, fontSize: 15,
    textAlign: 'center', display: 'block',
  },
  centered: {
    minHeight: '100dvh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24,
  },
  notFoundText: { fontSize: 16, color: '#6B7280' },
  backLink: { color: '#7C3AED', fontWeight: 600 },
};

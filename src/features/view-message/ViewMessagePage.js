import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/lib/navigation';
import { getMessage } from '../../lib/repository/messageRepository';
import MediaPlayer from './MediaPlayer';
import BackButton from './BackButton';

export async function generateMetadata(id) {
  const message = await getMessage(id);
  if (!message) return { title: 'Mensaje no encontrado' };
  return {
    title: `Mensaje para ${message.nickname || message.child_name} | Legado`,
    description: `Un mensaje especial de ${message.parent_name}`,
  };
}

export default async function ViewMessagePage({ id }) {
  const [t, locale] = await Promise.all([getTranslations('view'), getLocale()]);
  const raw = await getMessage(id);

  let message = raw;
  if (raw?.file_data) {
    message = { ...raw, file_url: `data:audio/webm;base64,${Buffer.from(raw.file_data).toString('base64')}` };
    delete message.file_data;
  }

  if (!message) {
    return (
      <div style={s.centered}>
        <div style={s.notFoundIcon}>🔒</div>
        <h1 style={s.notFoundTitle}>{t('notFound')}</h1>
        <p style={s.notFoundSub}>{t('notFoundSub')}</p>
        <Link href="/" style={s.homeBtn}>{t('goHome')}</Link>
      </div>
    );
  }

  const displayName  = message.nickname || message.child_name;
  const senderName   = message.parent_nickname || message.parent_name;
  const isVideo      = message.file_type === 'video';
  const deliveryDate = new Date(message.delivery_date).toLocaleDateString(
    locale === 'pt' ? 'pt-BR' : 'es-ES',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
  );

  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.header}>
        <BackButton label={t('back')} />
        <div style={s.headerInner}>
          <div style={s.envelopeCircle}>💌</div>
          <p style={s.forLabel}>{t('forLabel')}</p>
          <h1 style={s.recipientName}>{displayName} 💜</h1>
          <div style={s.senderBadge}>{t('from')}: {senderName}</div>
        </div>
      </div>

      {/* Body */}
      <div style={s.body}>

        {/* Info card */}
        <div style={s.card}>
          <div style={s.infoRow}>
            <div style={s.iconCircle}>🎁</div>
            <div>
              <p style={s.infoLabel}>{t('to')}</p>
              <p style={s.infoValue}>{displayName}</p>
            </div>
          </div>
          <div style={s.divider} />
          <div style={s.infoRow}>
            <div style={s.iconCircle}>👤</div>
            <div>
              <p style={s.infoLabel}>{t('from')}</p>
              <p style={s.infoValue}>{senderName}</p>
            </div>
          </div>
          <div style={s.divider} />
          <div style={s.infoRow}>
            <div style={s.iconCircle}>📅</div>
            <div>
              <p style={s.infoLabel}>{t('deliveryDate')}</p>
              <p style={s.infoValue}>{deliveryDate}</p>
            </div>
          </div>
        </div>

        {/* Audio / Video */}
        {message.file_url && (
          <div style={s.card}>
            <div style={s.mediaHeader}>
              <div style={s.iconCircle}>{isVideo ? '🎥' : '🎙'}</div>
              <div>
                <p style={s.mediaTitle}>{isVideo ? t('video') : t('audio')}</p>
                <p style={s.mediaSub}>{t(isVideo ? 'videoSub' : 'audioSub')}</p>
              </div>
            </div>
            <div style={s.playerWrap}>
              <MediaPlayer url={message.file_url} isVideo={isVideo} />
            </div>
          </div>
        )}

        {/* Texto */}
        {message.message_text && (
          <div style={s.card}>
            <div style={s.mediaHeader}>
              <div style={s.iconCircle}>✍️</div>
              <div>
                <p style={s.mediaTitle}>{t('text')}</p>
              </div>
            </div>
            <div style={s.divider} />
            <p style={s.messageText}>{message.message_text}</p>
          </div>
        )}

        {/* Botones */}
        <Link href={`/create?edit=${id}`} style={s.btnPrimary}>{t('edit')}</Link>
        <Link href="/my-messages" style={s.btnOutline}>{t('myMessages')}</Link>
        <p style={s.footer}>🔒 {t('footer')}</p>

      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100dvh', backgroundColor: '#EEEAFF', display: 'flex', flexDirection: 'column' },

  header: {
    background: 'linear-gradient(160deg, #4C1D95 0%, #7C3AED 100%)',
    padding: '20px 20px 48px',
    textAlign: 'center',
    position: 'relative',
  },
  headerInner: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 8 },
  envelopeCircle: {
    width: 80, height: 80, borderRadius: 22,
    backgroundColor: '#FFFFFF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 38, marginBottom: 4,
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  forLabel:    { fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: 0, letterSpacing: 0.3 },
  recipientName: { fontSize: 32, fontWeight: 800, color: '#FFFFFF', margin: 0, lineHeight: 1.2 },
  senderBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: '#FFFFFF', fontSize: 14, fontWeight: 600,
    padding: '6px 18px', borderRadius: 20, marginTop: 4,
  },

  body: { flex: 1, padding: '0 16px 40px', display: 'flex', flexDirection: 'column', gap: 14, marginTop: -24 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 20,
    padding: '18px 16px',
    boxShadow: '0 2px 12px rgba(90,50,180,0.08)',
  },

  infoRow:   { display: 'flex', alignItems: 'center', gap: 14, padding: '4px 0' },
  iconCircle: {
    width: 44, height: 44, borderRadius: '50%',
    backgroundColor: '#EDE9FE',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, flexShrink: 0,
  },
  infoLabel: { fontSize: 13, color: '#9CA3AF', margin: 0 },
  infoValue: { fontSize: 16, fontWeight: 700, color: '#1F2937', margin: '2px 0 0' },
  divider:   { height: 1, backgroundColor: '#F3F4F6', margin: '12px 0' },

  mediaHeader: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 },
  mediaTitle:  { fontSize: 16, fontWeight: 700, color: '#5B21B6', margin: 0 },
  mediaSub:    { fontSize: 13, color: '#9CA3AF', margin: '2px 0 0' },
  playerWrap:  { borderRadius: 14, overflow: 'hidden', backgroundColor: '#F5F3FF', padding: 4 },

  messageText: { fontSize: 16, color: '#1F2937', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' },

  btnPrimary: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '15px 24px', borderRadius: 14,
    backgroundColor: '#7C3AED', color: '#FFFFFF',
    fontWeight: 700, fontSize: 16, textDecoration: 'none',
    boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
  },
  btnOutline: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '15px 24px', borderRadius: 14,
    backgroundColor: '#FFFFFF', color: '#7C3AED',
    fontWeight: 700, fontSize: 16, textDecoration: 'none',
    border: '2px solid #7C3AED',
  },
  footer: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', margin: '4px 0 0' },

  centered: { minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#F5F3FF', padding: 28, textAlign: 'center' },
  notFoundIcon:  { fontSize: 56, marginBottom: 8 },
  notFoundTitle: { fontSize: 22, fontWeight: 800, color: '#1F2937' },
  notFoundSub:   { fontSize: 15, color: '#6B7280', lineHeight: 1.5 },
  homeBtn:       { marginTop: 16, padding: '12px 32px', borderRadius: 12, backgroundColor: '#7C3AED', color: '#FFFFFF', fontWeight: 700, fontSize: 15, textDecoration: 'none' },
};

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

  // Convertir file_data (bytea) → base64 data URL para reproducir en browser
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
        <Link href="/" className="btn-primary" style={s.homeBtn}>
          {t('goHome')}
        </Link>
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
      <div style={s.header}>
        <BackButton label={t('back')} />
        <div style={s.headerInner}>
          <div style={s.envelopeCircle}>💌</div>
          <p style={s.from}>{t('from')}</p>
          <h1 style={s.senderName}>{senderName}</h1>
        </div>
      </div>

      <div style={s.body}>
        <div className="card">
          <div style={s.metaRow}>
            <span style={s.metaIcon}>🎁</span>
            <div>
              <p style={s.metaLabel}>{t('to')}</p>
              <p style={s.metaValue}>{displayName}</p>
            </div>
          </div>
          <div className="divider" />
          <div style={s.metaRow}>
            <span style={s.metaIcon}>📅</span>
            <div>
              <p style={s.metaLabel}>{t('deliveryDate')}</p>
              <p style={s.metaValue}>{deliveryDate}</p>
            </div>
          </div>
        </div>

        {message.file_url && (
          <div className="card">
            <p style={s.cardTitle}>{isVideo ? t('video') : t('audio')}</p>
            <div className="divider" />
            <MediaPlayer url={message.file_url} isVideo={isVideo} />
          </div>
        )}

        {message.message_text && (
          <div className="card">
            <p style={s.cardTitle}>{t('text')}</p>
            <div className="divider" />
            <p style={s.messageText}>{message.message_text}</p>
          </div>
        )}

        <Link href={`/create?edit=${id}`} style={s.editBtn}>
          {t('edit')}
        </Link>
        <Link href="/my-messages" style={s.myMessagesBtn}>
          {t('myMessages')}
        </Link>

        <div style={{ height: 48 }} />
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100dvh',
    backgroundColor: '#F5F3FF',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    background: 'linear-gradient(160deg, #5B21B6 0%, #7C3AED 100%)',
    padding: '20px 28px 48px',
    textAlign: 'center',
    position: 'relative',
  },
  headerInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  envelopeCircle: {
    width: 76,
    height: 76,
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 34,
    marginBottom: 4,
  },
  from: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  senderName: {
    fontSize: 28,
    fontWeight: 800,
    color: '#FFFFFF',
    lineHeight: 1.2,
  },
  body: {
    flex: 1,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginTop: -20,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  metaIcon: { fontSize: 24, flexShrink: 0 },
  metaLabel: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: 600,
  },
  metaValue: {
    fontSize: 17,
    fontWeight: 700,
    color: '#1F2937',
    marginTop: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#5B21B6',
  },
  messageText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 1.7,
    whiteSpace: 'pre-wrap',
  },
  editBtn: {
    display: 'block', textAlign: 'center',
    padding: '14px 24px',
    backgroundColor: 'transparent',
    color: '#7C3AED', fontWeight: 700, fontSize: 16,
    borderRadius: 12, textDecoration: 'none',
    border: '2px solid #7C3AED',
  },
  myMessagesBtn: {
    display: 'block',
    textAlign: 'center',
    padding: '14px 24px',
    backgroundColor: '#7C3AED',
    color: '#FFFFFF',
    fontWeight: 700,
    fontSize: 16,
    borderRadius: 12,
    textDecoration: 'none',
  },
  centered: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#F5F3FF',
    padding: 28,
    textAlign: 'center',
  },
  notFoundIcon: { fontSize: 56, marginBottom: 8 },
  notFoundTitle: { fontSize: 22, fontWeight: 800, color: '#1F2937' },
  notFoundSub: { fontSize: 15, color: '#6B7280', lineHeight: 1.5 },
  homeBtn: {
    marginTop: 16,
    display: 'inline-flex',
    width: 'auto',
    paddingLeft: 40,
    paddingRight: 40,
  },
};

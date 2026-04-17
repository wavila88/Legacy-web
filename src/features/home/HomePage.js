import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={styles.container}>
        <img
          src="/padre-hija.png"
          alt=""
          aria-hidden="true"
          className="bg-video"
          style={styles.bgImage}
        />

        <div style={styles.gradient} />

        <div style={styles.content}>
          <div style={styles.bottom}>
            <p style={styles.tagline}>Un regalo que trasciende el tiempo</p>

            <h1 style={styles.title}>Legado</h1>
            <h1 style={styles.titleAccent}>Mensajes</h1>

            <p style={styles.description}>
              Deja tu amor, tu sabiduría y tu voz<br />
              para las personas que más quieres.
            </p>

            <Link href="/create" style={styles.cta}>
              Crear un Mensaje
              <span style={styles.ctaArrow}>&#8594;</span>
            </Link>

            <p style={styles.disclaimer}>
              Tus mensajes se entregan únicamente en la fecha que elijas.
            </p>
          </div>
        </div>
      </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    minHeight: '100dvh',
    backgroundColor: '#1a0533',
    overflow: 'hidden',
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 0,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '75%',
    background:
      'linear-gradient(to bottom, transparent 0%, transparent 20%, rgba(17,5,40,0.7) 55%, rgba(10,2,30,0.97) 100%)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  content: {
    position: 'relative',
    zIndex: 2,
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    paddingBottom: 48,
    paddingLeft: 28,
    paddingRight: 28,
  },
  bottom: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  tagline: {
    fontSize: 11,
    color: '#C4B5FD',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 52,
    fontWeight: 800,
    color: '#FFFFFF',
    letterSpacing: 1,
    lineHeight: '56px',
    textAlign: 'center',
  },
  titleAccent: {
    fontSize: 52,
    fontWeight: 800,
    color: '#A78BFA',
    letterSpacing: 1,
    lineHeight: '52px',
    textAlign: 'center',
    marginTop: -6,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: '22px',
    marginBottom: 6,
  },
  cta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    maxWidth: 480,
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 40,
    paddingRight: 32,
    backgroundColor: '#7C3AED',
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: 0.5,
    borderRadius: 50,
    boxShadow: '0 10px 20px rgba(124,58,237,0.6)',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  },
  ctaArrow: {
    fontSize: 22,
    fontWeight: 400,
    lineHeight: 1,
  },
  disclaimer: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.42)',
    textAlign: 'center',
    lineHeight: '18px',
    paddingLeft: 8,
    paddingRight: 8,
  },
};

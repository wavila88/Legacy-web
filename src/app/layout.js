import './globals.css';
import SwRegister from './sw-register';

export const metadata = {
  title: 'Legado Mensajes',
  description: 'Deja tu amor, tu sabiduría y tu voz para las personas que más quieres.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Legado',
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: 'Legado Mensajes',
    description: 'Un regalo que trasciende el tiempo.',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#1a0533',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <SwRegister />
        {children}
      </body>
    </html>
  );
}

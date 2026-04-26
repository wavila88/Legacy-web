import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import PixPaymentPage from '@/features/payment/PixPaymentPage';
import { PRICE_BRL } from '@/lib/mercadopago';

export default async function Page({ params }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const priceDisplay = PRICE_BRL.toFixed(2).replace('.', ',');
  return (
    <Suspense>
      <PixPaymentPage messageId={id} priceDisplay={priceDisplay} />
    </Suspense>
  );
}

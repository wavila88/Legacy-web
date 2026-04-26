import { setRequestLocale } from 'next-intl/server';
import SuccessPage from '@/features/success/SuccessPage';

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SuccessPage />;
}

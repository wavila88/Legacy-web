import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import CreateMessagePage from '@/features/create-message/CreateMessagePage';

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense>
      <CreateMessagePage />
    </Suspense>
  );
}

import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import MyMessagesPage from '@/features/my-messages/MyMessagesPage';

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense>
      <MyMessagesPage />
    </Suspense>
  );
}

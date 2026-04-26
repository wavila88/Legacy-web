import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import SchedulePage from '@/features/schedule/SchedulePage';

export default async function Page({ params }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return (
    <Suspense>
      <SchedulePage messageId={id} />
    </Suspense>
  );
}

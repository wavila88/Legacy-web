import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import AdminRoot from '@/features/admin/AdminRoot';

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense>
      <AdminRoot />
    </Suspense>
  );
}

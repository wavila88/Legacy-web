import { setRequestLocale } from 'next-intl/server';
import ViewMessagePage from '@/features/view-message/ViewMessagePage';

export default async function Page({ params }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <ViewMessagePage id={id} />;
}

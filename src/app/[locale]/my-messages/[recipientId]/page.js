import { setRequestLocale } from 'next-intl/server';
import RecipientMessagesPage from '@/features/my-messages/RecipientMessagesPage';

export default async function Page({ params }) {
  const { locale, recipientId } = await params;
  setRequestLocale(locale);
  return <RecipientMessagesPage recipientId={recipientId} />;
}

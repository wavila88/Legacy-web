import RecipientMessagesPage from '../../../features/my-messages/RecipientMessagesPage';

export default function Page({ params }) {
  return <RecipientMessagesPage recipientId={params.recipientId} />;
}

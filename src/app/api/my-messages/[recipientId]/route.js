import { NextResponse } from 'next/server';
import { getRecipient } from '@/lib/repository/recipientRepository';
import { getClientById } from '@/lib/repository/clientRepository';
import { getMessagesByRecipient } from '@/lib/repository/messageRepository';

export async function GET(_request, { params }) {
  const { recipientId } = params;
  const recipient = await getRecipient(recipientId);
  if (!recipient) {
    return NextResponse.json({ error: 'Destinatario no encontrado.' }, { status: 404 });
  }
  const [client, messages] = await Promise.all([
    getClientById(recipient.client_id),
    getMessagesByRecipient(recipientId),
  ]);
  return NextResponse.json({ recipient, client, messages });
}

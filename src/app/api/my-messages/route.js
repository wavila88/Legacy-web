import { NextResponse } from 'next/server';
import { getClientByEmail } from '@/lib/repository/clientRepository';
import { getRecipientsWithMessageCount } from '@/lib/repository/recipientRepository';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email')?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: 'El parámetro email es requerido.' }, { status: 400 });
  }

  const client = await getClientByEmail(email);
  if (!client) {
    return NextResponse.json({ error: 'No se encontró ninguna cuenta con ese correo.' }, { status: 404 });
  }

  const recipients = await getRecipientsWithMessageCount(client.id);
  return NextResponse.json({ client, recipients });
}

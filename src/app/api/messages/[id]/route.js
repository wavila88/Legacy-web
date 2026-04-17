import { NextResponse } from 'next/server';
import { getMessage } from '@/lib/repository/messageRepository';

export async function GET(request, { params }) {
  const { id } = params;
  const message = await getMessage(id);

  if (!message) {
    return NextResponse.json({ error: 'Mensaje no encontrado.' }, { status: 404 });
  }

  // Convertir bytea → base64 data URL para que el browser pueda reproducirlo
  const response = { ...message };
  if (message.file_data) {
    response.file_url = `data:audio/webm;base64,${Buffer.from(message.file_data).toString('base64')}`;
  }
  delete response.file_data;

  return NextResponse.json(response);
}

import { NextResponse } from 'next/server';
import { getMessage, updateMessage } from '@/lib/repository/messageRepository';

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

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();

  const fields = {
    tipo_mensaje:  body.tipo_mensaje  ?? undefined,
    delivery_date: body.delivery_date ?? undefined,
    message_text:  body.message_text  ?? null,
    file_url:      body.file_url      ?? null,
    file_type:     body.file_type     ?? null,
    file_data:     body.file_data     ? Buffer.from(body.file_data.split(',')[1], 'base64') : null,
  };

  const updated = await updateMessage(id, fields);
  if (!updated) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json(updated);
}

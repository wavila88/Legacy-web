import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { saveMessage } from '@/lib/repository/messageRepository';

export async function POST(request) {
  try {
    const body = await request.json();
    const { parent_name, parent_nickname, child_name, nickname, email, phone, delivery_date, file_url, file_type, message_text } = body;

    if (!parent_name?.trim() || !child_name?.trim() || !delivery_date) {
      return NextResponse.json(
        { error: 'Los campos parent_name, child_name y delivery_date son obligatorios.' },
        { status: 400 },
      );
    }

    // Si el audio viene como base64 data URL, extraer los bytes y guardar en file_data
    let audioBuffer = null;
    let storedFileUrl = file_url ?? null;

    if (file_type === 'audio' && file_url?.startsWith('data:')) {
      const base64 = file_url.split(',')[1];
      audioBuffer = Buffer.from(base64, 'base64');
      storedFileUrl = null; // no guardamos la URL, guardamos los bytes
    }

    const message = await saveMessage({
      id:              randomUUID(),
      parent_name:     parent_name.trim(),
      parent_nickname: parent_nickname?.trim() ?? null,
      child_name:      child_name.trim(),
      nickname:        nickname?.trim() ?? null,
      email:           email?.trim() ?? null,
      phone:           phone?.trim() ?? null,
      delivery_date,
      file_url:        storedFileUrl,
      file_type:       file_type ?? null,
      file_data:       audioBuffer,
      message_text:    message_text?.trim() ?? null,
      delivered:       false,
    });

    return NextResponse.json({ id: message.id, message }, { status: 201 });
  } catch (err) {
    console.error('POST /api/messages:', err);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

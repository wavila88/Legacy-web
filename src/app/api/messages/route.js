import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { findOrCreateClient } from '@/lib/repository/clientRepository';
import { findOrCreateRecipient } from '@/lib/repository/recipientRepository';
import { saveMessage } from '@/lib/repository/messageRepository';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      parent_name, parent_nickname, client_email, client_phone,
      child_name, nickname, relationship, recipient_email, recipient_phone,
      tipo_mensaje, delivery_date, file_url, file_type, message_text,
    } = body;

    if (!parent_name?.trim() || !child_name?.trim() || !delivery_date || !client_email?.trim()) {
      return NextResponse.json(
        { error: 'Los campos parent_name, child_name, client_email y delivery_date son obligatorios.' },
        { status: 400 },
      );
    }

    // 1. Crear o encontrar el cliente (remitente)
    const client = await findOrCreateClient({
      name:     parent_name.trim(),
      nickname: parent_nickname?.trim() ?? null,
      email:    client_email.trim().toLowerCase(),
      phone:    client_phone?.trim() ?? null,
    });

    // 2. Crear o encontrar el destinatario
    const recipient = await findOrCreateRecipient({
      client_id:    client.id,
      name:         child_name.trim(),
      nickname:     nickname?.trim() ?? null,
      relationship: relationship ?? null,
      email:        recipient_email?.trim() ?? null,
      phone:        recipient_phone?.trim() ?? null,
    });

    // 3. Procesar audio: base64 → Buffer para guardar como bytea
    let audioBuffer = null;
    let storedFileUrl = file_url ?? null;
    if (file_type === 'audio' && file_url?.startsWith('data:')) {
      audioBuffer = Buffer.from(file_url.split(',')[1], 'base64');
      storedFileUrl = null;
    }

    // 4. Guardar el mensaje
    const message = await saveMessage({
      id:            randomUUID(),
      client_id:     client.id,
      recipient_id:  recipient.id,
      tipo_mensaje:  tipo_mensaje ?? null,
      delivery_date,
      file_url:      storedFileUrl,
      file_type:     file_type ?? null,
      file_data:     audioBuffer,
      message_text:  message_text?.trim() ?? null,
      delivered:     false,
    });

    return NextResponse.json({ id: message.id, message }, { status: 201 });
  } catch (err) {
    console.error('POST /api/messages:', err);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

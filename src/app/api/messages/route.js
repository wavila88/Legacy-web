import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { saveMessage } from '@/lib/db';

/**
 * POST /api/messages
 *
 * Body (JSON):
 *   parent_name   string  required
 *   child_name    string  required
 *   nickname      string  optional
 *   email         string  optional
 *   delivery_date string  required  (ISO date: "2030-06-15")
 *   file_url      string  optional  (storage URL from upload step)
 *   message_text  string  optional
 *
 * Returns: { id, message }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { parent_name, parent_nickname, child_name, nickname, email, delivery_date, file_url, file_type, message_text } = body;

    if (!parent_name?.trim() || !child_name?.trim() || !delivery_date) {
      return NextResponse.json(
        { error: 'Los campos parent_name, child_name y delivery_date son obligatorios.' },
        { status: 400 },
      );
    }

    const message = {
      id: randomUUID(),
      parent_name: parent_name.trim(),
      parent_nickname: parent_nickname?.trim() || null,
      child_name: child_name.trim(),
      nickname: nickname?.trim() || null,
      email: email?.trim() || null,
      delivery_date,
      file_url: file_url || null,
      file_type: file_type || null,
      message_text: message_text?.trim() || null,
      delivered: false,
      created_at: new Date().toISOString(),
    };

    saveMessage(message);

    return NextResponse.json({ id: message.id, message }, { status: 201 });
  } catch (err) {
    console.error('POST /api/messages:', err);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

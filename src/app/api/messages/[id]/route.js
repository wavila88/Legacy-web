import { NextResponse } from 'next/server';
import { getMessage } from '@/lib/db';

/**
 * GET /api/messages/[id]
 * Returns the message data for a given ID.
 */
export async function GET(request, { params }) {
  const { id } = params;
  const message = getMessage(id);

  if (!message) {
    return NextResponse.json({ error: 'Mensaje no encontrado.' }, { status: 404 });
  }

  return NextResponse.json(message);
}

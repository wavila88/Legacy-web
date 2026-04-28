import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/adminAuth';
import { db } from '@/lib/repository/index.js';
import { messages, recipients, clients } from '@/lib/repository/schema.js';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  const jar   = await cookies();
  const token = jar.get('admin_token')?.value;
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = await db
    .select({
      id:            messages.id,
      status:        messages.status,
      delivery_date: messages.delivery_date,
      tipo_mensaje:  messages.tipo_mensaje,
      delivered:     messages.delivered,
      payment_amount: messages.payment_amount,
      created_at:    messages.created_at,
      parent_name:   clients.name,
      client_email:  clients.email,
      child_name:    recipients.name,
      child_phone:   recipients.phone,
      relationship:  recipients.relationship,
    })
    .from(messages)
    .innerJoin(clients,    eq(messages.client_id,    clients.id))
    .innerJoin(recipients, eq(messages.recipient_id, recipients.id))
    .orderBy(desc(messages.created_at));

  return NextResponse.json(rows);
}

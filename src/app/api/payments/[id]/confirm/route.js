import { NextResponse } from 'next/server';
import { getMessageByPaymentId, updateMessagePayment } from '@/lib/repository/messageRepository';

// Only works in simulation mode
export async function POST(request, { params }) {
  if (process.env.MP_SIMULATE !== 'true') {
    return NextResponse.json({ error: 'not_allowed' }, { status: 403 });
  }

  const { id } = await params;
  const msg = await getMessageByPaymentId(id);
  if (!msg) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  await updateMessagePayment(msg.id, {
    status: 'scheduled',
    payment_id: id,
    payment_amount: null,
  });

  return NextResponse.json({ ok: true });
}

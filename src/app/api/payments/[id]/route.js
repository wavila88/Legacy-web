import { NextResponse } from 'next/server';
import { paymentClient } from '@/lib/mercadopago';
import { getMessageByPaymentId, updateMessagePayment } from '@/lib/repository/messageRepository';

export async function GET(request, { params }) {
  const { id } = await params;

  // Simulated payments are confirmed via a separate action; return 'pending' while polling
  if (id.startsWith('SIM-')) {
    return NextResponse.json({ status: 'pending', simulate: true });
  }

  try {
    const payment  = await paymentClient.get({ id });
    const mpStatus = payment.status;

    if (mpStatus === 'approved') {
      const msg = await getMessageByPaymentId(id);
      if (msg && msg.status !== 'scheduled') {
        await updateMessagePayment(msg.id, {
          status: 'scheduled',
          payment_id: id,
          payment_amount: payment.transaction_amount,
        });
      }
    }

    return NextResponse.json({ status: mpStatus });
  } catch (err) {
    console.error('MP payment status error:', err?.cause ?? err);
    return NextResponse.json({ error: 'status_check_failed' }, { status: 500 });
  }
}

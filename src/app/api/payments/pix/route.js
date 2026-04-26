import { NextResponse } from 'next/server';
import { paymentClient, PRICE_BRL } from '@/lib/mercadopago';
import { getMessage, updateMessagePayment } from '@/lib/repository/messageRepository';
import { randomUUID } from 'crypto';

function fakePixCode() {
  const id = randomUUID().replace(/-/g, '').toUpperCase();
  return `00020101021226870014br.gov.bcb.pix2565qrcodepix.bb.com.br/pix/v2/${id}5204000053039865802BR5925OurLegacy Mensagens Lda6009Sao Paulo62290525${id.slice(0, 25)}6304ABCD`;
}

export async function POST(request) {
  try {
    const { messageId } = await request.json();
    if (!messageId) {
      return NextResponse.json({ error: 'messageId required' }, { status: 400 });
    }

    const message = await getMessage(messageId);
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (message.status === 'scheduled') {
      return NextResponse.json({ error: 'already_scheduled' }, { status: 409 });
    }

    // SIMULATION MODE
    if (process.env.MP_SIMULATE === 'true') {
      const paymentId = `SIM-${Date.now()}`;
      await updateMessagePayment(messageId, {
        status: 'pending_payment',
        payment_id: paymentId,
        payment_amount: PRICE_BRL,
      });
      return NextResponse.json({ pixCode: fakePixCode(), paymentId, simulate: true });
    }

    // If already pending, try to reuse existing payment
    if (message.status === 'pending_payment' && message.payment_id) {
      try {
        const existing = await paymentClient.get({ id: message.payment_id });
        const pixCode = existing.point_of_interaction?.transaction_data?.qr_code;
        if (pixCode && existing.status === 'pending') {
          return NextResponse.json({ pixCode, paymentId: String(existing.id) });
        }
      } catch { /* create new */ }
    }

    const response = await paymentClient.create({
      body: {
        transaction_amount: PRICE_BRL,
        description: `OurLegacy — mensagem para ${message.child_name}`,
        payment_method_id: 'pix',
        payer: { email: message.client_email, first_name: message.parent_name },
        metadata: { message_id: messageId },
      },
    });

    const pixCode   = response.point_of_interaction?.transaction_data?.qr_code;
    const paymentId = String(response.id);

    await updateMessagePayment(messageId, {
      status: 'pending_payment',
      payment_id: paymentId,
      payment_amount: PRICE_BRL,
    });

    return NextResponse.json({ pixCode, paymentId });

  } catch (err) {
    console.error('PIX route error:', err?.message ?? err);
    return NextResponse.json({ error: 'payment_creation_failed', detail: err?.message }, { status: 500 });
  }
}

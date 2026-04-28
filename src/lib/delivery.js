import { findMessagesDue, markAsSent, markAsFailed } from './repository/messageRepository';

export async function deliverMessage(message) {
  try {
    // TODO: reemplazar con WhatsApp Cloud API
    // await sendWhatsApp({ to: message.child_phone, ... });
    console.log('[DELIVERY] Sending message', message.id, '→', message.child_phone);
    await markAsSent(message.id);
    return { success: true, message_id: message.id };
  } catch (err) {
    console.error('[DELIVERY] Failed', message.id, err);
    await markAsFailed(message.id);
    return { success: false, message_id: message.id };
  }
}

export async function runDailyDelivery() {
  const due = await findMessagesDue();
  if (due.length === 0) return { processed: 0 };
  const results  = await Promise.allSettled(due.map(deliverMessage));
  const processed = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
  console.log(`[DELIVERY] Processed ${processed}/${due.length}`);
  return { processed, total: due.length };
}

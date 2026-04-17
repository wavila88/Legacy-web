import { findMessagesDueToday, markAsDelivered } from './repository/messageRepository';

export async function sendDeliveryEmail(message) {
  const privateLink = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/m/${message.id}`;

  // ── Replace with: await resend.emails.send({ to, subject, html }) ──
  console.log('[DELIVERY] ✉️  Sending message', message.id);
  console.log('  To:      ', message.email);
  console.log('  Child:   ', message.child_name);
  console.log('  From:    ', message.parent_name);
  console.log('  Link:    ', privateLink);
  // ────────────────────────────────────────────────────────────────────

  await markAsDelivered(message.id);
  return { success: true, message_id: message.id };
}

export async function runDailyDelivery() {
  const due = await findMessagesDueToday();
  if (due.length === 0) {
    console.log('[DELIVERY] No messages due today.');
    return { processed: 0 };
  }

  const results = await Promise.allSettled(due.map(sendDeliveryEmail));
  const processed = results.filter((r) => r.status === 'fulfilled').length;
  console.log(`[DELIVERY] Processed ${processed}/${due.length} messages.`);
  return { processed, total: due.length };
}

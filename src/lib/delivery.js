/**
 * Mock delivery logic.
 *
 * In production this logic would run as a scheduled cron job (e.g. Vercel Cron,
 * GitHub Actions, or a node-cron server job) that fires every day at 08:00.
 *
 * Flow:
 *   1. Find all messages where delivery_date = today
 *   2. Send email with private link  /m/[id]  via SendGrid / Resend / Nodemailer
 *   3. Mark message as `delivered: true` in the database
 */

import { getAllMessages } from './db';

/**
 * Returns messages whose delivery_date matches today's date (UTC).
 */
export function findMessagesDueToday() {
  const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
  return getAllMessages().filter((msg) => {
    const deliveryDay = new Date(msg.delivery_date).toISOString().split('T')[0];
    return deliveryDay === today && !msg.delivered;
  });
}

/**
 * Simulates sending a delivery email.
 * Replace with real email provider in production.
 */
export async function sendDeliveryEmail(message) {
  const privateLink = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/m/${message.id}`;

  // ── Replace this block with: await resend.emails.send({ to, subject, html }) ──
  console.log('[DELIVERY] ✉️  Sending message', message.id);
  console.log('  To:      ', message.email);
  console.log('  Child:   ', message.child_name);
  console.log('  From:    ', message.parent_name);
  console.log('  Link:    ', privateLink);
  // ── End mock ────────────────────────────────────────────────────────────────

  return { success: true, message_id: message.id };
}

/**
 * Main entry point called by the cron handler at  /api/cron/deliver
 *
 * Example Vercel cron config in vercel.json:
 * {
 *   "crons": [{ "path": "/api/cron/deliver", "schedule": "0 8 * * *" }]
 * }
 */
export async function runDailyDelivery() {
  const due = findMessagesDueToday();
  if (due.length === 0) {
    console.log('[DELIVERY] No messages due today.');
    return { processed: 0 };
  }

  const results = await Promise.allSettled(due.map(sendDeliveryEmail));
  const processed = results.filter((r) => r.status === 'fulfilled').length;
  console.log(`[DELIVERY] Processed ${processed}/${due.length} messages.`);
  return { processed, total: due.length };
}

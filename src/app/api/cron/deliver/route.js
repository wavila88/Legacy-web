import { NextResponse } from 'next/server';
import { runDailyDelivery } from '@/lib/delivery';

/**
 * GET /api/cron/deliver
 *
 * Called by a scheduled job (e.g. Vercel Cron) every day at 08:00.
 * Add to vercel.json:
 *   { "crons": [{ "path": "/api/cron/deliver", "schedule": "0 8 * * *" }] }
 *
 * Protected by CRON_SECRET environment variable to prevent public abuse.
 */
export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runDailyDelivery();
  return NextResponse.json(result);
}

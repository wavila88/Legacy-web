import { NextResponse } from 'next/server';
import { runDailyDelivery } from '@/lib/delivery';

// Llamado por cron-job.org cada hora
// En producción proteger con CRON_SECRET en Authorization: Bearer <secret>
export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const result = await runDailyDelivery();
  return NextResponse.json(result);
}

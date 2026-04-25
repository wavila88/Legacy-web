import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { db } from '@/lib/repository/index';
import { auth_tokens } from '@/lib/repository/schema';
import { sendMagicLink } from '@/lib/email';

export async function POST(request) {
  const { email } = await request.json();
  if (!email?.trim()) {
    return NextResponse.json({ error: 'El correo es requerido.' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  await db.insert(auth_tokens).values({
    token,
    email: normalizedEmail,
    expires_at: expiresAt,
  });

  const forwardedHost  = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : new URL(request.url).origin;
  const magicLink = `${origin}/api/auth/verify?token=${token}`;

  await sendMagicLink({ to: normalizedEmail, magicLink });

  return NextResponse.json({ ok: true });
}

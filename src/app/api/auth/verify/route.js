import { NextResponse } from 'next/server';
import { db } from '@/lib/repository/index';
import { auth_tokens } from '@/lib/repository/schema';
import { eq } from 'drizzle-orm';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/my-messages?error=invalid', request.url));
  }

  const [row] = await db
    .select()
    .from(auth_tokens)
    .where(eq(auth_tokens.token, token))
    .limit(1);

  if (!row || row.used || new Date() > new Date(row.expires_at)) {
    return NextResponse.redirect(new URL('/my-messages?error=expired', request.url));
  }

  await db
    .update(auth_tokens)
    .set({ used: true })
    .where(eq(auth_tokens.token, token));

  const forwardedHost  = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : new URL(request.url).origin;
  const dest = new URL('/my-messages', origin);
  dest.searchParams.set('email', row.email);
  return NextResponse.redirect(dest);
}

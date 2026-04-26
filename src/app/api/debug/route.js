import { NextResponse } from 'next/server';

export async function GET(request) {
  return NextResponse.json({
    acceptLanguage: request.headers.get('accept-language'),
    cookie: request.headers.get('cookie'),
    allHeaders: Object.fromEntries(request.headers.entries()),
  });
}

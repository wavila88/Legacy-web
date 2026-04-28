import { createHmac } from 'crypto';

function makeToken() {
  const secret = `${process.env.ADMIN_USER}:${process.env.ADMIN_PASSWORD}`;
  return createHmac('sha256', secret).update('ourlegacy-admin-v1').digest('hex');
}

export function verifyAdminToken(token) {
  if (!token) return false;
  return token === makeToken();
}

export { makeToken };

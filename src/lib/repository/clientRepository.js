import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from './index.js';
import { clients } from './schema.js';

export async function findOrCreateClient({ name, nickname, email, phone }) {
  const [existing] = await db.select().from(clients).where(eq(clients.email, email)).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(clients).values({
    id:       randomUUID(),
    name,
    nickname: nickname ?? null,
    email,
    phone:    phone ?? null,
  }).returning();
  return created;
}

export async function getClientByEmail(email) {
  const [client] = await db.select().from(clients).where(eq(clients.email, email)).limit(1);
  return client ?? null;
}

export async function getClientById(id) {
  const [client] = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return client ?? null;
}

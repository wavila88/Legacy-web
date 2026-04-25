import { eq, and, count } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from './index.js';
import { recipients, messages } from './schema.js';

export async function findOrCreateRecipient({ client_id, name, nickname, relationship, email, phone }) {
  const [existing] = await db.select().from(recipients)
    .where(and(eq(recipients.client_id, client_id), eq(recipients.name, name)))
    .limit(1);
  if (existing) return existing;
  const [created] = await db.insert(recipients).values({
    id:           randomUUID(),
    client_id,
    name,
    nickname:     nickname ?? null,
    relationship: relationship ?? null,
    email:        email ?? null,
    phone:        phone ?? null,
  }).returning();
  return created;
}

export async function getRecipientsWithMessageCount(client_id) {
  return db
    .select({
      id:            recipients.id,
      name:          recipients.name,
      nickname:      recipients.nickname,
      relationship:  recipients.relationship,
      email:         recipients.email,
      phone:         recipients.phone,
      message_count: count(messages.id),
    })
    .from(recipients)
    .leftJoin(messages, eq(messages.recipient_id, recipients.id))
    .where(eq(recipients.client_id, client_id))
    .groupBy(
      recipients.id,
      recipients.name,
      recipients.nickname,
      recipients.relationship,
      recipients.email,
      recipients.phone,
    );
}

export async function getRecipient(id) {
  const [recipient] = await db.select().from(recipients).where(eq(recipients.id, id)).limit(1);
  return recipient ?? null;
}

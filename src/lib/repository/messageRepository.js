import { eq, and, lte, sql } from 'drizzle-orm';
import { db } from './index.js';
import { messages, recipients, clients } from './schema.js';

export async function saveMessage(message) {
  const [inserted] = await db.insert(messages).values(message).returning();
  return inserted;
}

export async function getMessage(id) {
  const [row] = await db
    .select({
      id:              messages.id,
      tipo_mensaje:    messages.tipo_mensaje,
      delivery_date:   messages.delivery_date,
      file_url:        messages.file_url,
      file_type:       messages.file_type,
      file_data:       messages.file_data,
      message_text:    messages.message_text,
      delivered:       messages.delivered,
      status:          messages.status,
      payment_id:      messages.payment_id,
      payment_amount:  messages.payment_amount,
      created_at:      messages.created_at,
      parent_name:     clients.name,
      parent_nickname: clients.nickname,
      client_email:    clients.email,
      child_name:      recipients.name,
      nickname:        recipients.nickname,
      relationship:    recipients.relationship,
      email:           recipients.email,
    })
    .from(messages)
    .innerJoin(clients,    eq(messages.client_id,    clients.id))
    .innerJoin(recipients, eq(messages.recipient_id, recipients.id))
    .where(eq(messages.id, id))
    .limit(1);
  return row ?? null;
}

export async function getMessagesByRecipient(recipient_id) {
  return db
    .select({
      id:             messages.id,
      tipo_mensaje:   messages.tipo_mensaje,
      delivery_date:  messages.delivery_date,
      file_type:      messages.file_type,
      message_text:   messages.message_text,
      delivered:      messages.delivered,
      status:         messages.status,
      payment_id:     messages.payment_id,
      created_at:     messages.created_at,
    })
    .from(messages)
    .where(eq(messages.recipient_id, recipient_id))
    .orderBy(messages.delivery_date);
}

export async function updateMessage(id, fields) {
  const clean = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
  const [updated] = await db
    .update(messages)
    .set(clean)
    .where(eq(messages.id, id))
    .returning();
  return updated ?? null;
}

export async function updateMessagePayment(id, { status, payment_id, payment_amount }) {
  const [updated] = await db
    .update(messages)
    .set({ status, payment_id, payment_amount: String(payment_amount) })
    .where(eq(messages.id, id))
    .returning();
  return updated;
}

export async function getMessageByPaymentId(payment_id) {
  const [row] = await db
    .select({ id: messages.id, status: messages.status, delivery_date: messages.delivery_date })
    .from(messages)
    .where(eq(messages.payment_id, payment_id))
    .limit(1);
  return row ?? null;
}

export async function markAsSent(id) {
  const [updated] = await db
    .update(messages)
    .set({ delivered: true, status: 'sent' })
    .where(eq(messages.id, id))
    .returning();
  return updated;
}

export async function markAsFailed(id) {
  const [updated] = await db
    .update(messages)
    .set({ status: 'failed' })
    .where(eq(messages.id, id))
    .returning();
  return updated;
}

export async function findMessagesDue() {
  return db
    .select({
      id:            messages.id,
      delivery_date: messages.delivery_date,
      message_text:  messages.message_text,
      email:         recipients.email,
      child_phone:   recipients.phone,
      child_name:    recipients.name,
      parent_name:   clients.name,
    })
    .from(messages)
    .innerJoin(recipients, eq(messages.recipient_id, recipients.id))
    .innerJoin(clients,    eq(messages.client_id,    clients.id))
    .where(and(
      eq(messages.status, 'scheduled'),
      lte(sql`${messages.delivery_date}::timestamptz`, sql`NOW()`),
    ));
}


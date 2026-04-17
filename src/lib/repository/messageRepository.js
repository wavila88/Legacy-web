import { eq, and, lte } from 'drizzle-orm';
import { db } from './index.js';
import { messages } from './schema.js';

/**
 * Inserta un nuevo mensaje en la base de datos.
 * @param {object} message
 * @returns {Promise<object>} El mensaje insertado.
 */
export async function saveMessage(message) {
  const [inserted] = await db.insert(messages).values(message).returning();
  return inserted;
}

/**
 * Obtiene un mensaje por su ID.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function getMessage(id) {
  const [message] = await db
    .select()
    .from(messages)
    .where(eq(messages.id, id))
    .limit(1);
  return message ?? null;
}

/**
 * Retorna todos los mensajes pendientes de entrega cuya delivery_date <= hoy.
 * @returns {Promise<object[]>}
 */
export async function findMessagesDueToday() {
  const today = new Date().toISOString().split('T')[0];
  return db
    .select()
    .from(messages)
    .where(
      and(
        lte(messages.delivery_date, today),
        eq(messages.delivered, false),
      ),
    );
}

/**
 * Marca un mensaje como entregado.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function markAsDelivered(id) {
  const [updated] = await db
    .update(messages)
    .set({ delivered: true })
    .where(eq(messages.id, id))
    .returning();
  return updated;
}

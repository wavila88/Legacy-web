/**
 * In-memory message store.
 *
 * This module-level Map persists for the lifetime of the Node.js process.
 * In production, replace with a real database (PostgreSQL, MongoDB, etc.).
 *
 * NOTE: Data is lost on server restart in development due to hot-reload.
 */

/** @type {Map<string, object>} */
const messages = global._legadoDB ?? (global._legadoDB = new Map());

/**
 * @param {{ id: string, parent_name: string, child_name: string,
 *           nickname?: string, email?: string, delivery_date: string,
 *           file_url?: string, message_text?: string, created_at: string }} message
 */
export function saveMessage(message) {
  messages.set(message.id, message);
  return message;
}

/**
 * @param {string} id
 * @returns {object|null}
 */
export function getMessage(id) {
  return messages.get(id) ?? null;
}

/**
 * @returns {object[]}
 */
export function getAllMessages() {
  return Array.from(messages.values());
}

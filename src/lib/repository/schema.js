import { pgTable, text, boolean, timestamp, customType } from 'drizzle-orm/pg-core';

const bytea = customType({
  dataType: () => 'bytea',
  toDriver: (val) => Buffer.from(val),
  fromDriver: (val) => val,
});

export const clients = pgTable('clients', {
  id:         text('id').primaryKey(),
  name:       text('name').notNull(),
  nickname:   text('nickname'),
  email:      text('email').notNull(),
  phone:      text('phone'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const recipients = pgTable('recipients', {
  id:           text('id').primaryKey(),
  client_id:    text('client_id').notNull(),
  name:         text('name').notNull(),
  nickname:     text('nickname'),
  relationship: text('relationship'),
  email:        text('email'),
  phone:        text('phone'),
  created_at:   timestamp('created_at').defaultNow().notNull(),
});

export const auth_tokens = pgTable('auth_tokens', {
  token:      text('token').primaryKey(),
  email:      text('email').notNull(),
  expires_at: timestamp('expires_at').notNull(),
  used:       boolean('used').default(false).notNull(),
});

export const messages = pgTable('messages', {
  id:            text('id').primaryKey(),
  client_id:     text('client_id').notNull(),
  recipient_id:  text('recipient_id').notNull(),
  tipo_mensaje:  text('tipo_mensaje'),
  delivery_date: text('delivery_date').notNull(),
  file_url:      text('file_url'),
  file_type:     text('file_type'),
  file_data:     bytea('file_data'),
  message_text:  text('message_text'),
  delivered:     boolean('delivered').default(false).notNull(),
  created_at:    timestamp('created_at').defaultNow().notNull(),
});

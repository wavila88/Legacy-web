import { pgTable, text, boolean, timestamp, customType } from 'drizzle-orm/pg-core';

const bytea = customType({
  dataType: () => 'bytea',
  toDriver: (val) => Buffer.from(val),
  fromDriver: (val) => val,
});

export const messages = pgTable('messages', {
  id:              text('id').primaryKey(),
  parent_name:     text('parent_name').notNull(),
  parent_nickname: text('parent_nickname'),
  child_name:      text('child_name').notNull(),
  nickname:        text('nickname'),
  email:           text('email'),
  phone:           text('phone'),
  delivery_date:   text('delivery_date').notNull(),
  file_url:        text('file_url'),
  file_type:       text('file_type'),
  file_data:       bytea('file_data'),
  message_text:    text('message_text'),
  delivered:       boolean('delivered').default(false).notNull(),
  created_at:      timestamp('created_at').defaultNow().notNull(),
});

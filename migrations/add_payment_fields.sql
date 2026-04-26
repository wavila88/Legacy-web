-- Run this migration when the database is running
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS payment_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(10,2);

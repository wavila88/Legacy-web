import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

// Reuse the connection pool across hot-reloads in development.
const pool = global._pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (process.env.NODE_ENV !== 'production') global._pgPool = pool;

export const db = drizzle(pool, { schema });

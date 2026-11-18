import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const sslEnabled =
  process.env.PGSSL === 'true' ||
  process.env.PGSSLMODE === 'require' ||
  Boolean(process.env.DATABASE_URL?.includes('sslmode=require'));

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  schemaFilter: ['public'],
  dbCredentials: process.env.DATABASE_URL
    ? {
        url: process.env.DATABASE_URL,
      }
    : {
        host: process.env.PGHOST || '127.0.0.1',
        port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || '',
        database: process.env.PGDATABASE || 'visita_fray',
        ssl: sslEnabled ? { rejectUnauthorized: false } : false,
      },
  verbose: true,
});

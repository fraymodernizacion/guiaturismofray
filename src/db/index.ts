import 'dotenv/config';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool, type PoolConfig } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _visitaFrayPgPool: Pool | undefined;
  var _visitaFraySchemaPromise: Promise<void> | undefined;
}

export function isPostgresConfigured(): boolean {
  return Boolean(
    process.env.DATABASE_URL ||
      (process.env.PGHOST && process.env.PGDATABASE && process.env.PGUSER)
  );
}

function buildPoolConfig(): PoolConfig {
  const sslEnabled =
    process.env.PGSSL === 'true' ||
    process.env.PGSSLMODE === 'require' ||
    Boolean(process.env.DATABASE_URL?.includes('sslmode=require'));

  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.PGPOOL_MAX || 10),
      connectionTimeoutMillis: 15000,
      ...(sslEnabled ? { ssl: { rejectUnauthorized: false } } : {}),
    };
  }

  return {
    host: process.env.PGHOST || '127.0.0.1',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    max: Number(process.env.PGPOOL_MAX || 10),
    connectionTimeoutMillis: 15000,
    ...(sslEnabled ? { ssl: { rejectUnauthorized: false } } : {}),
  };
}

const createMockPool = (): Pool =>
  ({
    query: async () => ({ rows: [] }),
    connect: async () => ({ query: async () => ({ rows: [] }), release: () => {} }),
    on: () => undefined,
    end: async () => undefined,
  }) as unknown as Pool;

const createMockDb = (): NodePgDatabase<typeof schema> => {
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {},
    delete: async () => ({}),
  };
  return new Proxy(
    {},
    {
      get: (_, prop) =>
        prop === 'query'
          ? new Proxy({}, { get: () => noOp })
          : prop === 'transaction'
            ? async (fn: any) => fn(createMockDb())
            : async () => [],
    }
  ) as unknown as NodePgDatabase<typeof schema>;
};

export function getPgPool(): Pool {
  if (!isPostgresConfigured()) {
    console.warn('[AI Studio] PostgreSQL not configured — using mock pool');
    return createMockPool();
  }

  if (!global._visitaFrayPgPool) {
    try {
      global._visitaFrayPgPool = new Pool(buildPoolConfig());
      global._visitaFrayPgPool.on('error', (err) => {
        console.error('[POSTGRES] Unexpected idle client error:', err);
      });
    } catch (err) {
      console.warn('[AI Studio] PostgreSQL Pool init failed — using mock pool:', err);
      return createMockPool();
    }
  }

  return global._visitaFrayPgPool;
}

export function getDb(): NodePgDatabase<typeof schema> {
  if (!isPostgresConfigured()) {
    return createMockDb();
  }
  try {
    return drizzle(getPgPool(), { schema });
  } catch (err) {
    console.warn('[AI Studio] Drizzle DB not connected — using mock:', err);
    return createMockDb();
  }
}

export async function ensurePostgresSchema(): Promise<void> {
  if (!isPostgresConfigured()) return;

  if (!global._visitaFraySchemaPromise) {
    global._visitaFraySchemaPromise = (async () => {
      const pool = getPgPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS places (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          secondary_categories JSONB,
          sub_category TEXT,
          short_description TEXT NOT NULL DEFAULT '',
          description TEXT NOT NULL DEFAULT '',
          address TEXT NOT NULL DEFAULT '',
          locality TEXT NOT NULL DEFAULT '',
          locality_id TEXT,
          lat DOUBLE PRECISION NOT NULL DEFAULT 0,
          lng DOUBLE PRECISION NOT NULL DEFAULT 0,
          image TEXT NOT NULL DEFAULT '',
          gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
          opening_hours TEXT NOT NULL DEFAULT '',
          phone TEXT NOT NULL DEFAULT '',
          whatsapp TEXT NOT NULL DEFAULT '',
          instagram TEXT,
          facebook TEXT,
          tags JSONB NOT NULL DEFAULT '[]'::jsonb,
          services JSONB NOT NULL DEFAULT '[]'::jsonb,
          price_level TEXT,
          featured BOOLEAN DEFAULT FALSE,
          is_imperdible BOOLEAN DEFAULT FALSE,
          audioguide_id TEXT,
          validation_status TEXT,
          validation_note TEXT,
          source_guide TEXT,
          photo_pending_note TEXT,
          photo_credit TEXT,
          trekking_info JSONB,
          is_heritage_esquiu BOOLEAN DEFAULT FALSE,
          google_maps_url TEXT,
          safety_warning TEXT,
          sort_order INTEGER NOT NULL DEFAULT 0,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_places_category ON places (category);
        CREATE INDEX IF NOT EXISTS idx_places_sort_order ON places (sort_order);

        CREATE TABLE IF NOT EXISTS events (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          date TEXT NOT NULL,
          date_badge TEXT NOT NULL,
          time TEXT NOT NULL,
          category TEXT NOT NULL,
          location_name TEXT NOT NULL,
          address TEXT NOT NULL,
          lat DOUBLE PRECISION NOT NULL DEFAULT 0,
          lng DOUBLE PRECISION NOT NULL DEFAULT 0,
          description TEXT NOT NULL DEFAULT '',
          image TEXT NOT NULL DEFAULT '',
          is_free BOOLEAN NOT NULL DEFAULT TRUE,
          price_text TEXT,
          organizer TEXT,
          place_id TEXT,
          sort_order INTEGER NOT NULL DEFAULT 0,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS audioguides (
          id TEXT PRIMARY KEY,
          place_id TEXT NOT NULL,
          title TEXT NOT NULL,
          subtitle TEXT NOT NULL DEFAULT '',
          duration TEXT NOT NULL,
          audio_seconds INTEGER NOT NULL DEFAULT 0,
          audio_url TEXT,
          cover_image TEXT NOT NULL DEFAULT '',
          short_summary TEXT NOT NULL DEFAULT '',
          narrative_text TEXT NOT NULL DEFAULT '',
          historical_facts JSONB NOT NULL DEFAULT '[]'::jsonb,
          next_place_id TEXT NOT NULL DEFAULT '',
          next_place_reason TEXT NOT NULL DEFAULT '',
          sort_order INTEGER NOT NULL DEFAULT 0,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        ALTER TABLE audioguides ADD COLUMN IF NOT EXISTS audio_url TEXT;

        CREATE TABLE IF NOT EXISTS site_config (
          key TEXT PRIMARY KEY,
          config JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS media_uploads (
          filename TEXT PRIMARY KEY,
          mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
          data_base64 TEXT NOT NULL,
          size_bytes INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
    })().catch((err) => {
      global._visitaFraySchemaPromise = undefined;
      throw err;
    });
  }

  return global._visitaFraySchemaPromise;
}

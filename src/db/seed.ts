import 'dotenv/config';
import { getPgPool, isPostgresConfigured } from './index.ts';
import { seedDatabaseFromExistingFiles } from './repository.ts';

async function main() {
  if (!isPostgresConfigured()) {
    console.error(
      'PostgreSQL is not configured. Ensure SQL_HOST, SQL_USER, SQL_PASSWORD, and SQL_DB_NAME are available.'
    );
    process.exit(1);
  }

  console.log('[SEED] Migrating Visita Fray data to PostgreSQL...');
  const result = await seedDatabaseFromExistingFiles();
  console.log(
    `[SEED] Completed: ${result.placesCount} places, ${result.eventsCount} events, ${result.audioguidesCount} audioguides.`
  );
  await getPgPool().end();
}

main().catch(async (err) => {
  console.error('[SEED ERROR]', err);
  try {
    await getPgPool().end();
  } catch {
    // Ignore close errors
  }
  process.exit(1);
});

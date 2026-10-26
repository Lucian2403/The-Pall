import pg from 'pg';

// This read-only check uses exactly the same DATABASE_URL as the application.
// It works even when PostgreSQL belongs to an older Docker Compose project.
if (!process.env.DATABASE_URL) {
  console.error('FAILED: DATABASE_URL is missing from platform/.env');
  process.exit(1);
}

const required = ['account', 'session', 'user', 'verification'];
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
try {
  await client.connect();
  const result = await client.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = ANY($1::text[]) ORDER BY tablename",
    [required]
  );
  const found = result.rows.map(row => row.tablename);
  const missing = required.filter(name => !found.includes(name));
  console.log('Better Auth tables found: ' + found.join(', '));
  if (missing.length) {
    console.error('FAILED: Missing tables: ' + missing.join(', '));
    process.exitCode = 1;
  } else {
    console.log('PASS: All 4 Better Auth tables exist in the application database.');
  }
} catch (error) {
  // Avoid printing connection strings or other local configuration.
  console.error('FAILED: Could not query PostgreSQL with platform/.env DATABASE_URL.');
  console.error(error instanceof Error ? error.message.replaceAll(process.env.DATABASE_URL, '[redacted]') : 'Unknown database error');
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}

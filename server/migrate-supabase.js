/**
 * ============================================================
 * VAANIFLOW — SUPABASE MIGRATION & HEALTH PROBE SCRIPT
 * Run with: node server/migrate-supabase.js
 * ============================================================
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const { Pool } = pg;

async function runSupabaseMigration() {
  console.log('====================================================');
  console.log('  VAANIFLOW — SUPABASE DATABASE MIGRATION TOOL');
  console.log('====================================================\n');

  let dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.SUPABASE_DATABASE_URL;

  if (!dbUrl && process.env.SUPABASE_URL && process.env.SUPABASE_DB_PASSWORD) {
    const parsedUrl = new URL(process.env.SUPABASE_URL);
    const projectRef = parsedUrl.hostname.split('.')[0];
    const password = encodeURIComponent(process.env.SUPABASE_DB_PASSWORD);
    dbUrl = `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`;
  }

  if (!dbUrl) {
    console.error('❌ Error: No DATABASE_URL or SUPABASE credentials found in server/.env');
    console.log('\nPlease add your Supabase connection string to server/.env:');
    console.log('DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres\n');
    process.exit(1);
  }

  console.log('Connecting to database:', dbUrl.replace(/:[^:@]+@/, ':****@'));

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    const client = await pool.connect();
    console.log('✓ Successfully connected to Supabase PostgreSQL database!');

    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Applying database schema (users, conversations, messages, indexes)...');
    await client.query(schemaSql);
    console.log('✓ Schema applied successfully!\n');

    // Query tables count
    const tableRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('Existing Public Tables in Supabase:');
    tableRes.rows.forEach(r => console.log(` - ${r.table_name}`));

    client.release();
    await pool.end();
    console.log('\n✓ Supabase database is ready for VaaniFlow!');
  } catch (err) {
    console.error('❌ Supabase Migration Error:', err.message);
    process.exit(1);
  }
}

runSupabaseMigration();

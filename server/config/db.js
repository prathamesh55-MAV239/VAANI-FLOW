import pg from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

let pool = null;
let useLocalFallback = false;

// Path to local JSON fallback database file
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const localDbFile = path.join(dataDir, 'local_db.json');

function loadLocalDb() {
  if (fs.existsSync(localDbFile)) {
    try {
      return JSON.parse(fs.readFileSync(localDbFile, 'utf8'));
    } catch (e) {
      console.error('[DB] Error reading local db file, resetting:', e.message);
    }
  }
  return { users: [], conversations: [], messages: [] };
}

function saveLocalDb(data) {
  try {
    fs.writeFileSync(localDbFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('[DB] Error writing local db file:', e.message);
  }
}

// Ensure database tables exist in PostgreSQL
async function initPgTables(client) {
  const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log('[DB] PostgreSQL schema verified and applied.');
  }
}

export async function initDatabase() {
  let databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.SUPABASE_DATABASE_URL;

  // Auto-compose Supabase connection string if project URL and password provided
  if (!databaseUrl && process.env.SUPABASE_URL && process.env.SUPABASE_DB_PASSWORD) {
    try {
      const parsedUrl = new URL(process.env.SUPABASE_URL);
      const projectRef = parsedUrl.hostname.split('.')[0];
      const password = encodeURIComponent(process.env.SUPABASE_DB_PASSWORD);
      databaseUrl = `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`;
      console.log(`[DB] Composed Supabase PostgreSQL connection string for project: ${projectRef}`);
    } catch (e) {
      console.warn('[DB] Could not auto-compose Supabase connection string:', e.message);
    }
  }

  if (databaseUrl && !databaseUrl.includes('placeholder')) {
    try {
      const isSupabase = databaseUrl.includes('supabase') || databaseUrl.includes('pooler.supabase');
      pool = new Pool({
        connectionString: databaseUrl,
        ssl: isSupabase || databaseUrl.includes('render') || databaseUrl.includes('sslmode=require')
          ? { rejectUnauthorized: false }
          : false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });

      const client = await pool.connect();
      console.log(`[DB] Connected to PostgreSQL (${isSupabase ? 'Supabase Database' : 'Remote PostgreSQL'}) successfully.`);
      await initPgTables(client);
      client.release();
      useLocalFallback = false;
      return;
    } catch (err) {
      console.warn('[DB] PostgreSQL / Supabase connection attempt failed:', err.message);
      console.warn('[DB] Falling back to high-fidelity embedded database for development/offline testing.');
      useLocalFallback = true;
    }
  } else {
    console.log('[DB] No active DATABASE_URL or Supabase connection configured. Utilizing high-fidelity local database.');
    useLocalFallback = true;
  }

  // Initialize local db if needed
  const localDb = loadLocalDb();
  saveLocalDb(localDb);
  console.log('[DB] Embedded database initialized at:', localDbFile);
}

/**
 * Universal Query Adapter
 * Supports both PostgreSQL and the embedded local fallback with the same interface:
 * db.query(sqlString, paramsArray) -> Promise<{ rows: Array, rowCount: number }>
 */
export async function query(text, params = []) {
  if (!useLocalFallback && pool) {
    try {
      const start = Date.now();
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      if (process.env.NODE_ENV === 'development') {
        // console.log(`[SQL] ${text.slice(0, 60)}... (${duration}ms)`);
      }
      return res;
    } catch (err) {
      // If Postgres connection lost, log and throw
      console.error('[DB Query Error]', err.message);
      throw err;
    }
  }

  // Embedded SQL-emulation for local development / zero-setup demo
  return executeLocalQuery(text, params);
}

// SQL query emulator for the three required tables
function executeLocalQuery(sql, params = []) {
  const db = loadLocalDb();
  const trimmed = sql.trim().replace(/\s+/g, ' ');

  // 1. SELECT FROM users WHERE email = $1
  if (trimmed.match(/SELECT \* FROM users WHERE email = \$1/i)) {
    const email = params[0]?.toLowerCase();
    const rows = db.users.filter(u => u.email.toLowerCase() === email);
    return { rows, rowCount: rows.length };
  }

  // 2. SELECT id, name, email, created_at FROM users WHERE id = $1
  if (trimmed.match(/SELECT id, name, email, created_at FROM users WHERE id = \$1/i)) {
    const id = params[0];
    const user = db.users.find(u => u.id === id);
    const rows = user ? [{ id: user.id, name: user.name, email: user.email, created_at: user.created_at }] : [];
    return { rows, rowCount: rows.length };
  }

  // 3. INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at
  if (trimmed.match(/INSERT INTO users/i)) {
    const [name, email, password_hash] = params;
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      const err = new Error('duplicate key value violates unique constraint "users_email_key"');
      err.code = '23505';
      throw err;
    }
    const newUser = {
      id: crypto.randomUUID(),
      name,
      email: email.toLowerCase(),
      password_hash,
      created_at: new Date().toISOString()
    };
    db.users.push(newUser);
    saveLocalDb(db);
    return {
      rows: [{ id: newUser.id, name: newUser.name, email: newUser.email, created_at: newUser.created_at }],
      rowCount: 1
    };
  }

  // 4. SELECT * FROM conversations WHERE user_id = $1 ORDER BY updated_at DESC
  if (trimmed.match(/SELECT \* FROM conversations WHERE user_id = \$1/i)) {
    const userId = params[0];
    const rows = db.conversations
      .filter(c => c.user_id === userId)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    return { rows, rowCount: rows.length };
  }

  // 5. SELECT * FROM conversations WHERE id = $1 AND user_id = $2
  if (trimmed.match(/SELECT \* FROM conversations WHERE id = \$1 AND user_id = \$2/i)) {
    const [id, userId] = params;
    const conversation = db.conversations.find(c => c.id === id && c.user_id === userId);
    const rows = conversation ? [conversation] : [];
    return { rows, rowCount: rows.length };
  }

  // 6. INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING *
  if (trimmed.match(/INSERT INTO conversations/i)) {
    const [user_id, title] = params;
    const newConv = {
      id: crypto.randomUUID(),
      user_id,
      title: title || 'New Conversation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.conversations.push(newConv);
    saveLocalDb(db);
    return { rows: [newConv], rowCount: 1 };
  }

  // 7. UPDATE conversations SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *
  if (trimmed.match(/UPDATE conversations SET title = \$1/i)) {
    const [title, id, userId] = params;
    const conv = db.conversations.find(c => c.id === id && c.user_id === userId);
    if (!conv) {
      return { rows: [], rowCount: 0 };
    }
    conv.title = title;
    conv.updated_at = new Date().toISOString();
    saveLocalDb(db);
    return { rows: [conv], rowCount: 1 };
  }

  // 8. UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1
  if (trimmed.match(/UPDATE conversations SET updated_at =/i)) {
    const id = params[0];
    const conv = db.conversations.find(c => c.id === id);
    if (conv) {
      conv.updated_at = new Date().toISOString();
      saveLocalDb(db);
    }
    return { rows: conv ? [conv] : [], rowCount: conv ? 1 : 0 };
  }

  // 9. DELETE FROM conversations WHERE id = $1 AND user_id = $2 RETURNING id
  if (trimmed.match(/DELETE FROM conversations WHERE id = \$1 AND user_id = \$2/i)) {
    const [id, userId] = params;
    const index = db.conversations.findIndex(c => c.id === id && c.user_id === userId);
    if (index === -1) {
      return { rows: [], rowCount: 0 };
    }
    db.conversations.splice(index, 1);
    // Cascade delete messages
    db.messages = db.messages.filter(m => m.conversation_id !== id);
    saveLocalDb(db);
    return { rows: [{ id }], rowCount: 1 };
  }

  // 10. SELECT ... FROM messages WHERE conversation_id = $1
  if (trimmed.match(/SELECT .*? FROM messages WHERE conversation_id = \$1/i)) {
    const convId = params[0];
    const limitMatch = trimmed.match(/LIMIT (\d+)/i);
    let rows = db.messages
      .filter(m => m.conversation_id === convId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    if (trimmed.includes('DESC')) {
      rows = db.messages
        .filter(m => m.conversation_id === convId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    if (limitMatch) {
      rows = rows.slice(0, parseInt(limitMatch[1], 10));
    }
    return { rows, rowCount: rows.length };
  }

  // 11. INSERT INTO messages (conversation_id, role, content, language, intent) VALUES ($1, $2, $3, $4, $5) RETURNING *
  if (trimmed.match(/INSERT INTO messages/i)) {
    const [conversation_id, role, content, language, intent] = params;
    const newMsg = {
      id: crypto.randomUUID(),
      conversation_id,
      role,
      content,
      language: language || 'en',
      intent: intent || 'general_query',
      created_at: new Date().toISOString()
    };
    db.messages.push(newMsg);
    // Also touch conversation updated_at
    const conv = db.conversations.find(c => c.id === conversation_id);
    if (conv) {
      conv.updated_at = new Date().toISOString();
    }
    saveLocalDb(db);
    return { rows: [newMsg], rowCount: 1 };
  }

  // Default fallback
  console.warn('[DB] Unhandled local SQL query:', trimmed);
  return { rows: [], rowCount: 0 };
}

export default {
  query,
  initDatabase,
};

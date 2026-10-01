import db from './config/db.js';
import bcrypt from 'bcryptjs';

export async function seedDemoData() {
  await db.initDatabase();
  const demoEmail = 'judge@vaaniflow.ai';
  const existing = await db.query('SELECT * FROM users WHERE email = $1', [demoEmail]);

  if (existing.rows.length === 0) {
    const passwordHash = await bcrypt.hash('password123', 10);
    const userResult = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      ['Hackathon Judge', demoEmail, passwordHash]
    );
    const judgeUser = userResult.rows[0];

    // Seed an initial demo conversation
    const convResult = await db.query(
      'INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING *',
      [judgeUser.id, 'Customer Service Demo (मराठी)']
    );
    const conv = convResult.rows[0];

    // Seed demo messages
    await db.query(
      'INSERT INTO messages (conversation_id, role, content, language, intent) VALUES ($1, $2, $3, $4, $5)',
      [conv.id, 'user', 'माझ्या ऑर्डरची स्थिती काय आहे?', 'mr', 'order_status_inquiry']
    );

    await db.query(
      'INSERT INTO messages (conversation_id, role, content, language, intent) VALUES ($1, $2, $3, $4, $5)',
      [conv.id, 'assistant', 'तुमची ऑर्डर #VF-8492 सध्या डिलिव्हरीसाठी बाहेर पडली आहे आणि वेळेवर पोहोचत आहे.', 'mr', 'order_status_inquiry']
    );

    console.log('[Seed] Demo judge account seeded successfully: judge@vaaniflow.ai / password123');
  } else {
    console.log('[Seed] Demo judge account already exists.');
  }
}

seedDemoData().catch(console.error);

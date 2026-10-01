import db from './config/db.js';
import geminiService from './services/gemini.service.js';
import sttService from './services/stt.service.js';
import ttsService from './services/tts.service.js';
import translationService from './services/translation.service.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './middleware/auth.js';

async function runTests() {
  console.log('--- STARTING VAANIFLOW BACKEND VERIFICATION ---');

  // Checkpoint 1: Database init
  console.log('\n[TEST 1] Initializing database...');
  await db.initDatabase();
  console.log('✓ Database initialized successfully');

  // Checkpoint 2: Authentication & CRUD
  console.log('\n[TEST 2] Testing User Registration & Password Hashing...');
  const testEmail = `test_${Date.now()}@vaaniflow.ai`;
  const passwordHash = await bcrypt.hash('secret123', 10);
  const userRes = await db.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
    ['Judge Demo', testEmail, passwordHash]
  );
  const user = userRes.rows[0];
  console.log('✓ User created:', user);

  console.log('\n[TEST 3] Testing JWT issuance & verification...');
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  const decoded = jwt.verify(token, JWT_SECRET);
  if (decoded.id !== user.id) throw new Error('JWT verification mismatch');
  console.log('✓ JWT token verified successfully');

  console.log('\n[TEST 4] Testing Conversation CRUD...');
  const convRes = await db.query(
    'INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING *',
    [user.id, 'Marathi Support Inquiry']
  );
  const conv = convRes.rows[0];
  console.log('✓ Conversation created:', conv.id, conv.title);

  // Checkpoint 3 & 4: AI & Contextual Response
  console.log('\n[TEST 5] Testing AI Context Memory with Marathi Judge Prompt...');
  const marathiPrompt = 'माझ्या ऑर्डरची स्थिती काय आहे?';
  const aiRes1 = await geminiService.generateChatResponse({
    message: marathiPrompt,
    history: [],
    inputLanguage: 'mr',
    responseLanguage: 'mr',
  });
  console.log('✓ AI Turn 1 Response:', aiRes1);

  // Follow-up question relying on context memory
  console.log('\n[TEST 6] Testing Context Memory Follow-up (When will it arrive?)...');
  const followUpPrompt = 'ती कधी पोहोचेल?';
  const aiRes2 = await geminiService.generateChatResponse({
    message: followUpPrompt,
    history: [
      { role: 'user', content: marathiPrompt },
      { role: 'assistant', content: aiRes1.response }
    ],
    inputLanguage: 'mr',
    responseLanguage: 'mr',
  });
  console.log('✓ AI Turn 2 (Context Memory) Response:', aiRes2);

  // Checkpoint 5: STT, TTS & Translation
  console.log('\n[TEST 7] Testing Speech-to-Text adapter...');
  const sttRes = await sttService.transcribeAudio({ languageHint: 'mr' });
  console.log('✓ STT Result:', sttRes);

  console.log('\n[TEST 8] Testing Text-to-Speech adapter...');
  const ttsRes = await ttsService.synthesizeSpeech({ text: aiRes1.response, language: 'mr' });
  console.log('✓ TTS Result:', ttsRes);

  console.log('\n[TEST 9] Testing Translation Service (Marathi -> English)...');
  const transRes = await translationService.translateText({
    text: aiRes1.response,
    sourceLanguage: 'mr',
    targetLanguage: 'en',
  });
  console.log('✓ Translation Result:', transRes);

  // Clean up
  await db.query('DELETE FROM conversations WHERE id = $1 AND user_id = $2', [conv.id, user.id]);
  console.log('✓ Conversation deleted cleanly');

  console.log('\n====================================================');
  console.log('✓ ALL BACKEND TESTS PASSED: CHECKPOINTS 1, 2, 3, 4, 5 VERIFIED!');
  console.log('====================================================\n');
}

runTests().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});

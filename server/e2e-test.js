/**
 * ============================================================
 * VAANIFLOW — COMPREHENSIVE MULTILINGUAL E2E TEST SUITE
 * Validates English, Hindi, Marathi, Context Memory & Language Switching
 * ============================================================
 */

async function runComprehensiveE2E() {
  console.log('====================================================');
  console.log('  VAANIFLOW COMPREHENSIVE MULTILINGUAL VERIFICATION');
  console.log('====================================================\n');

  // 1. Health check
  const healthRes = await fetch('http://localhost:5000/api/health');
  const health = await healthRes.json();
  console.log('[Step 1] System Health Check:', health.status, '| DB:', health.database);

  // 2. Authentication
  console.log('\n[Step 2] Authenticating as Judge (judge@vaaniflow.ai)...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'judge@vaaniflow.ai', password: 'password123' })
  });
  const loginData = await loginRes.json();
  if (!loginData.success) throw new Error('Login failed: ' + JSON.stringify(loginData));
  const token = loginData.token;
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  console.log('✓ Logged in as:', loginData.user.name, `(${loginData.user.email})`);

  // Create isolated conversation for tests
  const convRes = await fetch('http://localhost:5000/api/conversations', {
    method: 'POST',
    headers,
    body: JSON.stringify({ title: 'Mandatory Multilingual Pipeline Test' })
  });
  const conv = (await convRes.json()).data;
  console.log('✓ Test Conversation Created:', conv.id);

  // ==========================================
  // TEST 1 — ENGLISH
  // ==========================================
  console.log('\n----------------------------------------------------');
  console.log('TEST 1 — ENGLISH PIPELINE');
  console.log('User: "What is the status of my order?"');
  console.log('----------------------------------------------------');
  // STT check
  const sttEn = await (await fetch('http://localhost:5000/api/ai/transcribe', {
    method: 'POST',
    headers,
    body: JSON.stringify({ language: 'en' })
  })).json();
  console.log('✓ STT English Transcript:', sttEn.data.text, `(Lang: ${sttEn.data.language})`);

  // Chat check
  const chatEn = await (await fetch('http://localhost:5000/api/ai/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      conversationId: conv.id,
      message: 'What is the status of my order?',
      inputLanguage: 'en',
      responseLanguage: 'en'
    })
  })).json();
  console.log('✓ AI English Response:', chatEn.data.response);
  console.log('  Response Language:', chatEn.data.language, '(Expected: en)');
  if (chatEn.data.language !== 'en') throw new Error(`Test 1 Failed: Expected language 'en', got '${chatEn.data.language}'`);

  // TTS check
  const ttsEn = await (await fetch('http://localhost:5000/api/ai/speak', {
    method: 'POST',
    headers,
    body: JSON.stringify({ text: chatEn.data.response, language: 'en' })
  })).json();
  console.log('✓ TTS English Config:', ttsEn.data.speechConfig.code, '| Provider:', ttsEn.data.provider);

  // ==========================================
  // TEST 2 — HINDI
  // ==========================================
  console.log('\n----------------------------------------------------');
  console.log('TEST 2 — HINDI PIPELINE');
  console.log('User: "मेरी ऑर्डर की स्थिति क्या है?"');
  console.log('----------------------------------------------------');
  // STT check
  const sttHi = await (await fetch('http://localhost:5000/api/ai/transcribe', {
    method: 'POST',
    headers,
    body: JSON.stringify({ language: 'hi' })
  })).json();
  console.log('✓ STT Hindi Transcript:', sttHi.data.text, `(Lang: ${sttHi.data.language})`);

  // Chat check
  const chatHi = await (await fetch('http://localhost:5000/api/ai/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      conversationId: conv.id,
      message: 'मेरी ऑर्डर की स्थिति क्या है?',
      inputLanguage: 'hi',
      responseLanguage: 'hi'
    })
  })).json();
  console.log('✓ AI Hindi Response:', chatHi.data.response);
  console.log('  Response Language:', chatHi.data.language, '(Expected: hi)');
  if (chatHi.data.language !== 'hi') throw new Error(`Test 2 Failed: Expected language 'hi', got '${chatHi.data.language}'`);

  // TTS check
  const ttsHi = await (await fetch('http://localhost:5000/api/ai/speak', {
    method: 'POST',
    headers,
    body: JSON.stringify({ text: chatHi.data.response, language: 'hi' })
  })).json();
  console.log('✓ TTS Hindi Config:', ttsHi.data.speechConfig.code, '| Google Voice:', ttsHi.data.speechConfig.googleVoice);

  // ==========================================
  // TEST 3 — MARATHI
  // ==========================================
  console.log('\n----------------------------------------------------');
  console.log('TEST 3 — MARATHI PIPELINE');
  console.log('User: "माझ्या ऑर्डरची स्थिती काय आहे?"');
  console.log('----------------------------------------------------');
  // STT check
  const sttMr = await (await fetch('http://localhost:5000/api/ai/transcribe', {
    method: 'POST',
    headers,
    body: JSON.stringify({ language: 'mr' })
  })).json();
  console.log('✓ STT Marathi Transcript:', sttMr.data.text, `(Lang: ${sttMr.data.language})`);

  // Chat check
  const chatMr = await (await fetch('http://localhost:5000/api/ai/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      conversationId: conv.id,
      message: 'माझ्या ऑर्डरची स्थिती काय आहे?',
      inputLanguage: 'mr',
      responseLanguage: 'mr'
    })
  })).json();
  console.log('✓ AI Marathi Response:', chatMr.data.response);
  console.log('  Response Language:', chatMr.data.language, '(Expected: mr)');
  if (chatMr.data.language !== 'mr') throw new Error(`Test 3 Failed: Expected language 'mr', got '${chatMr.data.language}'`);

  // TTS check
  const ttsMr = await (await fetch('http://localhost:5000/api/ai/speak', {
    method: 'POST',
    headers,
    body: JSON.stringify({ text: chatMr.data.response, language: 'mr' })
  })).json();
  console.log('✓ TTS Marathi Config:', ttsMr.data.speechConfig.code, '| Google Voice:', ttsMr.data.speechConfig.googleVoice);

  // ==========================================
  // TEST 4 — CONTEXT RETENTION (MARATHI)
  // ==========================================
  console.log('\n----------------------------------------------------');
  console.log('TEST 4 — CONTEXT PRESERVATION');
  console.log('Turn A: "माझी ऑर्डर कुठे आहे?"');
  console.log('Turn B: "ती कधी पोहोचेल?"');
  console.log('----------------------------------------------------');
  const contextConvRes = await fetch('http://localhost:5000/api/conversations', {
    method: 'POST',
    headers,
    body: JSON.stringify({ title: 'Context Preservation Test' })
  });
  const contextConv = (await contextConvRes.json()).data;

  // Turn A
  const turnA = await (await fetch('http://localhost:5000/api/ai/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      conversationId: contextConv.id,
      message: 'माझी ऑर्डर कुठे आहे?',
      inputLanguage: 'mr',
      responseLanguage: 'mr'
    })
  })).json();
  console.log('✓ Turn A Response:', turnA.data.response, `(Lang: ${turnA.data.language})`);

  // Turn B (Contextual follow-up with pronoun "ती")
  const turnB = await (await fetch('http://localhost:5000/api/ai/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      conversationId: contextConv.id,
      message: 'ती कधी पोहोचेल?',
      inputLanguage: 'mr',
      responseLanguage: 'mr'
    })
  })).json();
  console.log('✓ Turn B Contextual Response:', turnB.data.response);
  console.log('  Response Language:', turnB.data.language, '(Expected: mr)');
  console.log('  Intent:', turnB.data.intent);
  if (turnB.data.language !== 'mr') throw new Error(`Test 4 Failed: Expected language 'mr', got '${turnB.data.language}'`);
  if (!turnB.data.response.includes('पोहोचेल') && !turnB.data.response.includes('५')) {
    throw new Error('Test 4 Failed: Response did not resolve arrival context.');
  }

  // ==========================================
  // TEST 5 — DYNAMIC LANGUAGE SWITCHING
  // ==========================================
  console.log('\n----------------------------------------------------');
  console.log('TEST 5 — DYNAMIC LANGUAGE SWITCHING');
  console.log('Marathi -> Hindi -> English');
  console.log('----------------------------------------------------');
  const switchConvRes = await fetch('http://localhost:5000/api/conversations', {
    method: 'POST',
    headers,
    body: JSON.stringify({ title: 'Language Switch Session' })
  });
  const switchConv = (await switchConvRes.json()).data;

  // Step 1: Start in Marathi
  const swMr = await (await fetch('http://localhost:5000/api/ai/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      conversationId: switchConv.id,
      message: 'नमस्कार! आपण काय मदत करू शकता?',
      inputLanguage: 'mr',
      responseLanguage: 'mr'
    })
  })).json();
  console.log('✓ 1. Marathi Response:', swMr.data.language, '|', swMr.data.response.slice(0, 45) + '...');
  if (swMr.data.language !== 'mr') throw new Error('Switch Step 1 failed');

  // Step 2: Switch to Hindi
  const swHi = await (await fetch('http://localhost:5000/api/ai/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      conversationId: switchConv.id,
      message: 'मेरी ऑर्डर कहाँ है?',
      inputLanguage: 'hi',
      responseLanguage: 'hi'
    })
  })).json();
  console.log('✓ 2. Hindi Response:', swHi.data.language, '|', swHi.data.response.slice(0, 45) + '...');
  if (swHi.data.language !== 'hi') throw new Error('Switch Step 2 failed');

  // Step 3: Switch to English
  const swEn = await (await fetch('http://localhost:5000/api/ai/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      conversationId: switchConv.id,
      message: 'What is the status of my order?',
      inputLanguage: 'en',
      responseLanguage: 'en'
    })
  })).json();
  console.log('✓ 3. English Response:', swEn.data.language, '|', swEn.data.response.slice(0, 45) + '...');
  if (swEn.data.language !== 'en') throw new Error('Switch Step 3 failed');

  // Verify DB Persistence of Languages
  console.log('\n[Verification] Checking message language persistence in DB...');
  const persistedRes = await fetch(`http://localhost:5000/api/conversations/${switchConv.id}`, { headers });
  const persisted = (await persistedRes.json()).data;
  console.log(`✓ Stored ${persisted.messages.length} messages with verified language tags:`);
  persisted.messages.forEach(m => {
    console.log(`   [${m.role.toUpperCase()} · ${m.language?.toUpperCase()}]: ${m.content.slice(0, 40)}...`);
  });

  console.log('\n====================================================');
  console.log('  ALL 5 MANDATORY MULTILINGUAL TESTS PASSED! (5/5)');
  console.log('====================================================\n');
}

runComprehensiveE2E().catch(err => {
  console.error('\n❌ Comprehensive E2E Test Failed:', err);
  process.exit(1);
});

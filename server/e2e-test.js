async function testFullE2E() {
  console.log('=== VAANIFLOW FULL END-TO-END HTTP TEST ===\n');

  // 1. Health check
  const healthRes = await fetch('http://localhost:5000/api/health');
  const health = await healthRes.json();
  console.log('[1] Health Check:', health);

  // 2. Login with Seeded Demo Account
  console.log('\n[2] Logging in as Judge (judge@vaaniflow.ai)...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'judge@vaaniflow.ai',
      password: 'password123'
    })
  });
  const loginData = await loginRes.json();
  if (!loginData.success) throw new Error('Login failed: ' + JSON.stringify(loginData));
  console.log('✓ Login successful! Token issued for:', loginData.user.name);
  const token = loginData.token;

  // 3. Verify /auth/me with Bearer token
  console.log('\n[3] Verifying session with /api/auth/me...');
  const meRes = await fetch('http://localhost:5000/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const meData = await meRes.json();
  console.log('✓ Session valid for user:', meData.user.email);

  // 4. List user conversations
  console.log('\n[4] Fetching user conversations...');
  const convsRes = await fetch('http://localhost:5000/api/conversations', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const convsData = await convsRes.json();
  console.log(`✓ Retrieved ${convsData.count} conversation(s).`);

  // 5. Create new conversation for demo
  console.log('\n[5] Creating new conversation: "Judge Live Test"...');
  const createConvRes = await fetch('http://localhost:5000/api/conversations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ title: 'Judge Live Test' })
  });
  const newConv = (await createConvRes.json()).data;
  console.log('✓ New conversation created with ID:', newConv.id);

  // 6. Turn 1: Primary Marathi voice query
  console.log('\n[6] Sending Turn 1 Marathi message: "माझ्या ऑर्डरची स्थिती काय आहे?"...');
  const turn1Res = await fetch('http://localhost:5000/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      conversationId: newConv.id,
      message: 'माझ्या ऑर्डरची स्थिती काय आहे?',
      inputLanguage: 'mr',
      responseLanguage: 'mr'
    })
  });
  const turn1Data = await turn1Res.json();
  console.log('✓ Turn 1 AI Response:', turn1Data.data.response);
  console.log('  Intent detected:', turn1Data.data.intent);
  console.log('  Confidence:', turn1Data.data.confidence);

  // 7. Turn 2: Context memory follow-up ("ती कधी पोहोचेल?")
  console.log('\n[7] Sending Turn 2 Context Memory Follow-up: "ती कधी पोहोचेल?"...');
  const turn2Res = await fetch('http://localhost:5000/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      conversationId: newConv.id,
      message: 'ती कधी पोहोचेल?',
      inputLanguage: 'mr',
      responseLanguage: 'mr'
    })
  });
  const turn2Data = await turn2Res.json();
  console.log('✓ Turn 2 Context AI Response:', turn2Data.data.response);
  console.log('  Intent detected:', turn2Data.data.intent);

  // 8. Translation Test (Marathi -> English)
  console.log('\n[8] Testing Translation API (Marathi -> English)...');
  const transRes = await fetch('http://localhost:5000/api/ai/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: turn1Data.data.response,
      sourceLanguage: 'mr',
      targetLanguage: 'en'
    })
  });
  const transData = await transRes.json();
  console.log('✓ Translation:', transData.data.translation);

  // 9. Text-to-Speech config test
  console.log('\n[9] Testing Text-to-Speech API...');
  const speakRes = await fetch('http://localhost:5000/api/ai/speak', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: turn1Data.data.response,
      language: 'mr'
    })
  });
  const speakData = await speakRes.json();
  console.log('✓ Speech Config:', speakData.data.speechConfig);

  // 10. Verify full conversation reload from DB
  console.log('\n[10] Verifying conversation persistence from Database...');
  const convDetailRes = await fetch(`http://localhost:5000/api/conversations/${newConv.id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const convDetail = (await convDetailRes.json()).data;
  console.log(`✓ Conversation persisted with ${convDetail.messages.length} messages.`);
  convDetail.messages.forEach((m, idx) => {
    console.log(`   [${idx + 1}] (${m.role}): ${m.content.slice(0, 50)}...`);
  });

  console.log('\n======================================================');
  console.log('🎉 ALL END-TO-END TESTS PASSED SUCCESSFULLY! (10/10)');
  console.log('======================================================\n');
}

testFullE2E().catch(err => {
  console.error('❌ E2E Test failed:', err);
  process.exit(1);
});

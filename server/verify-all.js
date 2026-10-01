import dotenv from 'dotenv';
dotenv.config();

async function verifyAll() {
  console.log('====================================================');
  console.log('  LIVE INTEGRATION VERIFICATION: SUPABASE, MURF & GEMINI');
  console.log('====================================================\n');

  console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
  console.log('MURF_API_KEY:', process.env.MURF_API_KEY ? 'Present' : 'Missing');
  console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');

  // 1. Test Supabase Client & Database
  console.log('\n[1] Testing Supabase Client...');
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
  );

  const { data: convData, error: convErr } = await supabase.from('conversations').select('id').limit(1);
  console.log('✓ Supabase Query Status:', convErr ? `Notice: ${convErr.message}` : `Success (${convData?.length || 0} rows found)`);

  // 2. Test Murf AI
  console.log('\n[2] Testing Murf AI Voices API...');
  const murfKey = process.env.MURF_API_KEY;
  try {
    const murfRes = await fetch('https://api.murf.ai/v1/speech/voices', {
      headers: {
        'api-key': murfKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('Murf HTTP Status:', murfRes.status);
    if (murfRes.ok) {
      const voices = await murfRes.json();
      const list = Array.isArray(voices) ? voices : (voices.voices || []);
      console.log('✓ Murf catalog retrieved:', list.length, 'voices total.');
      const mrVoices = list.filter(v => (v.locale || v.language || '').toLowerCase().includes('mr'));
      const hiVoices = list.filter(v => (v.locale || v.language || '').toLowerCase().includes('hi'));
      const enVoices = list.filter(v => (v.locale || v.language || '').toLowerCase().includes('en'));
      console.log('  Marathi voices in Murf:', mrVoices.length > 0 ? mrVoices.map(v => v.voiceId || v.name) : 'Will use multilingual engine / fallback');
      console.log('  Hindi voices in Murf:', hiVoices.map(v => v.voiceId || v.name).slice(0, 5));
      console.log('  English voices in Murf:', enVoices.map(v => v.voiceId || v.name).slice(0, 5));
    } else {
      console.warn('Murf Response Notice:', await murfRes.text());
    }
  } catch (err) {
    console.warn('Murf exception:', err.message);
  }

  // 3. Test Gemini API
  console.log('\n[3] Testing Gemini 2.0 Flash API...');
  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Hello, respond with: "VaaniFlow Ready"' }] }]
      })
    });
    console.log('Gemini HTTP Status:', geminiRes.status);
    if (geminiRes.ok) {
      const gData = await geminiRes.json();
      console.log('✓ Gemini Live Output:', gData.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
    } else {
      console.warn('Gemini Notice:', await geminiRes.text());
    }
  } catch (err) {
    console.warn('Gemini exception:', err.message);
  }
}

verifyAll();

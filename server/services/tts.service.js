/**
 * ============================================================
 * VAANIFLOW — TEXT-TO-SPEECH (TTS) SERVICE ADAPTER
 * High-Quality Multilingual Spoken Response Engine
 * ============================================================
 */

const LANGUAGE_VOICE_MAP = {
  mr: { code: 'mr-IN', name: 'Marathi (India)', pitch: 1.0, rate: 0.95 },
  hi: { code: 'hi-IN', name: 'Hindi (India)', pitch: 1.0, rate: 0.95 },
  en: { code: 'en-US', name: 'English (United States)', pitch: 1.0, rate: 1.0 },
};

/**
 * Generate speech synthesis payload and audio representation
 */
export async function synthesizeSpeech({ text, language = 'mr' }) {
  const langKey = language.toLowerCase().slice(0, 2);
  const voiceConfig = LANGUAGE_VOICE_MAP[langKey] || LANGUAGE_VOICE_MAP.en;

  // If a dedicated TTS API key is configured (e.g. Google Cloud TTS or ElevenLabs),
  // we can call that provider here.
  const ttsKey = process.env.TTS_API_KEY;

  if (ttsKey && !ttsKey.includes('placeholder')) {
    try {
      // Optional external provider invocation
      // e.g. Google Cloud Text-to-Speech REST endpoint
      const googleTtsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${ttsKey}`;
      const response = await fetch(googleTtsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: voiceConfig.code,
            ssmlGender: 'FEMALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: voiceConfig.rate
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioContent) {
          return {
            success: true,
            language: langKey,
            audioBase64: `data:audio/mp3;base64,${data.audioContent}`,
            speechConfig: voiceConfig,
            provider: 'google_cloud_tts'
          };
        }
      }
    } catch (err) {
      console.warn('[TTS Service] External TTS provider failed, falling back:', err.message);
    }
  }

  // Return formatted speech synthesis parameters and ready audio instructions
  return {
    success: true,
    text,
    language: langKey,
    speechConfig: voiceConfig,
    provider: 'browser_speech_synthesis',
    audioBase64: null, // Frontend will utilize high-fidelity Web Speech API with native voice
  };
}

export default {
  synthesizeSpeech,
};

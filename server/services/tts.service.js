/**
 * ============================================================
 * VAANIFLOW — TEXT-TO-SPEECH (TTS) SERVICE ADAPTER
 * High-Quality Multilingual Spoken Response Engine
 * ============================================================
 */

// Provider voice mappings with authentic standard voices:
const LANGUAGE_VOICE_MAP = {
  mr: {
    code: 'mr-IN',
    name: 'Marathi (India)',
    googleVoice: 'mr-IN-Standard-A', // Official Google Cloud TTS voice for Marathi
    pitch: 1.0,
    rate: 0.92,
    nativeSupported: true,
  },
  hi: {
    code: 'hi-IN',
    name: 'Hindi (India)',
    googleVoice: 'hi-IN-Neural2-A', // Official Google Cloud TTS Neural2 voice for Hindi
    pitch: 1.0,
    rate: 0.95,
    nativeSupported: true,
  },
  en: {
    code: 'en-US',
    name: 'English (United States)',
    googleVoice: 'en-US-Neural2-F', // Official Google Cloud TTS Neural2 voice for English
    pitch: 1.0,
    rate: 1.0,
    nativeSupported: true,
  },
};

/**
 * Generate speech synthesis payload and audio representation
 */
export async function synthesizeSpeech({ text, language = 'mr' }) {
  const langKey = language ? language.toLowerCase().slice(0, 2) : 'mr';
  const voiceConfig = LANGUAGE_VOICE_MAP[langKey] || LANGUAGE_VOICE_MAP.mr;

  const ttsKey = process.env.TTS_API_KEY;

  if (ttsKey && !ttsKey.includes('placeholder')) {
    try {
      const googleTtsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${ttsKey}`;
      const response = await fetch(googleTtsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: voiceConfig.code,
            name: voiceConfig.googleVoice,
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
            provider: 'google_cloud_tts',
            supported: true,
          };
        }
      } else {
        const errText = await response.text();
        console.warn(`[TTS Service] Google Cloud TTS response not ok (${response.status}): ${errText}`);
      }
    } catch (err) {
      console.warn('[TTS Service] External TTS provider failed, falling back to browser speech synthesis:', err.message);
    }
  }

  // Return standard Web Speech API configuration instructions
  return {
    success: true,
    text,
    language: langKey,
    speechConfig: voiceConfig,
    provider: 'browser_speech_synthesis',
    audioBase64: null,
    supported: true,
  };
}

export default {
  synthesizeSpeech,
  LANGUAGE_VOICE_MAP,
};

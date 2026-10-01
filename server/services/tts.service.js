/**
 * ============================================================
 * VAANIFLOW — TEXT-TO-SPEECH (TTS) SERVICE ADAPTER
 * Multilingual Spoken Response Engine with Murf AI Integration
 * ============================================================
 */

import murfService from './murf.service.js';

// Provider voice mappings with authentic standard voices:
const LANGUAGE_VOICE_MAP = {
  mr: {
    code: 'mr-IN',
    name: 'Marathi (India)',
    googleVoice: 'mr-IN-Standard-A',
    murfVoice: 'hi-IN-kabir',
    pitch: 1.0,
    rate: 0.92,
    nativeSupported: true,
  },
  hi: {
    code: 'hi-IN',
    name: 'Hindi (India)',
    googleVoice: 'hi-IN-Neural2-A',
    murfVoice: 'hi-IN-kabir',
    pitch: 1.0,
    rate: 0.95,
    nativeSupported: true,
  },
  en: {
    code: 'en-IN',
    name: 'English (India)',
    googleVoice: 'en-IN-Neural2-A',
    murfVoice: 'en-IN-aarav',
    pitch: 1.0,
    rate: 1.0,
    nativeSupported: true,
  },
};

/**
 * Generate speech synthesis payload and audio representation
 * Primary Engine: Murf AI (when MURF_API_KEY is configured)
 * Secondary Engine: Google Cloud TTS (when TTS_API_KEY is configured)
 * Standard Fallback: Browser Web Speech API with authentic voice configs
 */
export async function synthesizeSpeech({ text, language = 'mr', voiceId = null }) {
  const langKey = language ? language.toLowerCase().slice(0, 2) : 'mr';
  const voiceConfig = LANGUAGE_VOICE_MAP[langKey] || LANGUAGE_VOICE_MAP.mr;

  // 1. PRIMARY: Murf AI Voice Generation
  const murfKey = process.env.MURF_API_KEY;
  if (murfKey && !murfKey.includes('placeholder')) {
    try {
      const murfResult = await murfService.generateSpeech({
        text,
        language: langKey,
        voiceId: voiceId || voiceConfig.murfVoice,
      });

      if (murfResult.success) {
        return {
          success: true,
          language: langKey,
          audioUrl: murfResult.audioUrl,
          audioBase64: murfResult.audioBase64,
          audioLengthInSeconds: murfResult.audioLengthInSeconds,
          speechConfig: {
            ...voiceConfig,
            voiceId: murfResult.voiceId,
          },
          provider: 'murf_ai',
          supported: true,
        };
      } else {
        console.warn('[TTS Service] Murf AI attempt failed, trying fallbacks:', murfResult.message || murfResult.reason);
      }
    } catch (murfErr) {
      console.warn('[TTS Service] Murf AI exception, falling back:', murfErr.message);
    }
  }

  // 2. SECONDARY: Google Cloud Text-to-Speech API
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
            audioUrl: null,
            speechConfig: voiceConfig,
            provider: 'google_cloud_tts',
            supported: true,
          };
        }
      }
    } catch (err) {
      console.warn('[TTS Service] Google Cloud TTS failed, falling back:', err.message);
    }
  }

  // 3. TERTIARY / RESILIENCE: Web Speech API Browser configuration
  return {
    success: true,
    text,
    language: langKey,
    speechConfig: voiceConfig,
    provider: 'browser_speech_synthesis',
    audioBase64: null,
    audioUrl: null,
    supported: true,
  };
}

export default {
  synthesizeSpeech,
  LANGUAGE_VOICE_MAP,
};

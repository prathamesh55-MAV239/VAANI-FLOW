/**
 * ============================================================
 * VAANIFLOW — MURF AI VOICE SYNTHESIS SERVICE
 * Studio-Grade Multilingual Voice Generation via Murf API
 * ============================================================
 */

// Default Murf voice mapping for supported languages
const DEFAULT_MURF_VOICES = {
  mr: {
    locale: 'mr-IN',
    voiceId: 'mr-IN-aarav',
    displayName: 'Murf Marathi (Aarav)',
    style: 'Conversational',
  },
  hi: {
    locale: 'hi-IN',
    voiceId: 'hi-IN-kabir',
    displayName: 'Murf Hindi (Kabir)',
    style: 'Conversational',
  },
  en: {
    locale: 'en-US',
    voiceId: 'en-US-marcus',
    displayName: 'Murf English (Marcus)',
    style: 'Conversational',
  },
};

// In-memory cache for Murf voices retrieved from API
let cachedVoices = null;
let lastCacheTime = 0;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetch available voices from Murf API
 */
export async function getVoices(apiKey = process.env.MURF_API_KEY) {
  if (!apiKey || apiKey.includes('placeholder')) {
    return Object.values(DEFAULT_MURF_VOICES);
  }

  const now = Date.now();
  if (cachedVoices && now - lastCacheTime < CACHE_DURATION_MS) {
    return cachedVoices;
  }

  try {
    const response = await fetch('https://api.murf.ai/v1/speech/voices', {
      method: 'GET',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const voicesList = Array.isArray(data) ? data : data.voices || [];
      if (voicesList.length > 0) {
        cachedVoices = voicesList;
        lastCacheTime = now;
        console.log(`[Murf AI] Successfully retrieved ${voicesList.length} voices from Murf catalog.`);
        return cachedVoices;
      }
    } else {
      const errText = await response.text();
      console.warn(`[Murf AI] Failed to fetch voice catalog (${response.status}): ${errText}`);
    }
  } catch (err) {
    console.warn('[Murf AI] Error querying Murf voice catalog:', err.message);
  }

  return Object.values(DEFAULT_MURF_VOICES);
}

/**
 * Resolve optimal Murf voiceId for a given language code
 */
export async function resolveVoiceId(langCode = 'mr') {
  const langKey = langCode ? langCode.toLowerCase().slice(0, 2) : 'mr';
  const targetLocale = langKey === 'mr' ? 'mr-IN' : langKey === 'hi' ? 'hi-IN' : 'en-US';

  const defaultVoice = DEFAULT_MURF_VOICES[langKey] || DEFAULT_MURF_VOICES.mr;

  try {
    const allVoices = await getVoices();
    if (Array.isArray(allVoices) && allVoices.length > 0) {
      // Look for a voice matching target locale or language
      const matched = allVoices.find((v) => {
        const vLocale = (v.locale || v.language || '').toLowerCase().replace('_', '-');
        return vLocale === targetLocale.toLowerCase() || vLocale.startsWith(langKey);
      });

      if (matched && (matched.voiceId || matched.id)) {
        return matched.voiceId || matched.id;
      }
    }
  } catch (err) {
    console.warn('[Murf AI] Voice resolution fallback:', err.message);
  }

  return defaultVoice.voiceId;
}

/**
 * Generate high-fidelity speech audio using Murf AI API
 */
export async function generateSpeech({ text, language = 'mr', voiceId = null }) {
  const apiKey = process.env.MURF_API_KEY;

  if (!apiKey || apiKey.includes('placeholder')) {
    return {
      success: false,
      reason: 'no_murf_api_key',
      message: 'MURF_API_KEY is not configured.',
    };
  }

  const langKey = language ? language.toLowerCase().slice(0, 2) : 'mr';
  const resolvedVoiceId = voiceId || (await resolveVoiceId(langKey));

  try {
    const endpoint = 'https://api.murf.ai/v1/speech/generate';

    const payload = {
      voiceId: resolvedVoiceId,
      text: text.trim(),
      format: 'MP3',
      rate: 0,
      pitch: 0,
      sampleRate: 44100,
    };

    console.log(`[Murf AI] Generating speech in "${langKey}" using voice "${resolvedVoiceId}"...`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[Murf AI API Error] (${response.status}): ${errorText}`);
      return {
        success: false,
        reason: 'murf_api_error',
        status: response.status,
        message: errorText,
      };
    }

    const data = await response.json();

    // Murf returns audioFile (URL) and audioLengthInSeconds
    const audioUrl = data.audioFile || data.url || data.audio_url;
    let audioBase64 = data.encodedAudio ? `data:audio/mp3;base64,${data.encodedAudio}` : null;

    // If audioFile URL is returned and base64 is missing, fetch and convert to base64
    if (audioUrl && !audioBase64) {
      try {
        const audioFetch = await fetch(audioUrl);
        if (audioFetch.ok) {
          const arrayBuffer = await audioFetch.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          audioBase64 = `data:audio/mp3;base64,${buffer.toString('base64')}`;
        }
      } catch (fetchErr) {
        console.warn('[Murf AI] Could not buffer audio URL to base64:', fetchErr.message);
      }
    }

    return {
      success: true,
      provider: 'murf_ai',
      language: langKey,
      voiceId: resolvedVoiceId,
      audioUrl: audioUrl || null,
      audioBase64: audioBase64 || null,
      audioLengthInSeconds: data.audioLengthInSeconds || null,
    };
  } catch (error) {
    console.error('[Murf AI Exception]', error);
    return {
      success: false,
      reason: 'murf_exception',
      message: error.message,
    };
  }
}

export default {
  generateSpeech,
  getVoices,
  resolveVoiceId,
  DEFAULT_MURF_VOICES,
};

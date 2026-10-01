/**
 * ============================================================
 * VAANIFLOW — MULTILINGUAL LANGUAGE DETERMINATION ENGINE
 * Robust text/script analysis and language preservation utility
 * ============================================================
 */

// Devanagari character range: U+0900 to U+097F
const DEVANAGARI_REGEX = /[\u0900-\u097F]/;
// English / Latin character range:
const LATIN_REGEX = /[a-zA-Z]/;

// Marathi distinct lexical markers & grammar patterns
const MARATHI_MARKERS = [
  'आहे', 'आहेत', 'नाही', 'नाहीत', 'नाहि', 'होते', 'होती',
  'माझ्या', 'माझी', 'माझे', 'माझा',
  'तुमची', 'तुमचा', 'तुमचे', 'तुमच्या',
  'कधी', 'पोहोचेल', 'पोचेल', 'कसे', 'कशी', 'कसा',
  'काय', 'केव्हा', 'कुठे', 'कुठं',
  'सांगा', 'करा', 'करावे', 'होय', 'मला', 'आपण',
  'दिला', 'दिली', 'दिले', 'झाली', 'झाला', 'झाले',
  'पाहिजे', 'पाहिजेस', 'हवे', 'हवी',
  'नमस्कार', 'हॅलो', 'मित्रा', 'कृपया', 'धन्यवाद',
  'स्थिती', 'स्थितीबद्दल', 'सांगू', 'शकता'
];

// Hindi distinct lexical markers & grammar patterns
const HINDI_MARKERS = [
  'है', 'हैं', 'नहीं', 'नही', 'था', 'थी', 'थे',
  'मेरी', 'मेरा', 'मेरे',
  'आपकी', 'आपका', 'आपके',
  'कब', 'पहुंचेगा', 'पहुँचेगा', 'आएगा', 'आएगी', 'आएंगे',
  'क्या', 'कैसे', 'कैसी', 'कैसा',
  'कहाँ', 'कहा', 'किधर',
  'बताएं', 'बताओ', 'बताइए', 'करें', 'करो', 'कीजिए',
  'हाँ', 'मुझे', 'हूँ', 'हुँ',
  'नमस्ते', 'प्रणाम', 'शुक्रिया',
  'स्थिति', 'बारे', 'सकते', 'सकता'
];

/**
 * Detect language from text content
 * Returns 'mr' | 'hi' | 'en'
 */
export function detectLanguageFromText(text, fallback = 'en') {
  if (!text || typeof text !== 'string') {
    return fallback;
  }

  const cleanText = text.trim();
  if (!cleanText) {
    return fallback;
  }

  const hasDevanagari = DEVANAGARI_REGEX.test(cleanText);

  // If text contains Devanagari script
  if (hasDevanagari) {
    // 1. Marathi unique character check: 'ळ' (U+0933) is extensively used in Marathi and absent in modern standard Hindi
    if (cleanText.includes('\u0933') || cleanText.includes('ळ')) {
      return 'mr';
    }

    const lowerText = cleanText.toLowerCase();

    // 2. Score Marathi vs Hindi distinctive word markers
    let marathiScore = 0;
    let hindiScore = 0;

    for (const marker of MARATHI_MARKERS) {
      if (lowerText.includes(marker)) {
        marathiScore += marker.length >= 4 ? 2 : 1;
      }
    }

    for (const marker of HINDI_MARKERS) {
      if (lowerText.includes(marker)) {
        hindiScore += marker.length >= 4 ? 2 : 1;
      }
    }

    if (marathiScore > hindiScore) {
      return 'mr';
    }
    if (hindiScore > marathiScore) {
      return 'hi';
    }

    // If ambiguous Devanagari (e.g. only "ऑर्डर"), check fallback preference
    if (fallback === 'mr' || fallback === 'hi') {
      return fallback;
    }

    // Default Devanagari to Marathi for VaaniFlow
    return 'mr';
  }

  // If text contains Latin letters, it's English
  if (LATIN_REGEX.test(cleanText)) {
    return 'en';
  }

  return fallback;
}

/**
 * Determine effective inputLanguage and responseLanguage for an AI request
 * Priority:
 * 1. Text-based detection if text is clearly Indic (Devanagari) or English
 * 2. Explicit user selection from client header/request body
 * 3. Fallback default
 */
export function determineLanguages(message, explicitInputLang, explicitResponseLang, defaultLang = 'mr') {
  // If user explicitly picked a language and message matches or is general
  const fallback = explicitInputLang && ['en', 'hi', 'mr'].includes(explicitInputLang)
    ? explicitInputLang
    : defaultLang;

  const detectedInputLang = detectLanguageFromText(message, fallback);

  // Determine final input language:
  // If the user typed in Devanagari, the detected script (mr or hi) must take precedence
  // over a stale English default.
  let finalInputLang = detectedInputLang;

  // If explicit user selection is provided and both are Devanagari (e.g. user selected 'mr' and text is 'ऑर्डर'):
  if (explicitInputLang && DEVANAGARI_REGEX.test(message)) {
    // If the explicit selection was 'mr' or 'hi', keep it unless detected has high distinct confidence
    if (explicitInputLang === 'mr' || explicitInputLang === 'hi') {
      finalInputLang = detectedInputLang;
    }
  }

  // Response language defaults to the input language to satisfy:
  // English input -> English response
  // Hindi input -> Hindi response
  // Marathi input -> Marathi response
  let finalResponseLang = finalInputLang;

  // If client explicitly requested a different response language (e.g. user selected target language in UI)
  if (explicitResponseLang && ['en', 'hi', 'mr'].includes(explicitResponseLang)) {
    // If explicit responseLanguage was sent and is not the default stale 'en' when input is Indic
    if (!(explicitResponseLang === 'en' && (finalInputLang === 'mr' || finalInputLang === 'hi'))) {
      finalResponseLang = explicitResponseLang;
    } else {
      // If user spoke Hindi or Marathi, do NOT silently fall back to English responseLanguage
      finalResponseLang = finalInputLang;
    }
  }

  return {
    inputLanguage: finalInputLang,
    responseLanguage: finalResponseLang,
  };
}

export default {
  detectLanguageFromText,
  determineLanguages,
};

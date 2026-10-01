import { useState, useEffect, useRef, useCallback } from 'react';
import { aiService } from '../services/api';

export const LANG_BCP47 = {
  mr: 'mr-IN',
  hi: 'hi-IN',
  en: 'en-US',
};

export const LANG_NAMES = {
  mr: 'मराठी',
  hi: 'हिंदी',
  en: 'English',
};

export function useVoice() {
  const [voiceState, setVoiceState] = useState('IDLE'); // 'IDLE' | 'LISTENING' | 'TRANSCRIBING' | 'THINKING' | 'RESPONDING' | 'SPEAKING' | 'COMPLETED' | 'ERROR'
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingLanguage, setSpeakingLanguage] = useState(null);
  const [voiceError, setVoiceError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [availableVoices, setAvailableVoices] = useState([]);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Check voice synthesis support and load available device voices
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition && !navigator.mediaDevices?.getUserMedia) {
      setIsSupported(false);
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setAvailableVoices(voices);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  /**
   * Honest device voice check:
   * Returns whether a genuine voice is installed on this OS/browser for the target language.
   */
  const checkVoiceSupport = useCallback((langCode = 'mr') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }
    const voices = window.speechSynthesis.getVoices();
    const bcp47 = LANG_BCP47[langCode] || 'mr-IN';
    const langKey = langCode.toLowerCase().slice(0, 2);

    return voices.some((v) => {
      const vLang = v.lang.replace('_', '-').toLowerCase();
      return vLang === bcp47.toLowerCase() || vLang.startsWith(langKey);
    });
  }, []);

  /**
   * Start listening for voice input
   */
  const startListening = useCallback((langCode = 'mr', onFinalTranscript = null) => {
    setVoiceError(null);
    setTranscript('');
    setInterimTranscript('');
    setVoiceState('LISTENING');

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = LANG_BCP47[langCode] || 'mr-IN';

        recognition.onstart = () => {
          setIsListening(true);
          setVoiceState('LISTENING');
        };

        recognition.onresult = (event) => {
          let currentInterim = '';
          let currentFinal = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptText = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              currentFinal += transcriptText;
            } else {
              currentInterim += transcriptText;
            }
          }

          if (currentInterim) {
            setInterimTranscript(currentInterim);
          }
          if (currentFinal) {
            setVoiceState('TRANSCRIBING');
            setTranscript(currentFinal);
            setInterimTranscript('');
            if (onFinalTranscript) {
              onFinalTranscript(currentFinal);
            }
          }
        };

        recognition.onerror = (event) => {
          console.warn('[Speech Recognition Error]', event.error);
          setIsListening(false);
          setVoiceState('ERROR');

          if (event.error === 'not-allowed') {
            setVoiceError('Microphone permission was denied. Please allow microphone access or type your message.');
          } else if (event.error === 'no-speech') {
            setVoiceError('No speech detected. Please tap and speak clearly.');
            setTimeout(() => setVoiceState('IDLE'), 2500);
          } else {
            setVoiceError(`Voice input error: ${event.error}`);
            setTimeout(() => setVoiceState('IDLE'), 2500);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch (err) {
        console.warn('[Web Speech Error] Initializing fallback audio recorder:', err.message);
      }
    }

    // Fallback: Audio recording via MediaRecorder
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          setIsListening(true);
          setVoiceState('LISTENING');
          const recorder = new MediaRecorder(stream);
          audioChunksRef.current = [];

          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };

          recorder.onstop = async () => {
            setIsListening(false);
            setVoiceState('TRANSCRIBING');
            stream.getTracks().forEach((track) => track.stop());

            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64Audio = reader.result;
              try {
                const res = await aiService.transcribe({
                  audio: base64Audio,
                  mimeType: 'audio/webm',
                  language: langCode,
                });
                if (res.success && res.data?.text) {
                  setTranscript(res.data.text);
                  setVoiceState('COMPLETED');
                  if (onFinalTranscript) {
                    onFinalTranscript(res.data.text);
                  }
                }
              } catch (e) {
                setVoiceState('ERROR');
                setVoiceError('Speech recognition failed. Please type your message.');
              }
            };
          };

          mediaRecorderRef.current = recorder;
          recorder.start();
        })
        .catch((err) => {
          console.error('[Microphone Access Denied]', err);
          setVoiceState('ERROR');
          setVoiceError('Microphone permission was denied. Please allow microphone access in your browser.');
          setIsListening(false);
        });
    } else {
      setVoiceState('ERROR');
      setVoiceError('Voice input is not supported in this browser.');
    }
  }, []);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  }, []);

  /**
   * Speak response using Text-To-Speech with honest voice detection
   * Never falls back to English voice for Hindi/Marathi text
   */
  const speak = useCallback((text, langCode = 'mr') => {
    if (!text) return { success: false, reason: 'empty_text' };

    // Cancel any active speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const bcp47 = LANG_BCP47[langCode] || 'mr-IN';
      const langKey = langCode.toLowerCase().slice(0, 2);
      const voices = window.speechSynthesis.getVoices();

      // Find authentic matching voice
      const matchVoice = voices.find((v) => {
        const vLang = v.lang.replace('_', '-').toLowerCase();
        return vLang === bcp47.toLowerCase() || vLang.startsWith(langKey);
      });

      // HONEST MULTILINGUAL RULE:
      // If user is receiving Marathi or Hindi response, and no native voice exists on this device,
      // DO NOT play an English voice! Preserve the text response and display clear state.
      if (!matchVoice && (langKey === 'mr' || langKey === 'hi')) {
        console.warn(`[TTS] No native ${langCode} voice found on device. Preserving text response without corrupted audio.`);
        setVoiceError(`Native ${LANG_NAMES[langKey]} voice is not installed on this device. You can read the response above.`);
        return {
          success: false,
          reason: 'voice_unavailable',
          lang: langKey,
          text
        };
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = bcp47;
      if (matchVoice) {
        utterance.voice = matchVoice;
      }
      utterance.rate = langKey === 'en' ? 1.0 : 0.92;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpeakingLanguage(langKey);
        setVoiceState('SPEAKING');
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingLanguage(null);
        setVoiceState('COMPLETED');
        setTimeout(() => setVoiceState('IDLE'), 1500);
      };

      utterance.onerror = (e) => {
        console.warn('[SpeechSynthesis Error]', e);
        setIsSpeaking(false);
        setSpeakingLanguage(null);
        setVoiceState('ERROR');
      };

      window.speechSynthesis.speak(utterance);
      return { success: true, voice: matchVoice?.name || bcp47 };
    }

    return { success: false, reason: 'speech_synthesis_unavailable' };
  }, []);

  /**
   * Stop speech playback
   */
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingLanguage(null);
    setVoiceState('IDLE');
  }, []);

  return {
    voiceState,
    setVoiceState,
    isListening,
    transcript,
    interimTranscript,
    isSpeaking,
    speakingLanguage,
    voiceError,
    isSupported,
    availableVoices,
    checkVoiceSupport,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    setVoiceError,
  };
}

export default useVoice;

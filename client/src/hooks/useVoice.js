import { useState, useEffect, useRef, useCallback } from 'react';
import { aiService } from '../services/api';

const LANG_BCP47 = {
  mr: 'mr-IN',
  hi: 'hi-IN',
  en: 'en-US',
};

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Check Web Speech API availability
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition && !navigator.mediaDevices?.getUserMedia) {
      setIsSupported(false);
    }
  }, []);

  /**
   * Start listening for voice input
   */
  const startListening = useCallback((langCode = 'mr', onFinalTranscript = null) => {
    setVoiceError(null);
    setTranscript('');
    setInterimTranscript('');

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
            setTranscript(currentFinal);
            setInterimTranscript('');
            if (onFinalTranscript) {
              onFinalTranscript(currentFinal);
            }
          }
        };

        recognition.onerror = (event) => {
          console.warn('[Speech Recognition Error]', event.error);
          if (event.error === 'not-allowed') {
            setVoiceError('Microphone permission was denied.');
          } else if (event.error === 'no-speech') {
            setVoiceError('No speech detected. Please try speaking again.');
          } else {
            setVoiceError(`Voice input error: ${event.error}`);
          }
          setIsListening(false);
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
          const recorder = new MediaRecorder(stream);
          audioChunksRef.current = [];

          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };

          recorder.onstop = async () => {
            setIsListening(false);
            stream.getTracks().forEach((track) => track.stop());

            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            // Transcribe using backend
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
                  if (onFinalTranscript) {
                    onFinalTranscript(res.data.text);
                  }
                }
              } catch (e) {
                setVoiceError('Speech recognition failed. Please type your message.');
              }
            };
          };

          mediaRecorderRef.current = recorder;
          recorder.start();
        })
        .catch((err) => {
          console.error('[Microphone Access Denied]', err);
          setVoiceError('Microphone permission was denied.');
          setIsListening(false);
        });
    } else {
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
   * Speak response using Text-To-Speech
   */
  const speak = useCallback((text, langCode = 'mr') => {
    if (!text) return;

    // Cancel any active speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const bcp47 = LANG_BCP47[langCode] || 'mr-IN';
      utterance.lang = bcp47;
      utterance.rate = langCode === 'en' ? 1.0 : 0.92;
      utterance.pitch = 1.0;

      // Match voice if available
      const voices = window.speechSynthesis.getVoices();
      const matchVoice = voices.find(
        (v) => v.lang === bcp47 || v.lang.startsWith(langCode)
      );
      if (matchVoice) {
        utterance.voice = matchVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.warn('[SpeechSynthesis Error]', e);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('[TTS] SpeechSynthesis not supported in window.');
    }
  }, []);

  /**
   * Stop speech playback
   */
  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSpeaking,
    voiceError,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    setVoiceError,
  };
}

export default useVoice;

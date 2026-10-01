import React from 'react';
import { Mic, Square, Loader2, Volume2, CheckCircle2, AlertCircle } from 'lucide-react';

const LANG_DISPLAY = {
  mr: 'मराठी',
  hi: 'हिंदी',
  en: 'English',
};

export function VoiceButton({
  voiceState = 'IDLE',
  isListening = false,
  isGenerating = false,
  isSpeaking = false,
  speakingLanguage = null,
  language = 'mr',
  onToggle,
  disabled = false,
}) {
  // Compute effective state label and subtext according to specification
  let title = 'Tap to speak';
  let subtext = `Ready in ${LANG_DISPLAY[language] || 'मराठी'}`;
  let themeColor = 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30';

  if (isListening || voiceState === 'LISTENING') {
    title = 'Listening...';
    subtext = `Listening for ${LANG_DISPLAY[language]} speech`;
    themeColor = 'bg-red-500 hover:bg-red-600 shadow-red-500/40 animate-pulse';
  } else if (voiceState === 'TRANSCRIBING') {
    title = 'Understanding your voice...';
    subtext = 'Transcribing speech audio';
    themeColor = 'bg-amber-500 shadow-amber-500/30';
  } else if (isGenerating || voiceState === 'THINKING') {
    title = 'Thinking...';
    subtext = 'Processing context with Gemini';
    themeColor = 'bg-zinc-800 text-amber-400 shadow-amber-500/20';
  } else if (voiceState === 'RESPONDING') {
    title = 'Preparing your response...';
    subtext = `Formulating response in ${LANG_DISPLAY[language]}`;
    themeColor = 'bg-amber-600 shadow-amber-600/30';
  } else if (isSpeaking || voiceState === 'SPEAKING') {
    const activeLang = speakingLanguage || language;
    title = `Speaking in ${LANG_DISPLAY[activeLang] || activeLang.toUpperCase()}`;
    subtext = `Speaking · ${LANG_DISPLAY[activeLang]}`;
    themeColor = 'bg-amber-700 shadow-amber-700/40 ring-2 ring-amber-400';
  } else if (voiceState === 'COMPLETED') {
    title = 'Done';
    subtext = 'Response delivered';
    themeColor = 'bg-green-600 shadow-green-600/30';
  } else if (voiceState === 'ERROR') {
    title = 'Something went wrong. Try again.';
    subtext = 'Tap to retry microphone input';
    themeColor = 'bg-rose-600 shadow-rose-600/30';
  }

  const isBusy = isGenerating || voiceState === 'THINKING' || voiceState === 'RESPONDING';

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className="relative flex items-center justify-center">
        {/* Pulsing Ripple Wavefront when listening */}
        {(isListening || voiceState === 'LISTENING') && (
          <>
            <span className="absolute w-24 h-24 rounded-full bg-red-500/25 animate-ping pointer-events-none" />
            <span className="absolute w-20 h-20 rounded-full bg-red-500/35 voice-ripple pointer-events-none" />
          </>
        )}

        {/* Dynamic Waveform rings when speaking */}
        {(isSpeaking || voiceState === 'SPEAKING') && (
          <>
            <span className="absolute w-22 h-22 rounded-full border-2 border-amber-500/40 animate-ping pointer-events-none" />
            <span className="absolute w-20 h-20 rounded-full bg-amber-500/15 pointer-events-none" />
          </>
        )}

        {/* Calm intelligent processing aura */}
        {isBusy && (
          <span className="absolute w-20 h-20 rounded-full border-2 border-dashed border-amber-500 animate-spin pointer-events-none" />
        )}

        {/* Main Microphone Button */}
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled || isBusy}
          aria-label={isListening ? 'Stop recording voice' : title}
          className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-white transition-all duration-300 transform active:scale-95 shadow-xl ${themeColor} ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
          }`}
        >
          {isBusy ? (
            <Loader2 className="w-7 h-7 animate-spin text-amber-400" />
          ) : isListening ? (
            <Square className="w-6 h-6 fill-current" />
          ) : isSpeaking ? (
            <Volume2 className="w-7 h-7 animate-bounce" />
          ) : voiceState === 'COMPLETED' ? (
            <CheckCircle2 className="w-7 h-7 text-white" />
          ) : voiceState === 'ERROR' ? (
            <AlertCircle className="w-7 h-7 text-white" />
          ) : (
            <Mic className="w-7 h-7" />
          )}
        </button>
      </div>

      {/* Reactive Visual Waveform during active voice */}
      {(isListening || isSpeaking) && (
        <div className="flex items-center gap-1 mt-3 h-4">
          {[0.3, 0.7, 1.0, 0.6, 0.9, 0.4, 0.8, 0.5, 0.2].map((factor, i) => (
            <span
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                isListening ? 'bg-red-500 animate-pulse' : 'bg-amber-600 animate-pulse'
              }`}
              style={{
                height: `${Math.max(4, factor * 16)}px`,
                animationDelay: `${i * 90}ms`,
              }}
            />
          ))}
        </div>
      )}

      {/* Dynamic Status Text */}
      <div className="mt-2.5 text-center px-4">
        <span className="text-xs font-bold tracking-tight text-vf-text dark:text-zinc-100 block">
          {title}
        </span>
        <span className="text-[11px] font-mono text-vf-muted dark:text-zinc-400 block mt-0.5">
          {subtext}
        </span>
      </div>
    </div>
  );
}

export default VoiceButton;

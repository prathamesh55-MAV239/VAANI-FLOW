import React from 'react';
import { Mic, MicOff, Square, Loader2 } from 'lucide-react';

export function VoiceButton({
  isListening,
  isGenerating,
  isSpeaking,
  onToggle,
  language = 'mr',
  disabled = false,
}) {
  // Determine current active state
  let stateLabel = 'Tap to speak';
  let stateSubtext = `Listening in ${language === 'mr' ? 'मराठी' : language === 'hi' ? 'हिन्दी' : 'English'}`;

  if (isListening) {
    stateLabel = 'Listening...';
    stateSubtext = 'Speak clearly into your microphone';
  } else if (isGenerating) {
    stateLabel = 'Thinking...';
    stateSubtext = 'Gemini is understanding your context';
  } else if (isSpeaking) {
    stateLabel = 'Responding...';
    stateSubtext = 'Speaking audio response';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        {/* Animated Ripple Waves when listening */}
        {isListening && (
          <>
            <span className="absolute w-24 h-24 rounded-full bg-vf-accent/20 animate-ping pointer-events-none" />
            <span className="absolute w-20 h-20 rounded-full bg-vf-accent/30 voice-ripple pointer-events-none" />
          </>
        )}

        {/* Pulsing ring when thinking */}
        {isGenerating && (
          <span className="absolute w-20 h-20 rounded-full border-2 border-dashed border-vf-accent animate-spin pointer-events-none" />
        )}

        {/* Main Microphone Button */}
        <button
          onClick={onToggle}
          disabled={disabled || isGenerating}
          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 shadow-lg ${
            isListening
              ? 'bg-red-500 text-white shadow-red-500/30 scale-105'
              : isSpeaking
              ? 'bg-amber-600 text-white shadow-amber-600/30'
              : isGenerating
              ? 'bg-vf-text dark:bg-zinc-800 text-vf-accent cursor-wait'
              : 'bg-vf-accent hover:bg-vf-accent-hover text-white shadow-vf-accent/30 hover:scale-105'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isGenerating ? (
            <Loader2 className="w-7 h-7 animate-spin" />
          ) : isListening ? (
            <Square className="w-6 h-6 fill-current" />
          ) : (
            <Mic className="w-7 h-7" />
          )}
        </button>
      </div>

      {/* Dynamic Status Label */}
      <div className="mt-3 text-center">
        <span className="text-xs font-semibold tracking-wide text-vf-text dark:text-zinc-200 block">
          {stateLabel}
        </span>
        <span className="text-[11px] font-mono text-vf-muted dark:text-zinc-500 block">
          {stateSubtext}
        </span>
      </div>
    </div>
  );
}

export default VoiceButton;

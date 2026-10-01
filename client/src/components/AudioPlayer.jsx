import React, { useState } from 'react';
import { Play, Square, RotateCcw, Volume2, AlertCircle } from 'lucide-react';
import { useVoice, LANG_NAMES } from '../hooks/useVoice';

export function AudioPlayer({ text, language = 'mr' }) {
  const { speak, stopSpeaking, checkVoiceSupport } = useVoice();
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState(null);

  const langKey = language ? language.toLowerCase().slice(0, 2) : 'mr';
  const hasNativeVoice = checkVoiceSupport(langKey);

  const handleToggle = () => {
    setVoiceNotice(null);
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
    } else {
      const result = speak(text, langKey);
      if (result && !result.success) {
        setIsPlaying(false);
        setVoiceNotice(
          langKey === 'mr'
            ? 'मराठी आवाज उपलब्ध नाही (वाचा)'
            : langKey === 'hi'
            ? 'हिंदी आवाज़ उपलब्ध नहीं (पढ़ें)'
            : 'Voice unavailable on device'
        );
        setTimeout(() => setVoiceNotice(null), 4000);
      } else {
        setIsPlaying(true);
        // Fallback timer based on text length in case speech engine doesn't fire onend
        const estimatedDuration = Math.max(2500, text.length * 80);
        setTimeout(() => {
          setIsPlaying(false);
        }, estimatedDuration);
      }
    }
  };

  const handleReplay = (e) => {
    e.stopPropagation();
    stopSpeaking();
    setIsPlaying(false);
    setTimeout(handleToggle, 100);
  };

  return (
    <div className="inline-flex items-center gap-2">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-vf-border dark:border-vf-darkBorder text-xs text-vf-text dark:text-zinc-300">
        <button
          type="button"
          onClick={handleToggle}
          className={`flex items-center gap-1.5 font-medium transition-colors focus:outline-none ${
            isPlaying ? 'text-amber-600 font-bold' : 'hover:text-amber-600'
          }`}
          aria-label={isPlaying ? 'Stop speech playback' : `Play voice in ${LANG_NAMES[langKey] || langKey}`}
        >
          {isPlaying ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current text-amber-600" />
              <span>Speaking · {LANG_NAMES[langKey] || langKey.toUpperCase()}</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current text-amber-600" />
              <span>Play · {LANG_NAMES[langKey] || langKey.toUpperCase()}</span>
            </>
          )}
        </button>

        {/* Animated Audio Waveform */}
        <div className="flex items-center gap-0.5 h-3 px-1">
          {[0.3, 0.8, 0.5, 1.0, 0.6, 0.9, 0.4].map((h, i) => (
            <span
              key={i}
              className={`w-0.5 rounded-full transition-all duration-200 ${
                isPlaying
                  ? 'bg-amber-600 animate-pulse'
                  : 'bg-vf-muted/60 dark:bg-zinc-600'
              }`}
              style={{
                height: isPlaying ? `${Math.max(4, h * 12)}px` : '4px',
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleReplay}
          className="p-1 hover:text-amber-600 text-vf-muted dark:text-zinc-500 transition-colors"
          title="Replay Voice"
          aria-label="Replay Voice"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* Honest fallback warning if no native OS voice installed */}
      {voiceNotice && (
        <span className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1 animate-fadeIn">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {voiceNotice}
        </span>
      )}
    </div>
  );
}

export default AudioPlayer;

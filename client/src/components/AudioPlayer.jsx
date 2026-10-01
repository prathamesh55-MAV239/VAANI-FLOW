import React, { useState } from 'react';
import { Volume2, VolumeX, RotateCcw, Play, Square } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';

export function AudioPlayer({ text, language = 'mr' }) {
  const { speak, stopSpeaking } = useVoice();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggle = () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speak(text, language);
      // Listen for speech finish or timeout
      const estimatedDuration = Math.max(2000, text.length * 75);
      setTimeout(() => {
        setIsPlaying(false);
      }, estimatedDuration);
    }
  };

  const handleReplay = (e) => {
    e.stopPropagation();
    stopSpeaking();
    setIsPlaying(true);
    speak(text, language);
    const estimatedDuration = Math.max(2000, text.length * 75);
    setTimeout(() => {
      setIsPlaying(false);
    }, estimatedDuration);
  };

  return (
    <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-vf-border dark:border-vf-darkBorder text-xs text-vf-text dark:text-zinc-300">
      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5 font-medium hover:text-vf-accent transition-colors focus:outline-none"
        aria-label={isPlaying ? 'Stop voice playback' : 'Play voice response'}
      >
        {isPlaying ? (
          <>
            <Square className="w-3.5 h-3.5 text-vf-accent fill-vf-accent" />
            <span className="text-vf-accent font-semibold">Speaking...</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play</span>
          </>
        )}
      </button>

      {/* Mini dynamic animated waveform */}
      <div className="flex items-center gap-0.5 h-3 px-1">
        {[0.4, 0.9, 0.6, 1.0, 0.5, 0.8, 0.3].map((height, i) => (
          <span
            key={i}
            className={`w-0.5 rounded-full transition-all duration-200 ${
              isPlaying
                ? 'bg-vf-accent animate-pulse'
                : 'bg-vf-muted dark:bg-zinc-600'
            }`}
            style={{
              height: isPlaying ? `${Math.max(4, height * 12)}px` : '4px',
              animationDelay: `${i * 120}ms`,
            }}
          />
        ))}
      </div>

      <button
        onClick={handleReplay}
        className="p-1 hover:text-vf-accent text-vf-muted dark:text-zinc-500 transition-colors"
        title="Replay Voice"
        aria-label="Replay Voice"
      >
        <RotateCcw className="w-3 h-3" />
      </button>
    </div>
  );
}

export default AudioPlayer;

import React from 'react';

export function LoadingState({ message = 'Loading conversations...' }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      {/* Dynamic Waveform Loading Animation */}
      <div className="flex items-center gap-1.5 h-8 mb-4">
        {[0.3, 0.7, 1.0, 0.6, 0.9, 0.4].map((scale, i) => (
          <span
            key={i}
            className="w-1 bg-vf-accent rounded-full animate-wave-flow"
            style={{
              height: `${scale * 32}px`,
              animationDelay: `${i * 150}ms`,
            }}
          />
        ))}
      </div>
      <p className="text-xs font-mono uppercase tracking-widest text-vf-muted dark:text-zinc-500 font-medium">
        {message}
      </p>
    </div>
  );
}

export default LoadingState;

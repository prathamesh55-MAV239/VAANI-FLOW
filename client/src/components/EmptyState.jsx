import React from 'react';
import { Mic, Sparkles, Languages, MessageCircle } from 'lucide-react';
import VoiceButton from './VoiceButton';

export function EmptyState({ onStartVoice, onSelectPrompt, isListening, inputLanguage }) {
  const suggestions = [
    { text: 'माझ्या ऑर्डरची स्थिती काय आहे?', label: 'Order Status (मराठी)', lang: 'mr' },
    { text: 'ती कधी पोहोचेल?', label: 'When will it arrive? (मराठी)', lang: 'mr' },
    { text: 'मेरी ऑर्डर की स्थिति क्या है?', label: 'Order Status (हिन्दी)', lang: 'hi' },
    { text: 'What is my order status?', label: 'Order Status (English)', lang: 'en' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto my-auto animate-fadeIn">
      {/* Editorial Title & Subtitle */}
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vf-accent/10 text-vf-accent text-xs font-mono tracking-wider uppercase font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Every Voice. Understood.
        </span>
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-vf-text dark:text-white mb-2">
          Your next conversation starts here.
        </h2>
        <p className="text-sm sm:text-base text-vf-muted dark:text-zinc-400 font-normal max-w-md mx-auto">
          Speak naturally in Marathi, Hindi, or English. VaaniFlow listens, understands, and responds with spoken intelligence.
        </p>
      </div>

      {/* Dominant Voice Button */}
      <div className="my-8">
        <VoiceButton
          isListening={isListening}
          onToggle={onStartVoice}
          language={inputLanguage}
        />
      </div>

      {/* Suggested Starting Questions */}
      <div className="w-full space-y-2 mt-4">
        <span className="text-[11px] font-mono uppercase tracking-widest text-vf-muted dark:text-zinc-500 block mb-2 font-medium">
          Or try a quick conversational prompt
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt(s.text, s.lang)}
              className="p-3 rounded-xl bg-vf-surface dark:bg-vf-darkSurface border border-vf-border dark:border-vf-darkBorder hover:border-vf-accent hover:shadow-sm transition-all text-xs group"
            >
              <span className="font-semibold text-vf-text dark:text-white block group-hover:text-vf-accent transition-colors">
                "{s.text}"
              </span>
              <span className="text-[10px] text-vf-muted dark:text-zinc-500 font-mono mt-0.5 block">
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EmptyState;

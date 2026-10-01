import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Mic, CornerDownLeft } from 'lucide-react';
import VoiceButton from './VoiceButton';
import LanguageSelector from './LanguageSelector';

const DEMO_PROMPTS = [
  { label: '📦 Order Status', text: 'माझ्या ऑर्डरची स्थिती काय आहे?', lang: 'mr' },
  { label: '⏰ Arrival Time', text: 'ती कधी पोहोचेल?', lang: 'mr' },
  { label: '🙏 Greeting', text: 'नमस्कार! आपण काय मदत करू शकता?', lang: 'mr' },
  { label: 'हिंदी: ऑर्डर स्थिति', text: 'मेरी ऑर्डर की स्थिति क्या है?', lang: 'hi' },
  { label: 'English: Track Order', text: 'What is my order status?', lang: 'en' },
];

export function MessageInput({
  onSendMessage,
  isGenerating,
  isListening,
  interimTranscript,
  onToggleVoice,
  inputLanguage,
  onSelectLanguage,
  voiceError,
}) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Sync interim transcript into input text while speaking
  useEffect(() => {
    if (interimTranscript) {
      setText(interimTranscript);
    }
  }, [interimTranscript]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (text.trim() && !isGenerating) {
      onSendMessage(text.trim());
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectPrompt = (prompt) => {
    onSelectLanguage(prompt.lang);
    setText(prompt.text);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="w-full bg-vf-surface/90 dark:bg-vf-darkSurface/90 border-t border-vf-border dark:border-vf-darkBorder backdrop-blur-md pt-3 pb-4 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Live speech feedback pill */}
        {isListening && (
          <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="font-semibold">Listening to speech...</span>
              <span className="text-vf-text dark:text-white italic">
                {interimTranscript ? `"${interimTranscript}"` : 'Say something in your selected language'}
              </span>
            </div>
            <button
              onClick={onToggleVoice}
              className="text-[11px] font-mono underline uppercase font-bold"
            >
              Stop
            </button>
          </div>
        )}

        {/* Voice Error Notice */}
        {voiceError && (
          <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-400 flex items-center justify-between">
            <span>{voiceError}</span>
            <button
              onClick={() => onToggleVoice()}
              className="text-[10px] font-mono underline uppercase"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Quick Demo Prompts for Judges & Testing */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-mono uppercase tracking-wider text-vf-muted dark:text-zinc-500 flex items-center gap-1 flex-shrink-0">
            <Sparkles className="w-3 h-3 text-vf-accent" />
            Quick Demo:
          </span>
          {DEMO_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSelectPrompt(p)}
              className="flex-shrink-0 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-vf-border dark:border-vf-darkBorder text-vf-text dark:text-zinc-300 hover:border-vf-accent hover:text-vf-accent transition-all text-xs font-medium"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Main Input Control Bar */}
        <div className="flex items-end gap-3 p-2 rounded-2xl bg-vf-bg dark:bg-vf-dark border border-vf-border dark:border-vf-darkBorder shadow-inner">
          {/* Circular Voice Button */}
          <div className="flex-shrink-0 pb-0.5">
            <button
              onClick={onToggleVoice}
              disabled={isGenerating}
              aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/20'
                  : 'bg-vf-accent hover:bg-vf-accent-hover text-white shadow-sm'
              }`}
              title="Voice Input (Speech-to-Text)"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>

          {/* Text Area */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Type a message or tap mic in ${
                inputLanguage === 'mr' ? 'मराठी' : inputLanguage === 'hi' ? 'हिन्दी' : 'English'
              }...`}
              className="w-full bg-transparent resize-none outline-none text-sm text-vf-text dark:text-white placeholder:text-vf-muted dark:placeholder:text-zinc-500 max-h-32 py-2.5 px-1 leading-relaxed"
            />
          </div>

          {/* Right Action: Language and Send */}
          <div className="flex items-center gap-2 pb-0.5">
            <div className="hidden sm:block">
              <LanguageSelector
                selectedLanguage={inputLanguage}
                onSelectLanguage={onSelectLanguage}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!text.trim() || isGenerating}
              aria-label="Send message"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                text.trim() && !isGenerating
                  ? 'bg-vf-text dark:bg-white text-white dark:text-vf-text hover:bg-vf-accent dark:hover:bg-vf-accent dark:hover:text-white shadow-sm'
                  : 'bg-black/5 dark:bg-white/5 text-vf-muted dark:text-zinc-600 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageInput;

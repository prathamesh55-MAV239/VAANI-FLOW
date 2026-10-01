import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Mic, Square, CornerDownLeft, AlertCircle } from 'lucide-react';
import LanguageSelector, { LANGUAGES } from './LanguageSelector';

const LANGUAGE_SUGGESTIONS = {
  mr: [
    { label: '📦 ऑर्डर स्थिती', text: 'माझ्या ऑर्डरची स्थिती काय आहे?' },
    { label: '⏰ कधी पोहोचेल?', text: 'ती कधी पोहोचेल?' },
    { label: '⛅ हवामान', text: 'मला आजच्या हवामानाबद्दल सांगा' },
    { label: '🙏 स्वागत', text: 'नमस्कार! आपण काय मदत करू शकता?' },
  ],
  hi: [
    { label: '📦 ऑर्डर स्टेटस', text: 'मेरी ऑर्डर की स्थिति क्या है?' },
    { label: '📍 ऑर्डर कहाँ है?', text: 'मेरी ऑर्डर कहाँ है?' },
    { label: '⏰ कब आएगा?', text: 'कब पहुंचेगा मेरा सामान?' },
    { label: '⛅ आज का मौसम', text: 'आज का मौसम कैसा है?' },
  ],
  en: [
    { label: '📦 Order Status', text: 'What is the status of my order?' },
    { label: '⏰ Arrival Time', text: 'When will it arrive?' },
    { label: '💡 Capabilities', text: 'What can you help me with?' },
    { label: '⛅ Weather', text: 'How is the weather today?' },
  ],
};

const PLACEHOLDERS = {
  mr: 'मराठी मध्ये बोला किंवा टाईप करा...',
  hi: 'हिंदी में बोलें या टाइप करें...',
  en: 'Speak or type in English...',
};

export function MessageInput({
  onSendMessage,
  isGenerating,
  isListening,
  interimTranscript,
  onToggleVoice,
  inputLanguage = 'mr',
  onSelectLanguage,
  voiceError,
}) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Sync interim speech transcript into input textarea while speaking
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

  const handleSelectSuggestion = (s) => {
    setText(s.text);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const activeSuggestions = LANGUAGE_SUGGESTIONS[inputLanguage] || LANGUAGE_SUGGESTIONS.mr;

  return (
    <div className="w-full bg-vf-surface/95 dark:bg-vf-darkSurface/95 border-t border-vf-border dark:border-vf-darkBorder backdrop-blur-md pt-3 pb-4 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Live speech feedback pill */}
        {isListening && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 animate-pulse">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping flex-shrink-0" />
              <span className="font-bold flex-shrink-0">Listening:</span>
              <span className="text-vf-text dark:text-white italic truncate">
                {interimTranscript ? `"${interimTranscript}"` : 'Listening for your voice... speak now'}
              </span>
            </div>
            <button
              type="button"
              onClick={onToggleVoice}
              className="text-[11px] font-mono underline uppercase font-bold text-red-600 dark:text-red-400 ml-2"
            >
              Stop
            </button>
          </div>
        )}

        {/* Voice Error Notice with honest fallback */}
        {voiceError && (
          <div className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{voiceError}</span>
            </div>
            <button
              type="button"
              onClick={() => onToggleVoice()}
              className="text-[10px] font-mono underline uppercase ml-2 flex-shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Language-Adaptive Starter Suggestions */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-mono uppercase tracking-wider text-vf-muted dark:text-zinc-500 flex items-center gap-1 flex-shrink-0 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Suggested ({inputLanguage.toUpperCase()}):
          </span>
          {activeSuggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectSuggestion(s)}
              className="flex-shrink-0 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-vf-border dark:border-vf-darkBorder text-vf-text dark:text-zinc-300 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/[0.04] transition-all text-xs font-medium"
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Main Input Control Bar */}
        <div className="flex items-end gap-3 p-2 rounded-2xl bg-vf-bg dark:bg-vf-dark border border-vf-border dark:border-vf-darkBorder shadow-inner">
          {/* Circular Voice Button */}
          <div className="flex-shrink-0 pb-0.5">
            <button
              type="button"
              onClick={onToggleVoice}
              disabled={isGenerating}
              aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30'
                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/30'
              }`}
              title="Voice Input (Speech-to-Text)"
            >
              {isListening ? (
                <Square className="w-5 h-5 fill-current" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
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
              placeholder={PLACEHOLDERS[inputLanguage] || 'Type a message or tap mic...'}
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
              type="button"
              onClick={handleSubmit}
              disabled={!text.trim() || isGenerating}
              aria-label="Send message"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                text.trim() && !isGenerating
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/30 cursor-pointer'
                  : 'bg-black/5 dark:bg-white/5 text-vf-muted dark:text-zinc-600 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Language Selector Row */}
        <div className="sm:hidden flex items-center justify-between px-1">
          <span className="text-[11px] font-mono text-vf-muted">Active Language:</span>
          <LanguageSelector
            selectedLanguage={inputLanguage}
            onSelectLanguage={onSelectLanguage}
          />
        </div>
      </div>
    </div>
  );
}

export default MessageInput;

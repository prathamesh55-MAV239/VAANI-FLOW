import React, { useRef, useEffect } from 'react';
import { Menu, Sparkles, Volume2, Shield } from 'lucide-react';
import ChatMessage from './ChatMessage';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import LanguageSelector from './LanguageSelector';

const LANG_TITLES = {
  mr: 'मराठी',
  hi: 'हिंदी',
  en: 'English',
};

export function ChatWindow({
  conversation,
  messages,
  isLoading,
  isGenerating,
  aiStatus,
  error,
  inputLanguage,
  responseLanguage,
  onSelectLanguage,
  onStartVoice,
  onSelectPrompt,
  onOpenSidebar,
  onRetry,
  voiceState = 'IDLE',
  isListening = false,
  isSpeaking = false,
  speakingLanguage = null,
}) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom whenever messages update or generating
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  return (
    <div className="flex-1 flex flex-col h-full bg-vf-bg dark:bg-vf-dark overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 px-4 sm:px-6 border-b border-vf-border dark:border-vf-darkBorder flex items-center justify-between bg-vf-surface/90 dark:bg-vf-darkSurface/90 backdrop-blur-md z-10 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="md:hidden p-2 text-vf-text dark:text-white rounded-lg hover:bg-black/5 dark:hover:bg-zinc-800"
            aria-label="Open conversation history"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="font-display font-bold text-sm sm:text-base text-vf-text dark:text-white truncate">
              {conversation?.title || 'VaaniFlow Multilingual Space'}
            </h1>
            <div className="flex items-center gap-2 text-[10px] font-mono text-vf-muted dark:text-zinc-500">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active Session
              </span>
              <span>•</span>
              <span className="truncate">Context Retained</span>
              <span>•</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                Mode: {LANG_TITLES[inputLanguage] || inputLanguage.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Status / Language Selector */}
        <div className="flex items-center gap-2">
          {/* Dynamic AI Status Badge */}
          {isGenerating ? (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-700 dark:text-amber-400 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Thinking with Gemini...</span>
            </div>
          ) : isSpeaking ? (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-600/15 border border-amber-600/30 text-xs font-semibold text-amber-700 dark:text-amber-400 animate-pulse">
              <Volume2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Speaking in {LANG_TITLES[speakingLanguage || responseLanguage]}...</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 text-[11px] font-mono text-vf-muted dark:text-zinc-400 border border-vf-border/50">
              <Shield className="w-3 h-3 text-amber-600" />
              <span>Multilingual Engine Active</span>
            </div>
          )}

          <div className="hidden sm:block">
            <LanguageSelector
              selectedLanguage={inputLanguage}
              onSelectLanguage={onSelectLanguage}
            />
          </div>
        </div>
      </header>

      {/* Messages Feed */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar flex flex-col">
        {isLoading ? (
          <LoadingState message="Loading conversation..." />
        ) : messages.length === 0 ? (
          <EmptyState
            onStartVoice={onStartVoice}
            onSelectPrompt={onSelectPrompt}
            voiceState={voiceState}
            isListening={isListening}
            isGenerating={isGenerating}
            isSpeaking={isSpeaking}
            speakingLanguage={speakingLanguage}
            inputLanguage={inputLanguage}
          />
        ) : (
          <div className="max-w-4xl w-full mx-auto space-y-2 flex-1">
            {messages.map((msg, index) => (
              <ChatMessage key={msg.id || index} message={msg} />
            ))}

            {/* AI Generation State Indicator */}
            {isGenerating && (
              <div className="flex justify-start mb-6 animate-fadeIn">
                <div className="bg-vf-surface dark:bg-vf-darkSurface border border-vf-border dark:border-vf-darkBorder rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-vf-text dark:text-white">
                      VaaniFlow is thinking...
                    </span>
                    <span className="text-[11px] font-mono text-vf-muted dark:text-zinc-500">
                      Processing language ({LANG_TITLES[inputLanguage]}) & context memory
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error banner if message failed */}
            {error && (
              <ErrorState
                title="Something interrupted the conversation."
                subtitle={error}
                onRetry={onRetry}
              />
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>
    </div>
  );
}

export default ChatWindow;

import React, { useState } from 'react';
import { Copy, Check, Globe, Sparkles, User } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import { aiService } from '../services/api';

const LANG_LABELS = {
  mr: 'मराठी (Marathi)',
  hi: 'हिन्दी (Hindi)',
  en: 'English',
};

export function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translatedText, setTranslatedText] = useState(message.translation || null);
  const [targetTransLang, setTargetTransLang] = useState(
    message.language === 'mr' ? 'en' : 'mr'
  );
  const [isTranslating, setIsTranslating] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleTranslation = async () => {
    if (!showTranslation && !translatedText) {
      setIsTranslating(true);
      try {
        const res = await aiService.translate({
          text: message.content,
          sourceLanguage: message.language || 'mr',
          targetLanguage: targetTransLang,
        });
        if (res.success && res.data?.translation) {
          setTranslatedText(res.data.translation);
        }
      } catch (err) {
        console.warn('[Translation Error]', err);
      } finally {
        setIsTranslating(false);
      }
    }
    setShowTranslation(!showTranslation);
  };

  const handleChangeTransLang = async (newLang) => {
    setTargetTransLang(newLang);
    setIsTranslating(true);
    try {
      const res = await aiService.translate({
        text: message.content,
        sourceLanguage: message.language || 'mr',
        targetLanguage: newLang,
      });
      if (res.success && res.data?.translation) {
        setTranslatedText(res.data.translation);
      }
    } catch (err) {
      console.warn('[Translation Error]', err);
    } finally {
      setIsTranslating(false);
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-6 animate-fadeIn">
        <div className="max-w-xl flex flex-col items-end">
          <div className="bg-vf-text dark:bg-white text-white dark:text-vf-text px-4 py-3 rounded-2xl rounded-tr-sm shadow-sm text-sm leading-relaxed font-normal">
            {message.content}
          </div>
          <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-vf-muted dark:text-zinc-500 font-mono">
            {message.language && <span>{message.language.toUpperCase()}</span>}
            <span>•</span>
            <span>
              {new Date(message.created_at || Date.now()).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Assistant Response Card
  return (
    <div className="flex justify-start mb-8 group animate-fadeIn">
      <div className="max-w-2xl w-full">
        <div className="bg-vf-surface dark:bg-vf-darkSurface border border-vf-border dark:border-vf-darkBorder rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          {/* Header metadata */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-vf-border/60 dark:border-vf-darkBorder/60">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-vf-accent/15 text-vf-accent flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-xs text-vf-text dark:text-white">
                VaaniFlow
              </span>

              {message.intent && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-black/5 dark:bg-white/5 text-vf-muted dark:text-zinc-400 uppercase">
                  {message.intent.replace(/_/g, ' ')}
                </span>
              )}
            </div>

            <div className="text-[11px] font-mono text-vf-muted dark:text-zinc-500">
              {LANG_LABELS[message.language] || message.language}
            </div>
          </div>

          {/* Main Response text */}
          <div className="text-sm sm:text-base leading-relaxed text-vf-text dark:text-zinc-200 font-normal mb-4 selection:bg-vf-accent selection:text-white">
            {message.content}
          </div>

          {/* Side-by-side or stacked Translation panel */}
          {showTranslation && (
            <div className="my-3 p-3.5 rounded-xl bg-amber-500/[0.06] dark:bg-amber-500/[0.08] border border-amber-500/20 text-xs text-vf-text dark:text-zinc-300">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                  <Globe className="w-3 h-3" />
                  Translated to {LANG_LABELS[targetTransLang] || targetTransLang}
                </span>

                <div className="flex gap-1">
                  {['en', 'hi', 'mr']
                    .filter((l) => l !== message.language)
                    .map((lang) => (
                      <button
                        key={lang}
                        onClick={() => handleChangeTransLang(lang)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors ${
                          targetTransLang === lang
                            ? 'bg-amber-600 text-white font-bold'
                            : 'bg-white/60 dark:bg-zinc-800 text-vf-muted hover:text-vf-text'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                </div>
              </div>

              {isTranslating ? (
                <div className="py-2 text-vf-muted animate-pulse">Translating...</div>
              ) : (
                <p className="leading-relaxed font-medium">
                  {translatedText || message.translation}
                </p>
              )}
            </div>
          )}

          {/* Action Footer: Play Audio, Translate, Copy */}
          <div className="flex items-center justify-between pt-2">
            <AudioPlayer text={message.content} language={message.language || 'mr'} />

            <div className="flex items-center gap-1">
              <button
                onClick={handleToggleTranslation}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  showTranslation
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                    : 'text-vf-muted hover:text-vf-text dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
                title="Translate Response"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Translate</span>
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-vf-muted hover:text-vf-text dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Copy Text"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-500 hidden sm:inline">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;

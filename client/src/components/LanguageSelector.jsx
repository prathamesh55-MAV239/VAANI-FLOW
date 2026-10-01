import React from 'react';
import { Globe, Check } from 'lucide-react';

export const LANGUAGES = [
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
];

export function LanguageSelector({ selectedLanguage = 'mr', onSelectLanguage, size = 'normal' }) {
  return (
    <div
      role="group"
      aria-label="Language selection"
      className="inline-flex items-center gap-1 p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-vf-border dark:border-vf-darkBorder"
    >
      <div className="pl-2 pr-1 text-vf-muted dark:text-zinc-400 flex items-center">
        <Globe className="w-3.5 h-3.5 text-vf-accent" />
      </div>

      <div className="flex items-center gap-1">
        {LANGUAGES.map((lang) => {
          const isSelected = selectedLanguage === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => onSelectLanguage(lang.code)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-amber-600 text-white font-bold shadow-sm shadow-amber-600/30 ring-1 ring-amber-500'
                  : 'text-vf-text/80 dark:text-zinc-300 hover:text-vf-text dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              title={`${lang.name} (${lang.nativeName})`}
              aria-pressed={isSelected}
            >
              <span className="text-xs">{lang.flag}</span>
              <span>{lang.nativeName}</span>
              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default LanguageSelector;

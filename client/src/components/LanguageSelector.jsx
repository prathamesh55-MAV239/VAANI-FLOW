import React from 'react';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'en', name: 'English', nativeName: 'English' },
];

export function LanguageSelector({ selectedLanguage, onSelectLanguage, label = 'Language' }) {
  return (
    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-vf-border dark:border-vf-darkBorder">
      <div className="pl-2 pr-1 text-vf-muted dark:text-zinc-500">
        <Globe className="w-3.5 h-3.5" />
      </div>
      {LANGUAGES.map((lang) => {
        const isSelected = selectedLanguage === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => onSelectLanguage(lang.code)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              isSelected
                ? 'bg-vf-surface dark:bg-zinc-800 text-vf-accent font-bold shadow-sm border border-vf-border/60 dark:border-zinc-700'
                : 'text-vf-text/70 dark:text-zinc-400 hover:text-vf-text dark:hover:text-white'
            }`}
            title={`${lang.name} (${lang.nativeName})`}
          >
            <span>{lang.nativeName}</span>
          </button>
        );
      })}
    </div>
  );
}

export default LanguageSelector;

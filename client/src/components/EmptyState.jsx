import React from 'react';
import { Mic, Sparkles, MessageSquare, Volume2, ArrowRight } from 'lucide-react';
import VoiceButton from './VoiceButton';

const LANGUAGE_PROMPTS = {
  mr: [
    { text: 'माझ्या ऑर्डरची स्थिती काय आहे?', label: 'ऑर्डर स्थिती विचारणा', category: 'ऑर्डर' },
    { text: 'ती कधी पोहोचेल?', label: 'वितरण वेळ आणि ट्रॅकिंग', category: 'फॉलो-अप' },
    { text: 'मला आजच्या हवामानाबद्दल सांगा', label: 'हवामान माहिती', category: 'माहिती' },
    { text: 'नमस्कार! आपण काय मदत करू शकता?', label: 'संभाषण सुरुवात', category: 'स्वागत' },
  ],
  hi: [
    { text: 'मेरी ऑर्डर की स्थिति क्या है?', label: 'ऑर्डर स्टेटस पूछताछ', category: 'ऑर्डर' },
    { text: 'मेरी ऑर्डर कहाँ है?', label: 'लाइव ट्रैकिंग', category: 'ट्रैकिंग' },
    { text: 'कब पहुंचेगा मेरा सामान?', label: 'डिलीवरी का समय', category: 'फॉलो-अप' },
    { text: 'नमस्ते! आप मेरी क्या मदद कर सकते हैं?', label: 'बातचीत शुरू करें', category: 'स्वागत' },
  ],
  en: [
    { text: 'What is the status of my order?', label: 'Track Order #VF-8492', category: 'Order' },
    { text: 'When will it arrive?', label: 'Contextual Follow-up', category: 'Context' },
    { text: 'What can you help me with?', label: 'Assistant Capabilities', category: 'General' },
    { text: 'How is the weather today?', label: 'Local Weather Update', category: 'Weather' },
  ],
};

export function EmptyState({
  onStartVoice,
  onSelectPrompt,
  voiceState = 'IDLE',
  isListening = false,
  isGenerating = false,
  isSpeaking = false,
  speakingLanguage = null,
  inputLanguage = 'mr',
}) {
  const currentPrompts = LANGUAGE_PROMPTS[inputLanguage] || LANGUAGE_PROMPTS.mr;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto my-auto animate-fadeIn">
      {/* Brand Header */}
      <div className="mb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-mono tracking-wider uppercase font-bold border border-amber-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>VAANIFLOW</span>
          <span className="text-amber-400 dark:text-amber-500">•</span>
          <span>Every Voice. Understood.</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-vf-text dark:text-white">
          Speak. Understand. Connect.
        </h2>

        <p className="text-sm sm:text-base text-vf-muted dark:text-zinc-400 font-normal max-w-lg mx-auto">
          Speak naturally in <span className="font-semibold text-amber-600 dark:text-amber-400">मराठी</span>, <span className="font-semibold text-amber-600 dark:text-amber-400">हिंदी</span>, or <span className="font-semibold text-amber-600 dark:text-amber-400">English</span>.
          VaaniFlow understands your intent, retains context across turns, and speaks back in your language.
        </p>
      </div>

      {/* Prominent Microphone Voice Button */}
      <div className="my-6">
        <VoiceButton
          voiceState={voiceState}
          isListening={isListening}
          isGenerating={isGenerating}
          isSpeaking={isSpeaking}
          speakingLanguage={speakingLanguage}
          language={inputLanguage}
          onToggle={onStartVoice}
        />
      </div>

      {/* Language-Adaptive Suggestions */}
      <div className="w-full space-y-2.5 mt-2">
        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-vf-muted dark:text-zinc-500 px-1 font-semibold">
          <span>Starter questions in {inputLanguage === 'mr' ? 'मराठी' : inputLanguage === 'hi' ? 'हिंदी' : 'English'}</span>
          <span>Tap to ask</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
          {currentPrompts.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(item.text, inputLanguage)}
              className="p-3.5 rounded-xl bg-vf-surface dark:bg-vf-darkSurface border border-vf-border dark:border-vf-darkBorder hover:border-amber-500 hover:shadow-md hover:bg-amber-500/[0.02] dark:hover:bg-amber-500/[0.05] transition-all text-xs group flex items-start justify-between"
            >
              <div className="space-y-1 pr-2">
                <span className="font-semibold text-vf-text dark:text-white block group-hover:text-amber-600 transition-colors">
                  "{item.text}"
                </span>
                <span className="text-[11px] text-vf-muted dark:text-zinc-400 font-normal block">
                  {item.label}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-vf-muted group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EmptyState;

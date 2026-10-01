import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Mic,
  ArrowRight,
  Sparkles,
  Globe,
  Volume2,
  ShieldCheck,
  Brain,
  MessageSquare,
  Lock,
  Zap,
  CheckCircle2,
  ChevronRight,
  Headphones,
  Cpu,
} from 'lucide-react';
import Navbar from '../components/Navbar';

export function Landing() {
  const [selectedDemoLang, setSelectedDemoLang] = useState('mr');
  const [isHeroListening, setIsHeroListening] = useState(false);
  const [heroStep, setHeroStep] = useState(0); // 0: Idle, 1: Listening, 2: Understanding, 3: Responded

  // Multilingual sample phrases for interactive demo
  const samplePhrases = {
    mr: {
      lang: 'मराठी',
      sample: 'माझ्या ऑर्डरची स्थिती काय आहे?',
      response: 'तुमची ऑर्डर #VF-8492 सध्या डिलिव्हरीसाठी बाहेर पडली आहे आणि आज संध्याकाळी ५ वाजेपर्यंत पोहोचेल.',
      intent: 'Order Status Inquiry',
      translation: 'Your order #VF-8492 is currently out for delivery and will arrive today by 5:00 PM.',
    },
    hi: {
      lang: 'हिन्दी',
      sample: 'मेरी ऑर्डर की स्थिति क्या है?',
      response: 'आपका ऑर्डर #VF-8492 अभी डिलीवरी के लिए निकल चुका है और आज शाम ५ बजे तक पहुँच जाएगा।',
      intent: 'Order Status Inquiry',
      translation: 'Your order #VF-8492 is currently out for delivery and will arrive today by 5:00 PM.',
    },
    en: {
      lang: 'English',
      sample: 'What is my order status?',
      response: 'Your order #VF-8492 is currently out for delivery and is scheduled to arrive today by 5:00 PM.',
      intent: 'Order Status Inquiry',
      translation: 'तुमची ऑर्डर #VF-8492 सध्या डिलिव्हरीसाठी बाहेर पडली आहे.',
    },
  };

  const handleHeroMicClick = () => {
    if (isHeroListening) return;
    setIsHeroListening(true);
    setHeroStep(1); // Listening

    setTimeout(() => {
      setHeroStep(2); // Understanding
    }, 1600);

    setTimeout(() => {
      setHeroStep(3); // Responded
      setIsHeroListening(false);
    }, 3200);
  };

  return (
    <div className="min-h-screen bg-vf-bg text-vf-text flex flex-col font-sans selection:bg-vf-accent selection:text-white">
      <Navbar />

      {/* ------------------------------------------------------------ */}
      {/* 1. HERO SECTION */}
      {/* ------------------------------------------------------------ */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 overflow-hidden px-6 sm:px-8 border-b border-vf-border/60">
        <div className="max-w-7xl mx-auto">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 border border-vf-border text-xs font-mono tracking-wider uppercase text-vf-text mb-8">
            <span className="w-2 h-2 rounded-full bg-vf-accent animate-pulse" />
            <span>AI-Powered Multilingual Voice Intelligence</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Massive Editorial Typography */}
            <div className="lg:col-span-7">
              <h1 className="font-display font-extrabold text-5xl sm:text-7xl lg:text-8xl tracking-tighter text-vf-text leading-[0.95] mb-8">
                EVERY <br />
                <span className="text-vf-accent underline decoration-vf-accent/30 underline-offset-8">
                  VOICE.
                </span>{' '}
                <br />
                UNDERSTOOD.
              </h1>

              <p className="text-lg sm:text-xl text-vf-muted max-w-xl leading-relaxed mb-10 font-normal">
                VaaniFlow transforms natural human speech into context-aware, intelligent, and spoken multilingual conversations across Marathi, Hindi, and English.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/dashboard"
                  className="px-8 py-4 rounded-full bg-vf-text text-white font-semibold text-base hover:bg-vf-accent hover:shadow-lg hover:shadow-vf-accent/25 transition-all flex items-center gap-3 group"
                >
                  <span>Start Talking</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#how-it-works"
                  className="px-8 py-4 rounded-full border border-vf-border bg-white/70 hover:bg-white text-vf-text font-semibold text-base hover:border-vf-accent transition-all flex items-center gap-2"
                >
                  See How It Works
                </a>
              </div>
            </div>

            {/* Right Interactive Voice Experience Element */}
            <div className="lg:col-span-5">
              <div className="p-8 rounded-3xl bg-white border border-vf-border shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-vf-border">
                  <span className="font-mono text-xs uppercase tracking-widest text-vf-muted font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                    Interactive Voice Demo
                  </span>
                  <span className="text-xs font-mono text-vf-accent font-bold">
                    {samplePhrases[selectedDemoLang].lang}
                  </span>
                </div>

                {/* Waveform Visualization Box */}
                <div className="h-28 flex items-center justify-center gap-1.5 my-4 bg-vf-bg/80 rounded-2xl p-4 border border-vf-border/60">
                  {[0.3, 0.6, 0.9, 0.4, 1.0, 0.7, 0.5, 0.8, 0.3, 0.6, 0.9, 0.5, 0.4].map(
                    (val, idx) => (
                      <span
                        key={idx}
                        className={`w-1.5 rounded-full transition-all duration-300 ${
                          isHeroListening
                            ? 'bg-vf-accent animate-wave-flow'
                            : heroStep === 3
                            ? 'bg-amber-600'
                            : 'bg-vf-muted/40'
                        }`}
                        style={{
                          height: isHeroListening
                            ? `${Math.max(12, val * 64)}px`
                            : heroStep === 3
                            ? `${Math.max(8, val * 36)}px`
                            : '8px',
                          animationDelay: `${idx * 80}ms`,
                        }}
                      />
                    )
                  )}
                </div>

                {/* Interactive Status Display */}
                <div className="text-center my-6 min-h-[52px]">
                  {heroStep === 0 && (
                    <p className="text-sm font-medium text-vf-muted">
                      Click the microphone to test voice comprehension.
                    </p>
                  )}
                  {heroStep === 1 && (
                    <p className="text-sm font-semibold text-red-500 animate-pulse flex items-center justify-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Listening: "{samplePhrases[selectedDemoLang].sample}"
                    </p>
                  )}
                  {heroStep === 2 && (
                    <p className="text-sm font-semibold text-vf-accent flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Understanding intent with Gemini...
                    </p>
                  )}
                  {heroStep === 3 && (
                    <div className="text-left bg-vf-bg p-3.5 rounded-xl border border-vf-border text-xs leading-relaxed animate-fadeIn">
                      <div className="font-semibold text-vf-accent mb-1 flex items-center gap-1">
                        <Volume2 className="w-3.5 h-3.5" />
                        Spoken Response:
                      </div>
                      <p className="text-vf-text font-medium">
                        "{samplePhrases[selectedDemoLang].response}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Central Action Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleHeroMicClick}
                    disabled={isHeroListening}
                    aria-label="Try Voice Interaction"
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-lg ${
                      isHeroListening
                        ? 'bg-red-500 text-white shadow-red-500/30'
                        : 'bg-vf-accent hover:bg-vf-accent-hover text-white shadow-vf-accent/30 hover:scale-105'
                    }`}
                  >
                    <Mic className="w-7 h-7" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* 2. THREE-STEP EXPERIENCE (01 SPEAK, 02 UNDERSTAND, 03 RESPOND) */}
      {/* ------------------------------------------------------------ */}
      <section id="how-it-works" className="py-24 px-6 sm:px-8 bg-white border-b border-vf-border/60">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="font-mono text-xs uppercase tracking-widest text-vf-accent font-bold">
              The VaaniFlow Pipeline
            </span>
            <h2 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-vf-text mt-2">
              Three Steps. One Fluid Conversation.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-vf-bg border border-vf-border/80 flex flex-col justify-between hover:border-vf-accent/50 transition-all group">
              <div>
                <span className="font-mono text-5xl font-extrabold text-vf-accent/30 group-hover:text-vf-accent transition-colors">
                  01
                </span>
                <h3 className="font-display font-bold text-2xl text-vf-text mt-4 mb-3">
                  SPEAK
                </h3>
                <p className="text-sm text-vf-muted leading-relaxed">
                  Speak naturally in Marathi, Hindi, or English. High-accuracy speech recognition captures tone, intent, and nuances in real time.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-vf-border/60 flex items-center gap-2 text-xs font-mono text-vf-muted">
                <Mic className="w-4 h-4 text-vf-accent" />
                <span>Speech-to-Text (STT)</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-vf-bg border border-vf-border/80 flex flex-col justify-between hover:border-vf-accent/50 transition-all group">
              <div>
                <span className="font-mono text-5xl font-extrabold text-vf-accent/30 group-hover:text-vf-accent transition-colors">
                  02
                </span>
                <h3 className="font-display font-bold text-2xl text-vf-text mt-4 mb-3">
                  UNDERSTAND
                </h3>
                <p className="text-sm text-vf-muted leading-relaxed">
                  Gemini contextual intelligence interprets user intent and remembers past turns. Follow-up questions like "When will it arrive?" are understood flawlessly.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-vf-border/60 flex items-center gap-2 text-xs font-mono text-vf-muted">
                <Brain className="w-4 h-4 text-vf-accent" />
                <span>Context Memory Engine</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-vf-bg border border-vf-border/80 flex flex-col justify-between hover:border-vf-accent/50 transition-all group">
              <div>
                <span className="font-mono text-5xl font-extrabold text-vf-accent/30 group-hover:text-vf-accent transition-colors">
                  03
                </span>
                <h3 className="font-display font-bold text-2xl text-vf-text mt-4 mb-3">
                  RESPOND
                </h3>
                <p className="text-sm text-vf-muted leading-relaxed">
                  Receive an immediate spoken response in your native language with clean text translation, audio replay, and database persistence.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-vf-border/60 flex items-center gap-2 text-xs font-mono text-vf-muted">
                <Volume2 className="w-4 h-4 text-vf-accent" />
                <span>Text-to-Speech (TTS)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* 3. MULTILINGUAL SHOWCASE */}
      {/* ------------------------------------------------------------ */}
      <section id="languages" className="py-24 px-6 sm:px-8 border-b border-vf-border/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-mono text-xs uppercase tracking-widest text-vf-accent font-bold">
              Language Inclusivity
            </span>
            <h2 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-vf-text mt-2 mb-4">
              One Conversation. Any Language.
            </h2>
            <p className="text-vf-muted text-base">
              Bridge communication barriers with native phonetic support for India's regional languages and global English.
            </p>

            {/* Language Chips */}
            <div className="flex items-center justify-center gap-3 mt-8">
              {Object.keys(samplePhrases).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedDemoLang(key)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    selectedDemoLang === key
                      ? 'bg-vf-text text-white shadow-md'
                      : 'bg-white border border-vf-border text-vf-text hover:border-vf-accent'
                  }`}
                >
                  {samplePhrases[key].lang} ({key.toUpperCase()})
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Language Card */}
          <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-white border border-vf-border shadow-md">
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-vf-muted block mb-1">
                  User Speaks in {samplePhrases[selectedDemoLang].lang}:
                </span>
                <p className="text-2xl font-display font-bold text-vf-text">
                  "{samplePhrases[selectedDemoLang].sample}"
                </p>
              </div>

              <div className="pt-4 border-t border-vf-border">
                <span className="text-[11px] font-mono uppercase tracking-wider text-vf-accent font-bold block mb-1">
                  VaaniFlow Understands & Responds:
                </span>
                <p className="text-base text-vf-text font-medium leading-relaxed">
                  "{samplePhrases[selectedDemoLang].response}"
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-vf-bg border border-vf-border flex items-center justify-between text-xs">
                <span className="text-vf-muted font-mono">
                  Translation: {samplePhrases[selectedDemoLang].translation}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-700 font-semibold font-mono text-[10px]">
                  99% Confidence
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* 4. CONVERSATION MEMORY SPOTLIGHT */}
      {/* ------------------------------------------------------------ */}
      <section className="py-24 px-6 sm:px-8 bg-white border-b border-vf-border/60">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <span className="font-mono text-xs uppercase tracking-widest text-vf-accent font-bold">
              Context Memory
            </span>
            <h2 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-vf-text mt-2 mb-6">
              AI That Remembers the Conversation.
            </h2>
            <p className="text-base text-vf-muted leading-relaxed mb-6 font-normal">
              Most voice bots treat each sentence in isolation. VaaniFlow stores conversational context in Supabase PostgreSQL, allowing users to ask follow-up questions using pronouns like "it", "that", or "when" without repeating themselves.
            </p>
            <div className="space-y-3 font-medium text-sm text-vf-text">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Multi-turn context retention across turns</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Pronoun resolution (it, that, previous issue)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Persisted message history with user ownership isolation</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            {/* Visual Chat Sequence */}
            <div className="p-6 rounded-3xl bg-vf-bg border border-vf-border shadow-inner space-y-4">
              <div className="text-right">
                <div className="inline-block bg-vf-text text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-xs">
                  "माझ्या ऑर्डरची स्थिती काय आहे?"
                </div>
              </div>
              <div className="text-left">
                <div className="inline-block bg-white border border-vf-border px-4 py-2.5 rounded-2xl rounded-tl-sm text-xs text-vf-text shadow-sm">
                  "तुमची ऑर्डर #VF-8492 सध्या डिलिव्हरीसाठी बाहेर पडली आहे."
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block bg-vf-text text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-xs">
                  "ती कधी पोहोचेल?"
                </div>
              </div>
              <div className="text-left">
                <div className="inline-block bg-white border-2 border-vf-accent px-4 py-2.5 rounded-2xl rounded-tl-sm text-xs text-vf-text shadow-sm relative">
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-vf-accent text-white font-mono text-[9px] uppercase font-bold">
                    Context Retained
                  </span>
                  "तुमची ऑर्डर आज संध्याकाळी ५ वाजेपर्यंत पोहोचेल."
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* 5. CAPABILITIES SECTION */}
      {/* ------------------------------------------------------------ */}
      <section id="capabilities" className="py-24 px-6 sm:px-8 border-b border-vf-border/60">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="font-mono text-xs uppercase tracking-widest text-vf-accent font-bold">
              Core Architecture
            </span>
            <h2 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-vf-text mt-2">
              One Conversation. Multiple Intelligences.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Mic,
                num: '01',
                title: 'Speech-to-Text',
                desc: 'Turn natural speech into accurate, punctuated text without conversational friction.',
              },
              {
                icon: Brain,
                num: '02',
                title: 'Gemini Conversational AI',
                desc: 'Context-aware intelligence extracting intent, language nuances, and helpful answers.',
              },
              {
                icon: Globe,
                num: '03',
                title: 'Language Detection',
                desc: 'Automatic detection and seamless translation between Marathi, Hindi, and English.',
              },
              {
                icon: Volume2,
                num: '04',
                title: 'Text-to-Speech',
                desc: 'Natural sounding speech playback matching native accents and pronunciations.',
              },
              {
                icon: MessageSquare,
                num: '05',
                title: 'Conversation Memory',
                desc: 'Persistent contextual tracking of past questions and parameters in Supabase.',
              },
              {
                icon: ShieldCheck,
                num: '06',
                title: 'Backend-Only AI Security',
                desc: 'Zero secrets exposed to the browser. End-to-end token authenticated isolation.',
              },
            ].map((cap, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl bg-white border border-vf-border hover:border-vf-accent hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-vf-bg flex items-center justify-center text-vf-accent group-hover:scale-110 transition-transform">
                    <cap.icon className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-xs text-vf-muted font-bold">
                    {cap.num}
                  </span>
                </div>
                <h3 className="text-xl font-bold font-display text-vf-text mb-2">
                  {cap.title}
                </h3>
                <p className="text-sm text-vf-muted leading-relaxed font-normal">
                  {cap.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* 6. SECURITY SECTION */}
      {/* ------------------------------------------------------------ */}
      <section id="security" className="py-24 px-6 sm:px-8 bg-white border-b border-vf-border/60">
        <div className="max-w-7xl mx-auto text-center max-w-3xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-vf-accent/10 text-vf-accent flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-vf-accent font-bold">
            Security by Design
          </span>
          <h2 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-vf-text mt-2 mb-4">
            Your Conversation. Your Control.
          </h2>
          <p className="text-vf-muted text-base leading-relaxed mb-10">
            VaaniFlow keeps AI credentials and sensitive keys strictly on the server. Every conversation query enforces strict authenticated ownership boundaries.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-vf-bg border border-vf-border">
              <span className="font-mono text-xs text-vf-accent font-bold block mb-1">01</span>
              <h4 className="font-bold text-sm text-vf-text mb-1">Backend-Only Keys</h4>
              <p className="text-xs text-vf-muted">
                No GEMINI_API_KEY, STT_API_KEY, or DB strings are ever exposed to the client bundle.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-vf-bg border border-vf-border">
              <span className="font-mono text-xs text-vf-accent font-bold block mb-1">02</span>
              <h4 className="font-bold text-sm text-vf-text mb-1">Strict Ownership</h4>
              <p className="text-xs text-vf-muted">
                Users can only read and manage their own conversations. Unauthorized queries return 401/404.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-vf-bg border border-vf-border">
              <span className="font-mono text-xs text-vf-accent font-bold block mb-1">03</span>
              <h4 className="font-bold text-sm text-vf-text mb-1">Bcrypt & JWT</h4>
              <p className="text-xs text-vf-muted">
                Salted hashing for passwords and secure cryptographic bearer tokens for state verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* 7. FINAL CALL TO ACTION */}
      {/* ------------------------------------------------------------ */}
      <section className="py-28 px-6 sm:px-8 bg-vf-text text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-vf-accent text-xs font-mono uppercase tracking-widest font-semibold mb-6">
            Ready to Experience VaaniFlow?
          </span>
          <h2 className="text-5xl sm:text-7xl font-display font-extrabold tracking-tighter mb-8 leading-none">
            LET YOUR VOICE <br />
            DO THE TALKING.
          </h2>
          <p className="text-lg text-zinc-300 max-w-xl mx-auto mb-10 leading-relaxed font-normal">
            Start communicating naturally across languages. Log in or create an account to begin your first contextual voice conversation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="px-9 py-4 rounded-full bg-vf-accent text-white font-bold text-base hover:bg-vf-accent-hover transition-all flex items-center gap-3 shadow-lg shadow-vf-accent/30 group"
            >
              <span>Try VaaniFlow Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* 8. FOOTER */}
      {/* ------------------------------------------------------------ */}
      <footer className="py-12 px-6 sm:px-8 border-t border-vf-border bg-white text-xs text-vf-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-vf-text text-white flex items-center justify-center font-bold text-xs">
              V
            </div>
            <span className="font-display font-bold text-sm text-vf-text">
              VAANIFLOW
            </span>
            <span className="text-[11px] font-mono text-vf-muted">
              — Every Voice. Understood.
            </span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <a href="#how-it-works" className="hover:text-vf-accent">
              How It Works
            </a>
            <a href="#languages" className="hover:text-vf-accent">
              Languages
            </a>
            <a href="#security" className="hover:text-vf-accent">
              Security
            </a>
            <Link to="/login" className="hover:text-vf-accent">
              Sign In
            </Link>
          </div>

          <div className="font-mono text-[11px]">
            © {new Date().getFullYear()} VaaniFlow MVP. Multilingual Voice Intelligence.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;

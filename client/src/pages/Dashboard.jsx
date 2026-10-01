import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';
import { useConversation } from '../hooks/useConversation';
import { useVoice } from '../hooks/useVoice';

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    currentConversation,
    messages,
    isLoadingMessages,
    isGenerating,
    aiStatus,
    error,
    inputLanguage,
    responseLanguage,
    setInputLanguage,
    setResponseLanguage,
    sendMessage,
    createConversation,
  } = useConversation();

  const {
    voiceState,
    setVoiceState,
    isListening,
    interimTranscript,
    isSpeaking,
    speakingLanguage,
    voiceError,
    startListening,
    stopListening,
    speak,
  } = useVoice();

  // Voice button toggle
  const handleToggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(inputLanguage, async (finalTranscript) => {
        if (finalTranscript && finalTranscript.trim()) {
          setVoiceState('THINKING');
          const assistantMsg = await sendMessage(finalTranscript);
          if (assistantMsg?.content) {
            // Auto-speak response in the AI's actual returned response language
            const langToSpeak = assistantMsg.language || responseLanguage || inputLanguage;
            speak(assistantMsg.content, langToSpeak);
          } else {
            setVoiceState('IDLE');
          }
        }
      });
    }
  };

  // When user clicks a prompt from the EmptyState
  const handleSelectPrompt = async (text, lang) => {
    if (lang) {
      setInputLanguage(lang);
      setResponseLanguage(lang);
    }
    const assistantMsg = await sendMessage(text);
    if (assistantMsg?.content) {
      const langToSpeak = assistantMsg.language || lang || responseLanguage;
      speak(assistantMsg.content, langToSpeak);
    }
  };

  // Text message send
  const handleSendMessage = async (text) => {
    const assistantMsg = await sendMessage(text);
    if (assistantMsg?.content) {
      // Optional speech response in the AI's actual returned response language
      const langToSpeak = assistantMsg.language || responseLanguage || inputLanguage;
      speak(assistantMsg.content, langToSpeak);
    }
  };

  const handleLanguageChange = (lang) => {
    setInputLanguage(lang);
    setResponseLanguage(lang);
  };

  return (
    <div className="flex h-screen bg-[#F5F3EE] dark:bg-[#111111] text-[#151515] dark:text-zinc-100 overflow-hidden font-sans">
      {/* Collapsible Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Interactive Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <ChatWindow
          conversation={currentConversation}
          messages={messages}
          isLoading={isLoadingMessages}
          isGenerating={isGenerating}
          aiStatus={aiStatus}
          error={error}
          inputLanguage={inputLanguage}
          responseLanguage={responseLanguage}
          onSelectLanguage={handleLanguageChange}
          onStartVoice={handleToggleVoice}
          onSelectPrompt={handleSelectPrompt}
          onOpenSidebar={() => setSidebarOpen(true)}
          onRetry={() => {
            const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
            if (lastUserMsg) {
              handleSendMessage(lastUserMsg.content);
            }
          }}
          voiceState={voiceState}
          isListening={isListening}
          isSpeaking={isSpeaking}
          speakingLanguage={speakingLanguage}
        />

        {/* Bottom Input Area with Integrated Voice and Text */}
        <MessageInput
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
          isListening={isListening}
          interimTranscript={interimTranscript}
          onToggleVoice={handleToggleVoice}
          inputLanguage={inputLanguage}
          onSelectLanguage={handleLanguageChange}
          voiceError={voiceError}
        />
      </div>
    </div>
  );
}

export default Dashboard;

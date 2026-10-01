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
    isListening,
    interimTranscript,
    isSpeaking,
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
          const assistantMsg = await sendMessage(finalTranscript);
          if (assistantMsg?.content) {
            // Auto-speak response in target language
            speak(assistantMsg.content, responseLanguage);
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
      speak(assistantMsg.content, lang || responseLanguage);
    }
  };

  const handleSendMessage = async (text) => {
    const assistantMsg = await sendMessage(text);
    if (assistantMsg?.content) {
      // Optional speech response on text input
      speak(assistantMsg.content, responseLanguage);
    }
  };

  return (
    <div className="flex h-screen bg-vf-bg dark:bg-vf-dark text-vf-text dark:text-zinc-100 overflow-hidden font-sans">
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
          onSelectLanguage={setInputLanguage}
          onStartVoice={handleToggleVoice}
          onSelectPrompt={handleSelectPrompt}
          onOpenSidebar={() => setSidebarOpen(true)}
          onRetry={() => {
            const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
            if (lastUserMsg) {
              handleSendMessage(lastUserMsg.content);
            }
          }}
        />

        {/* Bottom Input Area with Integrated Voice and Text */}
        <MessageInput
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
          isListening={isListening}
          interimTranscript={interimTranscript}
          onToggleVoice={handleToggleVoice}
          inputLanguage={inputLanguage}
          onSelectLanguage={(lang) => {
            setInputLanguage(lang);
            setResponseLanguage(lang);
          }}
          voiceError={voiceError}
        />
      </div>
    </div>
  );
}

export default Dashboard;

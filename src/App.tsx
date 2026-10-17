import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ChatView } from './components/chat/ChatView';
import { AgentInspectorPanel } from './components/chat/AgentInspectorPanel';
import { LearnView } from './components/learn/LearnView';
import { DailyLifeView } from './components/daily/DailyLifeView';
import { CareerView } from './components/career/CareerView';
import { VoiceConsoleView } from './components/voice/VoiceConsoleView';
import { KnowledgeBaseView } from './components/rag/KnowledgeBaseView';
import { TicketsView } from './components/tickets/TicketsView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { SettingsView } from './components/settings/SettingsView';
import { VivaDocsModal } from './components/docs/VivaDocsModal';
import {
  UserProfile,
  Conversation,
  Message,
  Language,
  AssistantMode,
  UserRole,
  UserPreferences,
} from './types';
import { api, setActiveUserId } from './lib/api';

export default function App() {
  // Current user state
  const [user, setUser] = useState<UserProfile>({
    id: 'usr_default',
    name: 'Krunal Parmar',
    email: 'krunalparmar0809@gmail.com',
    role: 'user',
    preferences: {
      preferredLanguage: 'en',
      assistantMode: 'student',
      readingLevel: 'intermediate',
      fontSize: 'normal',
      highContrast: false,
      reducedMotion: false,
      simplifiedUI: false,
      voiceAutoRead: false,
      speechRate: 1.0,
    },
    createdAt: new Date().toISOString(),
  });

  // Navigation & Layout
  const [currentTab, setCurrentTab] = useState<string>('chat');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isVivaDocsOpen, setIsVivaDocsOpen] = useState(false);

  // Conversations & Chat
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [escalatedTicketContext, setEscalatedTicketContext] = useState<string | undefined>();

  // Fetch initial profile & conversations
  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      const [profileRes, convsRes] = await Promise.all([
        api.getUserProfile(),
        api.getConversations(),
      ]);

      if (profileRes.user) {
        setUser(profileRes.user);
      }

      if (convsRes.conversations && convsRes.conversations.length > 0) {
        setConversations(convsRes.conversations);
        const firstId = convsRes.conversations[0].id;
        setActiveConversationId(firstId);
        loadMessages(firstId);
      } else {
        handleNewConversation();
      }
    } catch (e) {
      console.error('Failed to initialize app state:', e);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const res = await api.getMessages(convId);
      if (res.messages) {
        setMessages(res.messages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    loadMessages(id);
  };

  const handleNewConversation = async () => {
    try {
      const res = await api.createConversation(
        'New Conversation',
        user.preferences.assistantMode,
        user.preferences.preferredLanguage
      );
      if (res.conversation) {
        setConversations(prev => [res.conversation, ...prev]);
        setActiveConversationId(res.conversation.id);
        setMessages([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await api.deleteConversation(id);
      const remaining = conversations.filter(c => c.id !== id);
      setConversations(remaining);
      if (activeConversationId === id) {
        if (remaining.length > 0) {
          handleSelectConversation(remaining[0].id);
        } else {
          handleNewConversation();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    try {
      const res = await api.renameConversation(id, newTitle);
      if (res.conversation) {
        setConversations(prev =>
          prev.map(c => (c.id === id ? res.conversation : c))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your conversation history?')) {
      return;
    }
    try {
      await api.clearAllConversations();
      setConversations([]);
      setMessages([]);
      handleNewConversation();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Optimistic user message update
    const tempUserMsg: Message = {
      id: `temp_u_${Date.now()}`,
      conversationId: activeConversationId || '',
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const res = await api.sendMessage(
        text,
        activeConversationId || undefined,
        user.preferences.assistantMode,
        user.preferences.preferredLanguage
      );

      if (res.conversationId && res.conversationId !== activeConversationId) {
        setActiveConversationId(res.conversationId);
      }

      setMessages(prev => [
        ...prev.filter(m => m.id !== tempUserMsg.id),
        res.userMessage,
        res.assistantMessage,
      ]);

      // Update conversation list title
      setConversations(prev =>
        prev.map(c => {
          if (c.id === (res.conversationId || activeConversationId)) {
            return {
              ...c,
              title:
                c.title === 'New Conversation'
                  ? text.slice(0, 36) + (text.length > 36 ? '...' : '')
                  : c.title,
              updatedAt: new Date().toISOString(),
            };
          }
          return c;
        })
      );
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        conversationId: activeConversationId || '',
        role: 'assistant',
        content: `Error: ${err?.message || 'Unable to generate response. Please retry or open a support ticket.'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (messageId: string, rating: 'up' | 'down') => {
    try {
      await api.sendFeedback(messageId, rating);
      setMessages(prev =>
        prev.map(m => (m.id === messageId ? { ...m, feedback: rating } : m))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleEscalateToTicket = (contextMessage: string) => {
    setEscalatedTicketContext(contextMessage);
    setCurrentTab('tickets');
  };

  const handleUpdatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    try {
      const res = await api.updatePreferences(newPrefs);
      if (res.preferences) {
        setUser(prev => ({ ...prev, preferences: res.preferences }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSwitchRole = async (newRole: UserRole) => {
    try {
      const res = await api.switchRole(newRole);
      if (res.user) {
        setUser(res.user);
        setActiveUserId(res.user.id);
        const convsRes = await api.getConversations();
        if (convsRes.conversations) {
          setConversations(convsRes.conversations);
          if (convsRes.conversations.length > 0) {
            handleSelectConversation(convsRes.conversations[0].id);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Find latest assistant message with agent trace
  const latestAssistantMessage = [...messages]
    .reverse()
    .find(m => m.role === 'assistant' && m.trace);

  // Active senior mode class helper
  const isSeniorMode = user.preferences.assistantMode === 'senior';

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 ${
        isSeniorMode ? 'senior-mode' : ''
      } ${user.preferences.highContrast ? 'contrast-125' : ''}`}
    >
      {/* 1. Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={tab => {
          setCurrentTab(tab);
          if (tab !== 'chat') {
            setIsRightPanelOpen(false);
          }
        }}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onClearHistory={handleClearHistory}
        user={user}
        onSwitchRole={handleSwitchRole}
        onOpenVivaDocs={() => setIsVivaDocsOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. Main Content Center View */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Header
          onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
          language={user.preferences.preferredLanguage}
          onLanguageChange={lang => handleUpdatePreferences({ preferredLanguage: lang })}
          assistantMode={user.preferences.assistantMode}
          onModeChange={mode => handleUpdatePreferences({ assistantMode: mode })}
          preferences={user.preferences}
          onToggleHighContrast={() =>
            handleUpdatePreferences({ highContrast: !user.preferences.highContrast })
          }
          onToggleSeniorMode={() =>
            handleUpdatePreferences({
              assistantMode: isSeniorMode ? 'student' : 'senior',
            })
          }
          isRightPanelOpen={isRightPanelOpen}
          onToggleRightPanel={() => setIsRightPanelOpen(prev => !prev)}
        />

        {/* Dynamic Tab Views */}
        <main className="flex-1 flex overflow-hidden min-w-0 relative">
          {currentTab === 'chat' && (
            <ChatView
              conversation={
                conversations.find(c => c.id === activeConversationId) || null
              }
              messages={messages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              onStopGeneration={() => setIsLoading(false)}
              onFeedback={handleFeedback}
              onEscalateToTicket={handleEscalateToTicket}
              language={user.preferences.preferredLanguage}
              assistantMode={user.preferences.assistantMode}
              preferences={user.preferences}
              onQuickPrompt={prompt => handleSendMessage(prompt)}
            />
          )}

          {currentTab === 'learn' && (
            <LearnView
              language={user.preferences.preferredLanguage}
              onAskChat={prompt => {
                setCurrentTab('chat');
                handleSendMessage(prompt);
              }}
            />
          )}

          {currentTab === 'daily' && (
            <DailyLifeView
              language={user.preferences.preferredLanguage}
              onAskChat={prompt => {
                setCurrentTab('chat');
                handleSendMessage(prompt);
              }}
            />
          )}

          {currentTab === 'career' && (
            <CareerView
              language={user.preferences.preferredLanguage}
              onAskChat={prompt => {
                setCurrentTab('chat');
                handleSendMessage(prompt);
              }}
            />
          )}

          {currentTab === 'voice' && (
            <VoiceConsoleView
              language={user.preferences.preferredLanguage}
              onLanguageChange={lang =>
                handleUpdatePreferences({ preferredLanguage: lang })
              }
              preferences={user.preferences}
              onSendVoiceMessage={async text => {
                handleSendMessage(text);
                const res = await api.sendMessage(
                  text,
                  activeConversationId || undefined,
                  user.preferences.assistantMode,
                  user.preferences.preferredLanguage
                );
                return res.assistantMessage.content;
              }}
            />
          )}

          {currentTab === 'rag' && <KnowledgeBaseView />}

          {currentTab === 'tickets' && (
            <TicketsView
              user={user}
              initialEscalatedText={escalatedTicketContext}
              onClearEscalatedText={() => setEscalatedTicketContext(undefined)}
            />
          )}

          {currentTab === 'admin' && (
            <AdminDashboardView user={user} onSwitchRole={handleSwitchRole} />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              user={user}
              onUpdatePreferences={handleUpdatePreferences}
              onClearHistory={handleClearHistory}
            />
          )}

          {/* 3. Collapsible Right Context / Multi-Agent Inspector Panel */}
          {currentTab === 'chat' && (
            <AgentInspectorPanel
              isOpen={isRightPanelOpen}
              onClose={() => setIsRightPanelOpen(false)}
              trace={latestAssistantMessage?.trace}
              sources={latestAssistantMessage?.sources}
            />
          )}
        </main>
      </div>

      {/* 4. M.Sc. IT Viva & Architecture Documentation Modal */}
      <VivaDocsModal
        isOpen={isVivaDocsOpen}
        onClose={() => setIsVivaDocsOpen(false)}
      />
    </div>
  );
}

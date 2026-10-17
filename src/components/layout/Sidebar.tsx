import React, { useState } from 'react';
import {
  MessageSquare,
  GraduationCap,
  Sparkles,
  Briefcase,
  Mic,
  Database,
  Ticket,
  ShieldCheck,
  Sliders,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  ChevronRight,
} from 'lucide-react';
import { Conversation, UserProfile, UserRole } from '../../types';
import { translations } from '../../locales';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onClearHistory: () => void;
  user: UserProfile;
  onSwitchRole: (role: UserRole) => void;
  onOpenVivaDocs: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  onClearHistory,
  user,
  onSwitchRole,
  onOpenVivaDocs,
  isMobileOpen,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const t = translations[user.preferences.preferredLanguage] || translations.en;

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startRename = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const navItems = [
    { id: 'chat', label: t.navChat, icon: MessageSquare },
    { id: 'learn', label: t.navLearn, icon: GraduationCap },
    { id: 'daily', label: t.navDailyLife, icon: Sparkles },
    { id: 'career', label: t.navCareer, icon: Briefcase },
    { id: 'voice', label: t.navVoice, icon: Mic },
    { id: 'rag', label: t.navKnowledge, icon: Database },
    { id: 'tickets', label: t.navTickets, icon: Ticket },
    { id: 'admin', label: t.navAdmin, icon: ShieldCheck, badge: user.role !== 'admin' ? 'Staff' : undefined },
    { id: 'settings', label: t.navSettings, icon: Sliders },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-xs transition-opacity duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-[84vw] max-w-[280px] md:w-72 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out shrink-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <circle cx="9" cy="10" r="1.5" fill="currentColor" />
                <circle cx="15" cy="10" r="1.5" fill="currentColor" />
                <path d="M9.5 13.5c1 1 4 1 5 0" strokeLinecap="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight truncate flex items-center gap-1.5">
                LifeMate <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">AI</span>
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                {t.tagline}
              </p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary New Chat CTA */}
        <div className="p-2.5 sm:p-3 shrink-0">
          <button
            onClick={() => {
              onSelectTab('chat');
              onNewConversation();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-all shadow-indigo-600/20 min-h-[40px]"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="truncate">{t.newChat}</span>
          </button>
        </div>

        {/* Main Navigation */}
        <div className="px-2.5 sm:px-3 py-1 space-y-0.5 sm:space-y-1 shrink-0">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors min-h-[38px] ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`} />
                  <span className="truncate text-left">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Recent Conversations List */}
        <div className="flex-1 overflow-y-auto px-2.5 sm:px-3 py-2 border-t border-slate-200 dark:border-slate-800 mt-2 min-h-0">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Recent Chats
            </span>
            {conversations.length > 0 && (
              <button
                onClick={onClearHistory}
                title={t.clearHistory}
                className="text-[10px] text-slate-400 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Search Box */}
          {conversations.length > 3 && (
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={t.searchConversations}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-200 border-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}

          <div className="space-y-1">
            {filteredConversations.length === 0 ? (
              <p className="text-xs text-slate-400 italic px-2 py-3 text-center">
                {searchQuery ? 'No matching chats' : t.noConversations}
              </p>
            ) : (
              filteredConversations.map(conv => {
                const isSelected = conv.id === activeConversationId && currentTab === 'chat';
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      onSelectTab('chat');
                      onSelectConversation(conv.id);
                      onCloseMobile();
                    }}
                    className={`group relative flex items-center justify-between px-2.5 sm:px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors min-h-[36px] ${
                      isSelected
                        ? 'bg-indigo-100/70 dark:bg-indigo-900/40 text-indigo-900 dark:text-indigo-200 font-medium'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {editingId === conv.id ? (
                      <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveRename(conv.id)}
                          className="w-full px-1.5 py-0.5 text-xs bg-white dark:bg-slate-900 border border-indigo-400 rounded"
                          autoFocus
                        />
                        <button onClick={() => saveRename(conv.id)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1 text-slate-400 hover:bg-slate-200 rounded">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 truncate pr-6 min-w-0">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{conv.title}</span>
                        </div>
                        <div className="hidden group-hover:flex items-center gap-1 absolute right-2 bg-inherit pl-1">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              startRename(conv);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600"
                            title="Rename"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onDeleteConversation(conv.id);
                            }}
                            className="p-1 text-slate-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Academic Project Viva & Architecture Guide Button */}
        <div className="p-2.5 sm:p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <button
            onClick={() => {
              onOpenVivaDocs();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-200 dark:border-purple-800/50 text-purple-900 dark:text-purple-200 hover:shadow-xs transition-all text-xs font-medium"
          >
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <div className="text-left truncate">
                <span className="font-bold block truncate">M.Sc. IT Viva & Docs</span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 block truncate">10 Agents, RAG, Viva Q&A</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          </button>
        </div>

        {/* User Profile & Demo Role Switcher */}
        <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 truncate">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-500 capitalize truncate">{user.role} Account</p>
              </div>
            </div>
          </div>

          {/* Quick Role-Switcher to demonstrate RBAC */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 sm:p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px]">
            <span className="text-slate-400 px-1 font-medium hidden sm:inline">Role:</span>
            <button
              onClick={() => onSwitchRole('user')}
              className={`flex-1 py-1 rounded font-medium transition-colors text-center truncate ${
                user.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              User
            </button>
            <button
              onClick={() => onSwitchRole('support')}
              className={`flex-1 py-1 rounded font-medium transition-colors text-center truncate ${
                user.role === 'support'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Support
            </button>
            <button
              onClick={() => onSwitchRole('admin')}
              className={`flex-1 py-1 rounded font-medium transition-colors text-center truncate ${
                user.role === 'admin'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

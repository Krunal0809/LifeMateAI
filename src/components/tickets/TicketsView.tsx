import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Plus,
  Send,
  ChevronLeft,
} from 'lucide-react';
import { SupportTicket, UserProfile, TicketStatus } from '../../types';
import { api } from '../../lib/api';

interface TicketsViewProps {
  user: UserProfile;
  initialEscalatedText?: string;
  onClearEscalatedText?: () => void;
}

export const TicketsView: React.FC<TicketsViewProps> = ({
  user,
  initialEscalatedText,
  onClearEscalatedText,
}) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  // New Ticket Modal state
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(Boolean(initialEscalatedText));
  const [subject, setSubject] = useState(
    initialEscalatedText ? 'Query Escalated from AI Chat' : ''
  );
  const [description, setDescription] = useState(initialEscalatedText || '');
  const [category, setCategory] = useState<SupportTicket['category']>('Education');
  const [priority, setPriority] = useState<SupportTicket['priority']>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reply state
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (initialEscalatedText) {
      setSubject('Query Escalated from AI Chat');
      setDescription(initialEscalatedText);
      setIsNewTicketOpen(true);
    }
  }, [initialEscalatedText]);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const res = await api.getTickets();
      if (res.tickets) {
        setTickets(res.tickets);
        if (res.tickets.length > 0 && !activeTicket) {
          setActiveTicket(res.tickets[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await api.createTicket({
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority,
      });
      if (res.ticket) {
        setTickets(prev => [res.ticket, ...prev]);
        setActiveTicket(res.ticket);
        setMobileView('detail');
        setIsNewTicketOpen(false);
        setSubject('');
        setDescription('');
        if (onClearEscalatedText) onClearEscalatedText();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim() || isReplying) return;
    setIsReplying(true);
    try {
      const res = await api.replyToTicket(activeTicket.id, replyText.trim());
      if (res.ticket) {
        setActiveTicket(res.ticket);
        setTickets(prev => prev.map(t => (t.id === res.ticket.id ? res.ticket : t)));
        setReplyText('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsReplying(false);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!activeTicket) return;
    try {
      const res = await api.updateTicketStatus(activeTicket.id, newStatus);
      if (res.ticket) {
        setActiveTicket(res.ticket);
        setTickets(prev => prev.map(t => (t.id === res.ticket.id ? res.ticket : t)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px]">Open</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">In Progress</span>;
      case 'waiting_for_user':
        return <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[10px]">Waiting for User</span>;
      case 'resolved':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">Resolved</span>;
      case 'closed':
        return <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">Closed</span>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-2.5 sm:p-6 md:p-8 min-w-0">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Module Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 shrink-0">
                <Ticket className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Human Support & Ticket System
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Connect with faculty support staff when AI assistance needs human review.
            </p>
          </div>

          <button
            onClick={() => setIsNewTicketOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-2xs min-h-[38px]"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Ticket</span>
          </button>
        </div>

        {/* Mobile View Toggle if Active Ticket */}
        <div className="md:hidden flex items-center justify-between bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setMobileView('list')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              mobileView === 'list'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Tickets List ({filteredTickets.length})
          </button>
          <button
            onClick={() => setMobileView('detail')}
            disabled={!activeTicket}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              mobileView === 'detail'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 dark:text-slate-300'
            } disabled:opacity-40`}
          >
            Ticket Conversation
          </button>
        </div>

        {/* Tickets Layout: Master-Detail */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Left: Tickets List (hidden on mobile if detail view is active) */}
          <div className={`md:col-span-1 space-y-3 ${mobileView === 'detail' ? 'hidden md:block' : 'block'}`}>
            {/* Filter pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 text-xs">
              {(['all', 'open', 'in_progress', 'resolved'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg capitalize font-medium shrink-0 text-[11px] sm:text-xs ${
                    statusFilter === st
                      ? 'bg-amber-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="space-y-2">
              {filteredTickets.length === 0 ? (
                <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                  No support tickets found.
                </div>
              ) : (
                filteredTickets.map(ticket => {
                  const isSelected = activeTicket?.id === ticket.id;
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => {
                        setActiveTicket(ticket);
                        setMobileView('detail');
                      }}
                      className={`p-3 sm:p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 gap-1">
                        <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-xs">
                          {ticket.id}
                        </span>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 text-xs sm:text-sm">
                        {ticket.subject}
                      </h3>
                      <p className="text-slate-500 line-clamp-2 mt-0.5 text-[11px] sm:text-xs leading-relaxed">
                        {ticket.description}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                        <span>{ticket.category}</span>
                        <span>{ticket.messages.length} replies</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Active Ticket Details & Conversation Thread */}
          <div className={`md:col-span-2 ${mobileView === 'list' ? 'hidden md:block' : 'block'}`}>
            {activeTicket ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col h-[520px] sm:h-[600px] max-w-full">
                {/* Ticket Header */}
                <div className="p-3.5 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <button
                        onClick={() => setMobileView('list')}
                        className="md:hidden p-1 text-slate-500 hover:text-slate-800 -ml-1"
                        aria-label="Back to tickets list"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="font-mono font-bold text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                        {activeTicket.id}
                      </span>
                      {getStatusBadge(activeTicket.status)}
                      <span className="text-[11px] text-slate-400">
                        Priority: <strong className="capitalize">{activeTicket.priority}</strong>
                      </span>
                    </div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                      {activeTicket.subject}
                    </h2>
                    <p className="text-[10px] sm:text-xs text-slate-400 truncate mt-0.5">
                      Submitted by {activeTicket.userName} ({activeTicket.userEmail})
                    </p>
                  </div>

                  {/* Status Management for Support & Admin */}
                  {(user.role === 'support' || user.role === 'admin') && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs text-slate-500 font-medium">Status:</span>
                      <select
                        value={activeTicket.status}
                        onChange={e => handleStatusChange(e.target.value as TicketStatus)}
                        className="text-xs py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="waiting_for_user">Waiting for User</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Message Thread */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3">
                  {activeTicket.messages.map(msg => {
                    const isStaff = msg.senderRole === 'support' || msg.senderRole === 'admin';
                    return (
                      <div
                        key={msg.id}
                        className={`p-3 sm:p-4 rounded-xl text-xs space-y-1 ${
                          isStaff
                            ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 ml-2 sm:ml-4'
                            : 'bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 mr-2 sm:mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className={isStaff ? 'text-purple-700 dark:text-purple-300' : 'text-slate-800 dark:text-slate-200'}>
                            {msg.senderName} {isStaff && '(Staff)'}
                          </span>
                          <span className="text-slate-400 font-normal text-[10px]">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                          {msg.message}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Composer */}
                <form
                  onSubmit={handleSendReply}
                  className="p-2 sm:p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 sm:gap-2 bg-slate-50 dark:bg-slate-900/60 shrink-0"
                >
                  <input
                    type="text"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Write your response to this ticket..."
                    className="flex-1 p-2 sm:p-2.5 text-xs bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 min-w-0"
                  />
                  <button
                    type="submit"
                    disabled={isReplying || !replyText.trim()}
                    className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-2xs disabled:opacity-50 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Reply</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                Select a ticket from the list to view conversation.
              </div>
            )}
          </div>
        </div>

        {/* Create Ticket Modal */}
        {isNewTicketOpen && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-2xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-3.5 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
                Open Human Support Ticket
              </h3>

              <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-500 block mb-1">Subject / Question Summary</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="E.g., Need clarification on AI quiz score or exam schedule"
                    className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-500 block mb-1">Category</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as any)}
                      className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="Education">Education</option>
                      <option value="Daily Life">Daily Life</option>
                      <option value="Tech Issue">Tech Issue</option>
                      <option value="Career">Career</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-500 block mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value as any)}
                      className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High (Urgent)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-500 block mb-1">Detailed Explanation</label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Explain what assistance you need from our human guidance team..."
                    className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewTicketOpen(false);
                      if (onClearEscalatedText) onClearEscalatedText();
                    }}
                    className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-2xs"
                  >
                    {isSubmitting ? 'Creating...' : 'Generate Ticket'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import {
  UserProfile,
  Conversation,
  Message,
  SupportTicket,
  TicketMessage,
  TaskItem,
  SystemMetrics,
  UserPreferences,
  Language,
  AssistantMode,
  UserRole,
} from '../../src/types';

class LifeMateDatabase {
  private users: Map<string, UserProfile> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message[]> = new Map();
  private tickets: Map<string, SupportTicket> = new Map();
  private tasks: Map<string, TaskItem[]> = new Map();
  private feedbackList: Array<{ id: string; messageId: string; rating: 'up' | 'down'; comment?: string; createdAt: string }> = [];
  private auditLogs: Array<{ id: string; action: string; timestamp: string; details: string }> = [];

  constructor() {
    this.seedInitialData();
  }

  // --- Users & Profiles ---
  public getUser(userId: string): UserProfile | undefined {
    return this.users.get(userId);
  }

  public upsertUser(user: UserProfile): UserProfile {
    this.users.set(user.id, user);
    return user;
  }

  public updateUserPreferences(userId: string, prefs: Partial<UserPreferences>): UserPreferences | null {
    const user = this.users.get(userId);
    if (!user) return null;
    user.preferences = { ...user.preferences, ...prefs };
    this.users.set(userId, user);
    this.logAction('USER_PREFS_UPDATED', `Preferences updated for user ${user.name}`);
    return user.preferences;
  }

  // --- Conversations ---
  public getConversations(userId: string): Conversation[] {
    return Array.from(this.conversations.values())
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public getConversation(id: string): Conversation | undefined {
    const conv = this.conversations.get(id);
    if (conv) {
      conv.messages = this.messages.get(id) || [];
    }
    return conv;
  }

  public createConversation(
    userId: string,
    title: string = 'New Conversation',
    assistantMode: AssistantMode = 'simple',
    language: Language = 'en'
  ): Conversation {
    const id = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const conv: Conversation = {
      id,
      userId,
      title,
      createdAt: now,
      updatedAt: now,
      messages: [],
      assistantMode,
      language,
    };
    this.conversations.set(id, conv);
    this.messages.set(id, []);
    this.logAction('CONVERSATION_CREATED', `Conversation ${id} created for user ${userId}`);
    return conv;
  }

  public renameConversation(id: string, newTitle: string): Conversation | null {
    const conv = this.conversations.get(id);
    if (!conv) return null;
    conv.title = newTitle;
    conv.updatedAt = new Date().toISOString();
    this.conversations.set(id, conv);
    return conv;
  }

  public deleteConversation(id: string): boolean {
    const deleted = this.conversations.delete(id);
    this.messages.delete(id);
    this.logAction('CONVERSATION_DELETED', `Conversation ${id} removed.`);
    return deleted;
  }

  public clearAllConversations(userId: string): void {
    for (const [id, conv] of this.conversations.entries()) {
      if (conv.userId === userId) {
        this.conversations.delete(id);
        this.messages.delete(id);
      }
    }
    this.logAction('HISTORY_CLEARED', `All conversations cleared for user ${userId}`);
  }

  // --- Messages ---
  public getMessages(conversationId: string): Message[] {
    return this.messages.get(conversationId) || [];
  }

  public addMessage(msg: Message): Message {
    const list = this.messages.get(msg.conversationId) || [];
    list.push(msg);
    this.messages.set(msg.conversationId, list);

    // Update conversation timestamp and title if first user message
    const conv = this.conversations.get(msg.conversationId);
    if (conv) {
      conv.updatedAt = msg.timestamp;
      if (conv.title === 'New Conversation' && msg.role === 'user') {
        // Generate helpful title from first 6 words
        conv.title = msg.content.slice(0, 38).trim() + (msg.content.length > 38 ? '...' : '');
      }
      this.conversations.set(msg.conversationId, conv);
    }

    return msg;
  }

  public setMessageFeedback(messageId: string, rating: 'up' | 'down'): boolean {
    let found = false;
    for (const [_, msgList] of this.messages.entries()) {
      for (const m of msgList) {
        if (m.id === messageId) {
          m.feedback = rating;
          found = true;
          break;
        }
      }
      if (found) break;
    }
    this.feedbackList.push({
      id: `fb_${Date.now()}`,
      messageId,
      rating,
      createdAt: new Date().toISOString(),
    });
    return found;
  }

  // --- Support Tickets ---
  public getTickets(userId?: string, userRole?: UserRole): SupportTicket[] {
    const all = Array.from(this.tickets.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (userRole === 'admin' || userRole === 'support') {
      return all;
    }
    return userId ? all.filter(t => t.userId === userId) : all;
  }

  public getTicket(id: string): SupportTicket | undefined {
    return this.tickets.get(id);
  }

  public createTicket(
    userId: string,
    userName: string,
    userEmail: string,
    subject: string,
    description: string,
    category: SupportTicket['category'],
    priority: SupportTicket['priority'] = 'medium'
  ): SupportTicket {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const id = `LMA-TKT-${randomCode}`;
    const now = new Date().toISOString();

    const initialMessage: TicketMessage = {
      id: `msg_tkt_${Date.now()}`,
      ticketId: id,
      senderId: userId,
      senderName: userName,
      senderRole: 'user',
      message: description,
      createdAt: now,
    };

    const newTicket: SupportTicket = {
      id,
      userId,
      userName,
      userEmail,
      subject,
      description,
      category,
      status: 'open',
      priority,
      createdAt: now,
      updatedAt: now,
      messages: [initialMessage],
    };

    this.tickets.set(id, newTicket);
    this.logAction('TICKET_CREATED', `Support ticket ${id} created by ${userName}`);
    return newTicket;
  }

  public addTicketReply(
    ticketId: string,
    senderId: string,
    senderName: string,
    senderRole: UserRole,
    message: string
  ): TicketMessage | null {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return null;

    const replyMsg: TicketMessage = {
      id: `msg_tkt_${Date.now()}`,
      ticketId,
      senderId,
      senderName,
      senderRole,
      message,
      createdAt: new Date().toISOString(),
    };

    ticket.messages.push(replyMsg);
    ticket.updatedAt = replyMsg.createdAt;
    if (senderRole === 'support' || senderRole === 'admin') {
      ticket.status = 'in_progress';
    }
    this.tickets.set(ticketId, ticket);
    this.logAction('TICKET_REPLIED', `Ticket ${ticketId} replied by ${senderName} (${senderRole})`);
    return replyMsg;
  }

  public updateTicketStatus(ticketId: string, status: SupportTicket['status']): SupportTicket | null {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return null;
    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
    this.tickets.set(ticketId, ticket);
    this.logAction('TICKET_STATUS_UPDATED', `Ticket ${ticketId} set to ${status}`);
    return ticket;
  }

  // --- Tasks & Checklist ---
  public getTasks(userId: string): TaskItem[] {
    return this.tasks.get(userId) || [];
  }

  public createTask(
    userId: string,
    title: string,
    description?: string,
    dueDate?: string,
    category: TaskItem['category'] = 'daily'
  ): TaskItem {
    const task: TaskItem = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      title,
      description,
      dueDate,
      completed: false,
      category,
      createdAt: new Date().toISOString(),
    };
    const list = this.tasks.get(userId) || [];
    list.unshift(task);
    this.tasks.set(userId, list);
    return task;
  }

  public toggleTask(userId: string, taskId: string): TaskItem | null {
    const list = this.tasks.get(userId) || [];
    const item = list.find(t => t.id === taskId);
    if (!item) return null;
    item.completed = !item.completed;
    this.tasks.set(userId, list);
    return item;
  }

  public deleteTask(userId: string, taskId: string): boolean {
    const list = this.tasks.get(userId) || [];
    const filtered = list.filter(t => t.id !== taskId);
    this.tasks.set(userId, filtered);
    return filtered.length < list.length;
  }

  // --- Admin Metrics & Safe Logs ---
  public getMetrics(): SystemMetrics {
    let totalMessages = 0;
    for (const [_, list] of this.messages.entries()) {
      totalMessages += list.length;
    }

    const openCount = Array.from(this.tickets.values()).filter(
      t => t.status === 'open' || t.status === 'in_progress'
    ).length;
    const resolvedCount = Array.from(this.tickets.values()).filter(
      t => t.status === 'resolved' || t.status === 'closed'
    ).length;

    const upVotes = this.feedbackList.filter(f => f.rating === 'up').length;
    const totalVotes = this.feedbackList.length;
    const positiveRate = totalVotes > 0 ? Math.round((upVotes / totalVotes) * 100) : 96;

    return {
      totalUsers: this.users.size,
      totalConversations: this.conversations.size,
      totalMessages,
      totalKnowledgeDocs: 5,
      totalChunks: 18,
      openTickets: openCount,
      resolvedTickets: resolvedCount,
      avgResponseTimeMs: 420,
      safetyFlagsBlocked: 3,
      positiveFeedbackRate: positiveRate,
    };
  }

  public getAuditLogs() {
    return this.auditLogs.slice(-25).reverse();
  }

  private logAction(action: string, details: string) {
    this.auditLogs.push({
      id: `log_${Date.now()}`,
      action,
      timestamp: new Date().toISOString(),
      details,
    });
  }

  // Seed default demonstration users and sample data
  private seedInitialData() {
    const defaultUser: UserProfile = {
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
    };

    const supportStaff: UserProfile = {
      id: 'usr_staff',
      name: 'Priya Sharma (Faculty Support)',
      email: 'priya.support@lifemate.ai',
      role: 'support',
      preferences: {
        preferredLanguage: 'hi',
        assistantMode: 'professional',
        readingLevel: 'advanced',
        fontSize: 'normal',
        highContrast: false,
        reducedMotion: false,
        simplifiedUI: false,
        voiceAutoRead: false,
        speechRate: 1.0,
      },
      createdAt: new Date().toISOString(),
    };

    const adminUser: UserProfile = {
      id: 'usr_admin',
      name: 'Dr. Anand Mehta (HOD / System Admin)',
      email: 'anand.admin@lifemate.ai',
      role: 'admin',
      preferences: {
        preferredLanguage: 'gu',
        assistantMode: 'professional',
        readingLevel: 'advanced',
        fontSize: 'normal',
        highContrast: false,
        reducedMotion: false,
        simplifiedUI: false,
        voiceAutoRead: false,
        speechRate: 1.0,
      },
      createdAt: new Date().toISOString(),
    };

    this.users.set(defaultUser.id, defaultUser);
    this.users.set(supportStaff.id, supportStaff);
    this.users.set(adminUser.id, adminUser);

    // Seed sample conversation for the user
    const conv = this.createConversation(
      defaultUser.id,
      'Welcome to LifeMate AI Guidance',
      'student',
      'en'
    );
    this.addMessage({
      id: `msg_init_1`,
      conversationId: conv.id,
      role: 'assistant',
      content:
        'Hello Krunal! Welcome to LifeMate AI. I am your multi-agent personal companion across education, daily life technology, language learning, and career planning. You can chat in English, हिन्दी, or ગુજરાતી. How can I help you today?',
      detectedLanguage: 'en',
      timestamp: new Date().toISOString(),
      trace: {
        intent: 'general_information',
        confidence: 0.98,
        detectedLanguage: 'en',
        selectedAgent: 'education_agent',
        agentName: 'LifeMate Core Agent',
        safetyCheck: { passed: true },
        retrievalUsed: false,
        sourcesFound: 0,
        processingTimeMs: 120,
        modeApplied: 'student',
      },
    });

    // Seed sample support ticket
    const ticket = this.createTicket(
      defaultUser.id,
      defaultUser.name,
      defaultUser.email,
      'Query regarding M.Sc. IT Semester Exam Study Schedule',
      'I need clarification on preparing for my Distributed Systems and Machine Learning practical viva in Gujarati.',
      'Education',
      'medium'
    );
    this.addTicketReply(
      ticket.id,
      supportStaff.id,
      supportStaff.name,
      'support',
      'Hello Krunal, our academic guidance team has reviewed your request. You can use the "Learn with AI" Study Planner tab to generate your 14-day milestone chart, and we are available if you need additional viva revision material.'
    );

    // Seed default tasks
    this.createTask(
      defaultUser.id,
      'Practice 10 Algorithm MCQs on Binary Trees',
      'Prepare for upcoming IT viva exam using the Quiz Generator.',
      new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      'study'
    );
    this.createTask(
      defaultUser.id,
      'Verify UPI payment limit on PhonePe',
      'Check daily transaction limit and turn on auto-mandate alerts.',
      new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
      'daily'
    );
  }
}

export const db = new LifeMateDatabase();

import {
  UserProfile,
  Conversation,
  Message,
  KnowledgeDocument,
  DocumentSource,
  SupportTicket,
  TaskItem,
  SystemMetrics,
  UserPreferences,
  UserRole,
  Language,
  AssistantMode,
  Quiz,
  StudyPlan,
} from '../types';

let currentUserId = 'usr_default';

export function setActiveUserId(id: string) {
  currentUserId = id;
}

export function getActiveUserId(): string {
  return currentUserId;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': currentUserId,
    ...(options.headers || {}),
  };

  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: 'Network request failed' }));
    throw new Error(errorBody.error || `HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

export const api = {
  // User & Profile
  getUserProfile: async (): Promise<{ success: boolean; user: UserProfile }> => {
    return request('/user/profile');
  },

  updatePreferences: async (
    preferences: Partial<UserPreferences>
  ): Promise<{ success: boolean; preferences: UserPreferences }> => {
    return request('/user/preferences', {
      method: 'PATCH',
      body: JSON.stringify({ preferences }),
    });
  },

  switchRole: async (role: UserRole): Promise<{ success: boolean; user: UserProfile }> => {
    return request('/user/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  },

  // Conversations
  getConversations: async (): Promise<{ success: boolean; conversations: Conversation[] }> => {
    return request('/conversations');
  },

  createConversation: async (
    title?: string,
    assistantMode?: AssistantMode,
    language?: Language
  ): Promise<{ success: boolean; conversation: Conversation }> => {
    return request('/conversations', {
      method: 'POST',
      body: JSON.stringify({ title, assistantMode, language }),
    });
  },

  renameConversation: async (
    id: string,
    title: string
  ): Promise<{ success: boolean; conversation: Conversation }> => {
    return request(`/conversations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    });
  },

  deleteConversation: async (id: string): Promise<{ success: boolean }> => {
    return request(`/conversations/${id}`, { method: 'DELETE' });
  },

  clearAllConversations: async (): Promise<{ success: boolean }> => {
    return request('/conversations/clear', { method: 'POST' });
  },

  getMessages: async (
    conversationId: string
  ): Promise<{ success: boolean; messages: Message[] }> => {
    return request(`/conversations/${conversationId}/messages`);
  },

  // Chat
  sendMessage: async (
    message: string,
    conversationId?: string,
    assistantMode?: AssistantMode,
    language?: Language
  ): Promise<{
    success: boolean;
    conversationId: string;
    userMessage: Message;
    assistantMessage: Message;
  }> => {
    return request('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId, assistantMode, language }),
    });
  },

  sendFeedback: async (
    messageId: string,
    rating: 'up' | 'down'
  ): Promise<{ success: boolean }> => {
    return request('/feedback', {
      method: 'POST',
      body: JSON.stringify({ messageId, rating }),
    });
  },

  // RAG Knowledge Base
  getKnowledgeDocs: async (): Promise<{
    success: boolean;
    documents: KnowledgeDocument[];
    totalChunks: number;
  }> => {
    return request('/rag/documents');
  },

  uploadKnowledgeDoc: async (data: {
    title: string;
    category: string;
    language: string;
    content: string;
    summary?: string;
  }): Promise<{ success: boolean; document: KnowledgeDocument }> => {
    return request('/rag/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteKnowledgeDoc: async (id: string): Promise<{ success: boolean }> => {
    return request(`/rag/documents/${id}`, { method: 'DELETE' });
  },

  queryKnowledge: async (
    query: string,
    category?: string,
    topK: number = 3
  ): Promise<{ success: boolean; results: DocumentSource[]; count: number }> => {
    return request('/rag/query', {
      method: 'POST',
      body: JSON.stringify({ query, category, topK }),
    });
  },

  // Support Tickets
  getTickets: async (): Promise<{ success: boolean; tickets: SupportTicket[] }> => {
    return request('/tickets');
  },

  createTicket: async (data: {
    subject: string;
    description: string;
    category?: string;
    priority?: string;
  }): Promise<{ success: boolean; ticket: SupportTicket }> => {
    return request('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  replyToTicket: async (
    id: string,
    message: string
  ): Promise<{ success: boolean; ticket: SupportTicket }> => {
    return request(`/tickets/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  updateTicketStatus: async (
    id: string,
    status: string
  ): Promise<{ success: boolean; ticket: SupportTicket }> => {
    return request(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Tasks
  getTasks: async (): Promise<{ success: boolean; tasks: TaskItem[] }> => {
    return request('/tasks');
  },

  createTask: async (data: {
    title: string;
    description?: string;
    dueDate?: string;
    category?: string;
  }): Promise<{ success: boolean; task: TaskItem }> => {
    return request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  toggleTask: async (id: string): Promise<{ success: boolean; task: TaskItem }> => {
    return request(`/tasks/${id}/toggle`, { method: 'PATCH' });
  },

  deleteTask: async (id: string): Promise<{ success: boolean }> => {
    return request(`/tasks/${id}`, { method: 'DELETE' });
  },

  // Learn
  generateQuiz: async (
    topic: string,
    difficulty: string = 'medium',
    language: Language = 'en'
  ): Promise<{ success: boolean; quiz: Quiz }> => {
    return request('/learn/quiz', {
      method: 'POST',
      body: JSON.stringify({ topic, difficulty, language }),
    });
  },

  generateStudyPlan: async (
    subject: string,
    targetExam: string,
    days: number = 7,
    dailyHours: number = 2,
    language: Language = 'en'
  ): Promise<{ success: boolean; plan: StudyPlan }> => {
    return request('/learn/study-plan', {
      method: 'POST',
      body: JSON.stringify({ subject, targetExam, days, dailyHours, language }),
    });
  },

  // Daily Life
  rewriteText: async (
    text: string,
    tone: string = 'polite',
    targetLanguage: Language = 'en'
  ): Promise<{ success: boolean; result: string }> => {
    return request('/daily/rewrite', {
      method: 'POST',
      body: JSON.stringify({ text, tone, targetLanguage }),
    });
  },

  // Career
  critiqueResume: async (
    resumeSnippet: string,
    targetRole?: string
  ): Promise<{ success: boolean; critique: string }> => {
    return request('/career/critique-resume', {
      method: 'POST',
      body: JSON.stringify({ resumeSnippet, targetRole }),
    });
  },

  // Admin
  getAdminMetrics: async (): Promise<{
    success: boolean;
    metrics: SystemMetrics;
    provider: { model: string; status: string; apiConfigured: boolean };
  }> => {
    return request('/admin/metrics');
  },

  getAdminLogs: async (): Promise<{ success: boolean; logs: any[] }> => {
    return request('/admin/logs');
  },
};

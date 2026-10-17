export type Language = 'en' | 'hi' | 'gu';

export type AssistantMode = 'simple' | 'student' | 'professional' | 'senior' | 'custom';

export type UserRole = 'user' | 'support' | 'admin';

export interface UserPreferences {
  preferredLanguage: Language;
  assistantMode: AssistantMode;
  readingLevel: 'basic' | 'intermediate' | 'advanced';
  fontSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  reducedMotion: boolean;
  simplifiedUI: boolean;
  voiceAutoRead: boolean;
  speechVoice?: string;
  speechRate: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  preferences: UserPreferences;
  createdAt: string;
}

export type AgentType =
  | 'intent_agent'
  | 'preference_agent'
  | 'education_agent'
  | 'daily_life_agent'
  | 'career_agent'
  | 'language_agent'
  | 'retrieval_agent'
  | 'safety_agent'
  | 'decision_agent'
  | 'support_agent';

export interface DocumentSource {
  documentId: string;
  documentTitle: string;
  category: string;
  chunkIndex: number;
  snippet: string;
  similarityScore: number;
}

export interface AgentTrace {
  intent: string;
  confidence: number;
  detectedLanguage: Language | 'mixed';
  selectedAgent: AgentType;
  agentName: string;
  safetyCheck: {
    passed: boolean;
    reason?: string;
  };
  retrievalUsed: boolean;
  sourcesFound: number;
  processingTimeMs: number;
  modeApplied: AssistantMode;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  detectedLanguage?: Language | 'mixed';
  timestamp: string;
  trace?: AgentTrace;
  sources?: DocumentSource[];
  feedback?: 'up' | 'down' | null;
  suggestedFollowUps?: string[];
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  assistantMode: AssistantMode;
  language: Language;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: 'Education' | 'Daily Tech' | 'Career' | 'Health & Safety' | 'General';
  language: Language | 'all';
  storagePath: string;
  chunkCount: number;
  fileSize: number;
  processingStatus: 'ready' | 'processing' | 'error';
  uploadedBy: string;
  createdAt: string;
  summary: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  category: string;
  chunkIndex: number;
  content: string;
  embeddingKeywords: string[];
}

export type TicketStatus = 'open' | 'in_progress' | 'waiting_for_user' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  description: string;
  category: 'Education' | 'Daily Life' | 'Tech Issue' | 'Career' | 'General';
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export interface TaskItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  category: 'daily' | 'study' | 'career';
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  hint: string;
}

export interface Quiz {
  id: string;
  topic: string;
  language: Language;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
}

export interface StudyPlanDay {
  dayNumber: number;
  dayLabel: string;
  focusTopic: string;
  estimatedHours: number;
  learningActivities: string[];
  tips: string;
}

export interface StudyPlan {
  id: string;
  subject: string;
  targetExam: string;
  targetDate: string;
  dailyHours: number;
  totalDays: number;
  schedule: StudyPlanDay[];
}

export interface SystemMetrics {
  totalUsers: number;
  totalConversations: number;
  totalMessages: number;
  totalKnowledgeDocs: number;
  totalChunks: number;
  openTickets: number;
  resolvedTickets: number;
  avgResponseTimeMs: number;
  safetyFlagsBlocked: number;
  positiveFeedbackRate: number;
}

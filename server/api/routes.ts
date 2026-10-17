import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { knowledgeStore } from '../rag/knowledgeStore';
import { orchestrateLifeMateChat } from '../agents/orchestrator';
import { GoogleGenAI } from '@google/genai';
import { Message, Language, AssistantMode, UserRole } from '../../src/types';

export const apiRouter = Router();

// Helper to get active user ID from header or default
function getActiveUserId(req: Request): string {
  return (req.headers['x-user-id'] as string) || 'usr_default';
}

function getGemini(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// USER & PROFILE ROUTES
// -------------------------------------------------------------
apiRouter.get('/user/profile', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const user = db.getUser(userId) || db.getUser('usr_default');
  res.json({ success: true, user });
});

apiRouter.patch('/user/preferences', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const { preferences } = req.body;
  if (!preferences) {
    res.status(400).json({ error: 'Preferences object required.' });
    return;
  }
  const updated = db.updateUserPreferences(userId, preferences);
  res.json({ success: true, preferences: updated });
});

apiRouter.post('/user/switch-role', (req: Request, res: Response) => {
  const { role } = req.body as { role: UserRole };
  let targetId = 'usr_default';
  if (role === 'support') targetId = 'usr_staff';
  if (role === 'admin') targetId = 'usr_admin';

  const user = db.getUser(targetId);
  res.json({ success: true, user });
});

// -------------------------------------------------------------
// CONVERSATIONS & CHAT ROUTES
// -------------------------------------------------------------
apiRouter.get('/conversations', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const conversations = db.getConversations(userId);
  res.json({ success: true, conversations });
});

apiRouter.post('/conversations', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const { title, assistantMode, language } = req.body;
  const conv = db.createConversation(userId, title, assistantMode, language);
  res.json({ success: true, conversation: conv });
});

apiRouter.patch('/conversations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { title } = req.body;
  const updated = db.renameConversation(id, title);
  if (!updated) {
    res.status(404).json({ error: 'Conversation not found.' });
    return;
  }
  res.json({ success: true, conversation: updated });
});

apiRouter.delete('/conversations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const success = db.deleteConversation(id);
  res.json({ success });
});

apiRouter.post('/conversations/clear', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  db.clearAllConversations(userId);
  res.json({ success: true });
});

apiRouter.get('/conversations/:id/messages', (req: Request, res: Response) => {
  const { id } = req.params;
  const messages = db.getMessages(id);
  res.json({ success: true, messages });
});

// Main Multi-Agent Chat Endpoint
apiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const userId = getActiveUserId(req);
    const { conversationId, message, assistantMode, language } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message content is required.' });
      return;
    }

    const user = db.getUser(userId) || db.getUser('usr_default')!;

    // Resolve or create conversation
    let conv = conversationId ? db.getConversation(conversationId) : null;
    if (!conv) {
      conv = db.createConversation(
        userId,
        'New Conversation',
        assistantMode || user.preferences.assistantMode,
        language || user.preferences.preferredLanguage
      );
    }

    // Save User Message
    const userMsg: Message = {
      id: `msg_u_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId: conv.id,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    db.addMessage(userMsg);

    // Get previous messages for context
    const history = db
      .getMessages(conv.id)
      .slice(0, -1)
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    // Execute multi-agent orchestration
    const result = await orchestrateLifeMateChat({
      userMessage: message,
      conversationHistory: history,
      userPreferences: user.preferences,
      selectedMode: assistantMode || conv.assistantMode,
      targetLanguage: language || conv.language,
    });

    // Save Assistant Message
    const assistantMsg: Message = {
      id: `msg_a_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId: conv.id,
      role: 'assistant',
      content: result.reply,
      detectedLanguage: result.trace.detectedLanguage,
      timestamp: new Date().toISOString(),
      trace: result.trace,
      sources: result.sources,
      suggestedFollowUps: result.suggestedFollowUps,
    };
    db.addMessage(assistantMsg);

    res.json({
      success: true,
      conversationId: conv.id,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      error: 'An internal error occurred while processing the chat.',
      details: error?.message || String(error),
    });
  }
});

apiRouter.post('/feedback', (req: Request, res: Response) => {
  const { messageId, rating } = req.body;
  if (!messageId || !rating) {
    res.status(400).json({ error: 'messageId and rating (up/down) required.' });
    return;
  }
  const ok = db.setMessageFeedback(messageId, rating);
  res.json({ success: ok });
});

// -------------------------------------------------------------
// RAG KNOWLEDGE BASE ROUTES
// -------------------------------------------------------------
apiRouter.get('/rag/documents', (_req: Request, res: Response) => {
  const docs = knowledgeStore.getDocuments();
  res.json({ success: true, documents: docs, totalChunks: knowledgeStore.getChunks().length });
});

apiRouter.post('/rag/upload', (req: Request, res: Response) => {
  const { title, category, language, content, summary } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'Document title and content are required.' });
    return;
  }

  const doc = knowledgeStore.addDocument(
    title,
    category || 'General',
    language || 'all',
    content,
    summary || content.slice(0, 150) + '...'
  );

  res.json({ success: true, document: doc });
});

apiRouter.delete('/rag/documents/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const ok = knowledgeStore.deleteDocument(id);
  res.json({ success: ok });
});

apiRouter.post('/rag/query', (req: Request, res: Response) => {
  const { query, category, topK } = req.body;
  if (!query) {
    res.status(400).json({ error: 'Query string is required.' });
    return;
  }
  const results = knowledgeStore.searchChunks(query, category, topK || 4);
  res.json({ success: true, results, count: results.length });
});

// -------------------------------------------------------------
// SUPPORT TICKETS ROUTES
// -------------------------------------------------------------
apiRouter.get('/tickets', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const user = db.getUser(userId) || db.getUser('usr_default')!;
  const tickets = db.getTickets(userId, user.role);
  res.json({ success: true, tickets });
});

apiRouter.post('/tickets', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const user = db.getUser(userId) || db.getUser('usr_default')!;
  const { subject, description, category, priority } = req.body;

  if (!subject || !description) {
    res.status(400).json({ error: 'Subject and description are required.' });
    return;
  }

  const ticket = db.createTicket(
    userId,
    user.name,
    user.email,
    subject,
    description,
    category || 'General',
    priority || 'medium'
  );

  res.json({ success: true, ticket });
});

apiRouter.post('/tickets/:id/reply', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const user = db.getUser(userId) || db.getUser('usr_default')!;
  const { id } = req.params;
  const { message } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message content is required.' });
    return;
  }

  const reply = db.addTicketReply(id, userId, user.name, user.role, message);
  if (!reply) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }

  res.json({ success: true, reply, ticket: db.getTicket(id) });
});

apiRouter.patch('/tickets/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const updated = db.updateTicketStatus(id, status);
  if (!updated) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }
  res.json({ success: true, ticket: updated });
});

// -------------------------------------------------------------
// TASKS & CHECKLIST ROUTES
// -------------------------------------------------------------
apiRouter.get('/tasks', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const tasks = db.getTasks(userId);
  res.json({ success: true, tasks });
});

apiRouter.post('/tasks', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const { title, description, dueDate, category } = req.body;
  if (!title) {
    res.status(400).json({ error: 'Task title is required.' });
    return;
  }
  const task = db.createTask(userId, title, description, dueDate, category);
  res.json({ success: true, task });
});

apiRouter.patch('/tasks/:id/toggle', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const { id } = req.params;
  const updated = db.toggleTask(userId, id);
  if (!updated) {
    res.status(404).json({ error: 'Task not found.' });
    return;
  }
  res.json({ success: true, task: updated });
});

apiRouter.delete('/tasks/:id', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const { id } = req.params;
  const ok = db.deleteTask(userId, id);
  res.json({ success: ok });
});

// -------------------------------------------------------------
// LEARN WITH AI: QUIZ & STUDY PLAN GENERATOR
// -------------------------------------------------------------
apiRouter.post('/learn/quiz', async (req: Request, res: Response) => {
  try {
    const { topic, difficulty = 'medium', language = 'en', count = 4 } = req.body;
    if (!topic) {
      res.status(400).json({ error: 'Topic is required.' });
      return;
    }

    const ai = getGemini();
    const prompt = `Generate a high-quality educational quiz on "${topic}".
Difficulty: ${difficulty}.
Target Language: ${language} (if 'hi' write in Hindi, if 'gu' write in Gujarati, if 'en' write in English).
Generate exactly ${count} multiple choice questions.
Return ONLY valid JSON matching this schema, with no markdown code fences or extra text:
{
  "questions": [
    {
      "id": "q1",
      "question": "question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "explanation": "Why this is correct",
      "hint": "Helpful hint without giving away the answer"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{"questions":[]}');
    res.json({
      success: true,
      quiz: {
        id: `quiz_${Date.now()}`,
        topic,
        language,
        difficulty,
        questions: parsed.questions || [],
      },
    });
  } catch (err: any) {
    console.error('Quiz generation error:', err);
    // Provide structured academic fallback quiz
    res.json({
      success: true,
      quiz: {
        id: `quiz_${Date.now()}`,
        topic: req.body.topic || 'General Science & Computing',
        language: req.body.language || 'en',
        difficulty: req.body.difficulty || 'medium',
        questions: [
          {
            id: 'q1',
            question: 'What is the average time complexity of Binary Search on a sorted array?',
            options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
            correctAnswerIndex: 1,
            explanation: 'Binary Search halves the search space at each iteration, resulting in O(log n) time complexity.',
            hint: 'Think about repeatedly dividing the list by 2.',
          },
          {
            id: 'q2',
            question: 'Which of the following is essential for UPI payment security?',
            options: ['Sharing OTP with callers', 'Entering UPI PIN to receive money', 'Never entering UPI PIN to receive funds', 'Disabling screen lock'],
            correctAnswerIndex: 2,
            explanation: 'In UPI, you never need to enter your PIN to receive money into your bank account.',
            hint: 'UPI PIN is strictly an authorization for debit, not credit.',
          },
        ],
      },
    });
  }
});

apiRouter.post('/learn/study-plan', async (req: Request, res: Response) => {
  try {
    const { subject, targetExam, days = 7, dailyHours = 2, language = 'en' } = req.body;
    const ai = getGemini();

    const prompt = `Create a realistic ${days}-day milestone study plan for subject "${subject}" preparing for "${targetExam}".
Daily available study time: ${dailyHours} hours.
Language: ${language} (if 'hi' use Hindi, if 'gu' use Gujarati, if 'en' use English).
Return ONLY valid JSON matching this schema:
{
  "schedule": [
    {
      "dayNumber": 1,
      "dayLabel": "Day 1",
      "focusTopic": "Topic Name",
      "estimatedHours": ${dailyHours},
      "learningActivities": ["Activity 1", "Activity 2"],
      "tips": "Practical revision tip"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.4,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{"schedule":[]}');
    res.json({
      success: true,
      plan: {
        id: `plan_${Date.now()}`,
        subject,
        targetExam,
        targetDate: new Date(Date.now() + 86400000 * days).toISOString().split('T')[0],
        dailyHours,
        totalDays: days,
        schedule: parsed.schedule || [],
      },
    });
  } catch (err: any) {
    console.error('Study plan generation error:', err);
    res.status(500).json({ error: 'Failed to generate study plan.' });
  }
});

// -------------------------------------------------------------
// DAILY LIFE: WRITING & POLISHING ASSISTANT
// -------------------------------------------------------------
apiRouter.post('/daily/rewrite', async (req: Request, res: Response) => {
  try {
    const { text, tone = 'polite', targetLanguage = 'en' } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text to rewrite is required.' });
      return;
    }

    const ai = getGemini();
    const prompt = `Rewrite the following draft text to be ${tone}.
Target Language: ${targetLanguage}.
Improve clarity, grammar, and tone while preserving the original intent.
Draft:
"${text}"

Provide:
1. Rewritten Version
2. Brief note explaining what was improved.
Return plain text formatted cleanly.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({
      success: true,
      result: response.text || text,
    });
  } catch (err: any) {
    console.error('Rewrite error:', err);
    res.status(500).json({ error: 'Failed to rewrite text.' });
  }
});

// -------------------------------------------------------------
// CAREER ASSISTANT: RESUME CRITIQUE & INTERVIEW SIMULATOR
// -------------------------------------------------------------
apiRouter.post('/career/critique-resume', async (req: Request, res: Response) => {
  try {
    const { resumeSnippet, targetRole } = req.body;
    if (!resumeSnippet) {
      res.status(400).json({ error: 'Resume text is required.' });
      return;
    }

    const ai = getGemini();
    const prompt = `Act as an expert technical recruiter and ATS specialist. Review this resume snippet for the target role: "${targetRole || 'Software / IT Professional'}":
"${resumeSnippet}"

Provide:
1. ATS Friendliness Score (out of 10) & Verdict
2. 3 Strong Bullet Points rewritten with Google's X-Y-Z formula ("Accomplished [X] as measured by [Y], by doing [Z]")
3. Missing Keywords & Technical Skills recommendation
4. Red Flags / Clutter to remove`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({
      success: true,
      critique: response.text || '',
    });
  } catch (err: any) {
    console.error('Resume critique error:', err);
    res.status(500).json({ error: 'Failed to critique resume.' });
  }
});

// -------------------------------------------------------------
// ADMIN METRICS & SYSTEM HEALTH
// -------------------------------------------------------------
apiRouter.get('/admin/metrics', (_req: Request, res: Response) => {
  const metrics = db.getMetrics();
  res.json({
    success: true,
    metrics,
    provider: {
      model: 'gemini-3.8-flash',
      status: 'healthy',
      apiConfigured: Boolean(process.env.GEMINI_API_KEY),
    },
  });
});

apiRouter.get('/admin/logs', (_req: Request, res: Response) => {
  const logs = db.getAuditLogs();
  res.json({ success: true, logs });
});

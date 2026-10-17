import { GoogleGenAI } from '@google/genai';
import {
  Language,
  AssistantMode,
  AgentType,
  AgentTrace,
  DocumentSource,
  Message,
  UserPreferences,
} from '../../src/types';
import { knowledgeStore } from '../rag/knowledgeStore';

// Safe Gemini client initialization
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// -------------------------------------------------------------
// AGENT 1: Intent Recognition & Language Detection Agent
// -------------------------------------------------------------
export interface IntentAnalysis {
  intent:
    | 'education_help'
    | 'exam_preparation'
    | 'language_learning'
    | 'career_guidance'
    | 'daily_life_help'
    | 'technology_guidance'
    | 'general_information'
    | 'translation'
    | 'document_question'
    | 'account_support'
    | 'human_support';
  confidence: number;
  detectedLanguage: Language | 'mixed';
  requiresRAG: boolean;
  requiresHumanEscalation: boolean;
}

export function runIntentAgent(message: string): IntentAnalysis {
  const text = message.toLowerCase();

  // Detect script / language
  const hasDevanagari = /[\u0900-\u097F]/.test(message);
  const hasGujarati = /[\u0A80-\u0AFF]/.test(message);
  let detectedLanguage: Language | 'mixed' = 'en';

  if (hasGujarati) {
    detectedLanguage = hasDevanagari || /[a-zA-Z]{4,}/.test(message) ? 'mixed' : 'gu';
  } else if (hasDevanagari) {
    detectedLanguage = /[a-zA-Z]{4,}/.test(message) ? 'mixed' : 'hi';
  } else {
    detectedLanguage = 'en';
  }

  // Escalation intent
  if (
    text.includes('human') ||
    text.includes('support') ||
    text.includes('ticket') ||
    text.includes('complaint') ||
    text.includes('talk to agent') ||
    text.includes('મદદનીશ') ||
    text.includes('शिकायत')
  ) {
    return {
      intent: 'human_support',
      confidence: 0.95,
      detectedLanguage,
      requiresRAG: false,
      requiresHumanEscalation: true,
    };
  }

  // Translation intent
  if (
    text.includes('translate') ||
    text.includes('अनुवाद') ||
    text.includes('ભાષાંતર') ||
    text.includes('meaning in') ||
    text.includes('how to say')
  ) {
    return {
      intent: 'translation',
      confidence: 0.92,
      detectedLanguage,
      requiresRAG: false,
      requiresHumanEscalation: false,
    };
  }

  // Career intent
  if (
    text.includes('resume') ||
    text.includes('cv') ||
    text.includes('interview') ||
    text.includes('job') ||
    text.includes('career') ||
    text.includes('salary') ||
    text.includes('नोकरी') ||
    text.includes('ઇન્ટરવ્યુ')
  ) {
    return {
      intent: 'career_guidance',
      confidence: 0.94,
      detectedLanguage,
      requiresRAG: true,
      requiresHumanEscalation: false,
    };
  }

  // Exam & Study preparation
  if (
    text.includes('exam') ||
    text.includes('quiz') ||
    text.includes('syllabus') ||
    text.includes('study plan') ||
    text.includes('marks') ||
    text.includes('પરીક્ષા') ||
    text.includes('परीक्षा')
  ) {
    return {
      intent: 'exam_preparation',
      confidence: 0.91,
      detectedLanguage,
      requiresRAG: true,
      requiresHumanEscalation: false,
    };
  }

  // Education & academic concepts
  if (
    text.includes('explain') ||
    text.includes('physics') ||
    text.includes('math') ||
    text.includes('algorithm') ||
    text.includes('science') ||
    text.includes('history') ||
    text.includes('સમજાવો') ||
    text.includes('समझाओ')
  ) {
    return {
      intent: 'education_help',
      confidence: 0.89,
      detectedLanguage,
      requiresRAG: true,
      requiresHumanEscalation: false,
    };
  }

  // Technology & Smartphone Daily Guidance
  if (
    text.includes('upi') ||
    text.includes('whatsapp') ||
    text.includes('phone') ||
    text.includes('mobile') ||
    text.includes('google pay') ||
    text.includes('setting') ||
    text.includes('password') ||
    text.includes('મોબાઈલ') ||
    text.includes('फोन')
  ) {
    return {
      intent: 'technology_guidance',
      confidence: 0.93,
      detectedLanguage,
      requiresRAG: true,
      requiresHumanEscalation: false,
    };
  }

  // Daily life
  if (
    text.includes('routine') ||
    text.includes('habit') ||
    text.includes('email') ||
    text.includes('form') ||
    text.includes('draft') ||
    text.includes('પત્ર') ||
    text.includes('पत्र')
  ) {
    return {
      intent: 'daily_life_help',
      confidence: 0.85,
      detectedLanguage,
      requiresRAG: false,
      requiresHumanEscalation: false,
    };
  }

  // Default general information
  return {
    intent: 'general_information',
    confidence: 0.82,
    detectedLanguage,
    requiresRAG: true,
    requiresHumanEscalation: false,
  };
}

// -------------------------------------------------------------
// AGENT 8: Safety & Responsible AI Agent
// -------------------------------------------------------------
export interface SafetyCheckResult {
  passed: boolean;
  reason?: string;
  safeFallbackResponse?: string;
}

export function runSafetyAgent(message: string, language: Language): SafetyCheckResult {
  const lower = message.toLowerCase();

  // Severe Harm / Violence / Weapons check
  const dangerousKeywords = [
    'make a bomb',
    'how to hack',
    'kill yourself',
    'commit suicide',
    'poison someone',
    'buy drugs illegally',
    'आत्महत्या',
    'આત્મહત્યા',
  ];

  for (const word of dangerousKeywords) {
    if (lower.includes(word)) {
      if (word.includes('suicide') || word.includes('kill yourself') || word.includes('आत्महत्या') || word.includes('આત્મહત્યા')) {
        return {
          passed: false,
          reason: 'Self-harm or crisis intervention triggered.',
          safeFallbackResponse:
            language === 'gu'
              ? 'જો તમે મુશ્કેલીમાં હોવ, તો કૃપા કરીને મદદ મેળવો. ભારતમાં માનસિક સ્વાસ્થ્ય સહાય માટે કિરણ હેલ્પલાઇન 1800-599-0019 પર 24x7 વિનામૂલ્યે કૉલ કરી શકો છો.'
              : language === 'hi'
              ? 'यदि आप किसी मानसिक तनाव या संकट में हैं, तो कृपया राष्ट्रीय मानसिक स्वास्थ्य हेल्पलाइन (KIRAN) 1800-599-0019 पर तुरंत संपर्क करें। आपकी जिंदगी अनमोल है।'
              : 'If you or someone you know is going through a difficult time, please reach out for immediate support. You can call the national helpline 1800-599-0019 (India) or 988 (USA) for 24/7 confidential assistance.',
        };
      }

      return {
        passed: false,
        reason: 'Violation of LifeMate AI safety policy (harmful/illegal content).',
        safeFallbackResponse:
          language === 'gu'
            ? 'હું નુકસાન પહોંચાડી શકે તેવી કે ગેરકાયદે પ્રવૃત્તિઓમાં સહાય કરી શકતો નથી. હું તમને સુરક્ષિત, શૈક્ષણિક કે રોજિંદા પ્રશ્નોમાં મદદ કરવા માટે અહીં છું.'
            : language === 'hi'
            ? 'मैं किसी भी हानिकारक या अवैध गतिविधि में सहायता नहीं कर सकता। मैं आपकी शिक्षा, दैनिक जीवन और सुरक्षित तकनीकी प्रश्नों में सहायता के लिए समर्पित हूँ।'
            : 'I cannot assist with potentially dangerous, harmful, or unlawful activities. I am here to help you with safe everyday, educational, and productivity topics.',
      };
    }
  }

  // Medical emergency check
  if (
    lower.includes('chest pain') ||
    lower.includes('heart attack') ||
    lower.includes('severe bleeding') ||
    lower.includes('छाती में तेज दर्द') ||
    lower.includes('હાર્ટ એટેક')
  ) {
    return {
      passed: false,
      reason: 'Urgent medical symptoms detected.',
      safeFallbackResponse:
        language === 'gu'
          ? 'ચેતવણી: આ તાત્કાલિક તબીબી કટોકટી હોઈ શકે છે. કૃપા કરીને તરત જ 108 / 112 એમ્બ્યુલન્સ ડાયલ કરો અથવા નજીકની હોસ્પિટલના ઇમરજન્સી વિભાગમાં જાઓ.'
          : language === 'hi'
          ? 'चेतावनी: यह एक गंभीर चिकित्सीय आपातकाल हो सकता है। कृपया बिना देरी किए तुरंत 108 या 112 पर कॉल करके एम्बुलेंस बुलाएं अथवा नजदीकी अस्पताल जाएं।'
          : 'URGENT: This may be a serious medical emergency. Please dial emergency medical services immediately (112 or 108 in India / 911) or visit the nearest emergency room. Do not rely on AI for immediate medical crises.',
    };
  }

  return { passed: true };
}

// -------------------------------------------------------------
// AGENTS 3-6: Specialized Domain Prompts & Behavioral Adapters
// -------------------------------------------------------------
function getAgentPersona(agentType: AgentType, mode: AssistantMode, language: Language): string {
  let modeInstruction = '';
  switch (mode) {
    case 'simple':
      modeInstruction = 'Use short, clear sentences. Explain difficult words in simple everyday terms. Use relatable analogies.';
      break;
    case 'student':
      modeInstruction = 'Provide academic depth, step-by-step mathematical/conceptual derivations, encourage critical thinking, and suggest review questions.';
      break;
    case 'professional':
      modeInstruction = 'Use structured bullet points, executive summaries, productivity workflows, and industry-standard terminology.';
      break;
    case 'senior':
      modeInstruction = 'Be extremely patient, warm, and reassuring. Break steps into 1-2-3 numbered actions. Avoid technical jargon without explaining it simply. Prioritize clarity and safety.';
      break;
    case 'custom':
    default:
      modeInstruction = 'Balance clarity, warmth, and depth suited to the user query.';
      break;
  }

  let domainInstruction = '';
  switch (agentType) {
    case 'education_agent':
      domainInstruction = 'You are the LifeMate Education Agent. Help with concepts, school & college syllabus, algorithms, and study strategies.';
      break;
    case 'daily_life_agent':
      domainInstruction = 'You are the LifeMate Daily Life Agent. Provide practical everyday guidance, smartphone operating instructions, digital safety, and productivity checklist steps.';
      break;
    case 'career_agent':
      domainInstruction = 'You are the LifeMate Career Agent. Assist with resume improvements, interview preparation using the STAR method, and career roadmap planning. Do not guarantee job placements.';
      break;
    case 'language_agent':
      domainInstruction = 'You are the LifeMate Language Agent. Help with translation, grammar, vocabulary, idioms, and multilingual practice in Gujarati, Hindi, and English.';
      break;
    case 'support_agent':
      domainInstruction = 'You are the LifeMate Human Support Agent. If you cannot answer with high certainty, politely recommend opening a support ticket.';
      break;
    default:
      domainInstruction = 'You are LifeMate AI, a helpful, multilingual, multi-agent AI assistant for all generations.';
      break;
  }

  let languageInstruction = '';
  if (language === 'gu') {
    languageInstruction = 'Respond strictly in natural, grammatically correct Gujarati script (ગુજરાતી). Do not switch to English unless technical terms are commonly spoken.';
  } else if (language === 'hi') {
    languageInstruction = 'Respond strictly in natural, grammatically correct Hindi script (हिन्दी / देवनागरी). Use clear Devanagari.';
  } else {
    languageInstruction = 'Respond in fluent, clear English. If the user writes in Hinglish or Gujlish, respond gracefully while respecting their flow.';
  }

  return `System Directive:
${domainInstruction}
Target Audience / Mode: ${modeInstruction}
Language Protocol: ${languageInstruction}
Rule: Never invent external completed actions (such as paying bills, sending real SMS, or booking tickets). Always acknowledge when something needs manual confirmation.`;
}

// -------------------------------------------------------------
// MAIN MULTI-AGENT ORCHESTRATION PIPELINE
// -------------------------------------------------------------
export interface OrchestratorInput {
  userMessage: string;
  conversationHistory: { role: 'user' | 'assistant'; content: string }[];
  userPreferences: UserPreferences;
  selectedMode?: AssistantMode;
  targetLanguage?: Language;
}

export interface OrchestratorResult {
  reply: string;
  trace: AgentTrace;
  sources: DocumentSource[];
  suggestedFollowUps: string[];
}

export async function orchestrateLifeMateChat(
  input: OrchestratorInput
): Promise<OrchestratorResult> {
  const startTime = Date.now();
  const { userMessage, conversationHistory, userPreferences } = input;

  // Step 1: Run Intent Recognition Agent
  const intentResult = runIntentAgent(userMessage);

  // Determine active language
  const effectiveLanguage: Language =
    input.targetLanguage ||
    (intentResult.detectedLanguage === 'mixed'
      ? userPreferences.preferredLanguage
      : (intentResult.detectedLanguage as Language));

  const effectiveMode: AssistantMode = input.selectedMode || userPreferences.assistantMode || 'simple';

  // Step 2: Run Safety Agent
  const safetyResult = runSafetyAgent(userMessage, effectiveLanguage);
  if (!safetyResult.passed && safetyResult.safeFallbackResponse) {
    return {
      reply: safetyResult.safeFallbackResponse,
      trace: {
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        detectedLanguage: intentResult.detectedLanguage,
        selectedAgent: 'safety_agent',
        agentName: 'Safety & Protection Agent',
        safetyCheck: { passed: false, reason: safetyResult.reason },
        retrievalUsed: false,
        sourcesFound: 0,
        processingTimeMs: Date.now() - startTime,
        modeApplied: effectiveMode,
      },
      sources: [],
      suggestedFollowUps: [
        'How can LifeMate AI help me safely?',
        'Talk with human support',
      ],
    };
  }

  // Step 3: Map intent to specialized domain agent
  let selectedAgent: AgentType = 'daily_life_agent';
  let agentName = 'Daily Life Assistant';

  switch (intentResult.intent) {
    case 'education_help':
    case 'exam_preparation':
      selectedAgent = 'education_agent';
      agentName = 'Education & Learning Agent';
      break;
    case 'career_guidance':
      selectedAgent = 'career_agent';
      agentName = 'Career & Interview Agent';
      break;
    case 'language_learning':
    case 'translation':
      selectedAgent = 'language_agent';
      agentName = 'Multilingual Language Agent';
      break;
    case 'technology_guidance':
      selectedAgent = 'daily_life_agent';
      agentName = 'Tech Guidance & Everyday Agent';
      break;
    case 'human_support':
      selectedAgent = 'support_agent';
      agentName = 'Human Support Escalation Agent';
      break;
    default:
      selectedAgent = 'decision_agent';
      agentName = 'Decision & Synthesis Agent';
      break;
  }

  // Step 4: Knowledge Retrieval Agent (RAG)
  let retrievedSources: DocumentSource[] = [];
  if (intentResult.requiresRAG || intentResult.confidence < 0.9) {
    retrievedSources = knowledgeStore.searchChunks(userMessage, undefined, 3);
  }

  // Build context augmentation from RAG
  let ragContextPrompt = '';
  if (retrievedSources.length > 0) {
    ragContextPrompt = `\n\nVerified Knowledge Base References to ground your answer:\n` +
      retrievedSources
        .map(
          (s, idx) =>
            `[Source ${idx + 1}: ${s.documentTitle} (${s.category})]:\n${s.snippet}`
        )
        .join('\n\n') +
      `\n\nInstructions: Ground your explanation in the verified knowledge above whenever relevant, but phrase it naturally for the user.`;
  }

  // Step 5: System instruction assembly
  const systemInstruction =
    getAgentPersona(selectedAgent, effectiveMode, effectiveLanguage) +
    ragContextPrompt;

  // Step 6: Generate response using Gemini
  let replyText = '';
  try {
    const ai = getGenAI();

    // Prepare contents array with conversation history
    const contents: any[] = [];

    // Include recent history (up to last 6 messages for context window management)
    const recentHistory = conversationHistory.slice(-6);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    replyText = response.text || '';
  } catch (err: any) {
    console.error('Gemini generation error in orchestrator:', err?.message || err);
    // Graceful fallback response
    if (effectiveLanguage === 'gu') {
      replyText = `લાઈફમેટ એઆઈ સહાયક: તમારા પ્રશ્ન પર પ્રક્રિયા કરવામાં ક્ષણિક વિલંબ થઈ રહ્યો છે. કૃપા કરીને ફરી પ્રયત્ન કરો અથવા જો આપ તાત્કાલિક મદદ ઇચ્છતા હોવ તો 'સપોર્ટ ટિકિટ' બનાવી શકો છો.`;
    } else if (effectiveLanguage === 'hi') {
      replyText = `लाइफमेट एआई सहायक: आपके अनुरोध को संसाधित करते समय एक तकनीकी समस्या आई। कृपया पुनः प्रयास करें अथवा आप मानव सहायता के लिए एक नया 'सपोर्ट टिकट' बना सकते हैं।`;
    } else {
      replyText = `LifeMate AI: I encountered a brief connection delay while processing your request. Please try again, or you may open a Human Support Ticket from the menu for direct team assistance.`;
    }
  }

  // Generate suggested follow-up questions
  const suggestedFollowUps: string[] = [];
  if (intentResult.intent === 'education_help' || intentResult.intent === 'exam_preparation') {
    suggestedFollowUps.push('Generate a 3-question practice quiz on this');
    suggestedFollowUps.push('Explain this with a real-life example');
  } else if (intentResult.intent === 'technology_guidance') {
    suggestedFollowUps.push('Show me step-by-step instructions');
    suggestedFollowUps.push('How do I keep this secure from scams?');
  } else if (intentResult.intent === 'career_guidance') {
    suggestedFollowUps.push('What are common interview questions on this?');
    suggestedFollowUps.push('How do I list this skill on my resume?');
  } else {
    suggestedFollowUps.push('Explain this in simpler terms');
    suggestedFollowUps.push('Translate this to Gujarati / Hindi');
  }

  const processingTimeMs = Date.now() - startTime;

  return {
    reply: replyText,
    trace: {
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      detectedLanguage: intentResult.detectedLanguage,
      selectedAgent,
      agentName,
      safetyCheck: { passed: true },
      retrievalUsed: retrievedSources.length > 0,
      sourcesFound: retrievedSources.length,
      processingTimeMs,
      modeApplied: effectiveMode,
    },
    sources: retrievedSources,
    suggestedFollowUps,
  };
}

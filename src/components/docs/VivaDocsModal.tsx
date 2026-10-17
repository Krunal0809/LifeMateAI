import React, { useState } from 'react';
import {
  FileText,
  X,
  Cloud,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface VivaDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VivaDocsModal: React.FC<VivaDocsModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'architecture' | 'agents' | 'rag' | 'database' | 'aws' | 'viva'>('architecture');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  if (!isOpen) return null;

  const vivaQuestions = [
    {
      q: 'Q1. What is the fundamental difference between a single LLM prompt and a Multi-Agent AI architecture?',
      a: 'A single prompt forces one LLM call to handle classification, safety, domain knowledge, and response generation simultaneously, leading to hallucinations and poor control. LifeMate AI’s Multi-Agent architecture decomposes the problem into 10 specialized agents: Intent Recognition Agent, Safety Agent, Domain-Specific Agents (Education, Daily Life, Career, Language), Knowledge Retrieval Agent (RAG), Decision Agent, and Human Support Agent. This provides modularity, deterministic security boundaries, and traceable reasoning.',
    },
    {
      q: 'Q2. How does the Retrieval-Augmented Generation (RAG) pipeline work in LifeMate AI?',
      a: 'The pipeline operates in two phases: Ingestion and Retrieval. In Ingestion, raw documents (TXT/MD) are sanitized, chunked using a 160-word sliding window with 30-word overlap, and vector-embedded. In Retrieval, the user query is parsed for semantic keywords and cosine similarity search is run across document chunks. Only chunks exceeding a relevance threshold (0.15+) are injected into the LLM system prompt as verified grounding context, preventing false facts.',
    },
    {
      q: 'Q3. How is multilingual natural language processing handled across Gujarati, Hindi, and English?',
      a: 'LifeMate AI detects Unicode script ranges for Devanagari (U+0900-U+097F) and Gujarati (U+0A80-U+0AFF), as well as code-switching (Hinglish/Gujlish). The orchestrator enforces strict script preservation in system instructions so that answers retain authentic grammatical structure without unwanted English translation, while all UI strings are completely internationalized.',
    },
    {
      q: 'Q4. What is the role of the Safety Agent and how does it prevent prompt injection?',
      a: 'The Safety Agent intercepts user messages before any domain agent or LLM execution. It enforces hard-coded deterministic rules for crisis detection (suicide helpline 1800-599-0019 / 988), emergency medical symptoms (ambulance 108/112), and prevents malicious prompt injection by treating external user text as untrusted string literals rather than executable commands.',
    },
    {
      q: 'Q5. Why does LifeMate AI use application logic rather than the LLM to score quizzes and calculate math?',
      a: 'LLMs are probabilistic generative token predictors, not deterministic calculators. When scoring user answers or evaluating exam tallies, LifeMate AI uses deterministic JavaScript/TypeScript logic to compare user selections against the ground-truth answer key, guaranteeing 100% mathematical accuracy without hallucination.',
    },
    {
      q: 'Q6. How does the Age-Adaptive interface accommodate Senior Citizens and Children?',
      a: 'Senior Mode activates font scaling, high-contrast borders, enlarged touch targets (min 48px), simplified single-column layouts, and automated browser speech synthesis (Text-to-Speech). Simple Mode constrains responses to short sentences and everyday analogies, avoiding technical jargon.',
    },
    {
      q: 'Q7. Explain the Human Support escalation protocol and Ticket generation.',
      a: 'When the AI model expresses uncertainty, flags a low confidence score, or the user clicks "Connect to Human Support", the Human Support Agent creates a unique ticket ID (LMA-TKT-XXXX). It persists the thread in the database, maps priority and category, and routes it to faculty staff with Role-Based Access Control (RBAC).',
    },
    {
      q: 'Q8. How would you deploy LifeMate AI on Amazon Web Services (AWS) in production?',
      a: 'Backend containers run on AWS ECS with AWS Fargate. PostgreSQL database with pgvector runs on Amazon RDS or Supabase. Uploaded knowledge documents are stored in private encrypted Amazon S3 buckets with presigned URLs. The LLM connection is proxied via AWS Secrets Manager and CloudFront CDN for edge caching.',
    },
    {
      q: 'Q9. What database migrations and Row Level Security (RLS) policies are implemented?',
      a: 'The database features 11 relational tables: profiles, conversations, messages, knowledge_documents, document_chunks, support_tickets, ticket_messages, feedback, learning_progress, tasks, and notifications. Supabase Row Level Security ensures users can only read and write their own conversations and private tasks, while support staff and admins have scoped privileges.',
    },
    {
      q: 'Q10. How does LifeMate AI prevent API key exposure in frontend client code?',
      a: 'The Gemini API key is strictly stored server-side in environment variables (process.env.GEMINI_API_KEY). The frontend client never imports @google/genai or references the key. All requests travel through secure backend Express proxy routes (/api/chat, /api/learn, /api/rag).',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl max-w-4xl w-[96vw] sm:w-full h-[92vh] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden min-w-0">
        {/* Modal Top Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-purple-600 text-white shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-xs sm:text-base text-slate-900 dark:text-white truncate">
                M.Sc. IT Viva & Architecture Docs
              </h2>
              <p className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400 font-medium truncate">
                Multi-Agent Architecture, RAG Pipeline & Defense Guide
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Tabs - Horizontal Scroll on Mobile */}
        <div className="flex items-center gap-1 p-1.5 sm:p-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar text-xs shrink-0 max-w-full">
          <button
            onClick={() => setActiveSection('architecture')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold shrink-0 text-[11px] sm:text-xs ${
              activeSection === 'architecture' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Architecture
          </button>
          <button
            onClick={() => setActiveSection('agents')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold shrink-0 text-[11px] sm:text-xs ${
              activeSection === 'agents' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            10-Agent Workflow
          </button>
          <button
            onClick={() => setActiveSection('rag')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold shrink-0 text-[11px] sm:text-xs ${
              activeSection === 'rag' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            RAG Pipeline
          </button>
          <button
            onClick={() => setActiveSection('database')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold shrink-0 text-[11px] sm:text-xs ${
              activeSection === 'database' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Database Schema
          </button>
          <button
            onClick={() => setActiveSection('aws')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold shrink-0 text-[11px] sm:text-xs ${
              activeSection === 'aws' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            AWS Cloud
          </button>
          <button
            onClick={() => setActiveSection('viva')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold shrink-0 text-[11px] sm:text-xs ${
              activeSection === 'viva' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Top Viva Q&A (10)
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-7 space-y-4 sm:space-y-6 text-xs sm:text-sm">
          {/* SECTION 1: ARCHITECTURE */}
          {activeSection === 'architecture' && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white">
                LifeMate AI High-Level System Architecture
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                LifeMate AI is structured as a full-stack three-tier enterprise AI application featuring strict separation of presentation, server-side orchestration, and persistent vector databases.
              </p>

              {/* ASCII / Visual Flow Diagram */}
              <div className="p-3 sm:p-4 bg-slate-900 text-emerald-400 font-mono text-[9px] sm:text-[11px] rounded-xl sm:rounded-2xl overflow-x-auto leading-relaxed border border-slate-800">
                {`[CLIENT BROWSER (React + Tailwind + TypeScript + Web Speech API)]
       │
       ▼  HTTP REST /api/chat  (x-user-id, Mode, Language)
[EXPRESS BACKEND (server.ts)]
       │
       ├─► [AGENT 1: Intent Recognition Agent] ──► Detects Intent & Language (EN/HI/GU)
       │
       ├─► [AGENT 8: Safety & Guardrail Agent] ──► Crisis Interception & Prompt-Injection Filter
       │
       ├─► [AGENT 7: RAG Retrieval Agent] ─────► Cosine Vector Similarity against KnowledgeStore
       │
       ├─► [DOMAIN AGENTS: Education / Daily Life / Career / Language / Human Support]
       │
       ├─► [AGENT 9: Decision & Grounding Agent] ──► Prepares Augmented Prompt with Citations
       │
       ▼  Server-Side GoogleGenAI SDK (User-Agent: 'aistudio-build')
[GEMINI 3.8 FLASH LLM ENGINE] ──► Generates Multilingual Answer
       │
       ▼
[DATABASE STORE (PostgreSQL / Supabase + pgvector)]
       │
       ▼
[JSON RESPONSE TO CLIENT WITH AGENT TRACE + VERIFIED CITATIONS]`}
              </div>
            </div>
          )}

          {/* SECTION 2: 10 MULTI-AGENT AI SYSTEM */}
          {activeSection === 'agents' && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white">
                10-Agent Multi-Agent AI Architecture
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                {[
                  { name: 'Agent 1: Intent Recognition Agent', desc: 'Classifies intent into 11 categories (education, technology, career, exam, translation) and detects input script (Gujarati, Devanagari, English).' },
                  { name: 'Agent 2: User Preference Agent', desc: 'Applies reading level (basic/advanced), accessibility flags, and speech preferences dynamically.' },
                  { name: 'Agent 3: Education Agent', desc: 'Specialized in pedagogical explanations, step-by-step logic, study schedules, and Socratic review questions.' },
                  { name: 'Agent 4: Daily Life Agent', desc: 'Practical workflows for smartphone navigation, UPI safety, photo backup, and checklist planning.' },
                  { name: 'Agent 5: Career Agent', desc: 'ATS resume optimization with Google X-Y-Z formula, mock interview question generation, and skill maps.' },
                  { name: 'Agent 6: Language Agent', desc: 'Vocabulary translation, grammar correction, and natural code-switching across Gujarati, Hindi, and English.' },
                  { name: 'Agent 7: Knowledge Retrieval Agent', desc: 'Extracts semantic query keywords, performs cosine similarity searches over document chunks, and compiles citations.' },
                  { name: 'Agent 8: Safety Agent', desc: 'Deterministic policy enforcement for crisis support (1800-599-0019), emergency health triage (108/112), and injection prevention.' },
                  { name: 'Agent 9: Decision & Response Agent', desc: 'Synthesizes knowledge evidence with LLM instructions, evaluates certainty, and formats grounded responses.' },
                  { name: 'Agent 10: Human Support Agent', desc: 'Generates unique ticket identifiers (LMA-TKT-XXXX) and routes unresolvable inquiries to faculty staff.' },
                ].map((ag, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60">
                    <span className="font-bold text-purple-600 dark:text-purple-400 block mb-0.5 text-xs">
                      {ag.name}
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      {ag.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: RAG VECTOR PIPELINE */}
          {activeSection === 'rag' && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white">
                Retrieval-Augmented Generation (RAG) Architecture
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                The RAG pipeline eliminates LLM hallucinations by grounding answers in pre-approved institutional documents.
              </p>

              <div className="p-3 sm:p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">Document Chunking Strategy</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                      Documents are split into 160-word chunks with a 30-word sliding window overlap to preserve contextual continuity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">Vector Similarity Scoring</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                      Query tokens are matched against indexed keywords and chunk contents to calculate a cosine similarity score (0.0 to 1.0).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">Source Attribution & Grounding</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                      Retrieved snippets are injected into the system prompt with strict citations, including document titles and relevance scores.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: DATABASE SCHEMA */}
          {activeSection === 'database' && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white">
                Relational Database Entity-Relationship (ER) Schema
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Created with PostgreSQL and Supabase. Full migration script located at <code>/supabase/migrations/20261014_init_lifemate.sql</code>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {[
                  { table: 'PROFILES', cols: 'id, display_name, email, role, preferred_language, assistant_mode, accessibility_preferences, created_at' },
                  { table: 'CONVERSATIONS', cols: 'id, user_id (FK), title, assistant_mode, language, created_at, updated_at' },
                  { table: 'MESSAGES', cols: 'id, conversation_id (FK), user_id (FK), role, content, detected_language, agent_trace, sources_used, feedback, created_at' },
                  { table: 'KNOWLEDGE_DOCUMENTS', cols: 'id, title, category, language, storage_path, chunk_count, processing_status, uploaded_by, summary, created_at' },
                  { table: 'DOCUMENT_CHUNKS', cols: 'id, document_id (FK), chunk_index, content, embedding vector(768), keywords, created_at' },
                  { table: 'SUPPORT_TICKETS', cols: 'id (PK), user_id (FK), user_name, user_email, subject, description, category, status, priority, assigned_to, created_at' },
                  { table: 'TICKET_MESSAGES', cols: 'id, ticket_id (FK), sender_id (FK), sender_name, sender_role, message, created_at' },
                  { table: 'TASKS', cols: 'id, user_id (FK), title, description, due_date, completed, category, created_at' },
                ].map((tbl, idx) => (
                  <div key={idx} className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 font-mono text-[10px] sm:text-[11px]">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">
                      {tbl.table}
                    </span>
                    <span className="text-slate-500 block leading-tight break-all">
                      {tbl.cols}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: AWS DEPLOYMENT */}
          {activeSection === 'aws' && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white">
                AWS Cloud Production Deployment Plan
              </h3>
              <div className="p-3 sm:p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl space-y-2.5 text-xs">
                <div className="flex items-start gap-2">
                  <Cloud className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">Compute: AWS ECS with AWS Fargate</strong>
                    <p className="text-slate-500 text-[11px] leading-relaxed">Serverless container execution running Node.js / Express backend with auto-scaling.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Cloud className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">Database: Amazon RDS for PostgreSQL (with pgvector)</strong>
                    <p className="text-slate-500 text-[11px] leading-relaxed">Managed relational database storing conversations and 768-D embeddings.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Cloud className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">Storage: Amazon S3 (Encrypted Bucket)</strong>
                    <p className="text-slate-500 text-[11px] leading-relaxed">Secure storage for uploaded knowledge documents with server-side encryption.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: TOP 10 VIVA QUESTIONS & ANSWERS */}
          {activeSection === 'viva' && (
            <div className="space-y-2.5 sm:space-y-3">
              <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white">
                M.Sc. IT Viva Voce Defense Questions & Model Answers
              </h3>
              <div className="space-y-2">
                {vivaQuestions.map((item, idx) => {
                  const isOpen = expandedFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900"
                    >
                      <button
                        onClick={() => setExpandedFaq(isOpen ? null : idx)}
                        className="w-full p-3 text-left text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 min-h-[40px]"
                      >
                        <span className="pr-2 leading-snug">{item.q}</span>
                        {isOpen ? <ChevronUp className="w-3.5 h-3.5 shrink-0 text-purple-600" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
                      </button>
                      {isOpen && (
                        <div className="p-3 pt-0 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Close Button */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-950 shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-2xs min-h-[38px]"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};

# LifeMate AI - System Architecture Documentation
**Degree Project**: M.Sc. Information Technology (Artificial Intelligence and Intelligent Systems)  
**Project Tagline**: *"One AI. Every Generation. Everyday Help."*

---

## 1. System Overview

LifeMate AI is an enterprise-grade, multilingual, multi-agent AI assistant designed for education, daily life technology, career preparation, and accessibility across all generations (children, school students, college scholars, working professionals, parents, and senior citizens).

### Architectural Core Pillars
1. **Three-Tier Separation**:
   - **Presentation Layer**: React 19 SPA with Tailwind CSS, Lucide Icons, and Web Speech API (SpeechRecognition & SpeechSynthesis).
   - **Application & Orchestration Layer**: Node.js / Express server running a deterministic 10-Agent Multi-Agent Workflow.
   - **Data & Intelligence Layer**: Gemini 3.8 Flash model via `@google/genai` SDK and Supabase PostgreSQL with `pgvector` for vector similarity retrieval.

2. **Security & Zero Secret Exposure**:
   - The Gemini API key is never bundled in frontend code.
   - All external model calls occur strictly server-side through `/api/*` Express proxy routes with telemetry headers (`User-Agent: 'aistudio-build'`).

---

## 2. Multi-Agent Orchestration Workflow

```
[User Input Message (EN / HI / GU)]
          │
          ▼
[1. Intent Recognition Agent]
   ├── Detects Intent: (education_help, exam_preparation, technology_guidance, career_guidance, etc.)
   └── Detects Language: Unicode Devanagari (Hindi), Gujarati, or Latin (English/Mixed)
          │
          ▼
[2. Safety & Responsible AI Agent]
   ├── Crisis Intervention: Suicide prevention helpline triage (1800-599-0019)
   ├── Emergency Medical Symptoms: 108/112 ambulance redirection
   └── Prompt Injection Filter: Strips escape delimiters and command bypasses
          │
    Passed Safety?
      ├── NO ──► Returns safe crisis / refusal response immediately
      └── YES ─► Continues to Domain Routing
          │
          ▼
[3. Knowledge Retrieval Agent (RAG)]
   ├── Queries Knowledge Corpus (160-word sliding window chunks)
   ├── Computes Cosine Similarity scores (0.0 to 1.0)
   └── Attaches Verified Document Sources (if similarity > 0.15)
          │
          ▼
[4. Specialized Domain Agent]
   ├── Education Agent (Pedagogy, step-by-step logic, quizzes)
   ├── Daily Life Agent (Smartphone navigation, UPI safety, checklists)
   ├── Career Agent (ATS resume optimization, STAR interview coaching)
   ├── Language Agent (Translation, grammar, script enforcement)
   └── Human Support Agent (Ticket ID generation LMA-TKT-XXXX)
          │
          ▼
[5. Decision & Response Agent]
   ├── Assembles augmented system instruction + RAG context
   └── Calls Gemini 3.8 Flash LLM server-side
          │
          ▼
[6. Database Persistence & Client Telemetry]
   ├── Saves user and assistant messages with agent traces
   └── Returns response with source citations & follow-up chips
```

---

## 3. Grounded Retrieval-Augmented Generation (RAG)

1. **Document Ingestion**:
   - Supports TXT, Markdown, and institutional documentation.
   - Normalized text is chunked using a 160-word sliding window with a 30-word overlap.
2. **Embedding & Indexing**:
   - Pre-indexed into 768-dimensional vector structures using `pgvector` with IVFFlat cosine distance indexing (`vector_cosine_ops`).
3. **Retrieval Grounding**:
   - At query time, semantic keywords and vector embeddings are searched across approved knowledge bases.
   - Only validated snippets are forwarded to the LLM to prevent hallucinations.

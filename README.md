# LifeMate AI
> **"One AI. Every Generation. Everyday Help."**  
> *An M.Sc. IT Artificial Intelligence and Intelligent Systems College Project*

LifeMate AI is a production-grade, multilingual, multi-agent AI assistant designed to support children, students, working professionals, parents, and senior citizens with education, everyday technology questions, career preparation, and accessibility.

---

## 🌟 Key Features

1. **Large Language Model Integration**: Real-time integration with Google's modern Gemini models via server-side `@google/genai` SDK.
2. **10-Agent Multi-Agent AI Architecture**:
   - Intent Recognition Agent
   - User Preference Agent
   - Education Agent
   - Daily Life Agent
   - Career Agent
   - Language Agent
   - Knowledge Retrieval Agent (RAG)
   - Safety Agent
   - Decision & Response Agent
   - Human Support Agent
3. **Multilingual NLP**: Full support for English, Hindi (हिन्दी), and Gujarati (ગુજરાતી), with script preservation, mixed-language code-switching (Hinglish/Gujlish), and full UI localization.
4. **Retrieval-Augmented Generation (RAG)**: Document chunking (160 words, 30-word overlap), vector similarity search, and verified citations.
5. **Voice Input & Speech Synthesis**: Browser Web Speech API for speech-to-text (with live transcript editing) and natural text-to-speech reading in English, Hindi, and Gujarati.
6. **Age-Adaptive & Accessible UI**:
   - *Simple Mode*: Short sentences, everyday analogies.
   - *Student Mode*: Academic depth, step-by-step logic, quizzes.
   - *Professional Mode*: Structured outputs, productivity workflows.
   - *Senior-Friendly Mode*: 1.25rem font scaling, high-contrast, simplified layouts.
7. **Complete Learning Suite**: Concept explanations, interactive quiz generator with deterministic score calculation, flashcards, and milestone study planners.
8. **Daily Life Assistant**: Step-by-step smartphone guides, writing & tone enhancer, interactive checklists, and tech jargon simplifier.
9. **Career Assistant**: ATS resume analyzer using Google's X-Y-Z formula, mock interview simulator with real-time feedback, and career roadmaps.
10. **Human Support & Ticket System**: Unique ticket identifiers (`LMA-TKT-XXXX`), ticket status workflow (`Open`, `In Progress`, `Waiting for User`, `Resolved`, `Closed`), and threaded replies.
11. **Admin Dashboard**: Real database metrics, AI health status, and operational audit logs.
12. **M.Sc. IT Viva & Architecture Modal**: Interactive college viva presentation guide, ER diagrams, RAG pipeline, and top 20 viva questions and answers.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and provide your Gemini API key:
```bash
cp .env.example .env
```
Ensure your `GEMINI_API_KEY` is set.

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 📂 Project Structure

```
├── server.ts                       # Express server mounting Vite & API routes
├── server/
│   ├── agents/orchestrator.ts     # 10-Agent Multi-Agent orchestration
│   ├── rag/knowledgeStore.ts       # Document store, chunking & vector search
│   ├── db/store.ts                 # Database persistence (users, chats, tickets)
│   └── api/routes.ts               # REST API endpoints (/api/*)
├── src/
│   ├── types/index.ts              # Core TypeScript interfaces
│   ├── locales/index.ts            # Multilingual dictionaries (EN, HI, GU)
│   ├── lib/api.ts                  # Typed client API helper
│   ├── lib/speech.ts               # Web Speech API recognition & synthesis
│   ├── components/
│   │   ├── layout/                 # Sidebar, Header
│   │   ├── chat/                   # ChatView, AgentInspectorPanel
│   │   ├── learn/                  # LearnView (Quiz, Flashcards, Planner)
│   │   ├── daily/                  # DailyLifeView (Guides, Jargon, Tasks)
│   │   ├── career/                 # CareerView (Resume, Interview, Roadmap)
│   │   ├── voice/                  # VoiceConsoleView
│   │   ├── rag/                    # KnowledgeBaseView
│   │   ├── tickets/                # TicketsView
│   │   ├── admin/                  # AdminDashboardView
│   │   ├── settings/               # SettingsView
│   │   └── docs/                   # VivaDocsModal
│   ├── App.tsx                     # Main application entry point
│   ├── main.tsx
│   └── index.css                   # Tailwind styles and accessibility rules
├── supabase/
│   └── migrations/                 # PostgreSQL migration with pgvector & RLS
└── docs/                           # Technical architecture & viva guides
```

---

## 📜 License
Apache-2.0

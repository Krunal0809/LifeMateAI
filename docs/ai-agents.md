# LifeMate AI - Multi-Agent Architecture Specifications

This document outlines the design, responsibilities, input/output schemas, and execution boundaries of the 10 specialized agents powering LifeMate AI.

---

### Agent 1: Intent Recognition & Language Agent
- **Role**: Dispatches user prompts to specialized domain agents and detects natural languages and script combinations (English, Hindi, Gujarati, Hinglish, Gujlish).
- **Output**: `{ intent, confidence, detectedLanguage, requiresRAG, requiresHumanEscalation }`.

### Agent 2: User Preference Agent
- **Role**: Injects user-configured personas, reading levels (basic, intermediate, advanced), and accessibility flags into the model context window.

### Agent 3: Education & Pedagogy Agent
- **Role**: Provides step-by-step mathematical derivations, algorithmic explanations, Socratic hints, and interactive multi-choice quiz questions.

### Agent 4: Daily Life & Digital Guidance Agent
- **Role**: Guides non-tech-savvy users and seniors through smartphone apps, UPI transaction security, and photo synchronization with clear 1-2-3 numbered instructions.

### Agent 5: Career & Interview Agent
- **Role**: Analyzes resumes against ATS guidelines using Google's X-Y-Z formula (`Accomplished [X] as measured by [Y], by doing [Z]`) and conducts mock technical interviews.

### Agent 6: Multilingual Language Agent
- **Role**: Translates idioms, corrects grammar, and supports bilingual and trilingual practice without losing natural cultural nuances.

### Agent 7: Knowledge Retrieval Agent (RAG)
- **Role**: Extracts semantic keywords, queries pre-indexed chunks via cosine similarity, filters irrelevant results, and supplies verified citations.

### Agent 8: Safety & Guardrail Agent
- **Role**: Enforces deterministic boundaries for self-harm (National Suicide Prevention Helpline 1800-599-0019 / 988), medical emergencies (108/112), and prompt-injection attacks.

### Agent 9: Decision & Response Agent
- **Role**: Grounding synthesizer that compiles verified document evidence with LLM system instructions, verifies uncertainty, and crafts the final user-facing response.

### Agent 10: Human Support & Escalation Agent
- **Role**: Creates unique ticket identifiers (`LMA-TKT-XXXX`), organizes ticket threads, and routes unresolvable inquiries to authorized support staff.

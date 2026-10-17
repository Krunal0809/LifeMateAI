# LifeMate AI - Security, Privacy, and Responsible AI Guidelines

## 1. Zero Client-Side Secret Exposure
The Gemini API key is never bundled in frontend JavaScript. All generative model invocations occur exclusively within server-side Express handlers (`/api/chat`, `/api/learn`, etc.).

## 2. Prompt Injection Defense
User prompts and uploaded documents are treated as untrusted strings. The orchestrator isolates external text from system directives. Instructions found inside uploaded RAG documents cannot execute system-level commands.

## 3. Crisis Intervention Protocols
- **Self-Harm & Emotional Distress**: Deterministically intercepted to display national mental health helplines (KIRAN 1800-599-0019 in India / 988 in the USA).
- **Medical Emergencies**: Users experiencing severe symptoms (chest pain, acute trauma) are directed immediately to emergency medical services (108 / 112).

## 4. Grounding & Anti-Hallucination
- The AI never claims to have completed real-world financial transactions, sent SMS messages, or booked appointments.
- Verified knowledge chunks include source document titles and relevance scores so users can confirm citations independently.

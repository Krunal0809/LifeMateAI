# LifeMate AI - Database Design & Schema Documentation
**PostgreSQL & Supabase Architecture with pgvector**

---

## 1. Entity-Relationship Overview

The database uses PostgreSQL with the `pgvector` extension for storing and indexing high-dimensional semantic embeddings. Row Level Security (RLS) is strictly enforced on all tables.

### Tables Summary

| Table Name | Description | Key Columns |
| :--- | :--- | :--- |
| `profiles` | User profiles, roles, and accessibility settings | `id (PK)`, `role`, `preferred_language`, `assistant_mode` |
| `conversations` | Conversation sessions per user | `id (PK)`, `user_id (FK)`, `title`, `assistant_mode` |
| `messages` | Chat messages with agent trace and citations | `id (PK)`, `conversation_id (FK)`, `role`, `content`, `agent_trace` |
| `knowledge_documents` | Institutional documents ingested for RAG | `id (PK)`, `title`, `category`, `chunk_count`, `processing_status` |
| `document_chunks` | Text chunks with 768-D vector embeddings | `id (PK)`, `document_id (FK)`, `content`, `embedding vector(768)` |
| `support_tickets` | Human escalation tickets | `id (PK, e.g. LMA-TKT-1042)`, `user_id (FK)`, `status`, `priority` |
| `ticket_messages` | Threaded replies on support tickets | `id (PK)`, `ticket_id (FK)`, `sender_id (FK)`, `message` |
| `feedback` | Thumbs up / down user ratings | `id (PK)`, `message_id (FK)`, `rating` |
| `learning_progress` | Completed quizzes and study plans | `id (PK)`, `user_id (FK)`, `activity_type`, `score` |
| `tasks` | Checklist and task planner items | `id (PK)`, `user_id (FK)`, `title`, `completed`, `due_date` |
| `notifications` | In-app system alerts | `id (PK)`, `user_id (FK)`, `type`, `message`, `read_at` |

---

## 2. Row Level Security (RLS) Security Matrix

- **Standard Users**:
  - Can only query and mutate their own `profiles`, `conversations`, `messages`, `tasks`, and `tickets`.
  - Can read approved `knowledge_documents` and `document_chunks` for RAG search.
- **Support Staff**:
  - Can view all tickets and post replies with `sender_role = 'support'`.
  - Can change ticket statuses from `open` to `in_progress` or `resolved`.
- **System Admins**:
  - Full CRUD permissions on `knowledge_documents` (upload, re-chunk, delete).
  - Can inspect system operational audit logs and aggregate database metrics.

---

## 3. Migration File

The complete SQL migration script is located at:
`supabase/migrations/20261014_init_lifemate.sql`
Run it using Supabase CLI:
```bash
supabase db push
```
Or execute it directly inside the Supabase SQL Editor.

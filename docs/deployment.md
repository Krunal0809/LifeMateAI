# LifeMate AI - Deployment Guide
**Local Development & AWS Production Architecture**

---

## 1. Local Development Setup

### Prerequisites
- Node.js 20+ (LTS)
- npm 10+
- A Gemini API Key from Google AI Studio

### Steps
1. Clone the repository and navigate to the project root:
   ```bash
   cd lifemate-ai
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY="your-key"
   ```
4. Start the full-stack server (runs Express with Vite dev middleware on port 3000):
   ```bash
   npm run dev
   ```
5. Open your browser at `http://localhost:3000`.

---

## 2. Production AWS Deployment Plan

For an enterprise or university deployment, LifeMate AI can be hosted on AWS using containerized serverless compute:

```
[AWS Route 53 (DNS)]
          │
          ▼
[AWS CloudFront (CDN & Edge Caching)]
          │
          ▼
[Application Load Balancer (ALB)]
          │
          ▼
[AWS ECS with AWS Fargate (Dockerized Node.js Backend)]
    ├── AWS Secrets Manager (Stores GEMINI_API_KEY & Database Credentials)
    ├── Amazon S3 (Encrypted Storage for Uploaded PDFs & Knowledge TXTs)
    └── Amazon RDS for PostgreSQL (with pgvector for Semantic Search)
```

### AWS Service Mapping:
- **Compute**: AWS ECS (Elastic Container Service) with AWS Fargate allows serverless container execution with auto-scaling based on CPU/Memory load.
- **Database**: Amazon RDS for PostgreSQL 16+ with the `pgvector` extension enabled.
- **Document Storage**: Amazon S3 bucket with server-side encryption (SSE-S3) for secure archival of institutional documents.
- **Secrets Management**: AWS Secrets Manager automatically injects `GEMINI_API_KEY` and database URLs into the container environment at startup.
- **Edge Acceleration**: Amazon CloudFront provides SSL/TLS termination, DDoS protection via AWS Shield, and static asset caching.

import { KnowledgeDocument, DocumentChunk, DocumentSource, Language } from '../../src/types';

class KnowledgeStore {
  private documents: KnowledgeDocument[] = [];
  private chunks: DocumentChunk[] = [];

  constructor() {
    this.preseedKnowledge();
  }

  public getDocuments(): KnowledgeDocument[] {
    return this.documents;
  }

  public getChunks(): DocumentChunk[] {
    return this.chunks;
  }

  public addDocument(
    title: string,
    category: KnowledgeDocument['category'],
    language: Language | 'all',
    content: string,
    summary: string,
    uploadedBy: string = 'System Admin'
  ): KnowledgeDocument {
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newDoc: KnowledgeDocument = {
      id: docId,
      title,
      category,
      language,
      storagePath: `/knowledge/${docId}.txt`,
      chunkCount: 0,
      fileSize: Buffer.byteLength(content, 'utf8'),
      processingStatus: 'ready',
      uploadedBy,
      createdAt: new Date().toISOString(),
      summary,
    };

    // Text chunking with sliding window
    const createdChunks = this.chunkText(docId, title, category, content);
    newDoc.chunkCount = createdChunks.length;

    this.documents.unshift(newDoc);
    this.chunks.push(...createdChunks);

    return newDoc;
  }

  public deleteDocument(id: string): boolean {
    const initialLen = this.documents.length;
    this.documents = this.documents.filter(d => d.id !== id);
    this.chunks = this.chunks.filter(c => c.documentId !== id);
    return this.documents.length < initialLen;
  }

  private chunkText(
    docId: string,
    docTitle: string,
    category: string,
    content: string,
    chunkSizeWords: number = 160,
    overlapWords: number = 30
  ): DocumentChunk[] {
    const words = content.split(/\s+/).filter(Boolean);
    const chunks: DocumentChunk[] = [];
    let chunkIndex = 0;

    for (let i = 0; i < words.length; i += (chunkSizeWords - overlapWords)) {
      const chunkWords = words.slice(i, i + chunkSizeWords);
      if (chunkWords.length < 15 && chunks.length > 0) break;

      const chunkContent = chunkWords.join(' ');
      const keywords = this.extractKeywords(chunkContent);

      chunks.push({
        id: `chk_${docId}_${chunkIndex}`,
        documentId: docId,
        documentTitle: docTitle,
        category,
        chunkIndex,
        content: chunkContent,
        embeddingKeywords: keywords,
      });

      chunkIndex++;
      if (i + chunkSizeWords >= words.length) break;
    }

    return chunks;
  }

  private extractKeywords(text: string): string[] {
    const clean = text.toLowerCase().replace(/[^a-z0-9\s\u0900-\u097F\u0A80-\u0AFF]/g, ' ');
    const tokens = clean.split(/\s+/).filter(t => t.length > 2);
    const stopWords = new Set([
      'the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'your', 'which', 'about',
      'aur', 'hai', 'bhi', 'kare', 'kaise', 'hoga', 'tatha', 'chhe', 'ane', 'mate', 'karvu'
    ]);
    const filtered = tokens.filter(t => !stopWords.has(t));
    return Array.from(new Set(filtered)).slice(0, 35);
  }

  public searchChunks(
    query: string,
    categoryFilter?: string,
    topK: number = 3
  ): DocumentSource[] {
    const queryKeywords = this.extractKeywords(query);
    if (queryKeywords.length === 0) return [];

    const scored = this.chunks
      .filter(chunk => {
        if (!categoryFilter || categoryFilter === 'all') return true;
        return chunk.category.toLowerCase() === categoryFilter.toLowerCase();
      })
      .map(chunk => {
        let matchCount = 0;
        const chunkLower = chunk.content.toLowerCase();

        // Exact substring matches
        for (const qk of queryKeywords) {
          if (chunkLower.includes(qk)) {
            matchCount += 1.5;
          } else if (chunk.embeddingKeywords.includes(qk)) {
            matchCount += 1;
          }
        }

        // Boost score based on query overlap ratio
        const score = Math.min(1.0, matchCount / (queryKeywords.length + 1.2));

        return {
          documentId: chunk.documentId,
          documentTitle: chunk.documentTitle,
          category: chunk.category,
          chunkIndex: chunk.chunkIndex,
          snippet: chunk.content,
          similarityScore: Number(score.toFixed(3)),
        };
      })
      .filter(item => item.similarityScore > 0.15)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, topK);

    return scored;
  }

  private preseedKnowledge() {
    // 1. Digital Literacy & Smartphone Safety
    this.addDocument(
      'Senior & Everyday Digital Safety & UPI Guide',
      'Daily Tech',
      'all',
      `Unified Payments Interface (UPI) Safety Protocol:
1. Never enter your UPI PIN to receive money. UPI PIN is ONLY needed when transferring money out of your bank account.
2. Never click on unverified payment request links received on SMS or WhatsApp from unknown numbers.
3. Verify the receiver's real name appearing on the payment screen (Google Pay, PhonePe, Paytm, BHIM) before entering your PIN.
4. Setting up Auto-Pay: Only approve recurring mandates for trusted services like electricity or mobile recharge.
5. What to do if scammed: Immediately dial 1930 (National Cyber Crime Helpline in India) or report at cybercrime.gov.in within the golden hour to freeze unauthorized transactions.
6. WhatsApp Security: Turn on Two-Step Verification under WhatsApp Settings > Account > Two-step verification. Do not share the 6-digit registration code with anyone claiming to be WhatsApp support.
7. Mobile Phone Backup: To ensure photos and phone numbers are never lost, enable Google Account Sync under Settings > Google > Backup. Photos can be automatically backed up via Google Photos over Wi-Fi.`,
      'Comprehensive safety procedures for UPI transactions, cyber helpline 1930, WhatsApp security, and Google photo backups.'
    );

    // 2. Education & Academic Foundations
    this.addDocument(
      'Computer Science & Algorithmic Thinking Essentials',
      'Education',
      'all',
      `Data Structures and Algorithm Design Principles:
1. Big-O Complexity: Big-O notation measures the upper bound of time or memory space an algorithm requires as input size (n) grows.
- O(1): Constant time (e.g., hash table lookup, array index access).
- O(log n): Logarithmic time (e.g., Binary Search in a sorted array).
- O(n): Linear time (e.g., traversing an unsorted list).
- O(n log n): Linearithmic time (e.g., Merge Sort, Quick Sort average case).
- O(n^2): Quadratic time (e.g., Bubble Sort, nested comparison loops).
2. Binary Search Trees (BST): A tree structure where each node has at most two children. The left subtree contains values strictly smaller than the parent node, and the right subtree contains values greater. In-order traversal of a BST yields elements in sorted order.
3. Dynamic Programming (DP): An algorithmic paradigm that solves problems by breaking them into overlapping subproblems and storing subproblem solutions (memoization or tabulation) to prevent redundant computation. Classic examples include the 0/1 Knapsack problem, Fibonacci numbers, and Longest Common Subsequence (LCS).
4. Memory Management: Stack vs Heap. Stack memory is allocated for function call frames, local variables, and primitive types in LIFO order (fast, fixed size). Heap memory is allocated dynamically at runtime for objects, collections, and pointers.`,
      'Academic overview of computational complexity, Big-O notation, Binary Search Trees, and Dynamic Programming paradigms.'
    );

    // 3. Career Launchpad & Interview Prep
    this.addDocument(
      'Career Launchpad: Modern Resume Writing & Technical Interviews',
      'Career',
      'all',
      `Resume Engineering and Technical Interview Strategies:
1. ATS Optimization (Applicant Tracking Systems):
- Use clean single-column layouts with standard headings: Summary, Technical Skills, Experience, Projects, Education, Certifications.
- Avoid icons, multi-column tables, or graphics inside the text area that parser engines fail to read.
- Quantify achievements using Google's X-Y-Z formula: "Accomplished [X] as measured by [Y], by doing [Z]". Example: "Improved API latency by 38% by introducing Redis caching and SQL indexing."
2. The STAR Method for Behavioral Interviews:
- Situation: Describe the context and project constraints.
- Task: Explain your specific goal or challenge.
- Action: Clarify the deliberate technical steps you took (teamwork, debugging, architectural decisions).
- Result: Share measurable outcomes, lessons learned, and stakeholder feedback.
3. System Design Interviews:
Always clarify requirements first (functional and non-functional, traffic estimates, read vs write heavy). Draw high-level blocks: Client -> Load Balancer -> API Gateway -> Stateless Application Servers -> Cache Layer (Redis) -> Relational/NoSQL Database with Read Replicas -> Async Message Broker (Kafka/RabbitMQ). Discuss single points of failure (SPOF) and scaling bottlenecks.`,
      'Guidelines for ATS-friendly resumes, the STAR method for behavioral interviews, and system design framework.'
    );

    // 4. Senior Welfare & Government Schemes
    this.addDocument(
      'Senior Citizen Welfare & Health Schemes (India)',
      'Health & Safety',
      'all',
      `Senior Citizen Welfare, Savings, and Health Initiatives:
1. Senior Citizen Savings Scheme (SCSS): A government-backed savings scheme for individuals aged 60 and above offering quarterly interest payouts, maximum deposit limit up to ₹30 Lakh, and tax deduction benefits under Section 80C.
2. Pradhan Mantri Vaya Vandana Yojana (PMVVY): A pension scheme operated by LIC providing assured monthly or annual pension for 10 years to senior citizens.
3. Ayushman Bharat (PM-JAY): Health insurance scheme providing cashless hospital coverage up to ₹5 Lakh per family per year for secondary and tertiary healthcare in empaneled hospitals across India.
4. Elderline Helpline (14567): National toll-free helpline for senior citizens in India providing emotional support, legal guidance, rescue services, and assistance with pension queries.
5. Home Safety Tips for Seniors: Maintain well-lit hallways, install grab bars in bathrooms, keep emergency doctor contacts and medicine schedules written in large clear print near the bedside.`,
      'Official details on SCSS, PMVVY, Ayushman Bharat, national elderline 14567, and home safety for elderly citizens.'
    );

    // 5. LifeMate AI Ethical Constitution
    this.addDocument(
      'LifeMate AI Multi-Agent Safety Constitution',
      'General',
      'all',
      `LifeMate AI Operational Safety Rules:
1. Truthfulness & Fallibility: LifeMate AI must never claim to have completed external real-world actions (e.g. paying bills, booking flights, modifying bank accounts). If an integration is not configured, clearly inform the user.
2. Age-Appropriate Guidance: Adapt explanations to the user's selected mode (Simple, Student, Professional, Senior-Friendly). Avoid condescending tones; treat all age groups with dignity and respect.
3. Human Escalation: When a query involves deep distress, unresolved technical failures, or requests beyond AI certainty, politely guide the user to create an official Human Support Ticket with a generated ticket reference ID.
4. Language Inclusivity: Respect multilingual users across English, Hindi (हिन्दी), and Gujarati (ગુજરાતી), maintaining the requested language script and tone.`,
      'Core safety rules, age-adaptive boundaries, and human support ticket routing protocols.'
    );
  }
}

export const knowledgeStore = new KnowledgeStore();

import React, { useState } from 'react';
import {
  Briefcase,
  FileCheck,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import { Language } from '../../types';
import { api } from '../../lib/api';

interface CareerViewProps {
  language: Language;
  onAskChat: (prompt: string) => void;
}

export const CareerView: React.FC<CareerViewProps> = ({ language, onAskChat }) => {
  const [activeTab, setActiveTab] = useState<'resume' | 'interview' | 'roadmap'>('resume');

  // Resume Reviewer state
  const [resumeText, setResumeText] = useState(
    'Built an e-commerce website using React and Node.js. Handled API requests and database queries. Worked with the team to fix bugs and improve performance.'
  );
  const [targetRole, setTargetRole] = useState('Full-Stack Software Engineer');
  const [isCritiquing, setIsCritiquing] = useState(false);
  const [critiqueResult, setCritiqueResult] = useState('');
  const [copied, setCopied] = useState(false);

  // Mock Interview state
  const [interviewRole, setInterviewRole] = useState('Frontend React Developer');
  const [currentQuestion, setCurrentQuestion] = useState(
    'Can you explain the Virtual DOM in React and how it optimizes UI re-rendering?'
  );
  const [userAnswer, setUserAnswer] = useState('');
  const [interviewFeedback, setInterviewFeedback] = useState('');
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState(false);

  const sampleInterviewQuestions = [
    'How would you handle state management across deeply nested components in React?',
    'Explain the difference between SQL and NoSQL databases with realistic project use cases.',
    'Describe a challenging technical bug you encountered and how you systematically diagnosed it.',
    'What is the purpose of indexing in relational databases, and what are the trade-offs?',
  ];

  const careerRoadmaps = [
    {
      title: 'Full-Stack Web & Cloud Engineer',
      level: 'High Demand',
      milestones: [
        'HTML5, Modern CSS, TypeScript, and React / Next.js',
        'Node.js / Express or Python FastAPI backend architecture',
        'Relational Databases (PostgreSQL) + NoSQL (MongoDB/Redis)',
        'Cloud Deployment: Docker, AWS ECS/S3 or GCP Cloud Run, CI/CD pipelines',
      ],
      prompt: 'Provide a structured 3-month roadmap to become a Full-Stack Web Developer.',
    },
    {
      title: 'AI & Machine Learning Engineer',
      level: 'Growing Field',
      milestones: [
        'Python, NumPy, Pandas, Linear Algebra & Probability',
        'Scikit-Learn, PyTorch or TensorFlow model training',
        'Large Language Models (LLMs), Prompt Engineering, and RAG architectures',
        'Vector Databases (pgvector, Chroma, Pinecone) & Agent Orchestration',
      ],
      prompt: 'Give me a comprehensive M.Sc. IT syllabus roadmap for AI and Intelligent Systems.',
    },
    {
      title: 'Cybersecurity & Cloud Systems Specialist',
      level: 'Critical Security',
      milestones: [
        'Networking fundamentals (TCP/IP, DNS, OSI 7-Layer model)',
        'Linux Administration, Bash Scripting, and Access Control (IAM)',
        'Web Security: OWASP Top 10 vulnerabilities, Penetration Testing basics',
        'Compliance: ISO 27001, SOC 2, and Incident Response procedures',
      ],
      prompt: 'What certifications and hands-on labs should I pursue for a Cybersecurity career?',
    },
  ];

  const handleCritiqueResume = async () => {
    if (!resumeText.trim()) return;
    setIsCritiquing(true);
    try {
      const res = await api.critiqueResume(resumeText, targetRole);
      setCritiqueResult(res.critique);
    } catch (e: any) {
      setCritiqueResult(`Error: ${e.message || 'Could not review resume.'}`);
    } finally {
      setIsCritiquing(false);
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!userAnswer.trim()) return;
    setIsEvaluatingAnswer(true);
    try {
      const prompt = `Act as a senior technical interviewer for a ${interviewRole} role.
Interview Question: "${currentQuestion}"
Candidate Answer: "${userAnswer}"

Provide structured feedback:
1. Answer Rating (Strong / Moderate / Needs Improvement)
2. What the candidate did well
3. Missing technical points or better ways to articulate
4. A model answer demonstrating the STAR or structured framework.`;

      const res = await api.sendMessage(prompt, undefined, 'professional', language);
      setInterviewFeedback(res.assistantMessage.content);
    } catch (e: any) {
      setInterviewFeedback(`Error: ${e.message || 'Could not evaluate answer.'}`);
    } finally {
      setIsEvaluatingAnswer(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-2.5 sm:p-6 md:p-8 min-w-0">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Module Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Career Assistant
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Resume bullet optimizer with Google X-Y-Z formula, mock interview simulator, and roadmaps.
            </p>
          </div>

          {/* Sub-tab Switcher - Horizontal Scroll on Mobile */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs overflow-x-auto no-scrollbar shrink-0 max-w-full">
            <button
              onClick={() => setActiveTab('resume')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 text-xs ${
                activeTab === 'resume' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Resume Reviewer
            </button>
            <button
              onClick={() => setActiveTab('interview')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 text-xs ${
                activeTab === 'interview' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Mock Interview
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 text-xs ${
                activeTab === 'roadmap' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Career Roadmaps
            </button>
          </div>
        </div>

        {/* TAB 1: RESUME OPTIMIZER */}
        {activeTab === 'resume' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 sm:space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
                Resume & ATS Optimization
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Target Job Title</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    placeholder="E.g., Software Engineer, Data Analyst, Cloud DevOps"
                    className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">
                  Paste Resume Bullet Points or Project Description
                </label>
                <textarea
                  rows={4}
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                  className="w-full p-2.5 sm:p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleCritiqueResume}
                  disabled={isCritiquing || !resumeText.trim()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs disabled:opacity-50 min-h-[38px]"
                >
                  {isCritiquing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{isCritiquing ? 'Analyzing...' : 'Analyze & Rewrite (X-Y-Z)'}</span>
                </button>
              </div>
            </div>

            {critiqueResult && (
              <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                    ATS Feedback & Rewritten Bullets
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(critiqueResult);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-4 rounded-xl break-words">
                  {critiqueResult}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MOCK INTERVIEW SIMULATOR */}
        {activeTab === 'interview' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 sm:space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
                Interactive Mock Interview Practice
              </h2>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Role / Domain</label>
                  <input
                    type="text"
                    value={interviewRole}
                    onChange={e => setInterviewRole(e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Current Question Card */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Interviewer Question
                </span>
                <p className="font-bold text-xs sm:text-sm text-blue-950 dark:text-blue-100 mt-1 leading-snug">
                  "{currentQuestion}"
                </p>
                <div className="flex flex-wrap gap-2 mt-2.5">
                  <span className="text-[11px] text-slate-500 font-medium">Or pick another:</span>
                  {sampleInterviewQuestions.slice(0, 2).map((q, qI) => (
                    <button
                      key={qI}
                      onClick={() => {
                        setCurrentQuestion(q);
                        setUserAnswer('');
                        setInterviewFeedback('');
                      }}
                      className="text-[11px] text-blue-700 dark:text-blue-300 underline"
                    >
                      Question {qI + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* User Answer Input */}
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">
                  Your Answer (Type your response as you would speak it)
                </label>
                <textarea
                  rows={4}
                  value={userAnswer}
                  onChange={e => setUserAnswer(e.target.value)}
                  placeholder="Explain your thought process, architectural choices, or the STAR framework..."
                  className="w-full p-2.5 sm:p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleEvaluateAnswer}
                  disabled={isEvaluatingAnswer || !userAnswer.trim()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs disabled:opacity-50 min-h-[38px]"
                >
                  {isEvaluatingAnswer ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{isEvaluatingAnswer ? 'Evaluating...' : 'Submit Answer for Feedback'}</span>
                </button>
              </div>
            </div>

            {interviewFeedback && (
              <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  Interviewer Critique & Improvement Points
                </span>
                <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-4 rounded-xl break-words">
                  {interviewFeedback}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CAREER ROADMAPS */}
        {activeTab === 'roadmap' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {careerRoadmaps.map((map, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-3 sm:space-y-4 min-w-0"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      {map.level}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-2.5">
                    {map.title}
                  </h3>
                  <div className="space-y-2">
                    {map.milestones.map((ms, mIdx) => (
                      <div key={mIdx} className="flex items-start gap-2 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300">
                        <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {mIdx + 1}
                        </span>
                        <span className="leading-snug">{ms}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onAskChat(map.prompt)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold text-xs transition-colors min-h-[38px]"
                >
                  <span>Explore in Main Chat</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

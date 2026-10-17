import React, { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCw,
  Trophy,
  Clock,
  Send,
  Loader2,
} from 'lucide-react';
import { Language, Quiz, StudyPlan } from '../../types';
import { api } from '../../lib/api';

interface LearnViewProps {
  language: Language;
  onAskChat: (prompt: string) => void;
}

export const LearnView: React.FC<LearnViewProps> = ({ language, onAskChat }) => {
  const [activeTab, setActiveTab] = useState<'explain' | 'quiz' | 'flashcards' | 'planner'>('explain');

  // Topic explainer state
  const [topicInput, setTopicInput] = useState('');
  const [explanationMode, setExplanationMode] = useState<'simple' | 'step_by_step' | 'deep'>('simple');
  const [explanationResult, setExplanationResult] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);

  // Quiz state
  const [quizTopic, setQuizTopic] = useState('Data Structures & Algorithms');
  const [quizDifficulty, setQuizDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});

  // Flashcards state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const flashcards = [
    {
      front: 'What is the primary difference between Stack and Queue data structures?',
      back: 'A Stack follows LIFO (Last In First Out) whereas a Queue follows FIFO (First In First Out). Stack uses push/pop; Queue uses enqueue/dequeue.',
      tag: 'Computer Science',
    },
    {
      front: 'In UPI, why do you NEVER need to enter your UPI PIN to receive money?',
      back: 'UPI PIN is strictly an authorization for debiting (withdrawing) money from your account. Receiving money requires only sharing your UPI ID or QR code.',
      tag: 'Digital Literacy',
    },
    {
      front: 'What is the STAR method in behavioral job interviews?',
      back: 'Situation (context), Task (goal/challenge), Action (deliberate steps taken), and Result (measurable outcome and business impact).',
      tag: 'Career Preparation',
    },
    {
      front: 'What does Big-O notation represent in algorithmic complexity?',
      back: 'Big-O notation describes the upper bound on the growth rate of runtime or memory requirements as input size (n) tends toward infinity.',
      tag: 'Academic Algorithms',
    },
  ];

  // Study Planner state
  const [plannerSubject, setPlannerSubject] = useState('Operating Systems & Networking');
  const [plannerExam, setPlannerExam] = useState('M.Sc. IT Semester Final Exam');
  const [plannerDays, setPlannerDays] = useState(7);
  const [plannerHours, setPlannerHours] = useState(3);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<StudyPlan | null>(null);

  // Handlers
  const handleExplainTopic = async () => {
    if (!topicInput.trim()) return;
    setIsExplaining(true);
    let promptPrefix = 'Explain the following topic simply using everyday examples:';
    if (explanationMode === 'step_by_step') {
      promptPrefix = 'Explain this step-by-step with clear 1-2-3 numbered instructions:';
    } else if (explanationMode === 'deep') {
      promptPrefix = 'Provide a comprehensive academic explanation covering underlying principles, architecture, and common pitfalls for:';
    }

    try {
      const res = await api.sendMessage(`${promptPrefix} "${topicInput}"`, undefined, 'student', language);
      setExplanationResult(res.assistantMessage.content);
    } catch (e: any) {
      setExplanationResult(`Error: ${e.message || 'Could not explain topic.'}`);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!quizTopic.trim()) return;
    setIsGeneratingQuiz(true);
    setSelectedAnswers({});
    setIsQuizSubmitted(false);
    setRevealedHints({});
    try {
      const res = await api.generateQuiz(quizTopic, quizDifficulty, language);
      if (res.quiz && res.quiz.questions.length > 0) {
        setActiveQuiz(res.quiz);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSelectAnswer = (questionIdx: number, optionIdx: number) => {
    if (isQuizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const calculateQuizScore = () => {
    if (!activeQuiz) return { correct: 0, total: 0, percentage: 0 };
    let correct = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        correct++;
      }
    });
    const total = activeQuiz.questions.length;
    return { correct, total, percentage: Math.round((correct / total) * 100) };
  };

  const handleGeneratePlan = async () => {
    if (!plannerSubject.trim()) return;
    setIsGeneratingPlan(true);
    try {
      const res = await api.generateStudyPlan(
        plannerSubject,
        plannerExam,
        plannerDays,
        plannerHours,
        language
      );
      if (res.plan) {
        setGeneratedPlan(res.plan);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-2.5 sm:p-6 md:p-8 min-w-0">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Module Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 shrink-0">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Learn with AI
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Concept explanations, interactive quizzes, flashcards, and study schedules.
            </p>
          </div>

          {/* Sub-tab Switcher - Horizontal Scroll on Mobile */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs overflow-x-auto no-scrollbar shrink-0 max-w-full">
            <button
              onClick={() => setActiveTab('explain')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 text-xs ${
                activeTab === 'explain'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Explain Topic
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 text-xs ${
                activeTab === 'quiz'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Quiz Generator
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 text-xs ${
                activeTab === 'flashcards'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Flashcards
            </button>
            <button
              onClick={() => setActiveTab('planner')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 text-xs ${
                activeTab === 'planner'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Study Planner
            </button>
          </div>
        </div>

        {/* TAB 1: EXPLAIN A TOPIC */}
        {activeTab === 'explain' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 sm:space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 shrink-0" />
                Explain Any Concept
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="E.g., How does blockchain work? or Photosynthesis in simple terms..."
                  value={topicInput}
                  onChange={e => setTopicInput(e.target.value)}
                  className="w-full p-2.5 sm:p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-medium text-slate-500 text-[11px] sm:text-xs">Style:</span>
                    <button
                      onClick={() => setExplanationMode('simple')}
                      className={`px-2 sm:px-2.5 py-1 rounded-md text-[11px] ${
                        explanationMode === 'simple'
                          ? 'bg-purple-100 text-purple-700 font-bold dark:bg-purple-950 dark:text-purple-300'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      🌟 Simple
                    </button>
                    <button
                      onClick={() => setExplanationMode('step_by_step')}
                      className={`px-2 sm:px-2.5 py-1 rounded-md text-[11px] ${
                        explanationMode === 'step_by_step'
                          ? 'bg-purple-100 text-purple-700 font-bold dark:bg-purple-950 dark:text-purple-300'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      🔢 Step-by-Step
                    </button>
                    <button
                      onClick={() => setExplanationMode('deep')}
                      className={`px-2 sm:px-2.5 py-1 rounded-md text-[11px] ${
                        explanationMode === 'deep'
                          ? 'bg-purple-100 text-purple-700 font-bold dark:bg-purple-950 dark:text-purple-300'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      🎓 Academic
                    </button>
                  </div>

                  <button
                    onClick={handleExplainTopic}
                    disabled={isExplaining || !topicInput.trim()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-2xs disabled:opacity-50 min-h-[38px]"
                  >
                    {isExplaining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{isExplaining ? 'Explaining...' : 'Explain Concept'}</span>
                  </button>
                </div>
              </div>
            </div>

            {explanationResult && (
              <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
                    AI Explanation Output
                  </span>
                  <button
                    onClick={() => onAskChat(`Follow-up on: ${topicInput}`)}
                    className="text-[11px] sm:text-xs text-purple-600 font-semibold hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>Ask in Chat</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
                  {explanationResult}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INTERACTIVE QUIZ GENERATOR */}
        {activeTab === 'quiz' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 sm:space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 shrink-0" />
                Generate Practice Quiz
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Topic / Subject</label>
                  <input
                    type="text"
                    value={quizTopic}
                    onChange={e => setQuizTopic(e.target.value)}
                    placeholder="E.g., Operating Systems, Photosynthesis, UPI Security"
                    className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Difficulty</label>
                  <select
                    value={quizDifficulty}
                    onChange={e => setQuizDifficulty(e.target.value as any)}
                    className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="easy">Easy (Fundamentals)</option>
                    <option value="medium">Medium (College Standard)</option>
                    <option value="hard">Hard (Advanced Theory)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleGenerateQuiz}
                  disabled={isGeneratingQuiz || !quizTopic.trim()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-2xs disabled:opacity-50 min-h-[38px]"
                >
                  {isGeneratingQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{isGeneratingQuiz ? 'Creating Quiz...' : 'Generate 4 Questions'}</span>
                </button>
              </div>
            </div>

            {activeQuiz && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1 gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                    Quiz: {activeQuiz.topic}
                  </h3>
                  {isQuizSubmitted && (
                    <div className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs shrink-0">
                      Score: {calculateQuizScore().correct} / {calculateQuizScore().total} ({calculateQuizScore().percentage}%)
                    </div>
                  )}
                </div>

                {activeQuiz.questions.map((q, qIdx) => {
                  const userAnswer = selectedAnswers[qIdx];
                  const isCorrect = userAnswer === q.correctAnswerIndex;
                  const isHintOpen = revealedHints[qIdx];

                  return (
                    <div
                      key={q.id || qIdx}
                      className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5 sm:space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed">
                          {qIdx + 1}. {q.question}
                        </p>
                        {isQuizSubmitted && (
                          <div className="shrink-0 mt-0.5">
                            {isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                            ) : (
                              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Options */}
                      <div className="space-y-1.5 sm:space-y-2">
                        {q.options.map((opt, optIdx) => {
                          let optStyle = 'bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 text-slate-800 dark:text-slate-200';
                          if (userAnswer === optIdx) {
                            optStyle = 'bg-purple-100 dark:bg-purple-950 border-purple-500 text-purple-900 dark:text-purple-200 font-medium';
                          }
                          if (isQuizSubmitted) {
                            if (optIdx === q.correctAnswerIndex) {
                              optStyle = 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
                            } else if (userAnswer === optIdx && !isCorrect) {
                              optStyle = 'bg-rose-100 dark:bg-rose-950/80 border-rose-500 text-rose-900 dark:text-rose-200 line-through';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectAnswer(qIdx, optIdx)}
                              className={`w-full p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 text-left text-xs transition-all flex items-center justify-between gap-2 min-h-[40px] ${optStyle}`}
                            >
                              <span className="leading-snug break-words flex-1">{opt}</span>
                              <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[9px] shrink-0 font-bold">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Hint Button */}
                      {!isQuizSubmitted && q.hint && (
                        <div>
                          <button
                            onClick={() => setRevealedHints(prev => ({ ...prev, [qIdx]: !prev[qIdx] }))}
                            className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1 hover:underline"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            {isHintOpen ? 'Hide Hint' : 'Need a Hint?'}
                          </button>
                          {isHintOpen && (
                            <p className="mt-1 p-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 text-amber-900 dark:text-amber-200 text-xs rounded-lg italic">
                              💡 Hint: {q.hint}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Feedback & Explanation after submit */}
                      {isQuizSubmitted && (
                        <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
                          <p className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                            Explanation:
                          </p>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px] sm:text-xs leading-relaxed">
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Submit Quiz Actions */}
                <div className="flex justify-end gap-3 pt-1">
                  {!isQuizSubmitted ? (
                    <button
                      onClick={() => setIsQuizSubmitted(true)}
                      disabled={Object.keys(selectedAnswers).length === 0}
                      className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs disabled:opacity-50 min-h-[40px]"
                    >
                      Submit Quiz & Check Score
                    </button>
                  ) : (
                    <button
                      onClick={handleGenerateQuiz}
                      className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-2xs min-h-[40px]"
                    >
                      Try Another Quiz
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REVISION FLASHCARDS */}
        {activeTab === 'flashcards' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs text-center space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-500 gap-2">
                <span className="font-semibold uppercase tracking-wider text-purple-600 text-[10px] sm:text-xs">
                  Card {flashcardIndex + 1} of {flashcards.length}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[10px] sm:text-xs truncate">
                  {flashcards[flashcardIndex].tag}
                </span>
              </div>

              {/* Interactive Flippable Card */}
              <div
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className="cursor-pointer min-h-[190px] sm:min-h-[220px] p-5 sm:p-8 rounded-2xl bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-2 border-purple-200 dark:border-purple-800/60 shadow-xs flex flex-col items-center justify-center transition-all hover:scale-[1.01]"
              >
                <span className="text-[10px] uppercase font-bold text-slate-400 mb-2">
                  {isCardFlipped ? 'Answer' : 'Question (Tap to reveal answer)'}
                </span>
                <p className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white leading-relaxed max-w-lg break-words">
                  {isCardFlipped ? flashcards[flashcardIndex].back : flashcards[flashcardIndex].front}
                </p>
                <span className="text-xs text-purple-600 mt-4 font-semibold flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5" />
                  Flip Card
                </span>
              </div>

              {/* Navigation controls */}
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  onClick={() => {
                    setIsCardFlipped(false);
                    setFlashcardIndex(prev => (prev === 0 ? flashcards.length - 1 : prev - 1));
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 min-h-[40px]"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    setIsCardFlipped(false);
                    setFlashcardIndex(prev => (prev === flashcards.length - 1 ? 0 : prev + 1));
                  }}
                  className="flex-1 sm:flex-initial px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-2xs min-h-[40px]"
                >
                  Next Card
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: STUDY PLANNER */}
        {activeTab === 'planner' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 sm:space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 shrink-0" />
                AI Milestone Study Schedule Generator
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Subject / Syllabus</label>
                  <input
                    type="text"
                    value={plannerSubject}
                    onChange={e => setPlannerSubject(e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Target Exam / Goal</label>
                  <input
                    type="text"
                    value={plannerExam}
                    onChange={e => setPlannerExam(e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Available Days</label>
                  <input
                    type="number"
                    min={3}
                    max={30}
                    value={plannerDays}
                    onChange={e => setPlannerDays(Number(e.target.value))}
                    className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Study Hours / Day</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={plannerHours}
                    onChange={e => setPlannerHours(Number(e.target.value))}
                    className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleGeneratePlan}
                  disabled={isGeneratingPlan || !plannerSubject.trim()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-2xs disabled:opacity-50 min-h-[38px]"
                >
                  {isGeneratingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                  <span>{isGeneratingPlan ? 'Generating Schedule...' : 'Generate Plan'}</span>
                </button>
              </div>
            </div>

            {/* Generated Schedule */}
            {generatedPlan && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between px-1 gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                    {generatedPlan.totalDays}-Day Plan: {generatedPlan.subject}
                  </h3>
                  <span className="text-[11px] sm:text-xs text-purple-600 font-semibold shrink-0">
                    Target Date: {generatedPlan.targetDate}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                  {generatedPlan.schedule.map((day, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs shrink-0">
                            {day.dayLabel}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                            {day.focusTopic}
                          </span>
                        </div>
                        <ul className="text-[11px] sm:text-xs text-slate-500 list-disc list-inside space-y-0.5 pl-1">
                          {day.learningActivities.map((act, aIdx) => (
                            <li key={aIdx} className="leading-relaxed">{act}</li>
                          ))}
                        </ul>
                        {day.tips && (
                          <p className="text-[10px] sm:text-[11px] text-amber-700 dark:text-amber-400 italic mt-1">
                            Tip: {day.tips}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
                        <Clock className="w-3.5 h-3.5 text-purple-600" />
                        <span>{day.estimatedHours} hrs</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Smartphone,
  PenTool,
  CheckSquare,
  Search,
  Plus,
  Trash2,
  Check,
  Copy,
  ChevronRight,
  Calendar,
  Loader2,
} from 'lucide-react';
import { Language, TaskItem } from '../../types';
import { api } from '../../lib/api';

interface DailyLifeViewProps {
  language: Language;
  onAskChat: (prompt: string) => void;
}

export const DailyLifeView: React.FC<DailyLifeViewProps> = ({ language, onAskChat }) => {
  const [activeTab, setActiveTab] = useState<'guides' | 'writer' | 'tasks' | 'jargon'>('guides');

  // Writing Assistant state
  const [draftText, setDraftText] = useState('');
  const [writerTone, setWriterTone] = useState<'polite' | 'formal' | 'simple' | 'friendly'>('polite');
  const [writerResult, setWriterResult] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Tasks / Checklist state
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [taskCategory, setTaskCategory] = useState<'daily' | 'study' | 'career'>('daily');
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  // Jargon Glossary state
  const [jargonQuery, setJargonQuery] = useState('');

  const jargonItems = [
    {
      term: 'UPI PIN vs ATM PIN',
      simpleMeaning: 'Your ATM PIN is only for physical ATM machines. Your UPI PIN is used on your phone to send money out. NEVER enter either PIN to receive money.',
      example: 'If a buyer says "Enter PIN to receive payment", it is 100% a scam!',
    },
    {
      term: 'Cloud Storage (Google Drive / iCloud)',
      simpleMeaning: 'An online digital locker where your photos and files are safely kept even if your phone gets lost or broken.',
      example: 'When Google Photos syncs, your pictures are saved in the cloud.',
    },
    {
      term: 'Two-Factor Authentication (2FA)',
      simpleMeaning: 'A double lock for your accounts. Besides your password, you get an OTP or prompt on your phone so hackers cannot break in.',
      example: 'WhatsApp 6-digit PIN or Google 2-Step verification.',
    },
    {
      term: 'Cache Memory',
      simpleMeaning: 'Temporary storage files your phone saves so apps load faster next time. Clearing cache does not delete your photos or messages.',
      example: 'If WhatsApp feels sluggish, clearing cache frees up memory safely.',
    },
    {
      term: 'Phishing',
      simpleMeaning: 'Fake text messages, emails, or calls pretending to be your bank or electricity department asking you to click an urgent link.',
      example: 'A message saying "Your electricity will be cut tonight at 9:30 PM, click here to pay". Never click it!',
    },
  ];

  const smartphoneGuides = [
    {
      title: 'How to Safely Use UPI & Avoid Payment Scams',
      category: 'Finance Safety',
      steps: [
        'Open PhonePe, Google Pay, or Paytm.',
        'To send money: Scan QR code or enter mobile number.',
        'Check the recipient name appearing on screen before entering your PIN.',
        'Golden Rule: You NEVER enter UPI PIN to receive money.',
        'If suspicious, immediately call cyber helpline 1930.',
      ],
      prompt: 'Give me a detailed safety checklist for using Google Pay and PhonePe.',
    },
    {
      title: 'How to Enlarge Text Size on Your Phone (For Seniors)',
      category: 'Accessibility',
      steps: [
        'Open your phone Settings app.',
        'Tap on "Display" or "Accessibility".',
        'Find "Font size and display size".',
        'Drag the slider to Large or Largest.',
        'Your WhatsApp and text messages will now be much easier to read!',
      ],
      prompt: 'How to make my phone screen and font size larger for older eyes?',
    },
    {
      title: 'How to Back Up Photos So They Are Never Lost',
      category: 'Photo Storage',
      steps: [
        'Open the Google Photos app on your Android or iPhone.',
        'Tap your profile picture icon in the top right corner.',
        'Tap "Photos settings" > "Backup".',
        'Turn on the "Backup" switch.',
        'Photos will automatically backup whenever connected to Wi-Fi.',
      ],
      prompt: 'How to backup all my phone photos to Google Drive automatically?',
    },
    {
      title: 'How to Make Free Video Calls on WhatsApp',
      category: 'Communication',
      steps: [
        'Open WhatsApp and tap the contact you want to see.',
        'In the top right corner, tap the Video Camera icon.',
        'Wait for the person to answer.',
        'Tap the red handset icon at the bottom to end the call.',
      ],
      prompt: 'Step-by-step instructions on making video calls to family members.',
    },
  ];

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const res = await api.getTasks();
      if (res.tasks) {
        setTasks(res.tasks);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const res = await api.createTask({
        title: newTaskTitle.trim(),
        dueDate: newTaskDue || undefined,
        category: taskCategory,
      });
      if (res.task) {
        setTasks(prev => [res.task, ...prev]);
        setNewTaskTitle('');
        setNewTaskDue('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
      const res = await api.toggleTask(id);
      if (res.task) {
        setTasks(prev => prev.map(t => (t.id === id ? res.task : t)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await api.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleRewrite = async () => {
    if (!draftText.trim()) return;
    setIsRewriting(true);
    try {
      const res = await api.rewriteText(draftText, writerTone, language);
      setWriterResult(res.result);
    } catch (e: any) {
      setWriterResult(`Error: ${e.message || 'Could not rewrite text.'}`);
    } finally {
      setIsRewriting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredJargon = jargonItems.filter(
    j =>
      j.term.toLowerCase().includes(jargonQuery.toLowerCase()) ||
      j.simpleMeaning.toLowerCase().includes(jargonQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-2.5 sm:p-6 md:p-8 min-w-0">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Module Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Daily Life Assistant
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Smartphone guides, message drafting, checklists, and jargon simplifier.
            </p>
          </div>

          {/* Sub-tab Switcher - Horizontal Scroll on Mobile */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs overflow-x-auto no-scrollbar shrink-0 max-w-full">
            <button
              onClick={() => setActiveTab('guides')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 text-xs ${
                activeTab === 'guides' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Phone Guides
            </button>
            <button
              onClick={() => setActiveTab('writer')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 text-xs ${
                activeTab === 'writer' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Message Writer
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 text-xs ${
                activeTab === 'tasks' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Checklist & Tasks
            </button>
            <button
              onClick={() => setActiveTab('jargon')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 text-xs ${
                activeTab === 'jargon' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Jargon Glossary
            </button>
          </div>
        </div>

        {/* TAB 1: SMARTPHONE GUIDES */}
        {activeTab === 'guides' && (
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {smartphoneGuides.map((guide, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 flex flex-col justify-between min-w-0"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        {guide.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-2.5 leading-snug">
                      {guide.title}
                    </h3>
                    <ol className="space-y-1.5 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 list-decimal list-inside">
                      {guide.steps.map((st, sIdx) => (
                        <li key={sIdx} className="leading-relaxed">
                          {st}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <button
                    onClick={() => onAskChat(guide.prompt)}
                    className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold text-xs transition-colors min-h-[38px]"
                  >
                    <span>Ask LifeMate in Main Chat</span>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: WRITING & EMAIL ASSISTANT */}
        {activeTab === 'writer' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 sm:space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PenTool className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
                Message & Email Polishing Assistant
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Write a rough thought, message, or email. LifeMate AI will polish the grammar, tone, and clarity.
              </p>

              <textarea
                rows={3}
                value={draftText}
                onChange={e => setDraftText(e.target.value)}
                placeholder="Write your rough draft here. E.g., 'tell bank manager to issue new passbook'..."
                className="w-full p-2.5 sm:p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="font-medium text-slate-500 text-[11px] sm:text-xs">Tone:</span>
                  {(['polite', 'formal', 'simple', 'friendly'] as const).map(tone => (
                    <button
                      key={tone}
                      onClick={() => setWriterTone(tone)}
                      className={`px-2.5 py-1 rounded-lg capitalize font-medium text-xs ${
                        writerTone === tone
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleRewrite}
                  disabled={isRewriting || !draftText.trim()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs disabled:opacity-50 min-h-[38px]"
                >
                  {isRewriting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{isRewriting ? 'Refining...' : 'Polish Message'}</span>
                </button>
              </div>
            </div>

            {writerResult && (
              <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                    Polished Draft
                  </span>
                  <button
                    onClick={() => copyToClipboard(writerResult)}
                    className="flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:underline shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-4 rounded-xl break-words">
                  {writerResult}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CHECKLIST & TASKS */}
        {activeTab === 'tasks' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 sm:space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
                Everyday Task Planner & Checklist
              </h2>

              <form onSubmit={handleAddTask} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    placeholder="Task name (e.g. Pay electricity bill, Renew bus pass)..."
                    className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white min-h-[40px]"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    value={newTaskDue}
                    onChange={e => setNewTaskDue(e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white min-h-[40px]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs disabled:opacity-50 min-h-[40px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </button>
              </form>
            </div>

            {/* Tasks List */}
            <div className="space-y-2">
              {tasks.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400 italic">
                  No tasks in your checklist. Add one above!
                </p>
              ) : (
                tasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-3 sm:p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2.5 transition-colors ${
                      task.completed ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                          task.completed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                        }`}
                        aria-label="Toggle task completion"
                      >
                        {task.completed && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <div className="min-w-0">
                        <span
                          className={`text-xs sm:text-sm text-slate-900 dark:text-slate-100 block truncate ${
                            task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'font-medium'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.dueDate && (
                          <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                            <Calendar className="w-3 h-3 shrink-0" /> Due: {task.dueDate}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                      aria-label="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: JARGON GLOSSARY */}
        {activeTab === 'jargon' && (
          <div className="space-y-3 sm:space-y-4">
            <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
              <input
                type="text"
                placeholder="Search technical terms (e.g. UPI, Cloud, Cache, 2FA)..."
                value={jargonQuery}
                onChange={e => setJargonQuery(e.target.value)}
                className="w-full bg-transparent border-none text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden min-w-0"
              />
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
              {filteredJargon.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5 min-w-0"
                >
                  <h3 className="font-bold text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">
                    {item.term}
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed break-words">
                    {item.simpleMeaning}
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 italic break-words">
                    Example: {item.example}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

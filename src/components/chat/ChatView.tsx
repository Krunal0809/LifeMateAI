import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Mic,
  MicOff,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Database,
  Ticket,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Smartphone,
  Briefcase,
  GraduationCap,
} from 'lucide-react';
import {
  Message,
  Conversation,
  Language,
  AssistantMode,
  UserPreferences,
} from '../../types';
import { translations } from '../../locales';
import { speech } from '../../lib/speech';

interface ChatViewProps {
  conversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onStopGeneration: () => void;
  onFeedback: (messageId: string, rating: 'up' | 'down') => void;
  onEscalateToTicket: (contextMessage: string) => void;
  language: Language;
  assistantMode: AssistantMode;
  preferences: UserPreferences;
  onQuickPrompt: (promptText: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversation,
  messages,
  isLoading,
  onSendMessage,
  onStopGeneration,
  onFeedback,
  onEscalateToTicket,
  language,
  assistantMode,
  preferences,
  onQuickPrompt,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceInterim, setVoiceInterim] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const t = translations[language] || translations.en;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, voiceInterim]);

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
    setVoiceInterim('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (messageId: string, text: string) => {
    if (speakingMessageId === messageId) {
      speech.stopSpeaking();
      setSpeakingMessageId(null);
    } else {
      speech.speak(
        text,
        language,
        preferences.speechRate || 1.0,
        () => setSpeakingMessageId(messageId),
        () => setSpeakingMessageId(null)
      );
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      speech.stopListening();
      setIsRecording(false);
      setVoiceInterim('');
    } else {
      setVoiceError(null);
      setIsRecording(true);
      speech.startListening({
        language,
        onInterim: interim => setVoiceInterim(interim),
        onFinal: finalText => {
          setInputText(prev => (prev ? `${prev} ${finalText}` : finalText));
          setVoiceInterim('');
        },
        onError: err => {
          setVoiceError(err);
          setIsRecording(false);
          setVoiceInterim('');
        },
        onEnd: () => {
          setIsRecording(false);
        },
      });
    }
  };

  const toggleSourceExpand = (msgId: string) => {
    setExpandedSources(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const starterCards = [
    {
      title: t.starterLearnTitle,
      desc: t.starterLearnDesc,
      icon: BookOpen,
      prompt: language === 'gu'
        ? 'ક્વોન્ટમ કમ્પ્યુટિંગ સરળ ભાષામાં સમજાવો.'
        : language === 'hi'
        ? 'क्वांटम कंप्यूटिंग को सरल शब्दों में समझाइए।'
        : 'Explain Quantum Computing with simple everyday analogies.',
    },
    {
      title: t.starterDailyTitle,
      desc: t.starterDailyDesc,
      icon: Smartphone,
      prompt: language === 'gu'
        ? 'મોબાઈલમાં સુરક્ષિત રીતે યુપીઆઈ (UPI) પેમેન્ટ કેવી રીતે વાપરવું?'
        : language === 'hi'
        ? 'मोबाइल पर सुरक्षित रूप से यूपीआई (UPI) पेमेंट कैसे करें?'
        : 'How to safely set up and use UPI payments on mobile without getting scammed?',
    },
    {
      title: t.starterExamTitle,
      desc: t.starterExamDesc,
      icon: GraduationCap,
      prompt: language === 'gu'
        ? 'કમ્પ્યુટર સાયન્સ એલગોરિધમ્સની પરીક્ષા માટે 7 દિવસની અભ્યાસ યોજના બનાવો.'
        : language === 'hi'
        ? 'कंप्यूटर साइंस परीक्षा के लिए 7 दिन की स्टडी प्लान और क्विज बनाएं।'
        : 'Create a 7-day milestone study plan for Computer Science Algorithms.',
    },
    {
      title: t.starterInterviewTitle,
      desc: t.starterInterviewDesc,
      icon: Briefcase,
      prompt: language === 'gu'
        ? 'સોફ્ટવેર ડેવલપર ઇન્ટરવ્યુ માટે મોક સવાલ-જવાબ પૂછો.'
        : language === 'hi'
        ? 'सॉफ्टवेयर डेवलपर इंटरव्यू के लिए मॉक प्रश्न पूछें।'
        : 'Conduct a mock technical interview for a Software Engineer role.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden relative w-full min-w-0">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-2.5 sm:p-5 md:p-6 space-y-4 sm:space-y-6 min-h-0">
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div className="max-w-3xl mx-auto py-4 sm:py-10 space-y-5 sm:space-y-7 px-1">
            <div className="text-center space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] sm:text-xs font-semibold max-w-full truncate">
                <Sparkles className="w-3 h-3 shrink-0" />
                <span className="truncate">Multi-Agent AI • Multilingual • Grounded RAG</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t.welcomeTitle}
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
                {t.welcomeSubtitle}
              </p>
            </div>

            {/* Quick Starter Suggestions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 pt-1">
              {starterCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <button
                    key={i}
                    onClick={() => onQuickPrompt(card.prompt)}
                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-2xs hover:shadow-sm transition-all text-left group flex items-start gap-2.5 sm:gap-3.5 min-w-0"
                  >
                    <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {card.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Active Messages Thread */
          <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 px-0.5">
            {messages.map(msg => {
              const isUser = msg.role === 'user';
              const isSpeaking = speakingMessageId === msg.id;
              const hasSources = msg.sources && msg.sources.length > 0;
              const isSourcesOpen = Boolean(expandedSources[msg.id]);

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
                >
                  {/* Sender & Agent Badge Header */}
                  {!isUser && msg.trace && (
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] sm:text-[11px] text-slate-500 max-w-full flex-wrap">
                      <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 sm:px-2 py-0.5 rounded-md truncate">
                        <Sparkles className="w-3 h-3 shrink-0" />
                        <span className="truncate">{msg.trace.agentName}</span>
                      </span>
                      {msg.detectedLanguage && (
                        <span className="uppercase text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {msg.detectedLanguage}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`relative max-w-[94%] sm:max-w-[85%] rounded-2xl px-3.5 sm:px-5 py-2.5 sm:py-3.5 shadow-2xs text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-bl-xs'
                    }`}
                  >
                    {msg.content}

                    {/* Grounded RAG Sources Drawer for Assistant */}
                    {!isUser && hasSources && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 max-w-full overflow-hidden">
                        <button
                          onClick={() => toggleSourceExpand(msg.id)}
                          className="flex items-center justify-between w-full text-[11px] sm:text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <Database className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{t.sourcesUsed} ({msg.sources!.length})</span>
                          </span>
                          {isSourcesOpen ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
                        </button>

                        {isSourcesOpen && (
                          <div className="mt-2 space-y-2">
                            {msg.sources!.map((src, idx) => (
                              <div
                                key={idx}
                                className="p-2 sm:p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 text-[11px] sm:text-xs border border-slate-200 dark:border-slate-700/50"
                              >
                                <div className="flex items-center justify-between font-medium text-slate-900 dark:text-slate-200 mb-1 gap-1">
                                  <span className="truncate">{src.documentTitle}</span>
                                  <span className="text-[9px] sm:text-[10px] text-emerald-600 font-bold shrink-0">
                                    {Math.round(src.similarityScore * 100)}%
                                  </span>
                                </div>
                                <p className="text-[10px] sm:text-[11px] text-slate-500 italic line-clamp-3">
                                  "{src.snippet}"
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar for Assistant Message */}
                  {!isUser && (
                    <div className="flex items-center gap-1 mt-1 px-1 text-slate-400 text-xs flex-wrap max-w-full">
                      {/* Copy */}
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title={copiedId === msg.id ? t.copied : t.copy}
                        aria-label="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Text-to-Speech Speak/Stop */}
                      <button
                        onClick={() => handleSpeak(msg.id, msg.content)}
                        className={`p-1 rounded transition-colors ${
                          isSpeaking
                            ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950'
                            : 'hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                        title={isSpeaking ? t.stopSpeech : t.readAloud}
                        aria-label={isSpeaking ? t.stopSpeech : t.readAloud}
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>

                      {/* Feedback Thumbs */}
                      <button
                        onClick={() => onFeedback(msg.id, 'up')}
                        className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${
                          msg.feedback === 'up' ? 'text-emerald-600 font-bold' : ''
                        }`}
                        title={t.helpful}
                        aria-label="Helpful"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onFeedback(msg.id, 'down')}
                        className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${
                          msg.feedback === 'down' ? 'text-rose-600 font-bold' : ''
                        }`}
                        title={t.notHelpful}
                        aria-label="Not helpful"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Escalate to Human Support Ticket */}
                      <button
                        onClick={() => onEscalateToTicket(msg.content)}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors shrink-0"
                        title={t.requestHumanHelp}
                      >
                        <Ticket className="w-3 h-3 shrink-0" />
                        <span className="truncate">{t.requestHumanHelp}</span>
                      </button>
                    </div>
                  )}

                  {/* Suggested Follow-Ups (chips) */}
                  {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-full">
                      {msg.suggestedFollowUps.map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => onQuickPrompt(prompt)}
                          className="text-[10px] sm:text-xs px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors font-medium flex items-center gap-1 shadow-2xs max-w-full"
                        >
                          <span className="truncate">{prompt}</span>
                          <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-white dark:bg-slate-900 rounded-2xl max-w-[200px] border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-[11px] sm:text-xs text-slate-500 font-medium">LifeMate AI thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Voice Recognition Live Banner */}
      {isRecording && (
        <div className="mx-2 sm:mx-4 mb-2 p-2.5 sm:p-3 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-center justify-between text-xs gap-2 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold text-indigo-900 dark:text-indigo-200 text-xs truncate">
                {t.voiceListening}
              </p>
              {voiceInterim && (
                <p className="text-slate-600 dark:text-slate-300 italic text-[11px] truncate">
                  "{voiceInterim}"
                </p>
              )}
            </div>
          </div>
          <button
            onClick={toggleRecording}
            className="px-2.5 py-1 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 text-xs shrink-0"
          >
            {t.voiceStop}
          </button>
        </div>
      )}

      {/* Voice Error Notice */}
      {voiceError && (
        <div className="mx-2 sm:mx-4 mb-2 p-2 sm:p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center justify-between text-xs text-rose-700 dark:text-rose-300 gap-2 shrink-0">
          <span className="flex items-center gap-1.5 truncate">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">{voiceError}</span>
          </span>
          <button onClick={() => setVoiceError(null)} className="text-rose-500 font-bold ml-1 shrink-0">
            Dismiss
          </button>
        </div>
      )}

      {/* Composer Container */}
      <div className="p-2 sm:p-3 md:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <div className="max-w-3xl mx-auto space-y-1.5">
          <div className="relative flex items-end gap-1.5 sm:gap-2 bg-slate-100 dark:bg-slate-800/90 rounded-2xl p-1.5 sm:p-2 border border-slate-200 dark:border-slate-700/60 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
            {/* Microphone Button */}
            <button
              onClick={toggleRecording}
              className={`p-2 sm:p-2.5 rounded-xl transition-all shrink-0 min-w-[38px] min-h-[38px] flex items-center justify-center ${
                isRecording
                  ? 'bg-red-600 text-white voice-recording-wave'
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700'
              }`}
              title={isRecording ? t.voiceStop : t.voiceStart}
              aria-label={isRecording ? t.voiceStop : t.voiceStart}
            >
              {isRecording ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* Textarea Input */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={e => {
                setInputText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder={t.inputPlaceholder}
              className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden text-xs sm:text-sm resize-none py-1.5 max-h-36 min-w-0"
            />

            {/* Stop or Send Button */}
            {isLoading ? (
              <button
                onClick={onStopGeneration}
                className="p-2 sm:p-2.5 rounded-xl bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-red-500 hover:text-white transition-colors shrink-0 min-w-[38px] min-h-[38px] flex items-center justify-center"
                title={t.stop}
                aria-label={t.stop}
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className={`p-2 sm:p-2.5 rounded-xl transition-all shrink-0 min-w-[38px] min-h-[38px] flex items-center justify-center ${
                  inputText.trim()
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'
                    : 'text-slate-400 cursor-not-allowed'
                }`}
                title={t.send}
                aria-label={t.send}
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Privacy & Honesty Disclaimer */}
          <p className="text-[10px] text-center text-slate-400 line-clamp-1 px-1">
            {t.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};

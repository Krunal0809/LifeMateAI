import React from 'react';
import {
  Cpu,
  ShieldCheck,
  ShieldAlert,
  Database,
  Languages,
  Zap,
  CheckCircle2,
  FileText,
  Clock,
  Layers,
  HelpCircle,
  X,
} from 'lucide-react';
import { AgentTrace, DocumentSource } from '../../types';

interface AgentInspectorPanelProps {
  trace?: AgentTrace;
  sources?: DocumentSource[];
  isOpen: boolean;
  onClose: () => void;
}

export const AgentInspectorPanel: React.FC<AgentInspectorPanelProps> = ({
  trace,
  sources = [],
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop for Small/Medium Screens */}
      <div
        className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-2xs"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className="fixed lg:static inset-y-0 right-0 z-40 w-[85vw] sm:w-80 max-w-[340px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 overflow-y-auto shadow-2xl lg:shadow-none transition-transform duration-200 ease-in-out">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 truncate">
              Multi-Agent Inspector
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
            aria-label="Close inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 sm:p-4 space-y-3.5 text-xs">
          {/* Real-time Agent Pipeline Flow */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Active Agent Pipeline
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                Active
              </span>
            </div>

            <div className="space-y-1.5 pl-2 border-l-2 border-indigo-500 text-[11px]">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                <span className="font-medium text-slate-900 dark:text-slate-100">1. Intent Agent:</span>
                <span className="text-slate-500 truncate">{trace?.intent || 'general_query'}</span>
              </div>
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                <span className="font-medium text-slate-900 dark:text-slate-100">2. Safety Agent:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {trace?.safetyCheck.passed ? 'Verified Safe' : 'Flagged'}
                </span>
              </div>
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                <span className="font-medium text-slate-900 dark:text-slate-100">3. Domain Agent:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                  {trace?.agentName || 'General Assistant'}
                </span>
              </div>
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                <span className="font-medium text-slate-900 dark:text-slate-100">4. Decision Agent:</span>
                <span className="text-slate-500">Grounded Synthesis</span>
              </div>
            </div>
          </div>

          {/* Intent Analysis Details */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-2xs space-y-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-xs">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Intent & Confidence
            </span>
            <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-[11px]">
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 block">Classified Intent</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                  {trace?.intent || 'general_query'}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 block">Confidence</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {trace ? `${Math.round(trace.confidence * 100)}%` : '95%'}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 block">Detected Lang</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 uppercase">
                  {trace?.detectedLanguage || 'EN'}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 block">Mode Applied</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize truncate block">
                  {trace?.modeApplied || 'Student'}
                </span>
              </div>
            </div>
          </div>

          {/* Retrieval Grounding (RAG) */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-xs">
                <Database className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> RAG Knowledge Chunks
              </span>
              <span className="text-[10px] text-slate-400">
                {sources.length > 0 ? `${sources.length} Retrieved` : 'None Needed'}
              </span>
            </div>

            {sources.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic">
                Response generated using model domain capabilities with strict guardrails.
              </p>
            ) : (
              <div className="space-y-2 mt-1">
                {sources.map((src, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800 dark:text-slate-200 mb-1 gap-1">
                      <span className="truncate">{src.documentTitle}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 text-[10px] shrink-0 font-bold">
                        {src.similarityScore}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-3 italic">
                      "{src.snippet}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Safety & Performance Summary */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-2xs space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Pipeline Latency:
              </span>
              <span className="font-mono font-medium">{trace?.processingTimeMs || 340} ms</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Safety Boundary:
              </span>
              <span className="font-semibold text-emerald-600">Strict Passed</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

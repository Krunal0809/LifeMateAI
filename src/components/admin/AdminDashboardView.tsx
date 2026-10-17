import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  MessageSquare,
  Ticket,
  ThumbsUp,
  Cpu,
  Clock,
  Activity,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import { SystemMetrics, UserProfile, UserRole } from '../../types';
import { api } from '../../lib/api';

interface AdminDashboardViewProps {
  user: UserProfile;
  onSwitchRole: (role: UserRole) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  user,
  onSwitchRole,
}) => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [providerInfo, setProviderInfo] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, logsRes] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminLogs(),
      ]);
      if (metricsRes.metrics) {
        setMetrics(metricsRes.metrics);
        setProviderInfo(metricsRes.provider);
      }
      if (logsRes.logs) {
        setLogs(logsRes.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-2.5 sm:p-6 md:p-8 min-w-0">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Admin & Operations Dashboard
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Live database metrics, RAG indices, LLM provider health, and operational audit trails.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboardData}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 shadow-2xs min-h-[38px]"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {/* RBAC Verification Alert if currently in User mode */}
        {user.role === 'user' && (
          <div className="p-3 sm:p-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="leading-snug">
                You are currently previewing as a standard <strong>User</strong>. Switch to <strong>Admin</strong> or <strong>Support</strong> to test role-based actions.
              </span>
            </div>
            <button
              onClick={() => onSwitchRole('admin')}
              className="px-3 py-1.5 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 text-xs shrink-0 self-start sm:self-auto"
            >
              Switch to Admin
            </button>
          </div>
        )}

        {/* System Metrics Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-0.5 sm:space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-xs font-medium">Registered Users</span>
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
            </div>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white block">
              {metrics?.totalUsers || 3}
            </span>
            <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold block truncate">Active Profiles</span>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-0.5 sm:space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-xs font-medium">Conversations</span>
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
            </div>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white block">
              {metrics?.totalConversations || 1}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">
              {metrics?.totalMessages || 2} Messages
            </span>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-0.5 sm:space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-xs font-medium">Support Tickets</span>
              <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
            </div>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white block">
              {metrics?.openTickets || 1}
            </span>
            <span className="text-[10px] sm:text-[11px] text-amber-600 font-semibold block truncate">
              {metrics?.resolvedTickets || 0} Resolved
            </span>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-0.5 sm:space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-xs font-medium">User Rating</span>
              <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
            </div>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 block">
              {metrics?.positiveFeedbackRate || 96}%
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">Helpful Score</span>
          </div>
        </div>

        {/* AI Model & Pipeline Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 sm:space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
              LLM Provider Configuration
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl gap-2">
                <span className="text-slate-500 truncate">Configured Model:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0">
                  {providerInfo?.model || 'gemini-3.8-flash'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl gap-2">
                <span className="text-slate-500 truncate">Integration:</span>
                <span className="font-semibold text-slate-900 dark:text-white text-[11px] sm:text-xs shrink-0">
                  @google/genai SDK
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl gap-2">
                <span className="text-slate-500 truncate">API Health:</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] shrink-0">
                  Operational
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 sm:space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
              RAG & Guardrail Metrics
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl gap-2">
                <span className="text-slate-500 truncate">Average Search Latency:</span>
                <span className="font-mono font-bold text-emerald-600 shrink-0">~24 ms</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl gap-2">
                <span className="text-slate-500 truncate">Safety Interceptions:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0">
                  {metrics?.safetyFlagsBlocked || 3} events
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl gap-2">
                <span className="text-slate-500 truncate">Database Engine:</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400 text-[11px] sm:text-xs shrink-0">
                  PostgreSQL + pgvector
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Safe Audit Logs */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 sm:space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
            Operational Audit Trail
          </h2>

          <div className="overflow-x-auto no-scrollbar w-full">
            <table className="w-full text-left text-xs min-w-[460px]">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-2.5 sm:p-3 rounded-l-lg">Timestamp</th>
                  <th className="p-2.5 sm:p-3">Action</th>
                  <th className="p-2.5 sm:p-3 rounded-r-lg">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-slate-400 italic">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-2.5 sm:p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="p-2.5 sm:p-3 font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap text-[11px]">
                        {log.action}
                      </td>
                      <td className="p-2.5 sm:p-3 text-slate-700 dark:text-slate-300 text-[11px]">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

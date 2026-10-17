import React, { useState } from 'react';
import {
  Sliders,
  Globe,
  Eye,
  Volume2,
  Trash2,
  Download,
  Check,
  Shield,
} from 'lucide-react';
import { UserProfile, UserPreferences, Language, AssistantMode } from '../../types';
import { translations } from '../../locales';
import { api } from '../../lib/api';

interface SettingsViewProps {
  user: UserProfile;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onClearHistory: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdatePreferences,
  onClearHistory,
}) => {
  const [prefs, setPrefs] = useState<UserPreferences>(user.preferences);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const t = translations[prefs.preferredLanguage] || translations.en;

  const handleSave = async (updated: Partial<UserPreferences>) => {
    const newPrefs = { ...prefs, ...updated };
    setPrefs(newPrefs);
    onUpdatePreferences(newPrefs);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportData = async () => {
    const res = await api.getConversations();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.conversations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `lifemate_conversations_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-2.5 sm:p-6 md:p-8 min-w-0">
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Sliders className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {t.navSettings}
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                Manage language, modes, font scaling, and voice.
              </p>
            </div>
          </div>

          {savedSuccess && (
            <span className="flex items-center gap-1 text-[11px] sm:text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full shrink-0">
              <Check className="w-3.5 h-3.5" /> Saved!
            </span>
          )}
        </div>

        {/* 1. General Preferences */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 sm:space-y-4">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
            Language & Assistant Persona
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Preferred Language
              </label>
              <select
                value={prefs.preferredLanguage}
                onChange={e => handleSave({ preferredLanguage: e.target.value as Language })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-xs sm:text-sm"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Default Assistant Mode
              </label>
              <select
                value={prefs.assistantMode}
                onChange={e => handleSave({ assistantMode: e.target.value as AssistantMode })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-xs sm:text-sm"
              >
                <option value="simple">🌟 Simple Mode (Clear & brief)</option>
                <option value="student">🎓 Student Mode (Academic & quizzes)</option>
                <option value="professional">💼 Professional Mode (Productivity & career)</option>
                <option value="senior">👓 Senior-Friendly Mode (Patient & large text)</option>
                <option value="custom">⚙️ Custom Mode</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Accessibility & Senior Friendly Settings */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 sm:space-y-4">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-600 shrink-0" />
            Accessibility & Visual Comfort
          </h2>

          <div className="space-y-3 sm:space-y-4 text-xs">
            {/* Font Size Scaling */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Text Font Scaling
                </span>
                <span className="text-slate-500 text-[10px] sm:text-[11px]">
                  Adjust typography size across all screens.
                </span>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
                {(['normal', 'large', 'extra-large'] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => handleSave({ fontSize: size })}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg capitalize font-medium text-[11px] sm:text-xs ${
                      prefs.fontSize === size
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {size.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  High Contrast Theme
                </span>
                <span className="text-slate-500 text-[10px] sm:text-[11px]">
                  Enhances borders for low-vision readability.
                </span>
              </div>
              <button
                onClick={() => handleSave({ highContrast: !prefs.highContrast })}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                  prefs.highContrast ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                aria-label="Toggle high contrast"
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    prefs.highContrast ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Reduced Motion
                </span>
                <span className="text-slate-500 text-[10px] sm:text-[11px]">
                  Disables pulse effects and sliding animations.
                </span>
              </div>
              <button
                onClick={() => handleSave({ reducedMotion: !prefs.reducedMotion })}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                  prefs.reducedMotion ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                aria-label="Toggle reduced motion"
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    prefs.reducedMotion ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Voice & Speech Synthesis */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 sm:space-y-4">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-600 shrink-0" />
            Voice & Speech Settings
          </h2>

          <div className="space-y-3 sm:space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Read Responses Aloud
                </span>
                <span className="text-slate-500 text-[10px] sm:text-[11px]">
                  Automatically speak new answers.
                </span>
              </div>
              <button
                onClick={() => handleSave({ voiceAutoRead: !prefs.voiceAutoRead })}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                  prefs.voiceAutoRead ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                aria-label="Toggle auto voice playback"
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    prefs.voiceAutoRead ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Speech Speed Rate ({prefs.speechRate || 1.0}x)
                </span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.4"
                step="0.1"
                value={prefs.speechRate || 1.0}
                onChange={e => handleSave({ speechRate: parseFloat(e.target.value) })}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* 4. Privacy & Data Controls */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 sm:space-y-4">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
            Privacy & Data Controls
          </h2>

          <div className="space-y-2.5 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs block">
                  Export Conversation History
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-500">
                  Download chat transcripts in JSON format.
                </span>
              </div>
              <button
                onClick={handleExportData}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shrink-0 min-h-[36px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60">
              <div>
                <span className="font-semibold text-rose-800 dark:text-rose-200 text-xs block">
                  Clear All Chat Conversations
                </span>
                <span className="text-[10px] sm:text-[11px] text-rose-600/80 dark:text-rose-400">
                  Permanently delete your conversation history.
                </span>
              </div>
              <button
                onClick={onClearHistory}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shrink-0 min-h-[36px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

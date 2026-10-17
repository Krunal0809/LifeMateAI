import React from 'react';
import {
  Menu,
  Globe,
  Eye,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
} from 'lucide-react';
import { Language, AssistantMode, UserPreferences } from '../../types';
import { translations } from '../../locales';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  assistantMode: AssistantMode;
  onModeChange: (mode: AssistantMode) => void;
  preferences: UserPreferences;
  onToggleHighContrast: () => void;
  onToggleSeniorMode: () => void;
  isRightPanelOpen: boolean;
  onToggleRightPanel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  language,
  onLanguageChange,
  assistantMode,
  onModeChange,
  preferences,
  onToggleHighContrast,
  onToggleSeniorMode,
  isRightPanelOpen,
  onToggleRightPanel,
}) => {
  const t = translations[language] || translations.en;

  return (
    <header className="h-14 sm:h-16 px-2 sm:px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 z-30 gap-1.5 sm:gap-3 w-full max-w-full overflow-hidden">
      {/* Left: Mobile Menu & Current Context */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Current Active Mode Selector */}
        <div className="flex items-center min-w-0">
          <label htmlFor="mode-select" className="sr-only">
            {t.mode}
          </label>
          <select
            id="mode-select"
            value={assistantMode}
            onChange={e => onModeChange(e.target.value as AssistantMode)}
            className="text-[11px] sm:text-xs font-semibold py-1 sm:py-1.5 px-1.5 sm:px-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer max-w-[125px] sm:max-w-none truncate"
          >
            <option value="simple">🌟 Simple</option>
            <option value="student">🎓 Student</option>
            <option value="professional">💼 Pro</option>
            <option value="senior">👓 Senior</option>
            <option value="custom">⚙️ Custom</option>
          </select>
        </div>
      </div>

      {/* Right: Language, Accessibility Toggles, Inspector */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Multilingual Selector */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 sm:p-1 shrink-0">
          <Globe className="w-3.5 h-3.5 text-slate-500 ml-1 shrink-0 hidden xs:inline" />
          <label htmlFor="language-select" className="sr-only">
            {t.selectLanguage}
          </label>
          <select
            id="language-select"
            value={language}
            onChange={e => onLanguageChange(e.target.value as Language)}
            className="text-[11px] sm:text-xs font-semibold bg-transparent text-slate-700 dark:text-slate-200 border-none focus:outline-hidden cursor-pointer px-1 py-0.5"
          >
            <option value="en">EN</option>
            <option value="hi">हिन्दी</option>
            <option value="gu">ગુજરાતી</option>
          </select>
        </div>

        {/* Senior-Friendly Quick Toggle */}
        <button
          onClick={onToggleSeniorMode}
          title={assistantMode === 'senior' ? 'Normal text size' : 'Senior larger text mode'}
          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1 ${
            assistantMode === 'senior'
              ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          aria-label="Toggle senior mode text size"
        >
          <span className="text-sm">👓</span>
          <span className="hidden md:inline">{t.modeSenior}</span>
        </button>

        {/* High Contrast Toggle */}
        <button
          onClick={onToggleHighContrast}
          title="Toggle High Contrast"
          className={`p-1.5 rounded-lg text-xs transition-colors shrink-0 ${
            preferences.highContrast
              ? 'bg-black text-yellow-300 ring-2 ring-yellow-400'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          aria-label="Toggle high contrast"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Toggle Right Inspector Panel */}
        <button
          onClick={onToggleRightPanel}
          title={isRightPanelOpen ? 'Hide Agent Inspector' : 'Show Multi-Agent Inspector'}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-hidden shrink-0"
          aria-label="Toggle agent inspector panel"
        >
          {isRightPanelOpen ? (
            <PanelRightClose className="w-4 h-4 text-indigo-600" />
          ) : (
            <PanelRightOpen className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
};

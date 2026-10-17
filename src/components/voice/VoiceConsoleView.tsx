import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  AlertCircle,
  Sparkles,
  Languages,
} from 'lucide-react';
import { Language, UserPreferences } from '../../types';
import { speech } from '../../lib/speech';
import { translations } from '../../locales';

interface VoiceConsoleViewProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  preferences: UserPreferences;
  onSendVoiceMessage: (text: string) => Promise<string | undefined>;
}

export const VoiceConsoleView: React.FC<VoiceConsoleViewProps> = ({
  language,
  onLanguageChange,
  preferences,
  onSendVoiceMessage,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [assistantSpokenReply, setAssistantSpokenReply] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const t = translations[language] || translations.en;

  useEffect(() => {
    return () => {
      speech.stopListening();
      speech.stopSpeaking();
    };
  }, []);

  const handleToggleListening = () => {
    if (isListening) {
      speech.stopListening();
      setIsListening(false);
    } else {
      setVoiceError(null);
      setAssistantSpokenReply('');
      setIsListening(true);
      speech.startListening({
        language,
        onInterim: interim => setTranscript(interim),
        onFinal: final => {
          setTranscript(final);
          setIsListening(false);
        },
        onError: err => {
          setVoiceError(err);
          setIsListening(false);
        },
        onEnd: () => {
          setIsListening(false);
        },
      });
    }
  };

  const handleSendSpokenText = async () => {
    if (!transcript.trim() || isProcessing) return;
    setIsProcessing(true);
    speech.stopSpeaking();

    try {
      const reply = await onSendVoiceMessage(transcript.trim());
      if (reply) {
        setAssistantSpokenReply(reply);
        // Automatically speak back response
        speech.speak(
          reply,
          language,
          preferences.speechRate || 1.0,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      }
    } catch (e: any) {
      setVoiceError(e?.message || 'Error processing speech message.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStopSpeaking = () => {
    speech.stopSpeaking();
    setIsSpeaking(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-900 text-white p-3 sm:p-6 md:p-10 flex flex-col items-center justify-between min-h-full w-full min-w-0">
      {/* Top Header */}
      <div className="w-full max-w-2xl flex items-center justify-between pb-4 sm:pb-6 border-b border-slate-800 gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm sm:text-base md:text-lg text-white truncate">
              Voice Assistant Cockpit
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate">
              Accessible hands-free voice interface
            </p>
          </div>
        </div>

        {/* Speech Language Switch */}
        <div className="flex items-center gap-1.5 bg-slate-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-slate-700 shrink-0">
          <Languages className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={language}
            onChange={e => onLanguageChange(e.target.value as Language)}
            className="bg-transparent text-[11px] sm:text-xs font-semibold text-slate-200 border-none focus:outline-hidden cursor-pointer"
          >
            <option value="en" className="bg-slate-900">EN (en-US)</option>
            <option value="hi" className="bg-slate-900">हिन्दी (hi-IN)</option>
            <option value="gu" className="bg-slate-900">ગુજરાતી (gu-IN)</option>
          </select>
        </div>
      </div>

      {/* Center Interactive Microphone Console */}
      <div className="my-auto py-6 sm:py-8 text-center space-y-4 sm:space-y-6 max-w-lg w-full">
        {/* Animated Big Mic Button */}
        <div className="relative inline-block">
          <button
            onClick={handleToggleListening}
            className={`w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full flex flex-col items-center justify-center transition-all shadow-2xl active:scale-95 ${
              isListening
                ? 'bg-red-500 text-white voice-recording-wave'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Start speaking'}
          >
            {isListening ? (
              <>
                <MicOff className="w-10 h-10 sm:w-12 sm:h-12 mb-1 animate-pulse" />
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Listening...</span>
              </>
            ) : (
              <>
                <Mic className="w-10 h-10 sm:w-12 sm:h-12 mb-1" />
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Tap to Speak</span>
              </>
            )}
          </button>
        </div>

        {/* Status Text */}
        <p className="text-xs sm:text-sm font-medium text-slate-300 px-2 leading-relaxed">
          {isListening
            ? t.voiceListening
            : isProcessing
            ? 'Analyzing speech & synthesizing answer...'
            : isSpeaking
            ? 'Reading answer aloud...'
            : 'Tap the microphone and ask in Gujarati, Hindi, or English.'}
        </p>

        {/* Error Notification */}
        {voiceError && (
          <div className="p-2.5 sm:p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-xl text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">{voiceError}</span>
          </div>
        )}

        {/* Editable Recognized Transcript Preview */}
        {transcript && (
          <div className="bg-slate-800/90 p-3 sm:p-4 rounded-2xl border border-slate-700 text-left space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-xs">{t.voiceTranscript}</span>
              <span className="text-[10px] text-slate-400 hidden xs:inline">{t.voiceEditBeforeSend}</span>
            </div>
            <textarea
              rows={2}
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              className="w-full bg-slate-900 p-2 sm:p-2.5 rounded-xl border border-slate-700 text-white text-xs sm:text-sm focus:ring-1 focus:ring-indigo-500 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setTranscript('')}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
              <button
                onClick={handleSendSpokenText}
                disabled={isProcessing || !transcript.trim()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold disabled:opacity-50 min-h-[36px]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send to LifeMate</span>
              </button>
            </div>
          </div>
        )}

        {/* Spoken AI Reply Card */}
        {assistantSpokenReply && (
          <div className="bg-slate-800 p-3.5 sm:p-5 rounded-2xl border border-slate-700 text-left space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 shrink-0" /> LifeMate Voice Response
              </span>
              <button
                onClick={handleStopSpeaking}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white shrink-0"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-red-400" />
                    <span>Stop Speech</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Replay Audio</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-h-40 overflow-y-auto break-words">
              {assistantSpokenReply}
            </p>
          </div>
        )}
      </div>

      {/* Accessible Footer Notice */}
      <div className="w-full max-w-2xl text-center pt-4 sm:pt-6 border-t border-slate-800 text-[10px] sm:text-xs text-slate-500 shrink-0">
        Voice input requires microphone permissions in your browser. Speech synthesis supports English, Hindi, and Gujarati voices where available.
      </div>
    </div>
  );
};

import { Language } from '../types';

// Web Speech API interface declarations for TypeScript
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

let activeRecognition: any = null;

export const speech = {
  isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as unknown as IWindow;
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
  },

  isSynthesisSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean('speechSynthesis' in window && window.speechSynthesis);
  },

  startListening(options: {
    language: Language;
    onInterim: (text: string) => void;
    onFinal: (text: string) => void;
    onError: (err: string) => void;
    onEnd: () => void;
  }): void {
    if (!this.isRecognitionSupported()) {
      options.onError('Speech recognition is not supported in this browser.');
      return;
    }

    const win = window as unknown as IWindow;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    try {
      if (activeRecognition) {
        activeRecognition.abort();
      }

      const recognition = new SpeechRec();
      activeRecognition = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;

      // Map language code to standard BCP 47 locale
      let locale = 'en-US';
      if (options.language === 'gu') locale = 'gu-IN';
      if (options.language === 'hi') locale = 'hi-IN';
      recognition.lang = locale;

      recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript;
          } else {
            interimText += event.results[i][0].transcript;
          }
        }

        if (interimText) {
          options.onInterim(interimText);
        }
        if (finalText) {
          options.onFinal(finalText);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        if (event.error === 'not-allowed') {
          options.onError('Microphone access was denied. Please allow microphone permission in your browser address bar.');
        } else if (event.error === 'no-speech') {
          options.onError('No speech was detected. Please try again.');
        } else {
          options.onError(`Voice recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        activeRecognition = null;
        options.onEnd();
      };

      recognition.start();
    } catch (e: any) {
      options.onError(e?.message || 'Failed to start speech recognition.');
    }
  },

  stopListening(): void {
    if (activeRecognition) {
      try {
        activeRecognition.stop();
      } catch (e) {
        // ignore
      }
      activeRecognition = null;
    }
  },

  speak(
    text: string,
    language: Language = 'en',
    rate: number = 1.0,
    onStart?: () => void,
    onEnd?: () => void
  ): void {
    if (!this.isSynthesisSupported()) return;

    window.speechSynthesis.cancel();

    // Clean markdown before speaking
    const cleanText = text
      .replace(/[#*_`~>\[\]\(\)]/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = Math.max(0.7, Math.min(1.5, rate));

    let langCode = 'en-US';
    if (language === 'hi') langCode = 'hi-IN';
    if (language === 'gu') langCode = 'gu-IN';
    utterance.lang = langCode;

    // Pick matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(language) || v.lang.includes(langCode));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  },

  stopSpeaking(): void {
    if (this.isSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
  },

  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.isSynthesisSupported()) return [];
    return window.speechSynthesis.getVoices();
  },
};

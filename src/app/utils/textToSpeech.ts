/**
 * Text-to-Speech Utilities
 * Provides accessible audio reading of page content
 */

export interface SpeechOptions {
  rate?: number; // 0.5 - 2.0
  pitch?: number; // 0 - 2.0
  volume?: number; // 0 - 1.0
  lang?: string;
}

export interface TextToSpeechState {
  isSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
}

class TextToSpeechManager {
  private synth: SpeechSynthesis | null = null;
  private utteranceQueue: SpeechSynthesisUtterance[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  /**
   * Check if Text-to-Speech is supported
   */
  isSupported(): boolean {
    return this.synth !== null;
  }

  /**
   * Read text aloud
   */
  speak(text: string, options?: SpeechOptions): void {
    if (!this.synth) {
      console.warn('Text-to-Speech not supported in this browser');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    if (options?.rate) utterance.rate = options.rate;
    if (options?.pitch) utterance.pitch = options.pitch;
    if (options?.volume) utterance.volume = options.volume;
    if (options?.lang) utterance.lang = options.lang;

    utterance.onstart = () => {
      this.isSpeaking = true;
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (this.utteranceQueue.length > 0) {
        const next = this.utteranceQueue.shift();
        if (next) this.synth?.speak(next);
      }
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      this.isSpeaking = false;
    };

    this.currentUtterance = utterance;
    this.utteranceQueue.push(utterance);

    this.synth.speak(utterance);
  }

  /**
   * Read element content aloud
   */
  speakElement(element: HTMLElement, options?: SpeechOptions): void {
    const text = element.innerText || element.textContent || '';
    this.speak(text, options);
  }

  /**
   * Pause ongoing speech
   */
  pause(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
      this.isPaused = true;
    }
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.isPaused = false;
    }
  }

  /**
   * Stop all speech
   */
  stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      this.utteranceQueue = [];
    }
  }

  /**
   * Get current state
   */
  getState(): TextToSpeechState {
    return {
      isSupported: this.isSupported(),
      isSpeaking: this.isSpeaking,
      isPaused: this.isPaused,
    };
  }

  /**
   * Get available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    return this.synth?.getVoices() || [];
  }

  /**
   * Set voice
   */
  setVoice(voiceIndex: number): void {
    if (this.currentUtterance && this.synth) {
      const voices = this.synth.getVoices();
      if (voices[voiceIndex]) {
        this.currentUtterance.voice = voices[voiceIndex];
      }
    }
  }
}

// Export singleton instance
export const ttsManager = new TextToSpeechManager();

/**
 * Hook for Text-to-Speech
 * Usage: const { speak, stop, isSpeaking } = useTTS();
 */
export function useTTS() {
  return {
    speak: (text: string, options?: SpeechOptions) => ttsManager.speak(text, options),
    speakElement: (element: HTMLElement, options?: SpeechOptions) => ttsManager.speakElement(element, options),
    pause: () => ttsManager.pause(),
    resume: () => ttsManager.resume(),
    stop: () => ttsManager.stop(),
    getState: () => ttsManager.getState(),
    getVoices: () => ttsManager.getVoices(),
    setVoice: (index: number) => ttsManager.setVoice(index),
  };
}

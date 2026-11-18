// Audio Narrator Engine using Web Speech API with fallback audio simulation

class AudioNarrator {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;
  private onEndCallback: (() => void) | null = null;
  private onProgressCallback: ((progressPercent: number, currentTimeSec: number) => void) | null = null;
  private progressInterval: number | null = null;
  private elapsedSeconds: number = 0;
  private estimatedTotalSeconds: number = 60;
  private playbackRate: number = 1.0;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public setPlaybackRate(rate: number) {
    this.playbackRate = rate;
    if (this.currentUtterance) {
      this.currentUtterance.rate = rate;
    }
  }

  public speak(
    text: string,
    estimatedDurationSec: number,
    onProgress?: (progressPercent: number, currentTimeSec: number) => void,
    onEnd?: () => void
  ) {
    this.stop();

    this.estimatedTotalSeconds = estimatedDurationSec || 120;
    this.elapsedSeconds = 0;
    this.onProgressCallback = onProgress || null;
    this.onEndCallback = onEnd || null;
    this.isSpeaking = true;
    this.isPaused = false;

    // Start progress timer
    this.startProgressTimer();

    if (this.synth) {
      // Cancel previous utterances
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.playbackRate;
      utterance.pitch = 1.0;
      utterance.lang = 'es-AR'; // Argentine Spanish if available

      // Try selecting a good Spanish voice
      const voices = this.synth.getVoices();
      const spanishVoice =
        voices.find((v) => v.lang.includes('es-AR')) ||
        voices.find((v) => v.lang.startsWith('es')) ||
        null;

      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }

      utterance.onend = () => {
        this.finishPlayback();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error, continuing timer mode:', e);
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    }
  }

  public pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
    this.isPaused = true;
    if (this.progressInterval) {
      window.clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
    this.isPaused = false;
    this.startProgressTimer();
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentUtterance = null;
    if (this.progressInterval) {
      window.clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    this.elapsedSeconds = 0;
  }

  private startProgressTimer() {
    if (this.progressInterval) {
      window.clearInterval(this.progressInterval);
    }

    this.progressInterval = window.setInterval(() => {
      if (!this.isPaused && this.isSpeaking) {
        this.elapsedSeconds += 0.5 * this.playbackRate;
        const progress = Math.min(100, (this.elapsedSeconds / this.estimatedTotalSeconds) * 100);

        if (this.onProgressCallback) {
          this.onProgressCallback(progress, Math.floor(this.elapsedSeconds));
        }

        if (this.elapsedSeconds >= this.estimatedTotalSeconds) {
          this.finishPlayback();
        }
      }
    }, 500);
  }

  private finishPlayback() {
    this.stop();
    if (this.onProgressCallback) {
      this.onProgressCallback(100, this.estimatedTotalSeconds);
    }
    if (this.onEndCallback) {
      this.onEndCallback();
    }
  }

  public getIsPlaying(): boolean {
    return this.isSpeaking && !this.isPaused;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }
}

export const audioNarrator = new AudioNarrator();

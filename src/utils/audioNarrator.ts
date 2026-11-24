// Audio Narrator Engine supporting real MP3 audio files with Web Speech API fallback

class AudioNarrator {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
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
    if (this.currentAudio) {
      this.currentAudio.playbackRate = rate;
    }
    if (this.currentUtterance) {
      this.currentUtterance.rate = rate;
    }
  }

  public speak(
    text: string,
    estimatedDurationSec: number,
    onProgress?: (progressPercent: number, currentTimeSec: number) => void,
    onEnd?: () => void,
    audioUrl?: string
  ) {
    this.stop();

    this.estimatedTotalSeconds = estimatedDurationSec || 120;
    this.elapsedSeconds = 0;
    this.onProgressCallback = onProgress || null;
    this.onEndCallback = onEnd || null;
    this.isSpeaking = true;
    this.isPaused = false;

    // Prefer recorded audio file when available (streamed on demand, zero TTS voice)
    if (audioUrl && audioUrl.trim() !== '' && typeof Audio !== 'undefined') {
      const audio = new Audio(audioUrl);
      audio.preload = 'auto';
      audio.playbackRate = this.playbackRate;
      this.currentAudio = audio;

      const emitAudioProgress = () => {
        if (this.currentAudio !== audio || !this.isSpeaking) return;
        const duration =
          Number.isFinite(audio.duration) && audio.duration > 0
            ? audio.duration
            : this.estimatedTotalSeconds;
        this.elapsedSeconds = audio.currentTime;
        const progress = Math.min(100, (audio.currentTime / duration) * 100);
        if (this.onProgressCallback) {
          this.onProgressCallback(progress, Math.floor(audio.currentTime));
        }
      };

      audio.ontimeupdate = emitAudioProgress;
      audio.onloadedmetadata = () => {
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          this.estimatedTotalSeconds = Math.round(audio.duration);
        }
      };
      audio.onended = () => {
        if (this.currentAudio === audio) {
          this.finishPlayback();
        }
      };
      audio.onerror = (err) => {
        console.warn('[AUDIO] Failed to play recorded audioguide, falling back to speech synthesis:', err);
        if (this.currentAudio === audio) {
          this.cleanupAudioElement();
          this.startSpeechFallback(text);
        }
      };

      audio.play().catch((err) => {
        console.warn('[AUDIO] Playback interrupted or blocked:', err);
        if (this.currentAudio === audio && err?.name !== 'AbortError') {
          this.cleanupAudioElement();
          this.startSpeechFallback(text);
        }
      });
      return;
    }

    this.startSpeechFallback(text);
  }

  private startSpeechFallback(text: string) {
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

  private cleanupAudioElement() {
    if (this.currentAudio) {
      this.currentAudio.ontimeupdate = null;
      this.currentAudio.onloadedmetadata = null;
      this.currentAudio.onended = null;
      this.currentAudio.onerror = null;
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.src = '';
      } catch {
        // Ignore media reset errors
      }
      this.currentAudio = null;
    }
  }

  public pause() {
    if (this.currentAudio) {
      this.currentAudio.pause();
    } else if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
    this.isPaused = true;
    if (this.progressInterval) {
      window.clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  public resume() {
    if (this.currentAudio) {
      this.currentAudio.playbackRate = this.playbackRate;
      this.currentAudio.play().catch((err) => {
        console.warn('[AUDIO] Could not resume audio playback:', err);
      });
      this.isPaused = false;
      return;
    }
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
    this.isPaused = false;
    this.startProgressTimer();
  }

  public stop() {
    this.cleanupAudioElement();
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
    const endCb = this.onEndCallback;
    const progressCb = this.onProgressCallback;
    const totalSec = this.estimatedTotalSeconds;
    this.stop();
    if (progressCb) {
      progressCb(100, totalSec);
    }
    if (endCb) {
      endCb();
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

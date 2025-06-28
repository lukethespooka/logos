// Define sound types for better type safety
type SoundId = 'taskComplete' | 'taskIncomplete' | 'error' | 'success' | 'reorder' | 'focus';

class SoundManager {
  private volume: number = 0.5;
  private isMuted: boolean = false;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('🎶 Audio system ready');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', delay: number = 0) {
    if (!this.audioContext || this.isMuted) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime + delay);

      // Smooth envelope to avoid clicks
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + delay);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + delay + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + delay + duration);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start(this.audioContext.currentTime + delay);
      oscillator.stop(this.audioContext.currentTime + delay + duration);
    } catch (error) {
      console.error('Failed to play tone:', error);
    }
  }

  async play(id: SoundId) {
    if (this.isMuted || !this.audioContext) {
      return;
    }

    try {
      switch (id) {
        case 'taskComplete':
        case 'success':
          // Happy success melody - C major triad ascending
          this.playTone(523.25, 0.15, 'sine', 0);     // C5
          this.playTone(659.25, 0.15, 'sine', 0.08);  // E5
          this.playTone(783.99, 0.2, 'sine', 0.16);   // G5
          break;
          
        case 'reorder':
          // Quick positive chirp
          this.playTone(880, 0.1, 'sine', 0);         // A5
          this.playTone(1046.5, 0.1, 'sine', 0.06);   // C6
          break;
          
        case 'focus':
          // Gentle focus tone - perfect fifth
          this.playTone(440, 0.15, 'sine', 0);        // A4
          this.playTone(659.25, 0.15, 'sine', 0.08);  // E5
          break;
          
        case 'taskIncomplete':
          // Neutral descending
          this.playTone(523.25, 0.12, 'sine', 0);     // C5
          this.playTone(440, 0.12, 'sine', 0.08);     // A4
          break;
          
        case 'error':
          // Warning sound - minor second interval
          this.playTone(349.23, 0.2, 'square', 0);    // F4
          this.playTone(369.99, 0.15, 'square', 0.1); // F#4
          break;
      }
    } catch (error) {
      console.error(`Failed to play sound ${id}:`, error);
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  mute() {
    this.isMuted = true;
  }

  unmute() {
    this.isMuted = false;
  }

  toggleMute() {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  getVolume() {
    return this.volume;
  }

  isSoundMuted() {
    return this.isMuted;
  }

  testSound() {
    console.log('🔊 Playing test sound...');
    this.play('success');
  }

  getAudioInfo() {
    return {
      contextState: this.audioContext?.state || 'unavailable',
      volume: this.volume,
      isMuted: this.isMuted,
      type: 'synthetic'
    };
  }
}

// Export singleton instance
export const soundManager = new SoundManager();

// Convenience function for playing sounds
export const playSound = (id: SoundId) => soundManager.play(id); 
export type ToneType = 'hit' | 'charge' | 'perfect' | 'break' | 'result';

export class AudioSystem {
  private context: AudioContext | null = null;

  private ensureContext() {
    if (!this.context) {
      this.context = new AudioContext();
    }
    if (this.context.state === 'suspended') {
      void this.context.resume();
    }
  }

  play(tone: ToneType) {
    this.ensureContext();
    if (!this.context) {
      return;
    }
    const context = this.context;
    const now = context.currentTime;

    const patterns: Record<ToneType, Array<{ freq: number; duration: number; gain: number }>> = {
      hit: [
        { freq: 640, duration: 0.06, gain: 0.14 },
        { freq: 920, duration: 0.05, gain: 0.1 },
      ],
      charge: [
        { freq: 220, duration: 0.12, gain: 0.18 },
        { freq: 320, duration: 0.12, gain: 0.14 },
      ],
      perfect: [
        { freq: 880, duration: 0.08, gain: 0.2 },
        { freq: 1320, duration: 0.08, gain: 0.16 },
      ],
      break: [
        { freq: 180, duration: 0.14, gain: 0.2 },
        { freq: 120, duration: 0.14, gain: 0.18 },
      ],
      result: [
        { freq: 520, duration: 0.1, gain: 0.16 },
        { freq: 780, duration: 0.12, gain: 0.14 },
        { freq: 1040, duration: 0.12, gain: 0.12 },
      ],
    };

    const pattern = patterns[tone];
    let offset = 0;
    pattern.forEach((note) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.value = note.freq;
      gain.gain.value = 0;
      oscillator.connect(gain);
      gain.connect(context.destination);

      const startTime = now + offset;
      gain.gain.linearRampToValueAtTime(note.gain, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + note.duration + 0.02);
      offset += note.duration * 0.85;
    });
  }
}

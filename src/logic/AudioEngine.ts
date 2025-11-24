import * as Tone from 'tone';

export class AudioEngine {
    private static instance: AudioEngine;
    private buffer: Tone.ToneAudioBuffer | null = null;
    private reverb: Tone.Reverb | null = null;
    private filter: Tone.Filter | null = null;
    private masterGain: Tone.Gain | null = null;
    private isReady: boolean = false;
    private currentScale: number[] = [];
    private sampleStart: number = 0.0;
    private sampleEnd: number = 1.0;
    private grainFadeIn: number = 0.05;
    private grainFadeOut: number = 0.1;
    private grainSize: number = 1.0;
    private grainPitchRange: number = 0.0;

    // Scales
    private readonly scales: Record<string, number[]> = {
        pentatonic: [0.5, 0.5625, 0.625, 0.75, 0.875, 1.0, 1.125, 1.25, 1.5, 1.6875, 1.875, 2.0],
        major: [0.5, 0.5612, 0.6299, 0.6674, 0.7491, 0.8408, 0.9438, 1.0, 1.1224, 1.2599, 1.3348, 1.4983, 1.6817, 1.8877, 2.0],
        minor: [0.5, 0.5612, 0.5946, 0.6674, 0.7491, 0.7937, 0.8908, 1.0, 1.1224, 1.1892, 1.3348, 1.4983, 1.5874, 1.7817, 2.0],
        chromatic: [0.5, 0.5297, 0.5612, 0.5946, 0.6299, 0.6674, 0.7071, 0.7491, 0.7937, 0.8408, 0.8908, 0.9438, 1.0, 1.0594, 1.1224, 1.1892, 1.2599, 1.3348, 1.4142, 1.4983, 1.5874, 1.6817, 1.7817, 1.8877, 2.0],
        dorian: [0.5, 0.5612, 0.5946, 0.6674, 0.7491, 0.8408, 0.8908, 1.0, 1.1224, 1.1892, 1.3348, 1.4983, 1.6817, 1.7817, 2.0],
        phrygian: [0.5, 0.5297, 0.5946, 0.6674, 0.7491, 0.7937, 0.8908, 1.0, 1.0594, 1.1892, 1.3348, 1.4983, 1.5874, 1.7817, 2.0],
        lydian: [0.5, 0.5612, 0.6299, 0.7071, 0.7491, 0.8408, 0.9438, 1.0, 1.1224, 1.2599, 1.4142, 1.4983, 1.6817, 1.8877, 2.0],
        mixolydian: [0.5, 0.5612, 0.6299, 0.6674, 0.7491, 0.8408, 0.8908, 1.0, 1.1224, 1.2599, 1.3348, 1.4983, 1.6817, 1.7817, 2.0],
        locrian: [0.5, 0.5297, 0.5946, 0.6674, 0.7071, 0.7937, 0.8908, 1.0, 1.0594, 1.1892, 1.3348, 1.4142, 1.5874, 1.7817, 2.0],
        wholetone: [0.5, 0.5612, 0.6299, 0.7071, 0.7937, 0.8908, 1.0, 1.1224, 1.2599, 1.4142, 1.5874, 1.7817, 2.0],
        unquantized: Array.from({ length: 100 }, (_, i) => Math.pow(2, (i / 99) * 2 - 1)) // Logarithmic from 0.5 to 2.0
    };

    private constructor() {
        this.currentScale = this.scales['minor'];
    }

    public static getInstance(): AudioEngine {
        if (!AudioEngine.instance) {
            AudioEngine.instance = new AudioEngine();
        }
        return AudioEngine.instance;
    }

    public async init() {
        await Tone.start();

        this.masterGain = new Tone.Gain(Tone.dbToGain(-10)).toDestination();

        // Create filter 
        this.filter = new Tone.Filter({
            frequency: 5000,
            type: 'lowpass',
            Q: 1
        });
        this.filter.connect(this.masterGain);

        this.reverb = new Tone.Reverb({
            decay: 4,
            preDelay: 0.1,
            wet: 0.5
        });
        await this.reverb.generate();
        this.reverb.connect(this.filter);

        // Load default local sample
        this.buffer = new Tone.ToneAudioBuffer();
        await this.buffer.load('/src/assets/samples/Vocal Female.wav');

        this.isReady = true;
        console.log('Audio Engine Ready');
    }

    public async toggleAudio(): Promise<boolean> {
        if (!this.isReady) {
            await this.init();
            return true;
        }

        if (Tone.context.state !== 'running') {
            await Tone.start();
            if (Tone.context.state === 'suspended') {
                await Tone.context.resume();
            }
            return true;
        } else {
            // Access rawContext to suspend
            const ctx = Tone.context.rawContext;
            await ctx.suspend();
            return false;
        }
    }

    public getAudioState(): string {
        return Tone.context.state;
    }

    public setReverb(wet: number) {
        if (this.reverb) {
            this.reverb.wet.rampTo(wet, 0.1);
        }
    }

    public setVolume(db: number) {
        if (this.masterGain) {
            this.masterGain.gain.rampTo(Tone.dbToGain(db), 0.1);
        }
    }

    public setScale(scaleName: string) {
        if (this.scales[scaleName]) {
            this.currentScale = this.scales[scaleName];
        }
    }

    public async setSample(url: string) {
        if (this.buffer) {
            try {
                await this.buffer.load(url);
            } catch (e) {
                console.error("Failed to load sample", e);
            }
        }
    }

    public setSampleWindow(start: number, end: number) {
        this.sampleStart = Math.max(0, Math.min(1, start));
        this.sampleEnd = Math.max(0, Math.min(1, end));
    }

    public setFilterCutoff(freq: number) {
        if (this.filter) {
            this.filter.frequency.rampTo(freq, 0.1);
        }
    }

    public setFilterResonance(Q: number) {
        if (this.filter) {
            this.filter.Q.rampTo(Q, 0.1);
        }
    }

    public setGrainFadeIn(fadeIn: number) {
        this.grainFadeIn = fadeIn;
    }

    public setGrainFadeOut(fadeOut: number) {
        this.grainFadeOut = fadeOut;
    }

    public setGrainSize(size: number) {
        this.grainSize = size;
    }

    public setGrainPitchRange(range: number) {
        this.grainPitchRange = range;
    }

    public getBuffer(): Tone.ToneAudioBuffer | null {
        return this.buffer;
    }

    public triggerGrain(position: { x: number, y: number, z: number }, velocity: number) {
        if (!this.isReady || !this.buffer || !this.reverb) return;

        // Map Z (-100 to 100) to offset within sample window
        const duration = this.buffer.duration;
        const windowStart = this.sampleStart * duration;
        const windowEnd = this.sampleEnd * duration;
        const windowDuration = windowEnd - windowStart;

        const normalizedZ = (position.z + 100) / 200; // 0 to 1
        const offset = Math.max(windowStart, Math.min(windowEnd - 0.5, windowStart + (normalizedZ * windowDuration)));

        // Map Y (-100 to 100) to playback rate (quantized)
        let normalizedY = (position.y + 100) / 200; // 0 to 1

        // Apply pitch range scaling - compress range toward center (0.5)
        const center = 0.5;
        normalizedY = center + (normalizedY - center) * this.grainPitchRange;

        const playbackRate = this.getQuantizedRate(normalizedY);

        // Map X (-100 to 100) to Pan (-1 to 1)
        const pan = Math.max(-1, Math.min(1, position.x / 100));

        // Map Velocity to Volume and Duration
        const normalizedVel = Math.min(1, velocity / 2);
        const baseGrainDuration = 0.5 - (normalizedVel * 0.4);
        const grainDuration = baseGrainDuration * this.grainSize;
        const volume = -10 + (normalizedVel * 10); // Relative to master

        const source = new Tone.ToneBufferSource({
            playbackRate: playbackRate,
            fadeIn: this.grainFadeIn,
            fadeOut: this.grainFadeOut,
        });
        source.buffer = this.buffer;

        const panner = new Tone.Panner(pan);
        const gain = new Tone.Gain(Tone.dbToGain(volume));

        source.connect(panner);
        panner.connect(gain);
        gain.connect(this.reverb);

        source.start(Tone.now(), offset, grainDuration);
    }

    private getQuantizedRate(normalizedY: number): number {
        const index = Math.floor(normalizedY * this.currentScale.length);
        const safeIndex = Math.max(0, Math.min(this.currentScale.length - 1, index));
        return this.currentScale[safeIndex];
    }
}

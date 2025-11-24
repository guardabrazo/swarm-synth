import { create } from 'zustand';

interface AppState {
  isLoaded: boolean;
  isPlaying: boolean;
  interactionState: {
    isDragging: boolean;
    cursorPosition: { x: number; y: number; z: number };
  };

  // New Parameters
  boidCount: number;
  reverbWet: number;
  masterVolume: number;
  selectedScale: string;
  selectedSample: string;

  // Simulation Parameters
  separationForce: number;
  alignmentForce: number;
  cohesionForce: number;
  maxSpeed: number;

  // New v6 Features
  triggerFrequency: number;
  boidShape: string; // 'cone', 'sphere', 'line'

  noiseSphereEnabled: boolean;
  noiseSphereForce: number;
  noiseSphereSpeed: number;

  // Audio Engine v9
  sampleStart: number;
  sampleEnd: number;
  filterCutoff: number;
  filterResonance: number;
  grainFadeIn: number;
  grainFadeOut: number;
  grainSize: number;
  grainPitchRange: number;

  setLoaded: (loaded: boolean) => void;
  setPlaying: (playing: boolean) => void;
  setInteractionState: (state: Partial<AppState['interactionState']>) => void;

  setBoidCount: (count: number) => void;
  setReverbWet: (wet: number) => void;
  setMasterVolume: (vol: number) => void;
  setSelectedScale: (scale: string) => void;
  setSelectedSample: (sample: string) => void;

  setSeparationForce: (force: number) => void;
  setAlignmentForce: (force: number) => void;
  setCohesionForce: (force: number) => void;
  setMaxSpeed: (speed: number) => void;

  setTriggerFrequency: (freq: number) => void;
  setBoidShape: (shape: string) => void;

  setNoiseSphereEnabled: (enabled: boolean) => void;
  setNoiseSphereForce: (force: number) => void;
  setNoiseSphereSpeed: (speed: number) => void;

  setSampleStart: (start: number) => void;
  setSampleEnd: (end: number) => void;
  setFilterCutoff: (cutoff: number) => void;
  setFilterResonance: (resonance: number) => void;
  setGrainFadeIn: (fadeIn: number) => void;
  setGrainFadeOut: (fadeOut: number) => void;
  setGrainSize: (size: number) => void;
  setGrainPitchRange: (range: number) => void;
}

export const useStore = create<AppState>((set) => ({
  isLoaded: false,
  isPlaying: false,
  interactionState: {
    isDragging: false,
    cursorPosition: { x: 0, y: 0, z: 0 },
  },

  boidCount: 60,
  reverbWet: 0.5,
  masterVolume: -10,
  selectedScale: 'minor',
  selectedSample: '/src/assets/samples/Vocal Female.wav',

  separationForce: 1.5,
  alignmentForce: 1.0,
  cohesionForce: 1.0,
  maxSpeed: 1.0,

  triggerFrequency: 0.1,
  boidShape: 'cone',

  noiseSphereEnabled: false,
  noiseSphereForce: 0,
  noiseSphereSpeed: 0.5,

  sampleStart: 0.0,
  sampleEnd: 1.0,
  filterCutoff: 5000,
  filterResonance: 1,
  grainFadeIn: 0.05,
  grainFadeOut: 0.1,
  grainSize: 1.0,
  grainPitchRange: 0.0,

  setLoaded: (loaded) => set({ isLoaded: loaded }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setInteractionState: (newState) => set((state) => ({
    interactionState: { ...state.interactionState, ...newState }
  })),

  setBoidCount: (count) => set({ boidCount: count }),
  setReverbWet: (wet) => set({ reverbWet: wet }),
  setMasterVolume: (vol) => set({ masterVolume: vol }),
  setSelectedScale: (scale) => set({ selectedScale: scale }),
  setSelectedSample: (sample) => set({ selectedSample: sample }),

  setSeparationForce: (force) => set({ separationForce: force }),
  setAlignmentForce: (force) => set({ alignmentForce: force }),
  setCohesionForce: (force) => set({ cohesionForce: force }),
  setMaxSpeed: (speed) => set({ maxSpeed: speed }),

  setTriggerFrequency: (freq) => set({ triggerFrequency: freq }),
  setBoidShape: (shape) => set({ boidShape: shape }),

  setNoiseSphereEnabled: (enabled) => set({ noiseSphereEnabled: enabled }),
  setNoiseSphereForce: (force) => set({ noiseSphereForce: force }),
  setNoiseSphereSpeed: (speed) => set({ noiseSphereSpeed: speed }),

  setSampleStart: (start) => set({ sampleStart: start }),
  setSampleEnd: (end) => set({ sampleEnd: end }),
  setFilterCutoff: (cutoff) => set({ filterCutoff: cutoff }),
  setFilterResonance: (resonance) => set({ filterResonance: resonance }),
  setGrainFadeIn: (fadeIn) => set({ grainFadeIn: fadeIn }),
  setGrainFadeOut: (fadeOut) => set({ grainFadeOut: fadeOut }),
  setGrainSize: (size) => set({ grainSize: size }),
  setGrainPitchRange: (range) => set({ grainPitchRange: range }),
}));

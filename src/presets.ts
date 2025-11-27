
export interface Preset {
    name: string;
    // Simulation
    boidCount: number;
    separationForce: number;
    alignmentForce: number;
    cohesionForce: number;
    maxSpeed: number;
    triggerFrequency: number;
    boidShape: string;
    noiseSphereEnabled: boolean;
    noiseSphereForce: number;
    noiseSphereSpeed: number;

    // Audio
    selectedSample: string;
    sampleStart: number;
    sampleEnd: number;
    filterCutoff: number;
    filterResonance: number;
    grainFadeIn: number;
    grainFadeOut: number;
    grainSize: number;
    grainPitchRange: number;
    selectedScale: string;
    reverbWet: number;
    masterVolume: number;
}

const DEFAULTS = {
    boidCount: 60,
    reverbWet: 0.5,
    masterVolume: -10,
    selectedScale: 'minor',
    selectedSample: '/swarm-synth/samples/Vocal Female.mp3',
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
};

export const PRESETS: Record<string, Preset> = {
    'Choir': {
        name: 'Choir',
        ...DEFAULTS,
        selectedScale: 'unquantized',
    },
    'Minor Flute': {
        name: 'Minor Flute',
        ...DEFAULTS,
        selectedSample: '/swarm-synth/samples/Clay Flute.mp3',
        grainPitchRange: 1.00,
        boidCount: 10,
    },
    'Snowstorm': {
        name: 'Snowstorm',
        ...DEFAULTS,
        selectedSample: '/swarm-synth/samples/Bowed Lids.mp3',
        sampleStart: 0,
        sampleEnd: 0.6,
        filterCutoff: 2000,
        filterResonance: 8,
        grainFadeIn: 0.3,
        grainFadeOut: 0.5,
        grainPitchRange: 1,
        selectedScale: 'unquantized',
        boidCount: 400,
        separationForce: 1.5,
        maxSpeed: 5,
        triggerFrequency: 1.0,
        boidShape: 'sphere',
    },
    'Pulsating Drone': {
        name: 'Pulsating Drone',
        ...DEFAULTS,
        selectedSample: '/swarm-synth/samples/Bass.mp3',
        sampleStart: 0,
        sampleEnd: 0.1,
        filterCutoff: 5000,
        filterResonance: 0.1,
        grainFadeIn: 0.35,
        grainFadeOut: 0.5,
        grainSize: 2.3,
        grainPitchRange: 0,
        selectedScale: 'unquantized',
        reverbWet: 0,
        boidCount: 300,
        separationForce: 0.5,
        alignmentForce: 0.5,
        cohesionForce: 0.8,
        maxSpeed: 3,
        triggerFrequency: 0.5,
    },
    'Eerie Forest': {
        name: 'Eerie Forest',
        ...DEFAULTS,
        selectedSample: '/swarm-synth/samples/Forest Ambience.mp3',
        filterCutoff: 20000,
        grainFadeIn: 0.35,
        grainFadeOut: 0.5,
        grainPitchRange: 1,
        selectedScale: 'unquantized',
        boidCount: 100,
        separationForce: 1.5,
        alignmentForce: 1,
        cohesionForce: 1,
        boidShape: 'line',
        noiseSphereEnabled: true,
        noiseSphereForce: 0.3,
        noiseSphereSpeed: 0.5,
    }
};

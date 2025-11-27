# Swarm Synth

A 3D granular synthesizer driven by flocking simulation. Each agent (boid) in the swarm acts as a playhead, triggering grains of sound as they fly through a 3D audio space. The result is an evolving, organic soundscape that responds to the collective behavior of the swarm.

🎵 **[Live Demo](https://guardabrazo.github.io/swarm-synth/)**

## Features

- **Flocking Simulation**: Real-time 3D visualization of boid behavior (separation, alignment, cohesion).
- **Granular Synthesis**: Each boid triggers audio grains based on its position and velocity.
- **3D Audio Space**:
  - **X-Axis**: Panning (Left/Right)
  - **Y-Axis**: Pitch/Playback Rate
  - **Z-Axis**: Sample Position (Grain Offset)
- **Presets**: Instant access to curated soundscapes (Choir, Minor Flute, Snowstorm, etc.).
- **Waveform Visualization**: Interactive display of the sample waveform and playback window.
- **Mobile Responsive**: Optimized interface for touch devices.

## Controls

### Simulation
- **Boid Count**: Number of agents in the swarm (10-400).
- **Flocking Physics**: Adjust Separation, Alignment, and Cohesion forces.
- **Speed**: Control the maximum speed of the boids.
- **Trigger Freq**: Probability of a boid triggering a sound grain.
- **Shape**: Change boid visualization (Cone, Sphere, Line).
- **Noise Sphere**: Add a chaotic force field to disrupt the swarm.

### Audio Engine
- **Sample Selection**: Choose from various source samples (Vocals, Instruments, Textures).
- **Waveform**: Drag to set the start and end points of the sample grain window.
- **Grain Settings**:
  - **Size**: Duration of each grain.
  - **Fade In/Out**: Envelope shaping for smooth textures.
  - **Pitch Range**: Randomization of playback rate.
- **Filter**: Low-pass filter cutoff and resonance.
- **Scale**: Quantize pitch to musical scales (Major, Minor, Pentatonic, etc.).
- **Reverb**: Spatial depth and ambience.

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

Deploy to GitHub Pages:

```bash
npm run deploy
```

## Technical Stack

- **React** - UI Framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tooling
- **Three.js** - 3D Graphics and Simulation
- **Tone.js** - Web Audio Framework
- **Zustand** - State Management
- **SCSS** - Styling

## Credits

Created by [Guardabrazo](https://guardabrazo.com)

Orchestrated by Google Antigravity

## License

MIT

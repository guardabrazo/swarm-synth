import React from 'react';
import { useStore } from '../store';
import { AudioEngine } from '../logic/AudioEngine';
import { WaveformVisualization } from './WaveformVisualization';

export const Controls: React.FC = () => {
    const {
        boidCount, setBoidCount,
        reverbWet, setReverbWet,
        masterVolume, setMasterVolume,
        selectedScale, setSelectedScale,
        selectedSample, setSelectedSample,
        separationForce, setSeparationForce,
        alignmentForce, setAlignmentForce,
        cohesionForce, setCohesionForce,
        maxSpeed, setMaxSpeed,
        triggerFrequency, setTriggerFrequency,
        boidShape, setBoidShape,
        sampleStart, setSampleStart,
        sampleEnd, setSampleEnd,
        filterCutoff, setFilterCutoff,
        filterResonance, setFilterResonance,
        grainFadeIn, setGrainFadeIn,
        grainFadeOut, setGrainFadeOut,
        grainSize, setGrainSize,
        grainPitchRange, setGrainPitchRange,
        noiseSphereEnabled, setNoiseSphereEnabled,
        noiseSphereForce, setNoiseSphereForce,
        noiseSphereSpeed, setNoiseSphereSpeed
    } = useStore();

    const handleSampleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const url = e.target.value;
        setSelectedSample(url);
        AudioEngine.getInstance().setSample(url);
    };

    const handleWindowChange = (start: number, end: number) => {
        setSampleStart(start);
        setSampleEnd(end);
        AudioEngine.getInstance().setSampleWindow(start, end);
    };

    const handleFilterCutoffChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setFilterCutoff(value);
        AudioEngine.getInstance().setFilterCutoff(value);
    };

    const handleFilterResonanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setFilterResonance(value);
        AudioEngine.getInstance().setFilterResonance(value);
    };

    const handleGrainFadeInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setGrainFadeIn(value);
        AudioEngine.getInstance().setGrainFadeIn(value);
    };

    const handleGrainFadeOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setGrainFadeOut(value);
        AudioEngine.getInstance().setGrainFadeOut(value);
    };

    const handleGrainSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setGrainSize(value);
        AudioEngine.getInstance().setGrainSize(value);
    };

    return (
        <>
            <div className="controls-panel left">
                <div className="section">
                    <div className="section-header">
                        <span>SIMULATION</span>
                    </div>

                    <div className="control-group">
                        <label>
                            <span>BOID COUNT</span>
                            <span className="value">{boidCount}</span>
                        </label>
                        <input
                            type="range"
                            min="10"
                            max="400"
                            step="10"
                            value={boidCount}
                            onChange={(e) => setBoidCount(Number(e.target.value))}
                        />
                    </div>

                    <div className="control-group">
                        <label>
                            <span>SEPARATION</span>
                            <span className="value">{separationForce.toFixed(1)}</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="3"
                            step="0.1"
                            value={separationForce}
                            onChange={(e) => setSeparationForce(Number(e.target.value))}
                        />
                    </div>

                    <div className="control-group">
                        <label>
                            <span>ALIGNMENT</span>
                            <span className="value">{alignmentForce.toFixed(1)}</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="3"
                            step="0.1"
                            value={alignmentForce}
                            onChange={(e) => setAlignmentForce(Number(e.target.value))}
                        />
                    </div>

                    <div className="control-group">
                        <label>
                            <span>COHESION</span>
                            <span className="value">{cohesionForce.toFixed(1)}</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="3"
                            step="0.1"
                            value={cohesionForce}
                            onChange={(e) => setCohesionForce(Number(e.target.value))}
                        />
                    </div>

                    <div className="control-group">
                        <label>
                            <span>SPEED</span>
                            <span className="value">{maxSpeed.toFixed(1)}</span>
                        </label>
                        <input
                            type="range"
                            min="0.5"
                            max="5"
                            step="0.1"
                            value={maxSpeed}
                            onChange={(e) => setMaxSpeed(Number(e.target.value))}
                        />
                    </div>

                    <div className="control-group">
                        <label>
                            <span>TRIGGER FREQ</span>
                            <span className="value">{Math.round(triggerFrequency * 100)}%</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={triggerFrequency}
                            onChange={(e) => setTriggerFrequency(Number(e.target.value))}
                        />
                    </div>

                    <div className="control-group">
                        <label>
                            <span>SHAPE</span>
                        </label>
                        <select value={boidShape} onChange={(e) => setBoidShape(e.target.value)}>
                            <option value="cone">CONE</option>
                            <option value="sphere">SPHERE</option>
                            <option value="line">LINE</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label>
                            <span>NOISE SPHERE</span>
                            <input
                                type="checkbox"
                                checked={noiseSphereEnabled}
                                onChange={(e) => setNoiseSphereEnabled(e.target.checked)}
                            />
                        </label>
                    </div>

                    <div className="control-group">
                        <label>
                            <span>SPHERE FORCE</span>
                            <span className="value">{noiseSphereForce.toFixed(1)}</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={noiseSphereForce}
                            onChange={(e) => setNoiseSphereForce(Number(e.target.value))}
                            disabled={!noiseSphereEnabled}
                            style={{ opacity: noiseSphereEnabled ? 1 : 0.3 }}
                        />
                    </div>

                    <div className="control-group">
                        <label>
                            <span>SPHERE SPEED</span>
                            <span className="value">{noiseSphereSpeed.toFixed(1)}</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={noiseSphereSpeed}
                            onChange={(e) => setNoiseSphereSpeed(Number(e.target.value))}
                            disabled={!noiseSphereEnabled}
                            style={{ opacity: noiseSphereEnabled ? 1 : 0.3 }}
                        />
                    </div>
                </div>
            </div>


            <div className="controls-panel right">
                <div className="section">
                    <div className="section-header">
                        <span>AUDIO ENGINE</span>
                    </div>



                    <div className="control-group">
                        <label>
                            <span>SAMPLE</span>
                        </label>
                        <select value={selectedSample} onChange={handleSampleChange}>
                            <option value="/src/assets/samples/Rhodes.wav">RHODES</option>
                            <option value="/src/assets/samples/E-Piano.wav">E-PIANO</option>
                            <option value="/src/assets/samples/Guitar Loop.wav">GUITAR LOOP</option>
                            <option value="/src/assets/samples/Vocal Male.wav">VOCAL MALE</option>
                            <option value="/src/assets/samples/Vocal Female.wav">VOCAL FEMALE</option>
                            <option value="/src/assets/samples/Banjo Arpeggio.wav">BANJO ARP</option>
                            <option value="/src/assets/samples/Bass.wav">BASS</option>
                            <option value="/src/assets/samples/Break.wav">BREAK</option>
                            <option value="/src/assets/samples/Bowed Lids.wav">BOWED LIDS</option>
                            <option value="/src/assets/samples/Cat Purring.wav">CAT PURR</option>
                            <option value="/src/assets/samples/Clay Flute.wav">CLAY FLUTE</option>
                            <option value="/src/assets/samples/Dubstep.wav">DUBSTEP</option>
                            <option value="/src/assets/samples/Female Vocal Reverb.wav">VOCAL REV</option>
                            <option value="/src/assets/samples/Forest Ambience.wav">FOREST</option>
                            <option value="/src/assets/samples/Radio Station Search.wav">RADIO</option>
                            <option value="/src/assets/samples/Sandpaper Strings.wav">SANDPAPER</option>
                            <option value="/src/assets/samples/Soundboard Whale.wav">WHALE</option>
                            <option value="/src/assets/samples/Strings.wav">STRINGS</option>
                            <option value="/src/assets/samples/Tea Cups.wav">TEA CUPS</option>
                            <option value="/src/assets/samples/Vinyl Dirt.wav">VINYL</option>
                        </select>
                    </div>

                    <div className="control-group waveform-group">
                        <label>
                            <span>WAVEFORM</span>
                        </label>
                        <WaveformVisualization
                            sampleStart={sampleStart}
                            sampleEnd={sampleEnd}
                            onWindowChange={handleWindowChange}
                        />
                    </div>

                    <div className="control-group">
                        <label>
                            <span>CUTOFF</span>
                            <span className="value">{Math.round(filterCutoff)}Hz</span>
                        </label>
                        <input
                            type="range"
                            min="20"
                            max="20000"
                            step="10"
                            value={filterCutoff}
                            onChange={handleFilterCutoffChange}
                        />
                    </div>

                    <div className="control-group">
                        <label>
                            <span>RESONANCE</span>
                            <span className="value">{filterResonance.toFixed(1)}</span>
                        </label>
                        <input
                            type="range"
                            min="0.1"
                            max="30"
                            step="0.1"
                            value={filterResonance}
                            onChange={handleFilterResonanceChange}
                        />
                    </div>

                    <div className="control-group">
                        <label>
                            <span>FADE IN</span>
                            <span className="value">{(grainFadeIn * 1000).toFixed(0)}ms</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="0.5"
                            step="0.001"
                            value={grainFadeIn}
                            onChange={handleGrainFadeInChange}
                        />
                    </div>

                    <div className="control-group">
                        <label>
                            <span>FADE OUT</span>
                            <span className="value">{(grainFadeOut * 1000).toFixed(0)}ms</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="0.5"
                            step="0.001"
                            value={grainFadeOut}
                            onChange={handleGrainFadeOutChange}
                        />
                    </div>

                    <div className="control-group">
                        <label>
                            <span>GRAIN SIZE</span>
                            <span className="value">{grainSize.toFixed(2)}x</span>
                        </label>
                        <input
                            type="range"
                            min="0.1"
                            max="5"
                            step="0.1"
                            value={grainSize}
                            onChange={handleGrainSizeChange}
                        />
                    </div>

                    <div className="control-group">
                        <label>
                            <span>PITCH RANGE</span>
                            <span className="value">{grainPitchRange.toFixed(2)}</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={grainPitchRange}
                            onChange={(e) => {
                                const value = Number(e.target.value);
                                setGrainPitchRange(value);
                                AudioEngine.getInstance().setGrainPitchRange(value);
                            }}
                        />
                    </div>

                    <div className="control-group">
                        <label>
                            <span>SCALE</span>
                        </label>
                        <select value={selectedScale} onChange={(e) => setSelectedScale(e.target.value)}>
                            <option value="pentatonic">PENTATONIC</option>
                            <option value="major">MAJOR</option>
                            <option value="minor">MINOR</option>
                            <option value="chromatic">CHROMATIC</option>
                            <option value="dorian">DORIAN</option>
                            <option value="phrygian">PHRYGIAN</option>
                            <option value="lydian">LYDIAN</option>
                            <option value="mixolydian">MIXOLYDIAN</option>
                            <option value="locrian">LOCRIAN</option>
                            <option value="wholetone">WHOLE TONE</option>
                            <option value="unquantized">UNQUANTIZED</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label>
                            <span>REVERB</span>
                            <span className="value">{Math.round(reverbWet * 100)}%</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={reverbWet}
                            onChange={(e) => setReverbWet(Number(e.target.value))}
                        />
                    </div>

                    <div className="control-group">
                        <label>
                            <span>VOLUME</span>
                            <span className="value">{masterVolume}dB</span>
                        </label>
                        <input
                            type="range"
                            min="-60"
                            max="0"
                            step="1"
                            value={masterVolume}
                            onChange={(e) => setMasterVolume(Number(e.target.value))}
                        />
                    </div>

                    <div className="control-group" style={{ marginTop: '20px' }}>
                        <button
                            className="power-button"
                            onClick={async (e) => {
                                const btn = e.currentTarget;
                                const isRunning = await AudioEngine.getInstance().toggleAudio();
                                btn.textContent = isRunning ? 'STOP AUDIO' : 'START AUDIO';
                                btn.classList.toggle('active', isRunning);
                            }}
                            style={{
                                width: '100%',
                                padding: '8px',
                                background: 'transparent',
                                border: '1px solid #fff',
                                color: '#fff',
                                fontFamily: 'inherit',
                                fontSize: '10px',
                                letterSpacing: '2px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            START AUDIO
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

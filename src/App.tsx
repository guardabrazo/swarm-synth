import { useState } from 'react';
import { Canvas } from './components/Canvas';
import { useStore } from './store';

import { Controls } from './components/Controls';

function App() {
  const setPlaying = useStore((state) => state.setPlaying);

  // Auto-start simulation on load (audio will wait for user interaction via button)
  useState(() => {
    setPlaying(true);
  });

  return (
    <div className="app-container">


      <div className="canvas-container">
        <Canvas />
      </div>

      <div className="ui-layer">
        <div className="header">
          <div className="logo">SWARM SYNTH</div>
          <div className="header-right">
            <div className="version-badge">BOID2AUDIO</div>
            <span className="version-number">V 1.0</span>
          </div>
        </div>

        <Controls />

        <div className="footer">
          <div className="footer-left">
            <div className="badge-box">
              <span className="badge-text">GUARDABRAZO</span>
              <div className="footer-links">
                <a href="https://instagram.com/guardabrazo" target="_blank" rel="noopener noreferrer">INSTAGRAM</a>
                <span className="separator">|</span>
                <a href="https://linkedin.com/in/guardabrazo" target="_blank" rel="noopener noreferrer">LINKEDIN</a>
                <span className="separator">|</span>
                <a href="https://guardabrazo.com" target="_blank" rel="noopener noreferrer">WEBSITE</a>
              </div>
            </div>
          </div>
          <div className="credits-text">
            <p>ALGORITHMICALLY GENERATED</p>
            <p className="sub-credit">ORCHESTRATED BY GOOGLE ANTIGRAVITY</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

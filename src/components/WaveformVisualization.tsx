import React, { useEffect, useRef, useState } from 'react';
import { AudioEngine } from '../logic/AudioEngine';
import { useStore } from '../store';

interface WaveformVisualizationProps {
    sampleStart: number;
    sampleEnd: number;
    onWindowChange: (start: number, end: number) => void;
}

export const WaveformVisualization: React.FC<WaveformVisualizationProps> = ({
    sampleStart,
    sampleEnd,
    onWindowChange,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDraggingRef = useRef<'start' | 'end' | null>(null);
    const selectedSample = useStore(state => state.selectedSample);

    const [isLoading, setIsLoading] = useState(false);
    const lastDrawnSampleRef = useRef<string>('');

    const localStartRef = useRef(sampleStart);
    const localEndRef = useRef(sampleEnd);

    // Sync props to refs when not dragging
    useEffect(() => {
        if (!isDraggingRef.current) {
            localStartRef.current = sampleStart;
            localEndRef.current = sampleEnd;
            drawWaveform();
        }
    }, [sampleStart, sampleEnd]);

    useEffect(() => {
        // If sample URL changed, we're loading a new sample
        if (selectedSample !== lastDrawnSampleRef.current) {
            setIsLoading(true);
        }

        // Draw immediately
        drawWaveform();

        // Keep trying to draw every 100ms while loading
        const loadingInterval = setInterval(() => {
            if (isLoading) {
                drawWaveform();
            }
        }, 100);

        return () => {
            clearInterval(loadingInterval);
        };
    }, [selectedSample, isLoading]);

    const drawWaveform = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const buffer = AudioEngine.getInstance().getBuffer();

        if (!buffer || !buffer.loaded) {
            // Buffer not loaded yet - show loading message
            ctx.fillStyle = '#666';
            ctx.font = '12px Helvetica Neue, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('', canvas.width / 2, canvas.height / 2);
            setIsLoading(true);
            return;
        }

        // Buffer is loaded - check if it's the current sample
        // If we just finished loading, update our reference
        if (isLoading) {
            lastDrawnSampleRef.current = selectedSample;
            setIsLoading(false);
        }

        const width = canvas.width;
        const height = canvas.height;
        const data = buffer.getChannelData(0);

        // Draw waveform
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.beginPath();

        const step = Math.ceil(data.length / width);
        const amp = height / 2;

        for (let i = 0; i < width; i++) {
            const min = Math.min(...Array.from(data.slice(i * step, (i + 1) * step)));
            const max = Math.max(...Array.from(data.slice(i * step, (i + 1) * step)));

            if (i === 0) {
                ctx.moveTo(i, (1 + min) * amp);
            }
            ctx.lineTo(i, (1 + max) * amp);
            ctx.lineTo(i, (1 + min) * amp);
        }

        ctx.stroke();

        // Draw sample window overlay using local refs
        const startX = localStartRef.current * width;
        const endX = localEndRef.current * width;

        // Dimmed regions outside window
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, startX, height);
        ctx.fillRect(endX, 0, width - endX, height);

        // Markers - white
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        // Start marker
        ctx.beginPath();
        ctx.moveTo(startX, 0);
        ctx.lineTo(startX, height);
        ctx.stroke();

        // End marker
        ctx.beginPath();
        ctx.moveTo(endX, 0);
        ctx.lineTo(endX, height);
        ctx.stroke();
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isLoading) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;

        // Use rect.width (actual displayed width) not canvas.width (buffer width)
        const startX = localStartRef.current * rect.width;
        const endX = localEndRef.current * rect.width;

        if (Math.abs(x - startX) < 15) {
            isDraggingRef.current = 'start';
            e.preventDefault();
            e.stopPropagation();
        } else if (Math.abs(x - endX) < 15) {
            isDraggingRef.current = 'end';
            e.preventDefault();
            e.stopPropagation();
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDraggingRef.current || isLoading) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const normalized = Math.max(0, Math.min(1, x / rect.width));

        if (isDraggingRef.current === 'start') {
            localStartRef.current = Math.min(normalized, localEndRef.current - 0.01);
        } else if (isDraggingRef.current === 'end') {
            localEndRef.current = Math.max(normalized, localStartRef.current + 0.01);
        }

        drawWaveform();

        e.preventDefault();
        e.stopPropagation();
    };

    const handleMouseUp = () => {
        if (isDraggingRef.current) {
            onWindowChange(localStartRef.current, localEndRef.current);
            isDraggingRef.current = null;
        }
    };

    // Add global mouse event handlers for dragging outside canvas
    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current || isLoading) return;

            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const normalized = Math.max(0, Math.min(1, x / rect.width));

            if (isDraggingRef.current === 'start') {
                localStartRef.current = Math.min(normalized, localEndRef.current - 0.01);
            } else if (isDraggingRef.current === 'end') {
                localEndRef.current = Math.max(normalized, localStartRef.current + 0.01);
            }

            drawWaveform();
        };

        const handleGlobalMouseUp = () => {
            if (isDraggingRef.current) {
                onWindowChange(localStartRef.current, localEndRef.current);
                isDraggingRef.current = null;
            }
        };

        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', handleGlobalMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isLoading, onWindowChange]);

    return (
        <canvas
            ref={canvasRef}
            width={350}
            height={60}
            className="waveform-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isLoading ? 'wait' : 'ew-resize', width: '100%', height: '60px' }}
        />
    );
};

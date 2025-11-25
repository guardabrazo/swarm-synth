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

    const animationFrameRef = useRef<number | null>(null);

    // Sync props to refs when not dragging
    useEffect(() => {
        if (!isDraggingRef.current) {
            localStartRef.current = sampleStart;
            localEndRef.current = sampleEnd;
            scheduleDraw();
        }
    }, [sampleStart, sampleEnd]);

    useEffect(() => {
        // Poll for loading status
        const pollInterval = setInterval(() => {
            const engine = AudioEngine.getInstance();
            const buffer = engine.getBuffer();
            const engineLoading = engine.isLoading();

            // If engine is loading OR buffer is not loaded/ready
            if (engineLoading || !buffer || !buffer.loaded) {
                if (!isLoading) {
                    setIsLoading(true);
                    scheduleDraw();
                }
            } else {
                // Engine is done and buffer is ready
                if (isLoading) {
                    setIsLoading(false);
                    scheduleDraw();
                } else if (selectedSample !== lastDrawnSampleRef.current) {
                    lastDrawnSampleRef.current = selectedSample;
                    scheduleDraw();
                }
            }
        }, 100);

        return () => clearInterval(pollInterval);
    }, [selectedSample, isLoading]);

    // Trigger draw when loading state changes
    useEffect(() => {
        scheduleDraw();
    }, [isLoading]);

    // Handle resize
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width } = entry.contentRect;
                // Set internal resolution to match display size
                canvas.width = width;
                // Redraw after resize
                scheduleDraw();
            }
        });

        resizeObserver.observe(canvas);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    const scheduleDraw = () => {
        // Direct call to debug visibility
        // console.log('scheduleDraw called');
        drawWaveform();
    };

    const drawWaveform = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }

        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (isLoading) {
            ctx.fillStyle = '#999';
            ctx.font = '10px Helvetica Neue, sans-serif';
            ctx.textAlign = 'center';
            ctx.font
            ctx.textBaseline = 'middle';
            ctx.fillText('START AUDIO TO SEE WAVEFORM', canvas.width / 2, canvas.height / 2);
            return;
        }

        const buffer = AudioEngine.getInstance().getBuffer();
        if (!buffer || !buffer.loaded) {

            return;
        }

        const width = canvas.width;
        const height = canvas.height;
        const data = buffer.getChannelData(0);


        // Draw waveform - Optimized to avoid allocations
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.beginPath();

        const step = Math.ceil(data.length / width);
        const amp = height / 2;

        for (let i = 0; i < width; i++) {
            let min = 1.0;
            let max = -1.0;

            // Find min/max in this chunk without creating new arrays
            const startIdx = i * step;
            const endIdx = Math.min((i + 1) * step, data.length);

            for (let j = startIdx; j < endIdx; j++) {
                const val = data[j];
                if (val < min) min = val;
                if (val > max) max = val;
            }

            // Handle silence/empty chunks
            if (min > max) {
                min = 0;
                max = 0;
            }

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

        scheduleDraw();

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

            scheduleDraw();
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
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isLoading, onWindowChange]);

    return (
        <canvas
            ref={canvasRef}
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

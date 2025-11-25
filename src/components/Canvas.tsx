import React, { useEffect, useRef } from 'react';
import { SceneController } from '../logic/SceneController';

export const Canvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const controllerRef = useRef<SceneController | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const controller = new SceneController(canvasRef.current);
        controllerRef.current = controller;

        return () => {
            controller.dispose();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block' }}
        />
    );
};

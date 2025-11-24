import React, { useEffect, useRef } from 'react';
import { SceneController } from '../logic/SceneController';
import { useStore } from '../store';

export const Canvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const controllerRef = useRef<SceneController | null>(null);
    const setInteractionState = useStore((state) => state.setInteractionState);

    useEffect(() => {
        if (!canvasRef.current) return;

        const controller = new SceneController(canvasRef.current);
        controllerRef.current = controller;

        return () => {
            controller.dispose();
        };
    }, []);

    const handlePointerDown = () => {
        setInteractionState({ isDragging: true });
    };

    const handlePointerUp = () => {
        setInteractionState({ isDragging: false });
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (controllerRef.current) {
            controllerRef.current.handlePointerMove(e.nativeEvent);
        }
    };

    return (
        <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerMove={handlePointerMove}
            style={{ width: '100%', height: '100%', display: 'block' }}
        />
    );
};

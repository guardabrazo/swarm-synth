import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BoidSystem } from './BoidSystem';
import { useStore } from '../store';
import { AudioEngine } from './AudioEngine';
import { noise3D } from '../utils/noise';

export class SceneController {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    boidSystem: BoidSystem;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    interactionPlane: THREE.Plane;
    cursorMesh: THREE.Mesh;
    interactionCube: THREE.Mesh; // Invisible cube for raycasting
    noiseSphere: THREE.Mesh; // Sphere that moves with noise
    noiseTime: number = 0;

    private animationId: number | null = null;
    private unsubscribe: () => void;

    constructor(canvas: HTMLCanvasElement) {
        // Scene Setup
        this.scene = new THREE.Scene();
        // Transparent background to let CSS grid show through if we want, or keep black
        this.scene.background = null;

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 300;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Controls
        this.controls = new OrbitControls(this.camera, canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = false;

        // Wireframe Cube
        const cubeGeo = new THREE.BoxGeometry(200, 200, 200);
        const cubeEdges = new THREE.EdgesGeometry(cubeGeo);
        const cubeMat = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.2, transparent: true });
        const cube = new THREE.LineSegments(cubeEdges, cubeMat);
        this.scene.add(cube);

        // Invisible cube for raycasting (same size as wireframe)
        const interactionCubeGeo = new THREE.BoxGeometry(200, 200, 200);
        const interactionCubeMat = new THREE.MeshBasicMaterial({ visible: false });
        this.interactionCube = new THREE.Mesh(interactionCubeGeo, interactionCubeMat);
        this.scene.add(this.interactionCube);

        // Boid System
        this.boidSystem = new BoidSystem(this.scene, useStore.getState().boidCount);

        // Interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

        // Cursor Visual
        const cursorGeo = new THREE.SphereGeometry(2, 16, 16);
        const cursorMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.cursorMesh = new THREE.Mesh(cursorGeo, cursorMat);
        this.cursorMesh.visible = false;
        this.scene.add(this.cursorMesh);

        // Noise Sphere
        const sphereGeo = new THREE.SphereGeometry(8, 32, 32);
        const sphereMat = new THREE.MeshBasicMaterial({
            color: 0xffffff
        });
        this.noiseSphere = new THREE.Mesh(sphereGeo, sphereMat);
        this.noiseSphere.visible = false;
        this.scene.add(this.noiseSphere);

        // Axis Gizmo
        this.createAxisGizmo();

        // Bindings
        this.onWindowResize = this.onWindowResize.bind(this);
        window.addEventListener('resize', this.onWindowResize);

        // Store Subscriptions
        this.unsubscribe = useStore.subscribe((state) => {
            this.boidSystem.setCount(state.boidCount);
            this.boidSystem.setSeparation(state.separationForce);
            this.boidSystem.setAlignment(state.alignmentForce);
            this.boidSystem.setCohesion(state.cohesionForce);
            this.boidSystem.setMaxSpeed(state.maxSpeed);
            this.boidSystem.setFrequency(state.triggerFrequency);
            this.boidSystem.setShape(state.boidShape);

            const audio = AudioEngine.getInstance();
            audio.setReverb(state.reverbWet);
            audio.setVolume(state.masterVolume);
            audio.setScale(state.selectedScale);
            // Sample change is async, might need handling if we want to show loading state
            if (state.selectedSample) {
                // Handled by UI calling AudioEngine directly or here if needed
            }
        });

        // Initial State Sync
        const state = useStore.getState();
        const audio = AudioEngine.getInstance();
        audio.setReverb(state.reverbWet);
        audio.setVolume(state.masterVolume);
        audio.setScale(state.selectedScale);
        this.boidSystem.setSeparation(state.separationForce);
        this.boidSystem.setAlignment(state.alignmentForce);
        this.boidSystem.setCohesion(state.cohesionForce);
        this.boidSystem.setMaxSpeed(state.maxSpeed);
        this.boidSystem.setFrequency(state.triggerFrequency);
        this.boidSystem.setShape(state.boidShape);

        this.start();
    }

    start() {
        if (!this.animationId) {
            this.animate();
        }
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    animate = () => {
        this.animationId = requestAnimationFrame(this.animate);

        this.controls.update();

        // Update noise sphere
        const { noiseSphereEnabled, noiseSphereForce, noiseSphereSpeed } = useStore.getState();
        this.updateNoiseSphere(noiseSphereEnabled, noiseSphereForce, noiseSphereSpeed);

        // Interaction Logic
        const { interactionState, separationForce, alignmentForce, cohesionForce, maxSpeed, triggerFrequency } = useStore.getState();
        let target: THREE.Vector3 | null = null;

        if (interactionState.isDragging) {
            const cursorPos = new THREE.Vector3(
                interactionState.cursorPosition.x,
                interactionState.cursorPosition.y,
                interactionState.cursorPosition.z
            );

            // Check if we hit the cube with raycast
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObject(this.interactionCube);

            if (intersects.length > 0) {
                // We're clicking on/in the cube
                target = cursorPos;
                this.cursorMesh.position.copy(target);
                this.cursorMesh.visible = true;
            } else {
                this.cursorMesh.visible = false;
            }
        } else {
            this.cursorMesh.visible = false;
        }

        this.boidSystem.update(target, { separation: separationForce, alignment: alignmentForce, cohesion: cohesionForce, maxSpeed, frequency: triggerFrequency },
            noiseSphereEnabled ? this.noiseSphere.position : null, noiseSphereForce);

        this.renderer.render(this.scene, this.camera);
    };

    updateNoiseSphere(enabled: boolean, force: number, speed: number) {
        if (!enabled) {
            this.noiseSphere.visible = false;
            return;
        }

        this.noiseSphere.visible = true;

        // Move sphere using 3D Perlin noise
        this.noiseTime += 0.001 + (speed * 0.01); // Speed controlled by slider
        const scale = 0.3; // Frequency of noise

        const x = noise3D.noise(this.noiseTime * scale, 0, 0) * 250; // Increased range
        const y = noise3D.noise(0, this.noiseTime * scale, 100) * 250;
        const z = noise3D.noise(100, 0, this.noiseTime * scale) * 250;

        this.noiseSphere.position.set(x, y, z);
    }

    createAxisGizmo() {
        const gizmoGroup = new THREE.Group();
        // Position closer to corner (-100, -100, 100)
        gizmoGroup.position.set(-105, -105, 105);
        this.scene.add(gizmoGroup);

        const axisLength = 25; // Smaller
        const arrowHeadLength = 4;
        const arrowHeadWidth = 2;
        const color = 0x444444; // Dimmer grey

        // Helper to create arrow
        const createArrow = (dir: THREE.Vector3, origin: THREE.Vector3, length: number, color: number) => {
            return new THREE.ArrowHelper(dir, origin, length, color, arrowHeadLength, arrowHeadWidth);
        };

        // X Axis (Pan)
        const xAxis = createArrow(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), axisLength, color);
        gizmoGroup.add(xAxis);

        // Y Axis (Pitch)
        const yAxis = createArrow(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), axisLength, color);
        gizmoGroup.add(yAxis);

        // Z Axis (Start)
        const zAxis = createArrow(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0, 0), axisLength, color);
        gizmoGroup.add(zAxis);

        // Labels using Mesh + PlaneGeometry for alignment
        const createLabel = (text: string, position: THREE.Vector3, rotation: THREE.Euler) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) return null;

            canvas.width = 128;
            canvas.height = 64;

            context.fillStyle = 'rgba(0,0,0,0)'; // Transparent
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.font = 'bold 24px Helvetica, Arial, sans-serif';
            context.fillStyle = '#444444'; // Dimmer text
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(text, canvas.width / 2, canvas.height / 2);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide // Visible from both sides
            });

            const geometry = new THREE.PlaneGeometry(15, 7.5); // Match previous scale
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.copy(position);
            mesh.rotation.copy(rotation);

            return mesh;
        };

        // X Label: PAN (Aligned with X axis)
        // Default plane is XY. To align text along X, we can keep it on XY or XZ.
        // Let's put it "above" the axis on the XY plane.
        // No rotation needed for XY plane alignment if text runs along X.
        const xLabel = createLabel('PAN', new THREE.Vector3(axisLength + 5, 0, 0), new THREE.Euler(0, 0, 0));
        if (xLabel) gizmoGroup.add(xLabel);

        // Y Label: PITCH (Aligned with Y axis)
        // Text needs to run along Y. Rotate 90 deg around Z.
        const yLabel = createLabel('PITCH', new THREE.Vector3(0, axisLength + 5, 0), new THREE.Euler(0, 0, Math.PI / 2));
        if (yLabel) gizmoGroup.add(yLabel);

        // Z Label: START (Aligned with Z axis)
        // Text needs to run along Z. Rotate 90 deg around Y.
        const zLabel = createLabel('START', new THREE.Vector3(0, 0, -axisLength - 5), new THREE.Euler(0, Math.PI / 2, 0));
        if (zLabel) gizmoGroup.add(zLabel);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Interaction Handlers called from React component
    handlePointerMove(event: PointerEvent) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Raycast against the interaction cube
        const intersects = this.raycaster.intersectObject(this.interactionCube);

        if (intersects.length > 0) {
            // Hit the cube - use intersection point
            const hit = intersects[0].point;
            useStore.getState().setInteractionState({
                cursorPosition: { x: hit.x, y: hit.y, z: hit.z }
            });
        } else {
            // Didn't hit cube - use plane intersection as fallback
            const target = new THREE.Vector3();
            this.raycaster.ray.intersectPlane(this.interactionPlane, target);

            if (target) {
                useStore.getState().setInteractionState({
                    cursorPosition: { x: target.x, y: target.y, z: target.z }
                });
            }
        }
    }

    dispose() {
        this.stop();
        window.removeEventListener('resize', this.onWindowResize);
        this.unsubscribe();
        this.boidSystem.dispose();
        this.renderer.dispose();
    }
}

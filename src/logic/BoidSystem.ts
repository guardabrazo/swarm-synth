import * as THREE from 'three';
import { AudioEngine } from './AudioEngine';

class Boid {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    acceleration: THREE.Vector3;
    maxForce: number;
    maxSpeed: number;
    mesh: THREE.Mesh;
    cooldown: number;
    maxCooldown: number;

    constructor(mesh: THREE.Mesh) {
        this.position = new THREE.Vector3(
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200
        );
        this.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
        );
        this.acceleration = new THREE.Vector3();
        this.maxSpeed = 2.0;
        this.maxForce = 0.05;
        this.mesh = mesh;

        // Randomize initial cooldown to prevent synchronization
        this.maxCooldown = 120;
        this.cooldown = Math.random() * this.maxCooldown;
    }

    update(bounds: number, frequency: number) {
        this.velocity.add(this.acceleration);
        this.velocity.clampLength(0, this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.set(0, 0, 0);

        // Toroidal wrapping
        if (this.position.x > bounds) this.position.x = -bounds;
        if (this.position.x < -bounds) this.position.x = bounds;
        if (this.position.y > bounds) this.position.y = -bounds;
        if (this.position.y < -bounds) this.position.y = bounds;
        if (this.position.z > bounds) this.position.z = -bounds;
        if (this.position.z < -bounds) this.position.z = bounds;

        // Update mesh
        this.mesh.position.copy(this.position);

        // Orient mesh to face velocity
        const target = this.position.clone().add(this.velocity);
        this.mesh.lookAt(target);
        // Rotate 90 degrees on X because ConeGeometry points up by default
        // For Sphere it doesn't matter, for Line (Cylinder) it might need adjustment depending on geometry
        // Assuming Cone/Cylinder are Y-up
        this.mesh.rotateX(Math.PI / 2);

        // Handle Cooldown & Trigger
        // Frequency 0 -> Slowest (e.g. maxCooldown = 300)
        // Frequency 1 -> Fastest (e.g. maxCooldown = 30)
        const minCD = 30;
        const maxCD = 300;
        this.maxCooldown = maxCD - (frequency * (maxCD - minCD));

        this.cooldown--;
        if (this.cooldown <= 0) {
            this.trigger();
        }

        // Color decay
        const material = this.mesh.material as THREE.MeshBasicMaterial;
        // Fade from White (1,1,1) to Dark Gray (0.13, 0.13, 0.13) -> 0x222222
        // 0x22 is approx 0.13
        const baseColor = 0.13;

        if (material.color.r > baseColor) {
            material.color.r -= 0.05;
            if (material.color.r < baseColor) material.color.r = baseColor;
        }
        if (material.color.g > baseColor) {
            material.color.g -= 0.05;
            if (material.color.g < baseColor) material.color.g = baseColor;
        }
        if (material.color.b > baseColor) {
            material.color.b -= 0.05;
            if (material.color.b < baseColor) material.color.b = baseColor;
        }

        // Fade out when near bounds, fade in when inside
        const fadeDistance = 10; // Start fading 10 units from edge
        const distanceFromEdge = Math.min(
            bounds - Math.abs(this.position.x),
            bounds - Math.abs(this.position.y),
            bounds - Math.abs(this.position.z)
        );

        if (distanceFromEdge < fadeDistance) {
            // Fade out as approaching edge
            material.opacity = Math.max(0, distanceFromEdge / fadeDistance);
        } else {
            // Fade in when inside
            material.opacity = Math.min(1, material.opacity + 0.05);
        }
    }

    trigger() {
        // Reset cooldown with significant randomness to prevent wave effect
        // Base cooldown is maxCooldown, add +/- 50% variation
        const variation = this.maxCooldown * 0.5;
        this.cooldown = this.maxCooldown + (Math.random() * variation * 2 - variation);

        // Visual Flash
        const material = this.mesh.material as THREE.MeshBasicMaterial;
        material.color.setHex(0xffffff); // White

        // Audio Trigger
        AudioEngine.getInstance().triggerGrain(this.position, this.velocity.length());
    }

    applyForce(force: THREE.Vector3) {
        this.acceleration.add(force);
    }

    flock(boids: Boid[], target: THREE.Vector3 | null, sepWeight: number, aliWeight: number, cohWeight: number) {
        const sep = this.separate(boids);
        const ali = this.align(boids);
        const coh = this.cohesion(boids);

        sep.multiplyScalar(sepWeight);
        ali.multiplyScalar(aliWeight);
        coh.multiplyScalar(cohWeight);

        this.applyForce(sep);
        this.applyForce(ali);
        this.applyForce(coh);

        if (target) {
            const att = this.seek(target);
            att.multiplyScalar(2.0); // Strong attraction
            this.applyForce(att);
        }
    }

    seek(target: THREE.Vector3): THREE.Vector3 {
        const desired = new THREE.Vector3().subVectors(target, this.position);
        desired.normalize();
        desired.multiplyScalar(this.maxSpeed);
        const steer = new THREE.Vector3().subVectors(desired, this.velocity);
        steer.clampLength(0, this.maxForce);
        return steer;
    }

    separate(boids: Boid[]): THREE.Vector3 {
        const desiredSeparation = 25.0;
        const steer = new THREE.Vector3();
        let count = 0;

        for (const other of boids) {
            const d = this.position.distanceTo(other.position);
            if ((d > 0) && (d < desiredSeparation)) {
                const diff = new THREE.Vector3().subVectors(this.position, other.position);
                diff.normalize();
                diff.divideScalar(d);
                steer.add(diff);
                count++;
            }
        }

        if (count > 0) {
            steer.divideScalar(count);
        }

        if (steer.length() > 0) {
            steer.normalize();
            steer.multiplyScalar(this.maxSpeed);
            steer.sub(this.velocity);
            steer.clampLength(0, this.maxForce);
        }
        return steer;
    }

    align(boids: Boid[]): THREE.Vector3 {
        const neighborDist = 50.0;
        const sum = new THREE.Vector3();
        let count = 0;

        for (const other of boids) {
            const d = this.position.distanceTo(other.position);
            if ((d > 0) && (d < neighborDist)) {
                sum.add(other.velocity);
                count++;
            }
        }

        if (count > 0) {
            sum.divideScalar(count);
            sum.normalize();
            sum.multiplyScalar(this.maxSpeed);
            const steer = new THREE.Vector3().subVectors(sum, this.velocity);
            steer.clampLength(0, this.maxForce);
            return steer;
        }
        return new THREE.Vector3();
    }

    cohesion(boids: Boid[]): THREE.Vector3 {
        const neighborDist = 50.0;
        const sum = new THREE.Vector3();
        let count = 0;

        for (const other of boids) {
            const d = this.position.distanceTo(other.position);
            if ((d > 0) && (d < neighborDist)) {
                sum.add(other.position);
                count++;
            }
        }

        if (count > 0) {
            sum.divideScalar(count);
            return this.seek(sum);
        }
        return new THREE.Vector3();
    }
}

export class BoidSystem {
    boids: Boid[] = [];
    scene: THREE.Scene;
    bounds: number = 100; // Matches cube half-size (200x200x200)

    currentShape: string = 'cone';
    currentGeometry: THREE.BufferGeometry;

    // Simulation Parameters
    separationWeight: number = 1.5;
    alignmentWeight: number = 1.0;
    cohesionWeight: number = 1.0;
    maxSpeed: number = 2.0;
    triggerFrequency: number = 0.5;

    constructor(scene: THREE.Scene, count: number) {
        this.scene = scene;
        this.currentGeometry = new THREE.ConeGeometry(2, 8, 8);
        this.setCount(count);
    }

    setCount(count: number) {
        const currentCount = this.boids.length;

        if (count > currentCount) {
            // Add boids with correct material type based on current shape
            for (let i = currentCount; i < count; i++) {
                let object: THREE.Object3D;

                if (this.currentShape === 'line') {
                    const lineMaterial = new THREE.LineBasicMaterial({
                        color: 0x222222,
                        linewidth: 3,
                        transparent: true,
                        opacity: 1.0
                    });
                    object = new THREE.Line(this.currentGeometry, lineMaterial);
                } else {
                    const meshMaterial = new THREE.MeshBasicMaterial({
                        color: 0x222222,
                        transparent: true,
                        opacity: 1.0
                    });
                    object = new THREE.Mesh(this.currentGeometry, meshMaterial);
                }

                this.scene.add(object);
                this.boids.push(new Boid(object as THREE.Mesh));
            }
        } else if (count < currentCount) {
            // Remove boids
            const toRemove = currentCount - count;
            for (let i = 0; i < toRemove; i++) {
                const boid = this.boids.pop();
                if (boid) {
                    this.scene.remove(boid.mesh);
                    (boid.mesh.material as THREE.Material).dispose();
                }
            }
        }
    }

    setShape(shape: string) {
        if (this.currentShape === shape) return;

        this.currentShape = shape;

        // Store old geometry to dispose later
        const oldGeometry = this.currentGeometry;

        // Create new geometry
        let newGeometry: THREE.BufferGeometry;
        let isLine = false;

        switch (shape) {
            case 'sphere':
                newGeometry = new THREE.SphereGeometry(2, 8, 8);
                break;
            case 'line':
                // Create a line with thickness using BufferGeometry
                const lineGeometry = new THREE.BufferGeometry();
                const lineVertices = new Float32Array([
                    0, -5, 0,  // start
                    0, 5, 0    // end
                ]);
                lineGeometry.setAttribute('position', new THREE.BufferAttribute(lineVertices, 3));
                newGeometry = lineGeometry;
                isLine = true;
                break;
            case 'cone':
            default:
                newGeometry = new THREE.ConeGeometry(2, 8, 8);
                break;
        }

        this.currentGeometry = newGeometry;

        // Recreate all boid meshes with new geometry
        for (const boid of this.boids) {
            const oldMesh = boid.mesh;
            const position = oldMesh.position.clone();
            const rotation = oldMesh.rotation.clone();
            const oldMaterial = oldMesh.material as THREE.MeshBasicMaterial;
            const color = oldMaterial.color.clone();

            // Remove old mesh
            this.scene.remove(oldMesh);
            if (oldMesh.geometry !== oldGeometry) {
                oldMesh.geometry.dispose();
            }
            oldMaterial.dispose();

            // Create new mesh/line with appropriate material
            let newObject: THREE.Object3D;

            if (isLine) {
                const lineMaterial = new THREE.LineBasicMaterial({
                    color: color,
                    linewidth: 3,
                    transparent: true,
                    opacity: 1.0
                });
                newObject = new THREE.Line(newGeometry, lineMaterial);
            } else {
                const meshMaterial = new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: 1.0
                });
                newObject = new THREE.Mesh(newGeometry, meshMaterial);
            }

            newObject.position.copy(position);
            newObject.rotation.copy(rotation);

            // Add to scene
            this.scene.add(newObject);

            // Update boid reference
            boid.mesh = newObject as THREE.Mesh;
        }

        // Dispose old geometry
        oldGeometry.dispose();
    }

    setSeparation(weight: number) { this.separationWeight = weight; }
    setAlignment(weight: number) { this.alignmentWeight = weight; }
    setCohesion(weight: number) { this.cohesionWeight = weight; }
    setMaxSpeed(speed: number) { this.maxSpeed = speed; }
    setFrequency(freq: number) { this.triggerFrequency = freq; }

    update(target: THREE.Vector3 | null, forces: { separation: number, alignment: number, cohesion: number, maxSpeed: number, frequency: number },
        noiseSpherePosition: THREE.Vector3 | null = null, noiseSphereForce: number = 0) {
        for (const boid of this.boids) {
            // Apply flocking rules
            const sep = boid.separate(this.boids).multiplyScalar(forces.separation);
            const ali = boid.align(this.boids).multiplyScalar(forces.alignment);
            const coh = boid.cohesion(this.boids).multiplyScalar(forces.cohesion);

            boid.acceleration.add(sep);
            boid.acceleration.add(ali);
            boid.acceleration.add(coh);

            // Apply attraction to mouse cursor
            if (target) {
                const desired = new THREE.Vector3().subVectors(target, boid.position);
                const d = desired.length();
                if (d > 0 && d < 150) {
                    desired.normalize();
                    const strength = (1 - d / 150) * 0.15;
                    desired.multiplyScalar(strength);
                    boid.acceleration.add(desired);
                }
            }

            // Apply noise sphere force (attract if positive, repel if negative)
            if (noiseSpherePosition) {
                const toSphere = new THREE.Vector3().subVectors(noiseSpherePosition, boid.position);
                const d = toSphere.length();
                if (d > 0 && d < 200) {
                    toSphere.normalize();
                    // Positive force = attraction, negative = repulsion
                    const strength = noiseSphereForce * (1 - d / 200) * 0.1;
                    toSphere.multiplyScalar(strength);
                    boid.acceleration.add(toSphere);
                }
            }

            // Update boid with frequency
            boid.maxSpeed = forces.maxSpeed;
            boid.update(this.bounds, forces.frequency);
        }
    }

    dispose() {
        this.setCount(0);
        this.currentGeometry.dispose();
    }
}

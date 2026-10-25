/**
 * Particles.js - Particle Systems for Sparkles, Dust, Leaves & Speed Lines
 */

class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.fallingLeaves = [];
        this.initFallingLeaves();
    }

    initFallingLeaves() {
        // Ambient falling leaves in the jungle temple
        const leafGeo = new THREE.PlaneGeometry(0.3, 0.45);
        const leafMat = new THREE.MeshBasicMaterial({
            color: 0x4CAF50,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.75
        });

        this.leafGroup = new THREE.Group();
        this.scene.add(this.leafGroup);

        for (let i = 0; i < 40; i++) {
            const leaf = new THREE.Mesh(leafGeo, leafMat.clone());
            leaf.material.color.setHex([0x4CAF50, 0x8BC34A, 0xC6FF00, 0x8D6E63][i % 4]);
            leaf.position.set(
                (Math.random() - 0.5) * 40,
                5 + Math.random() * 15,
                (Math.random() - 0.5) * 80
            );
            leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            leaf.userData = {
                rotSpeedX: (Math.random() - 0.5) * 2.0,
                rotSpeedY: (Math.random() - 0.5) * 2.0,
                fallSpeed: 1.5 + Math.random() * 2.0,
                swaySpeed: 1.0 + Math.random() * 2.0,
                swayAmount: 0.5 + Math.random() * 1.0,
                seed: Math.random() * 10
            };
            this.leafGroup.add(leaf);
            this.fallingLeaves.push(leaf);
        }
    }

    spawnCoinSparkle(x, y, z) {
        const count = 14;
        const geo = new THREE.SphereGeometry(0.08, 4, 4);
        const mat = new THREE.MeshBasicMaterial({ color: 0xFFEB3B });

        for (let i = 0; i < count; i++) {
            const p = new THREE.Mesh(geo, mat);
            p.position.set(x, y, z);
            const angle = Math.random() * Math.PI * 2;
            const elevation = (Math.random() - 0.5) * Math.PI;
            const speed = 4.0 + Math.random() * 5.0;

            p.userData = {
                vx: Math.cos(angle) * Math.cos(elevation) * speed,
                vy: Math.sin(elevation) * speed + 2.0,
                vz: Math.sin(angle) * Math.cos(elevation) * speed,
                life: 0.45,
                maxLife: 0.45
            };
            this.scene.add(p);
            this.particles.push(p);
        }
    }

    spawnDust(x, y, z, count = 5) {
        const geo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
        const mat = new THREE.MeshBasicMaterial({ color: 0xBAAFA0, transparent: true, opacity: 0.6 });

        for (let i = 0; i < count; i++) {
            const p = new THREE.Mesh(geo, mat);
            p.position.set(x + (Math.random() - 0.5) * 0.4, y + 0.1, z + (Math.random() - 0.5) * 0.4);
            p.userData = {
                vx: (Math.random() - 0.5) * 1.5,
                vy: 0.8 + Math.random() * 1.2,
                vz: (Math.random() - 0.5) * 1.5,
                life: 0.35,
                maxLife: 0.35
            };
            this.scene.add(p);
            this.particles.push(p);
        }
    }

    spawnImpactSparks(x, y, z) {
        const count = 20;
        const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00FF88 });

        for (let i = 0; i < count; i++) {
            const p = new THREE.Mesh(geo, mat);
            p.position.set(x, y, z);
            const speed = 6.0 + Math.random() * 6.0;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            p.userData = {
                vx: Math.sin(phi) * Math.cos(theta) * speed,
                vy: Math.cos(phi) * speed,
                vz: Math.sin(phi) * Math.sin(theta) * speed,
                life: 0.5,
                maxLife: 0.5
            };
            this.scene.add(p);
            this.particles.push(p);
        }
    }

    update(delta, playerPos) {
        // Update transient particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.userData.life -= delta;

            if (p.userData.life <= 0) {
                this.scene.remove(p);
                this.particles.splice(i, 1);
                continue;
            }

            p.position.x += p.userData.vx * delta;
            p.position.y += p.userData.vy * delta;
            p.position.z += p.userData.vz * delta;
            p.userData.vy -= 12.0 * delta; // Gravity

            const progress = p.userData.life / p.userData.maxLife;
            p.scale.setScalar(progress);
        }

        // Update ambient leaves around player
        if (playerPos) {
            const time = performance.now() * 0.001;
            for (const leaf of this.fallingLeaves) {
                const u = leaf.userData;
                leaf.position.y -= u.fallSpeed * delta;
                leaf.position.x += Math.sin(time * u.swaySpeed + u.seed) * u.swayAmount * delta;
                leaf.rotation.x += u.rotSpeedX * delta;
                leaf.rotation.y += u.rotSpeedY * delta;

                // Reposition when fallen below ground or too far from player
                if (leaf.position.y < 0 || Math.abs(leaf.position.z - playerPos.z) > 45) {
                    leaf.position.y = 8 + Math.random() * 8;
                    leaf.position.x = playerPos.x + (Math.random() - 0.5) * 35;
                    leaf.position.z = playerPos.z + (Math.random() - 0.5) * 40;
                }
            }
        }
    }

    clear() {
        for (const p of this.particles) {
            this.scene.remove(p);
        }
        this.particles = [];
    }
}

window.ParticleSystem = ParticleSystem;

/**
 * Pursuer.js - Original 3D Temple Guardian Beast (Demon Ape)
 * Pursues behind the runner and lunges forward when mistakes occur.
 */

class Pursuer {
    constructor() {
        this.group = new THREE.Group();
        this.threatDistance = 3.8;  // Close follow distance when active
        this.retreatDistance = 18.0; // Distance when retreating out of view
        this.currentDistance = this.retreatDistance;
        this.targetDistance = this.retreatDistance;
        this.threatLevel = 0; // 0 = hidden/retreating, 1 = active chase (5s), 2 = catching
        this.showTimer = 0;
        this.animTime = 0;
        this.roarCooldown = 0;

        // Hidden by default; appears at start and on obstacle collisions for 5 seconds
        this.group.visible = false;

        this.buildModel();
    }

    buildModel() {
        // Materials for dark obsidian stone beast
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0x1A1A1E }); // Dark charcoal/slate
        const stoneSpikeMat = new THREE.MeshLambertMaterial({ color: 0x2C2D35 });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xFF1744 }); // Fiery glowing crimson red
        const fangMat = new THREE.MeshLambertMaterial({ color: 0xE0E0E0 });

        // Root pelvis / body node
        this.body = new THREE.Group();
        this.body.position.y = 1.3;
        this.group.add(this.body);

        // Muscular hunchback chest
        const chestGeo = new THREE.BoxGeometry(1.2, 1.1, 0.9);
        const chestMesh = new THREE.Mesh(chestGeo, bodyMat);
        chestMesh.position.y = 0.45;
        this.body.add(chestMesh);

        // Spiked shoulder pads
        const spikeGeo = new THREE.ConeGeometry(0.2, 0.45, 4);
        spikeGeo.rotateX(Math.PI / 2);

        const leftSpike = new THREE.Mesh(spikeGeo, stoneSpikeMat);
        leftSpike.position.set(-0.7, 0.9, -0.1);
        leftSpike.rotation.z = 0.5;
        this.body.add(leftSpike);

        const rightSpike = new THREE.Mesh(spikeGeo, stoneSpikeMat);
        rightSpike.position.set(0.7, 0.9, -0.1);
        rightSpike.rotation.z = -0.5;
        this.body.add(rightSpike);

        // Head with fangs and horns
        this.head = new THREE.Group();
        this.head.position.set(0, 0.85, 0.5);
        this.body.add(this.head);

        const headGeo = new THREE.BoxGeometry(0.75, 0.65, 0.7);
        const headMesh = new THREE.Mesh(headGeo, bodyMat);
        this.head.add(headMesh);

        // Jagged Horns
        const hornGeo = new THREE.ConeGeometry(0.12, 0.5, 4);
        const leftHorn = new THREE.Mesh(hornGeo, stoneSpikeMat);
        leftHorn.position.set(-0.35, 0.45, -0.1);
        leftHorn.rotation.z = 0.4;
        this.head.add(leftHorn);

        const rightHorn = new THREE.Mesh(hornGeo, stoneSpikeMat);
        rightHorn.position.set(0.35, 0.45, -0.1);
        rightHorn.rotation.z = -0.4;
        this.head.add(rightHorn);

        // Glowing Crimson Red Eyes
        const eyeGeo = new THREE.BoxGeometry(0.14, 0.08, 0.08);
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.2, 0.1, 0.38);
        this.head.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.2, 0.1, 0.38);
        this.head.add(rightEye);

        // Snarl jaw & fangs
        const jawGeo = new THREE.BoxGeometry(0.55, 0.22, 0.4);
        const jawMesh = new THREE.Mesh(jawGeo, bodyMat);
        jawMesh.position.set(0, -0.22, 0.25);
        this.head.add(jawMesh);

        const fangGeo = new THREE.ConeGeometry(0.06, 0.16, 4);
        const leftFang = new THREE.Mesh(fangGeo, fangMat);
        leftFang.position.set(-0.18, -0.15, 0.42);
        leftFang.rotation.x = Math.PI;
        this.head.add(leftFang);

        const rightFang = new THREE.Mesh(fangGeo, fangMat);
        rightFang.position.set(0.18, -0.15, 0.42);
        rightFang.rotation.x = Math.PI;
        this.head.add(rightFang);

        // Massive Ape Forearms
        this.leftArm = new THREE.Group();
        this.leftArm.position.set(-0.75, 0.8, 0.2);
        this.body.add(this.leftArm);

        const leftArmGeo = new THREE.BoxGeometry(0.35, 1.1, 0.38);
        const leftArmMesh = new THREE.Mesh(leftArmGeo, bodyMat);
        leftArmMesh.position.y = -0.55;
        this.leftArm.add(leftArmMesh);

        const leftClawGeo = new THREE.BoxGeometry(0.38, 0.3, 0.45);
        const leftClawMesh = new THREE.Mesh(leftClawGeo, stoneSpikeMat);
        leftClawMesh.position.set(0, -1.15, 0.05);
        this.leftArm.add(leftClawMesh);

        this.rightArm = new THREE.Group();
        this.rightArm.position.set(0.75, 0.8, 0.2);
        this.body.add(this.rightArm);

        const rightArmGeo = new THREE.BoxGeometry(0.35, 1.1, 0.38);
        const rightArmMesh = new THREE.Mesh(rightArmGeo, bodyMat);
        rightArmMesh.position.y = -0.55;
        this.rightArm.add(rightArmMesh);

        const rightClawGeo = new THREE.BoxGeometry(0.38, 0.3, 0.45);
        const rightClawMesh = new THREE.Mesh(rightClawGeo, stoneSpikeMat);
        rightClawMesh.position.set(0, -1.15, 0.05);
        this.rightArm.add(rightClawMesh);

        // Powerful Hind Legs
        this.leftLeg = new THREE.Group();
        this.leftLeg.position.set(-0.45, 0, -0.2);
        this.body.add(this.leftLeg);

        const leftLegGeo = new THREE.BoxGeometry(0.35, 0.75, 0.35);
        const leftLegMesh = new THREE.Mesh(leftLegGeo, bodyMat);
        leftLegMesh.position.y = -0.38;
        this.leftLeg.add(leftLegMesh);

        this.rightLeg = new THREE.Group();
        this.rightLeg.position.set(0.45, 0, -0.2);
        this.body.add(this.rightLeg);

        const rightLegGeo = new THREE.BoxGeometry(0.35, 0.75, 0.35);
        const rightLegMesh = new THREE.Mesh(rightLegGeo, bodyMat);
        rightLegMesh.position.y = -0.38;
        this.rightLeg.add(rightLegMesh);

        this.group.traverse((c) => {
            if (c.isMesh) {
                c.castShadow = true;
            }
        });
    }

    showForSeconds(seconds = 5.0) {
        this.showTimer = seconds;
        this.threatLevel = 1;
        this.group.visible = true;
        this.targetDistance = this.threatDistance;
        if (this.currentDistance > 6.0) {
            this.currentDistance = 4.8;
        }
    }

    onPlayerStumble() {
        // Monster lunges forward close on player stumble and stays for 5 seconds
        this.showTimer = 5.0;
        this.threatLevel = 1;
        this.group.visible = true;
        this.targetDistance = 2.1; // Surges very close to player's heels
        if (this.currentDistance > 4.5) {
            this.currentDistance = 4.0;
        }
        if (window.soundSystem) {
            window.soundSystem.playRoar();
        }
    }

    onPlayerCatch() {
        this.threatLevel = 2;
        this.showTimer = 999;
        this.group.visible = true;
        this.targetDistance = 0.5; // Catch player
    }

    update(delta, playerPosition, runSpeed) {
        if (!this.group.visible && this.showTimer <= 0) return;

        this.animTime += delta * (runSpeed / 10.0);
        this.roarCooldown -= delta;

        // Count down the 5-second timer
        if (this.showTimer > 0) {
            this.showTimer -= delta;
            if (this.showTimer <= 0) {
                // 5 seconds elapsed without another hit: retreat into mist
                this.threatLevel = 0;
                this.targetDistance = this.retreatDistance;
            }
        }

        // Interpolate distance smoothly
        this.currentDistance += (this.targetDistance - this.currentDistance) * Math.min(1.0, delta * 3.5);

        // Hide completely once retreated out of camera frame
        if (this.threatLevel === 0 && this.currentDistance > 12.0) {
            this.group.visible = false;
        }

        // Beast quadruped running animation
        const t = this.animTime * 11.0;
        const armCycle = Math.sin(t) * 0.9;
        const legCycle = -armCycle;

        this.leftArm.rotation.x = armCycle;
        this.rightArm.rotation.x = -armCycle;
        this.leftLeg.rotation.x = legCycle * 0.7;
        this.rightLeg.rotation.x = -legCycle * 0.7;

        this.body.position.y = 1.3 + Math.abs(Math.sin(t * 2.0)) * 0.15;
        this.head.rotation.x = -0.2 + Math.sin(t) * 0.1;

        if (this.threatLevel > 0 && this.roarCooldown <= 0) {
            this.roarCooldown = 6.0;
            if (window.soundSystem) {
                window.soundSystem.playRoar();
            }
        }
    }

    reset() {
        this.threatLevel = 0;
        this.showTimer = 0;
        this.currentDistance = this.retreatDistance;
        this.targetDistance = this.retreatDistance;
        this.roarCooldown = 0;
        this.group.visible = false;
    }
}

window.Pursuer = Pursuer;

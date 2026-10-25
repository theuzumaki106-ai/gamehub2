/**
 * Character.js - Low Poly 3D Runner Model matching the reference design:
 * Simple, clean, game-ready stylized character in dark teal tracksuit with white side stripes,
 * warm skin tones, brown boxy hat with hair, and white sneakers.
 */

class Character {
    constructor() {
        this.group = new THREE.Group();
        this.currentAnimation = 'run';
        this.animTime = 0;
        
        // Physics & Lane properties
        this.currentLane = 0; // -1 = Left, 0 = Center, 1 = Right
        this.laneWidth = 2.0;
        this.targetX = 0;
        this.posX = 0;
        this.posY = 0;
        this.posZ = 0;
        
        // Vertical jumping & sliding
        this.velocityY = 0;
        this.gravity = -48;
        this.jumpForce = 15.5;
        this.isGrounded = true;
        this.isSliding = false;
        this.slideDuration = 0.8;
        this.slideTimer = 0;
        
        // Collision dimensions
        this.normalHeight = 1.9;
        this.slideHeight = 0.75;
        this.colliderHeight = this.normalHeight;
        this.colliderRadius = 0.55;

        // Visual FX attached to character
        this.shieldMesh = null;
        this.magnetFX = null;
        this.boostFX = null;

        this.buildModel();
        this.buildPowerupEffects();
    }

    buildModel() {
        // Precise Color Palette from Reference Image:
        // Dark Teal (#206764), White (#FFFFFF), Warm Skin (#F0C096), Brown Hat & Hair (#6D4C41)
        const tealMat = new THREE.MeshLambertMaterial({ color: 0x206764 });
        const whiteMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const skinMat = new THREE.MeshLambertMaterial({ color: 0xF0C096 });
        const hatMat = new THREE.MeshLambertMaterial({ color: 0x6D4C41 });
        const hatBandMat = new THREE.MeshLambertMaterial({ color: 0x3E2723 });
        const hairMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
        const soleMat = new THREE.MeshLambertMaterial({ color: 0xCFD8DC });
        const goldMat = new THREE.MeshStandardMaterial({ 
            color: 0xFFD700, 
            roughness: 0.25, 
            metalness: 0.85,
            emissive: 0x443300
        });

        // ================= ROOT / PELVIS =================
        this.pelvis = new THREE.Group();
        this.pelvis.position.y = 1.05;
        this.group.add(this.pelvis);

        // Hips (Teal Tracksuit)
        const hipsGeo = new THREE.BoxGeometry(0.52, 0.26, 0.34);
        const hipsMesh = new THREE.Mesh(hipsGeo, tealMat);
        this.pelvis.add(hipsMesh);

        // Golden Idol artifact token at side hip
        const idolGeo = new THREE.BoxGeometry(0.14, 0.20, 0.12);
        this.idolMesh = new THREE.Mesh(idolGeo, goldMat);
        this.idolMesh.position.set(0.28, -0.02, 0.06);
        this.idolMesh.rotation.z = -0.15;
        this.pelvis.add(this.idolMesh);

        // ================= TORSO =================
        this.torso = new THREE.Group();
        this.torso.position.y = 0.18;
        this.pelvis.add(this.torso);

        // Main Jacket Body (Teal Tracksuit Jacket)
        const torsoGeo = new THREE.BoxGeometry(0.56, 0.62, 0.36);
        const torsoMesh = new THREE.Mesh(torsoGeo, tealMat);
        torsoMesh.position.y = 0.31;
        this.torso.add(torsoMesh);

        // Front Center White Zipper Stripe
        const zipperGeo = new THREE.BoxGeometry(0.04, 0.58, 0.37);
        const zipperMesh = new THREE.Mesh(zipperGeo, whiteMat);
        zipperMesh.position.set(0, 0.31, 0.005);
        this.torso.add(zipperMesh);

        // ================= HEAD & HAT =================
        this.head = new THREE.Group();
        this.head.position.y = 0.68;
        this.torso.add(this.head);

        // Cubic Head Block (Warm Skin Tone)
        const headGeo = new THREE.BoxGeometry(0.38, 0.38, 0.36);
        const headMesh = new THREE.Mesh(headGeo, skinMat);
        headMesh.position.y = 0.19;
        this.head.add(headMesh);

        // Hair block underneath hat (sides and back)
        const hairGeo = new THREE.BoxGeometry(0.40, 0.18, 0.38);
        const hairMesh = new THREE.Mesh(hairGeo, hairMat);
        hairMesh.position.set(0, 0.24, -0.01);
        this.head.add(hairMesh);

        // Hat Brim (Flat boxy brown brim)
        const brimGeo = new THREE.BoxGeometry(0.64, 0.07, 0.62);
        const brimMesh = new THREE.Mesh(brimGeo, hatMat);
        brimMesh.position.y = 0.38;
        this.head.add(brimMesh);

        // Hat Band (Dark brown ribbon)
        const bandGeo = new THREE.BoxGeometry(0.44, 0.06, 0.44);
        const bandMesh = new THREE.Mesh(bandGeo, hatBandMat);
        bandMesh.position.y = 0.44;
        this.head.add(bandMesh);

        // Hat Crown (Boxy brown crown)
        const crownGeo = new THREE.BoxGeometry(0.42, 0.20, 0.42);
        const crownMesh = new THREE.Mesh(crownGeo, hatMat);
        crownMesh.position.y = 0.54;
        this.head.add(crownMesh);

        // ================= LEFT ARM =================
        this.leftArm = new THREE.Group();
        this.leftArm.position.set(-0.36, 0.56, 0);
        this.torso.add(this.leftArm);

        // Upper Arm (Teal)
        const leftArmGeo = new THREE.BoxGeometry(0.18, 0.36, 0.20);
        const leftArmMesh = new THREE.Mesh(leftArmGeo, tealMat);
        leftArmMesh.position.y = -0.18;
        this.leftArm.add(leftArmMesh);

        // White Stripe on Lateral / Outer Arm
        const armStripeGeo = new THREE.BoxGeometry(0.03, 0.36, 0.09);
        const leftArmStripe = new THREE.Mesh(armStripeGeo, whiteMat);
        leftArmStripe.position.set(-0.09, -0.18, 0);
        this.leftArm.add(leftArmStripe);

        // Left Forearm
        this.leftForearm = new THREE.Group();
        this.leftForearm.position.y = -0.36;
        this.leftArm.add(this.leftForearm);

        const leftForearmGeo = new THREE.BoxGeometry(0.16, 0.34, 0.18);
        const leftForearmMesh = new THREE.Mesh(leftForearmGeo, tealMat);
        leftForearmMesh.position.y = -0.17;
        this.leftForearm.add(leftForearmMesh);

        // Forearm White Stripe
        const forearmStripeGeo = new THREE.BoxGeometry(0.03, 0.34, 0.08);
        const leftForearmStripe = new THREE.Mesh(forearmStripeGeo, whiteMat);
        leftForearmStripe.position.set(-0.08, -0.17, 0);
        this.leftForearm.add(leftForearmStripe);

        // Cubic Hand (Skin)
        const handGeo = new THREE.BoxGeometry(0.14, 0.16, 0.16);
        const leftHand = new THREE.Mesh(handGeo, skinMat);
        leftHand.position.set(0, -0.40, 0.01);
        this.leftForearm.add(leftHand);

        // ================= RIGHT ARM =================
        this.rightArm = new THREE.Group();
        this.rightArm.position.set(0.36, 0.56, 0);
        this.torso.add(this.rightArm);

        // Upper Arm (Teal)
        const rightArmGeo = new THREE.BoxGeometry(0.18, 0.36, 0.20);
        const rightArmMesh = new THREE.Mesh(rightArmGeo, tealMat);
        rightArmMesh.position.y = -0.18;
        this.rightArm.add(rightArmMesh);

        // White Stripe on Lateral / Outer Arm
        const rightArmStripe = new THREE.Mesh(armStripeGeo, whiteMat);
        rightArmStripe.position.set(0.09, -0.18, 0);
        this.rightArm.add(rightArmStripe);

        // Right Forearm
        this.rightForearm = new THREE.Group();
        this.rightForearm.position.y = -0.36;
        this.rightArm.add(this.rightForearm);

        const rightForearmGeo = new THREE.BoxGeometry(0.16, 0.34, 0.18);
        const rightForearmMesh = new THREE.Mesh(rightForearmGeo, tealMat);
        rightForearmMesh.position.y = -0.17;
        this.rightForearm.add(rightForearmMesh);

        // Forearm White Stripe
        const rightForearmStripe = new THREE.Mesh(forearmStripeGeo, whiteMat);
        rightForearmStripe.position.set(0.08, -0.17, 0);
        this.rightForearm.add(rightForearmStripe);

        // Cubic Hand (Skin)
        const rightHand = new THREE.Mesh(handGeo, skinMat);
        rightHand.position.set(0, -0.40, 0.01);
        this.rightForearm.add(rightHand);

        // ================= LEFT LEG =================
        this.leftLeg = new THREE.Group();
        this.leftLeg.position.set(-0.16, -0.05, 0);
        this.pelvis.add(this.leftLeg);

        // Thigh (Teal Pants)
        const thighGeo = new THREE.BoxGeometry(0.22, 0.44, 0.24);
        const leftThighMesh = new THREE.Mesh(thighGeo, tealMat);
        leftThighMesh.position.y = -0.22;
        this.leftLeg.add(leftThighMesh);

        // Thigh White Outer Stripe
        const legStripeGeo = new THREE.BoxGeometry(0.03, 0.44, 0.10);
        const leftThighStripe = new THREE.Mesh(legStripeGeo, whiteMat);
        leftThighStripe.position.set(-0.11, -0.22, 0);
        this.leftLeg.add(leftThighStripe);

        // Left Shin
        this.leftShin = new THREE.Group();
        this.leftShin.position.y = -0.44;
        this.leftLeg.add(this.leftShin);

        const shinGeo = new THREE.BoxGeometry(0.20, 0.42, 0.22);
        const leftShinMesh = new THREE.Mesh(shinGeo, tealMat);
        leftShinMesh.position.y = -0.21;
        this.leftShin.add(leftShinMesh);

        // Shin White Outer Stripe
        const shinStripeGeo = new THREE.BoxGeometry(0.03, 0.42, 0.09);
        const leftShinStripe = new THREE.Mesh(shinStripeGeo, whiteMat);
        leftShinStripe.position.set(-0.10, -0.21, 0);
        this.leftShin.add(leftShinStripe);

        // White Sneaker / Shoe
        const shoeGeo = new THREE.BoxGeometry(0.22, 0.16, 0.34);
        const leftShoe = new THREE.Mesh(shoeGeo, whiteMat);
        leftShoe.position.set(0, -0.47, 0.05);
        this.leftShin.add(leftShoe);

        const soleGeo = new THREE.BoxGeometry(0.23, 0.04, 0.35);
        const leftSole = new THREE.Mesh(soleGeo, soleMat);
        leftSole.position.set(0, -0.54, 0.05);
        this.leftShin.add(leftSole);

        // ================= RIGHT LEG =================
        this.rightLeg = new THREE.Group();
        this.rightLeg.position.set(0.16, -0.05, 0);
        this.pelvis.add(this.rightLeg);

        // Thigh (Teal Pants)
        const rightThighMesh = new THREE.Mesh(thighGeo, tealMat);
        rightThighMesh.position.y = -0.22;
        this.rightLeg.add(rightThighMesh);

        // Thigh White Outer Stripe
        const rightThighStripe = new THREE.Mesh(legStripeGeo, whiteMat);
        rightThighStripe.position.set(0.11, -0.22, 0);
        this.rightLeg.add(rightThighStripe);

        // Right Shin
        this.rightShin = new THREE.Group();
        this.rightShin.position.y = -0.44;
        this.rightLeg.add(this.rightShin);

        const rightShinMesh = new THREE.Mesh(shinGeo, tealMat);
        rightShinMesh.position.y = -0.21;
        this.rightShin.add(rightShinMesh);

        // Shin White Outer Stripe
        const rightShinStripe = new THREE.Mesh(shinStripeGeo, whiteMat);
        rightShinStripe.position.set(0.10, -0.21, 0);
        this.rightShin.add(rightShinStripe);

        // White Sneaker / Shoe
        const rightShoe = new THREE.Mesh(shoeGeo, whiteMat);
        rightShoe.position.set(0, -0.47, 0.05);
        this.rightShin.add(rightShoe);

        const rightSole = new THREE.Mesh(soleGeo, soleMat);
        rightSole.position.set(0, -0.54, 0.05);
        this.rightShin.add(rightSole);

        // Shadows
        this.group.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = false;
            }
        });
    }

    buildPowerupEffects() {
        // Shield Energy Bubble
        const shieldGeo = new THREE.SphereGeometry(1.25, 16, 12);
        const shieldMat = new THREE.MeshBasicMaterial({
            color: 0x00FF88,
            wireframe: true,
            transparent: true,
            opacity: 0.0
        });
        this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
        this.shieldMesh.position.y = 1.0;
        this.shieldMesh.visible = false;
        this.group.add(this.shieldMesh);

        // Boost Aura Ring
        const ringGeo = new THREE.TorusGeometry(0.8, 0.08, 8, 24);
        ringGeo.rotateX(Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x00E5FF,
            transparent: true,
            opacity: 0.0
        });
        this.boostFX = new THREE.Mesh(ringGeo, ringMat);
        this.boostFX.position.y = 0.2;
        this.boostFX.visible = false;
        this.group.add(this.boostFX);
    }

    jump() {
        if (!this.isGrounded || this.isSliding) return false;
        this.velocityY = this.jumpForce;
        this.isGrounded = false;
        this.currentAnimation = 'jump';
        return true;
    }

    slide() {
        if (!this.isGrounded || this.isSliding) return false;
        this.isSliding = true;
        this.slideTimer = this.slideDuration;
        this.colliderHeight = this.slideHeight;
        this.currentAnimation = 'slide';
        return true;
    }

    changeLane(direction) { // -1 = Left, +1 = Right
        const newLane = this.currentLane + direction;
        if (newLane >= -1 && newLane <= 1) {
            this.currentLane = newLane;
            this.targetX = this.currentLane * this.laneWidth;
            return true;
        }
        return false;
    }

    setShieldActive(active) {
        if (this.shieldMesh) {
            this.shieldMesh.visible = active;
            this.shieldMesh.material.opacity = active ? 0.6 : 0.0;
        }
    }

    setBoostActive(active) {
        if (this.boostFX) {
            this.boostFX.visible = active;
            this.boostFX.material.opacity = active ? 0.75 : 0.0;
        }
    }

    update(delta, runSpeed) {
        this.animTime += delta * (runSpeed / 12.0);

        // Smooth lateral lane transition
        this.posX += (this.targetX - this.posX) * Math.min(1.0, delta * 14.0);

        // Vertical Jump Physics
        if (!this.isGrounded) {
            this.velocityY += this.gravity * delta;
            this.posY += this.velocityY * delta;
            if (this.posY <= 0) {
                this.posY = 0;
                this.velocityY = 0;
                this.isGrounded = true;
                if (!this.isSliding) {
                    this.currentAnimation = 'run';
                }
            }
        }

        // Slide Timer
        if (this.isSliding) {
            this.slideTimer -= delta;
            if (this.slideTimer <= 0) {
                this.isSliding = false;
                this.colliderHeight = this.normalHeight;
                if (this.isGrounded) {
                    this.currentAnimation = 'run';
                }
            }
        }

        // Shield / FX rotation
        if (this.shieldMesh && this.shieldMesh.visible) {
            this.shieldMesh.rotation.y += delta * 2.5;
            this.shieldMesh.rotation.x += delta * 1.2;
        }
        if (this.boostFX && this.boostFX.visible) {
            this.boostFX.rotation.z += delta * 4.0;
            this.boostFX.position.y = 0.2 + Math.sin(this.animTime * 8.0) * 0.1;
        }

        this.applyProceduralAnimation(delta);
    }

    applyProceduralAnimation(delta) {
        const t = this.animTime * 12.0;

        if (this.currentAnimation === 'run') {
            // Running Animation Cycle matching reference 6-frame stride
            const legAngle = Math.sin(t) * 0.75;
            const armAngle = -legAngle * 0.85;

            // Legs stride back and forth
            this.leftLeg.rotation.x = legAngle;
            this.rightLeg.rotation.x = -legAngle;

            // Knee bend on backward swing (heel kicks up)
            this.leftShin.rotation.x = legAngle > 0 ? 0.05 : Math.abs(legAngle) * 0.95;
            this.rightShin.rotation.x = legAngle < 0 ? 0.05 : Math.abs(legAngle) * 0.95;

            // Arms swing opposing legs with natural elbow bend
            this.leftArm.rotation.x = armAngle;
            this.rightArm.rotation.x = -armAngle;
            this.leftForearm.rotation.x = -0.45 - Math.abs(armAngle) * 0.35;
            this.rightForearm.rotation.x = -0.45 - Math.abs(armAngle) * 0.35;

            // Dynamic forward posture & running gait bounce
            this.pelvis.position.y = 1.05 + Math.abs(Math.sin(t)) * 0.10;
            this.torso.rotation.x = 0.12; // Slight athletic forward pitch
            this.torso.rotation.y = Math.sin(t) * 0.07;
            this.pelvis.rotation.z = Math.sin(t) * 0.03;
            this.head.rotation.x = -0.08; // Head looks forward down path
        }
        else if (this.currentAnimation === 'jump') {
            // Airborne tuck posture
            this.leftLeg.rotation.x = -0.6;
            this.rightLeg.rotation.x = -0.4;
            this.leftShin.rotation.x = 1.2;
            this.rightShin.rotation.x = 0.9;

            this.leftArm.rotation.x = -1.7;
            this.rightArm.rotation.x = -1.7;
            this.leftArm.rotation.z = -0.3;
            this.rightArm.rotation.z = 0.3;

            this.torso.rotation.x = 0.1;
            this.pelvis.position.y = 1.05;
        }
        else if (this.currentAnimation === 'slide') {
            // Low baseball slide under obstacles
            this.pelvis.position.y = 0.38;
            this.torso.rotation.x = -1.1; // Leaning way back
            this.pelvis.rotation.x = -0.4;

            this.leftLeg.rotation.x = 1.2; // Extended forward
            this.rightLeg.rotation.x = 0.4;
            this.leftShin.rotation.x = 0.1;
            this.rightShin.rotation.x = 0.8;

            this.leftArm.rotation.x = -0.8;
            this.rightArm.rotation.x = -0.6;
            this.head.rotation.x = 0.6; // Chin to chest
        }
        else if (this.currentAnimation === 'stumble') {
            // Flailing arms and stumbling legs
            this.torso.rotation.x = 0.45;
            this.torso.rotation.z = Math.sin(t * 2.0) * 0.3;
            this.leftArm.rotation.z = -1.2;
            this.rightArm.rotation.z = 1.2;
            this.leftArm.rotation.x = Math.sin(t * 3.0) * 1.5;
            this.rightArm.rotation.x = -Math.sin(t * 3.0) * 1.5;
        }
        else if (this.currentAnimation === 'fall') {
            // Freefalling limb windmill
            this.torso.rotation.x += delta * 5.0;
            this.torso.rotation.y += delta * 3.0;
            this.leftLeg.rotation.x = Math.sin(t * 4.0) * 1.2;
            this.rightLeg.rotation.x = -Math.sin(t * 4.0) * 1.2;
            this.leftArm.rotation.x = Math.cos(t * 4.0) * 1.5;
            this.rightArm.rotation.x = -Math.cos(t * 4.0) * 1.5;
        }
    }

    reset() {
        this.currentLane = 0;
        this.targetX = 0;
        this.posX = 0;
        this.posY = 0;
        this.posZ = 0;
        this.velocityY = 0;
        this.isGrounded = true;
        this.isSliding = false;
        this.slideTimer = 0;
        this.colliderHeight = this.normalHeight;
        this.currentAnimation = 'run';
        this.setShieldActive(false);
        this.setBoostActive(false);
        this.group.rotation.set(0, 0, 0);
        this.pelvis.rotation.set(0, 0, 0);
        this.torso.rotation.set(0, 0, 0);
    }
}

window.Character = Character;

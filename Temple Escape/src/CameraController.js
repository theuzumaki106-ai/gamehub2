/**
 * CameraController.js - Third-Person Elevated Chase Camera for Clear Path Visibility
 */

class CameraController {
    constructor(camera) {
        this.camera = camera;
        
        // High, angled-down third-person view (classic Temple Run framing)
        this.baseDistance = 7.2;   // Distance behind character
        this.baseHeight = 4.9;     // Elevated above character for clear obstacle view ahead
        this.lookAhead = 17.0;     // Look point ahead along path
        this.lookAtHeight = 1.0;   // Height of look target
        
        this.currentPos = new THREE.Vector3(0, this.baseHeight, this.baseDistance);
        this.targetPos = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3(0, this.lookAtHeight, -this.lookAhead);
        this.targetLookAt = new THREE.Vector3();

        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeDecay = 4.0;

        this.baseFOV = 58;
        this.targetFOV = this.baseFOV;
    }

    shake(intensity = 0.4, duration = 0.3) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }

    setSpeedBoost(active) {
        this.targetFOV = active ? 70 : this.baseFOV;
    }

    update(delta, playerPos, forwardVector, rightVector) {
        // Position camera behind and elevated above character
        const idealCamX = playerPos.x - forwardVector.x * this.baseDistance;
        const idealCamY = playerPos.y + this.baseHeight;
        const idealCamZ = playerPos.z - forwardVector.z * this.baseDistance;
        this.targetPos.set(idealCamX, idealCamY, idealCamZ);

        // Smooth position follow (damping)
        const lerpFactor = Math.min(1.0, delta * 9.0);
        this.currentPos.lerp(this.targetPos, lerpFactor);

        // Look at a point well ahead of the character down the runway
        const idealLookX = playerPos.x + forwardVector.x * this.lookAhead;
        const idealLookY = playerPos.y + this.lookAtHeight;
        const idealLookZ = playerPos.z + forwardVector.z * this.lookAhead;
        this.targetLookAt.set(idealLookX, idealLookY, idealLookZ);

        this.currentLookAt.lerp(this.targetLookAt, Math.min(1.0, delta * 11.0));

        // Camera Shake on impacts
        let shakeOffset = new THREE.Vector3();
        if (this.shakeDuration > 0) {
            this.shakeDuration -= delta;
            const s = this.shakeIntensity;
            shakeOffset.set(
                (Math.random() - 0.5) * s,
                (Math.random() - 0.5) * s,
                (Math.random() - 0.5) * s
            );
            this.shakeIntensity = Math.max(0, this.shakeIntensity - delta * this.shakeDecay);
        }

        this.camera.position.copy(this.currentPos).add(shakeOffset);
        this.camera.lookAt(this.currentLookAt.clone().add(shakeOffset));

        // Smooth FOV interpolation
        if (Math.abs(this.camera.fov - this.targetFOV) > 0.1) {
            this.camera.fov += (this.targetFOV - this.camera.fov) * delta * 4.0;
            this.camera.updateProjectionMatrix();
        }
    }

    reset(playerPos, forwardVector) {
        const camX = playerPos.x - forwardVector.x * this.baseDistance;
        const camY = playerPos.y + this.baseHeight;
        const camZ = playerPos.z - forwardVector.z * this.baseDistance;
        this.currentPos.set(camX, camY, camZ);
        this.camera.position.copy(this.currentPos);

        const lookX = playerPos.x + forwardVector.x * this.lookAhead;
        const lookY = playerPos.y + this.lookAtHeight;
        const lookZ = playerPos.z + forwardVector.z * this.lookAhead;
        this.currentLookAt.set(lookX, lookY, lookZ);
        this.camera.lookAt(this.currentLookAt);

        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.camera.fov = this.baseFOV;
        this.camera.updateProjectionMatrix();
    }
}

window.CameraController = CameraController;

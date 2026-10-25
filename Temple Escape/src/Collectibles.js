/**
 * Collectibles.js - 3D Golden Coins & Power-Up Pickups in World Coordinates
 */

const PowerupTypes = {
    MAGNET: 'MAGNET',
    SHIELD: 'SHIELD',
    BOOST: 'BOOST',
    MULTIPLIER: 'MULTIPLIER'
};

class CollectibleManager {
    constructor(scene) {
        this.scene = scene;
        this.coins = [];
        this.powerups = [];
        this.coinGeometry = new THREE.CylinderGeometry(0.38, 0.38, 0.09, 14);
        this.coinGeometry.rotateX(Math.PI / 2);

        this.coinMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            metalness: 0.85,
            roughness: 0.25,
            emissive: 0x443300
        });

        // Inner glyph
        const glyphGeo = new THREE.BoxGeometry(0.24, 0.24, 0.11);
        const glyphMat = new THREE.MeshLambertMaterial({ color: 0xB8860B });
        this.coinGlyphMesh = new THREE.Mesh(glyphGeo, glyphMat);
    }

    createCoin(worldX, worldY, worldZ) {
        const coinGroup = new THREE.Group();
        coinGroup.position.set(worldX, worldY, worldZ);

        const mesh = new THREE.Mesh(this.coinGeometry, this.coinMaterial);
        mesh.castShadow = true;
        coinGroup.add(mesh);

        const glyph = this.coinGlyphMesh.clone();
        glyph.rotation.z = Math.PI / 4;
        coinGroup.add(glyph);

        coinGroup.userData = {
            type: 'COIN',
            baseY: worldY,
            collected: false,
            radius: 0.75
        };

        if (this.scene) {
            this.scene.add(coinGroup);
        }
        this.coins.push(coinGroup);
        return coinGroup;
    }

    createPowerup(type, worldX, worldY, worldZ) {
        const group = new THREE.Group();
        group.position.set(worldX, worldY, worldZ);

        let orbColor = 0xFFD700;
        if (type === PowerupTypes.SHIELD) orbColor = 0x00FF88;
        else if (type === PowerupTypes.MAGNET) orbColor = 0xFF3366;
        else if (type === PowerupTypes.BOOST) orbColor = 0x00E5FF;
        else if (type === PowerupTypes.MULTIPLIER) orbColor = 0xFFA000;

        const orbGeo = new THREE.SphereGeometry(0.55, 12, 10);
        const orbMat = new THREE.MeshBasicMaterial({
            color: orbColor,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        const orb = new THREE.Mesh(orbGeo, orbMat);
        group.add(orb);

        const coreGeo = new THREE.OctahedronGeometry(0.3, 0);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const core = new THREE.Mesh(coreGeo, coreMat);
        group.add(core);

        group.userData = {
            type: 'POWERUP',
            powerupType: type,
            baseY: worldY,
            collected: false,
            radius: 0.95
        };

        if (this.scene) {
            this.scene.add(group);
        }
        this.powerups.push(group);
        return group;
    }

    update(delta, playerPos, isMagnetActive) {
        const time = performance.now() * 0.003;

        // Animate & Magnetize Coins
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            if (coin.userData.collected) continue;

            coin.rotation.y += delta * 4.5;
            coin.position.y = coin.userData.baseY + Math.sin(time + coin.position.x + coin.position.z) * 0.12;

            if (isMagnetActive && playerPos) {
                const distToPlayer = coin.position.distanceTo(playerPos);
                if (distToPlayer < 14.0) {
                    const dir = new THREE.Vector3().subVectors(playerPos, coin.position).normalize();
                    const pullSpeed = Math.max(18.0, 34.0 - distToPlayer * 1.5);
                    coin.position.addScaledVector(dir, pullSpeed * delta);
                }
            }
        }

        // Animate Powerups
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const pup = this.powerups[i];
            if (pup.userData.collected) continue;

            pup.rotation.y += delta * 3.0;
            pup.rotation.x += delta * 1.5;
            pup.position.y = pup.userData.baseY + Math.sin(time * 1.5) * 0.15;
        }
    }

    removeCoin(coin) {
        coin.userData.collected = true;
        const idx = this.coins.indexOf(coin);
        if (idx !== -1) this.coins.splice(idx, 1);
        if (coin.parent) coin.parent.remove(coin);
    }

    removePowerup(powerup) {
        powerup.userData.collected = true;
        const idx = this.powerups.indexOf(powerup);
        if (idx !== -1) this.powerups.splice(idx, 1);
        if (powerup.parent) powerup.parent.remove(powerup);
    }

    clear() {
        for (const coin of this.coins) {
            if (coin.parent) coin.parent.remove(coin);
        }
        for (const pup of this.powerups) {
            if (pup.parent) pup.parent.remove(pup);
        }
        this.coins = [];
        this.powerups = [];
    }
}

window.PowerupTypes = PowerupTypes;
window.CollectibleManager = CollectibleManager;

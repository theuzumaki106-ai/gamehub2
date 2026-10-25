/**
 * Obstacles.js - High-Contrast 3D Hazard & Obstacle Meshes with Clear Visual Cues
 */

const ObstacleTypes = {
    LOG: 'LOG',               // Jump over
    ARCH: 'ARCH',             // Slide under
    SPIKES: 'SPIKES',         // Jump over
    BLOCK_LEFT: 'BLOCK_LEFT', // Dodge to center/right
    BLOCK_RIGHT: 'BLOCK_RIGHT', // Dodge to left/center
    BLOCK_CENTER: 'BLOCK_CENTER' // Dodge to left/right
};

class ObstacleFactory {
    static createObstacle(type) {
        const group = new THREE.Group();
        group.userData = { type: type, active: true };

        // Vivid high-contrast materials
        const stoneMat = new THREE.MeshLambertMaterial({ color: 0x90A4AE }); // Clean carved stone
        const darkStoneMat = new THREE.MeshLambertMaterial({ color: 0x455A64 });
        const mossMat = new THREE.MeshLambertMaterial({ color: 0x76FF03 }); // Bright vibrant moss
        const woodMat = new THREE.MeshLambertMaterial({ color: 0x795548 }); // Rich brown bark
        const metalMat = new THREE.MeshStandardMaterial({ 
            color: 0xECEFF1, 
            metalness: 0.85, 
            roughness: 0.25 
        }); // Gleaming spike metal
        const flameMat = new THREE.MeshBasicMaterial({ color: 0xFF9100 }); // Torch flame glow
        const runeMat = new THREE.MeshBasicMaterial({ color: 0xFFD600 }); // Glowing gold rune

        switch (type) {
            case ObstacleTypes.LOG: {
                // Fallen mossy log across path - requires jump
                const logGeo = new THREE.CylinderGeometry(0.38, 0.42, 5.8, 10);
                logGeo.rotateZ(Math.PI / 2);
                const logMesh = new THREE.Mesh(logGeo, woodMat);
                logMesh.position.y = 0.38;
                group.add(logMesh);

                // Vibrant green moss patches on top of log
                const mossGeo = new THREE.BoxGeometry(1.6, 0.16, 0.55);
                const moss1 = new THREE.Mesh(mossGeo, mossMat);
                moss1.position.set(-1.4, 0.76, 0);
                group.add(moss1);

                const moss2 = new THREE.Mesh(mossGeo, mossMat);
                moss2.position.set(1.4, 0.76, 0);
                group.add(moss2);

                // Bright orange fungi
                const shroomGeo = new THREE.ConeGeometry(0.14, 0.18, 6);
                const shroomMat = new THREE.MeshBasicMaterial({ color: 0xFF3D00 });
                const shroom1 = new THREE.Mesh(shroomGeo, shroomMat);
                shroom1.position.set(-0.2, 0.82, 0.15);
                group.add(shroom1);

                const shroom2 = new THREE.Mesh(shroomGeo, shroomMat);
                shroom2.position.set(0.3, 0.82, -0.12);
                group.add(shroom2);

                group.userData.collider = {
                    minY: 0.0,
                    maxY: 0.85,
                    minX: -2.9,
                    maxX: 2.9,
                    depth: 0.9,
                    actionNeeded: 'JUMP'
                };
                break;
            }

            case ObstacleTypes.ARCH: {
                // Low stone archway with twin glowing torches - requires slide
                const pillarGeo = new THREE.BoxGeometry(0.7, 3.2, 0.7);
                const leftPillar = new THREE.Mesh(pillarGeo, stoneMat);
                leftPillar.position.set(-2.8, 1.6, 0);
                group.add(leftPillar);

                const rightPillar = new THREE.Mesh(pillarGeo, stoneMat);
                rightPillar.position.set(2.8, 1.6, 0);
                group.add(rightPillar);

                // Low crossbeam lintel - low clearance under beam (~1.15m)
                const beamGeo = new THREE.BoxGeometry(6.4, 0.95, 0.85);
                const beamMesh = new THREE.Mesh(beamGeo, darkStoneMat);
                beamMesh.position.set(0, 1.65, 0);
                group.add(beamMesh);

                // Ancient glowing rune crest on arch center
                const runeGeo = new THREE.BoxGeometry(1.0, 0.6, 0.9);
                const runeMesh = new THREE.Mesh(runeGeo, runeMat);
                runeMesh.position.set(0, 1.65, 0);
                group.add(runeMesh);

                // Left & Right glowing torch flames on pillars
                const torchGeo = new THREE.ConeGeometry(0.16, 0.45, 6);
                const leftTorch = new THREE.Mesh(torchGeo, flameMat);
                leftTorch.position.set(-2.4, 2.2, 0.4);
                group.add(leftTorch);

                const rightTorch = new THREE.Mesh(torchGeo, flameMat);
                rightTorch.position.set(2.4, 2.2, 0.4);
                group.add(rightTorch);

                group.userData.collider = {
                    minY: 1.0, // Above slide height, hits standing player!
                    maxY: 2.3,
                    minX: -2.8,
                    maxX: 2.8,
                    depth: 0.85,
                    actionNeeded: 'SLIDE'
                };
                break;
            }

            case ObstacleTypes.SPIKES: {
                // Gleaming floor spikes trap - requires jump
                const baseGeo = new THREE.BoxGeometry(5.6, 0.1, 1.8);
                const baseMesh = new THREE.Mesh(baseGeo, darkStoneMat);
                baseMesh.position.y = 0.05;
                group.add(baseMesh);

                // Gleaming metallic spikes with red warning tips
                const spikeGeo = new THREE.ConeGeometry(0.14, 0.75, 5);
                for (let x = -2.2; x <= 2.2; x += 0.75) {
                    for (let z = -0.55; z <= 0.55; z += 0.55) {
                        const spike = new THREE.Mesh(spikeGeo, metalMat);
                        spike.position.set(x + (Math.random() * 0.08 - 0.04), 0.42, z);
                        group.add(spike);
                    }
                }

                group.userData.collider = {
                    minY: 0.0,
                    maxY: 0.82,
                    minX: -2.8,
                    maxX: 2.8,
                    depth: 1.8,
                    actionNeeded: 'JUMP'
                };
                break;
            }

            case ObstacleTypes.BLOCK_LEFT:
            case ObstacleTypes.BLOCK_RIGHT:
            case ObstacleTypes.BLOCK_CENTER: {
                // Fallen temple stone pillar blocking one lane
                const laneX = type === ObstacleTypes.BLOCK_LEFT ? -2.0 : 
                             (type === ObstacleTypes.BLOCK_RIGHT ? 2.0 : 0.0);

                const blockGeo = new THREE.BoxGeometry(1.7, 2.3, 1.4);
                const blockMesh = new THREE.Mesh(blockGeo, stoneMat);
                blockMesh.position.set(laneX, 1.15, 0);
                group.add(blockMesh);

                // Glowing warning rune on block face
                const runeGeo = new THREE.BoxGeometry(0.8, 0.8, 1.45);
                const runeMesh = new THREE.Mesh(runeGeo, runeMat);
                runeMesh.position.set(laneX, 1.2, 0);
                group.add(runeMesh);

                // Moss slab top
                const topGeo = new THREE.BoxGeometry(1.85, 0.3, 1.55);
                const topMesh = new THREE.Mesh(topGeo, mossMat);
                topMesh.position.set(laneX, 2.35, 0);
                group.add(topMesh);

                group.userData.collider = {
                    minY: 0.0,
                    maxY: 2.5,
                    minX: laneX - 0.9,
                    maxX: laneX + 0.9,
                    depth: 1.4,
                    actionNeeded: 'DODGE'
                };
                break;
            }
        }

        group.traverse((c) => {
            if (c.isMesh) {
                c.castShadow = true;
                c.receiveShadow = true;
            }
        });

        return group;
    }
}

window.ObstacleTypes = ObstacleTypes;
window.ObstacleFactory = ObstacleFactory;

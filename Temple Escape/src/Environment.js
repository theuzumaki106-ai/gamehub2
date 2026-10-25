/**
 * Environment.js - Modular 3D Endless Temple Path Generation & Seamless Turn Geometry
 */

const SegmentTypes = {
    STRAIGHT: 'STRAIGHT',
    TURN_LEFT: 'TURN_LEFT',
    TURN_RIGHT: 'TURN_RIGHT',
    BRIDGE: 'BRIDGE',
    OBSTACLE: 'OBSTACLE'
};

// Direction unit vectors: [dx, dz], angle in radians
const Directions = [
    { dx: 0, dz: -1, angle: 0 },             // 0: North (-Z)
    { dx: 1, dz: 0,  angle: -Math.PI / 2 },  // 1: East (+X)
    { dx: 0, dz: 1,  angle: Math.PI },       // 2: South (+Z)
    { dx: -1, dz: 0, angle: Math.PI / 2 }    // 3: West (-X)
];

class EnvironmentManager {
    constructor(scene, collectibleManager) {
        this.scene = scene;
        this.collectibles = collectibleManager;
        this.segments = [];
        this.segmentLength = 20.0; // Units per straight segment
        this.pathWidth = 6.0;

        // Generator head position (connection point in world space)
        this.currentDirIndex = 0; // Starts facing North (-Z)
        this.cursor = new THREE.Vector3(0, 0, 0);

        // Turn history to maintain balanced runway lengths
        this.consecutiveStraights = 0;
        this.minStraightsBetweenTurns = 3;
        this.totalSegmentsGenerated = 0;

        this.initMaterials();
    }

    initMaterials() {
        this.stonePathMat = new THREE.MeshLambertMaterial({ color: 0x9E9786 }); // Clear ancient limestone paver
        this.stoneBorderMat = new THREE.MeshLambertMaterial({ color: 0x4E4637 }); // Dark framing border
        this.woodPlankMat = new THREE.MeshLambertMaterial({ color: 0x6D4C41 }); // Warm bridge timber
        this.woodPostMat = new THREE.MeshLambertMaterial({ color: 0x3E2723 });
        this.ropeMat = new THREE.MeshLambertMaterial({ color: 0xBCAAA4 });
        this.pillarMat = new THREE.MeshLambertMaterial({ color: 0x78909C }); // Ancient ruin stone
        this.leafMat = new THREE.MeshLambertMaterial({ color: 0x2E7D32 }); // Lush tropical canopy
        this.trunkMat = new THREE.MeshLambertMaterial({ color: 0x4E342E });
    }

    buildStraightMesh(isBridge = false) {
        const group = new THREE.Group();

        if (isBridge) {
            // Wooden suspension bridge spanning local Z = 0 to Z = -20
            const plankGeo = new THREE.BoxGeometry(5.8, 0.22, 1.2);
            for (let z = -1.0; z >= -19.0; z -= 1.4) {
                const plank = new THREE.Mesh(plankGeo, this.woodPlankMat);
                plank.position.set(0, -0.1, z);
                plank.receiveShadow = true;
                group.add(plank);
            }

            // Bridge posts & rope railings
            const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.4, 6);
            for (let z = -2.0; z >= -18.0; z -= 3.5) {
                const lp = new THREE.Mesh(postGeo, this.woodPostMat);
                lp.position.set(-2.8, 0.6, z);
                group.add(lp);

                const rp = new THREE.Mesh(postGeo, this.woodPostMat);
                rp.position.set(2.8, 0.6, z);
                group.add(rp);
            }

            // Rope railings
            const ropeGeo = new THREE.CylinderGeometry(0.04, 0.04, 20.0, 5);
            ropeGeo.rotateX(Math.PI / 2);

            const lr = new THREE.Mesh(ropeGeo, this.ropeMat);
            lr.position.set(-2.8, 1.1, -10.0);
            group.add(lr);

            const rr = new THREE.Mesh(ropeGeo, this.ropeMat);
            rr.position.set(2.8, 1.1, -10.0);
            group.add(rr);
        } else {
            // Stone temple pathway: floor spans local Z = 0 to Z = -20
            const floorGeo = new THREE.BoxGeometry(5.8, 0.6, 20.0);
            const floor = new THREE.Mesh(floorGeo, this.stonePathMat);
            floor.position.set(0, -0.3, -10.0);
            floor.receiveShadow = true;
            group.add(floor);

            // Carved stone side borders
            const borderGeo = new THREE.BoxGeometry(0.5, 0.5, 20.0);
            const leftBorder = new THREE.Mesh(borderGeo, this.stoneBorderMat);
            leftBorder.position.set(-2.9, 0.1, -10.0);
            leftBorder.receiveShadow = true;
            group.add(leftBorder);

            const rightBorder = new THREE.Mesh(borderGeo, this.stoneBorderMat);
            rightBorder.position.set(2.9, 0.1, -10.0);
            rightBorder.receiveShadow = true;
            group.add(rightBorder);

            // Side temple pillars
            const pillarGeo = new THREE.BoxGeometry(0.8, 4.5, 0.8);
            const p1 = new THREE.Mesh(pillarGeo, this.pillarMat);
            p1.position.set(-3.8, 2.0, -14.0);
            p1.castShadow = true;
            group.add(p1);

            const p2 = new THREE.Mesh(pillarGeo, this.pillarMat);
            p2.position.set(3.8, 2.0, -6.0);
            p2.castShadow = true;
            group.add(p2);

            // Jungle foliage on sides
            this.addVegetation(group, -4.8, -10.0);
            this.addVegetation(group, 4.8, -10.0);
        }

        return group;
    }

    buildTurnMesh(isLeft) {
        const group = new THREE.Group();

        // 1. Entrance pathway from local Z = 0 to Z = -10
        const entryGeo = new THREE.BoxGeometry(5.8, 0.6, 10.0);
        const entryMesh = new THREE.Mesh(entryGeo, this.stonePathMat);
        entryMesh.position.set(0, -0.3, -5.0);
        entryMesh.receiveShadow = true;
        group.add(entryMesh);

        // 2. Intersection center slab at local (0, 0, -10)
        const centerFloorGeo = new THREE.BoxGeometry(6.4, 0.6, 6.4);
        const centerFloor = new THREE.Mesh(centerFloorGeo, this.stonePathMat);
        centerFloor.position.set(0, -0.3, -10.0);
        centerFloor.receiveShadow = true;
        group.add(centerFloor);

        // 3. Turn arm extending 10 units in turn direction from center (0, 0, -10)
        const armGeo = new THREE.BoxGeometry(10.0, 0.6, 5.8);
        const armMesh = new THREE.Mesh(armGeo, this.stonePathMat);
        const armX = isLeft ? -5.0 : 5.0;
        armMesh.position.set(armX, -0.3, -10.0);
        armMesh.receiveShadow = true;
        group.add(armMesh);

        // 4. Back dead-end wall at local Z = -13.5
        const wallGeo = new THREE.BoxGeometry(8.0, 5.2, 1.2);
        const wall = new THREE.Mesh(wallGeo, this.stoneBorderMat);
        wall.position.set(0, 2.3, -13.6);
        wall.castShadow = true;
        wall.receiveShadow = true;
        group.add(wall);

        // Ancient Carved Mask on wall
        const glyphGeo = new THREE.BoxGeometry(2.2, 2.2, 0.4);
        const glyphMat = new THREE.MeshLambertMaterial({ color: 0x9E9D24 });
        const glyph = new THREE.Mesh(glyphGeo, glyphMat);
        glyph.position.set(0, 2.6, -12.9);
        group.add(glyph);

        // Corner pillars
        const pillarGeo = new THREE.BoxGeometry(1.2, 5.2, 1.2);
        const outerPillarX = isLeft ? 3.5 : -3.5;
        const outerPillar = new THREE.Mesh(pillarGeo, this.pillarMat);
        outerPillar.position.set(outerPillarX, 2.3, -13.5);
        outerPillar.castShadow = true;
        group.add(outerPillar);

        const innerPillarX = isLeft ? 3.5 : -3.5;
        const innerPillar = new THREE.Mesh(pillarGeo, this.pillarMat);
        innerPillar.position.set(innerPillarX, 2.3, -6.5);
        innerPillar.castShadow = true;
        group.add(innerPillar);

        return group;
    }

    addVegetation(group, x, z) {
        const tree = new THREE.Group();
        tree.position.set(x, 0, z);

        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.45, 6.0, 6);
        const trunk = new THREE.Mesh(trunkGeo, this.trunkMat);
        trunk.position.y = 3.0;
        trunk.castShadow = true;
        tree.add(trunk);

        const canopyGeo = new THREE.ConeGeometry(2.4, 2.8, 6);
        const c1 = new THREE.Mesh(canopyGeo, this.leafMat);
        c1.position.y = 5.8;
        c1.castShadow = true;
        tree.add(c1);

        const c2 = new THREE.Mesh(canopyGeo, this.leafMat);
        c2.position.y = 7.0;
        c2.scale.set(0.75, 0.75, 0.75);
        c2.castShadow = true;
        tree.add(c2);

        group.add(tree);
    }

    createSegment(type, difficultyTier = 1) {
        const dir = Directions[this.currentDirIndex];
        const segGroup = new THREE.Group();
        segGroup.position.copy(this.cursor);
        segGroup.rotation.y = dir.angle;

        let segMesh = null;
        let isTurn = false;
        let turnDir = 0; // -1 = Left, +1 = Right
        let nextDirIndex = this.currentDirIndex;

        if (type === SegmentTypes.TURN_LEFT || type === SegmentTypes.TURN_RIGHT) {
            isTurn = true;
            turnDir = (type === SegmentTypes.TURN_LEFT) ? -1 : 1;
            nextDirIndex = (this.currentDirIndex + (turnDir === -1 ? 3 : 1)) % 4;
            segMesh = this.buildTurnMesh(turnDir === -1);
        } else if (type === SegmentTypes.BRIDGE) {
            segMesh = this.buildStraightMesh(true);
        } else {
            segMesh = this.buildStraightMesh(false);
        }

        segGroup.add(segMesh);
        this.scene.add(segGroup);
        segGroup.updateMatrixWorld(true);

        // Calculate world intersection center for turns
        let intersectionCenter = null;
        if (isTurn) {
            // Local intersection center is (0, 0, -10)
            intersectionCenter = new THREE.Vector3(0, 0, -10).applyMatrix4(segGroup.matrixWorld);
        }

        const segmentData = {
            id: this.totalSegmentsGenerated++,
            type: type,
            group: segGroup,
            startPos: this.cursor.clone(),
            dirIndex: this.currentDirIndex,
            forward: new THREE.Vector3(dir.dx, 0, dir.dz),
            isTurn: isTurn,
            turnDir: turnDir,
            nextDirIndex: nextDirIndex,
            intersectionCenter: intersectionCenter,
            obstacles: [],
            coins: [],
            powerups: []
        };

        // Populate obstacles and coins (first 3 runway segments are 100% safe!)
        if (!isTurn) {
            this.populateSegment(segmentData, type, difficultyTier);
        }

        this.segments.push(segmentData);

        // Advance generator cursor to segment exit connection
        if (isTurn) {
            // Exit point is at local (isLeft ? -10 : 10, 0, -10)
            const localExit = new THREE.Vector3(turnDir === -1 ? -10 : 10, 0, -10);
            this.cursor.copy(localExit.applyMatrix4(segGroup.matrixWorld));
            this.currentDirIndex = nextDirIndex;
            this.consecutiveStraights = 0;
        } else {
            // Straight exit is local (0, 0, -20)
            const localExit = new THREE.Vector3(0, 0, -20);
            this.cursor.copy(localExit.applyMatrix4(segGroup.matrixWorld));
            this.consecutiveStraights++;
        }

        return segmentData;
    }

    populateSegment(segmentData, type, difficultyTier) {
        const segGroup = segmentData.group;
        const isRunway = segmentData.id < 3; // First 3 segments are completely obstacle-free!

        // Add Obstacle at local (laneX, 0, -10)
        if (!isRunway && (type === SegmentTypes.OBSTACLE || Math.random() < 0.65)) {
            const obsChoices = [
                ObstacleTypes.LOG,
                ObstacleTypes.ARCH,
                ObstacleTypes.SPIKES,
                ObstacleTypes.BLOCK_LEFT,
                ObstacleTypes.BLOCK_RIGHT,
                ObstacleTypes.BLOCK_CENTER
            ];
            const choice = obsChoices[Math.floor(Math.random() * obsChoices.length)];
            const obstacle = ObstacleFactory.createObstacle(choice);

            // Center of straight segment along Z is -10.0
            obstacle.position.set(0, 0, -10.0);
            segGroup.add(obstacle);
            segmentData.obstacles.push(obstacle);
        }

        // Add Golden Coins in World Space
        const hasLogOrSpikes = segmentData.obstacles.some(o => 
            o.userData.type === ObstacleTypes.LOG || o.userData.type === ObstacleTypes.SPIKES
        );

        const lanes = [-2.0, 0, 2.0];
        const coinLane = lanes[Math.floor(Math.random() * lanes.length)];

        for (let z = -4.0; z >= -16.0; z -= 2.4) {
            let coinY = 0.8;
            if (hasLogOrSpikes && Math.abs(z - (-10.0)) <= 3.0) {
                // Parabolic coin arc over obstacle!
                coinY = 0.8 + (1.0 - (Math.abs(z - (-10.0)) / 3.0)) * 1.6;
            }

            const localCoin = new THREE.Vector3(coinLane, coinY, z);
            const worldCoin = localCoin.applyMatrix4(segGroup.matrixWorld);

            const coin = this.collectibles.createCoin(worldCoin.x, worldCoin.y, worldCoin.z);
            segmentData.coins.push(coin);
        }

        // Power-Up Pickup
        if (!isRunway && Math.random() < 0.25) {
            const powerupTypes = [
                PowerupTypes.MAGNET,
                PowerupTypes.SHIELD,
                PowerupTypes.BOOST,
                PowerupTypes.MULTIPLIER
            ];
            const pupType = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
            const pupLane = lanes[Math.floor(Math.random() * lanes.length)];

            const localPup = new THREE.Vector3(pupLane, 1.4, -6.0);
            const worldPup = localPup.applyMatrix4(segGroup.matrixWorld);

            const pup = this.collectibles.createPowerup(pupType, worldPup.x, worldPup.y, worldPup.z);
            segmentData.powerups.push(pup);
        }
    }

    update(playerPos, difficultyTier) {
        // Recycle old segments far behind the player
        const despawnDistSq = 65.0 * 65.0;
        while (this.segments.length > 0) {
            const seg = this.segments[0];
            const distSq = seg.startPos.distanceToSquared(playerPos);
            if (distSq > despawnDistSq && this.segments.length > 7) {
                this.removeSegment(seg);
                this.segments.shift();
            } else {
                break;
            }
        }

        // Maintain at least 8 segments ahead
        while (this.segments.length < 9) {
            let nextType = SegmentTypes.STRAIGHT;

            if (this.consecutiveStraights >= this.minStraightsBetweenTurns && Math.random() < 0.42) {
                nextType = Math.random() < 0.5 ? SegmentTypes.TURN_LEFT : SegmentTypes.TURN_RIGHT;
            } else if (Math.random() < 0.25) {
                nextType = SegmentTypes.BRIDGE;
            } else if (Math.random() < 0.5) {
                nextType = SegmentTypes.OBSTACLE;
            }

            this.createSegment(nextType, difficultyTier);
        }
    }

    removeSegment(seg) {
        for (const coin of seg.coins) {
            this.collectibles.removeCoin(coin);
        }
        for (const pup of seg.powerups) {
            this.collectibles.removePowerup(pup);
        }
        this.scene.remove(seg.group);
    }

    reset() {
        for (const seg of this.segments) {
            this.removeSegment(seg);
        }
        this.segments = [];
        this.currentDirIndex = 0;
        this.cursor.set(0, 0, 0);
        this.consecutiveStraights = 0;
        this.totalSegmentsGenerated = 0;

        // Build initial runway: 4 straight segments (segments 0-2 are 100% safe)
        for (let i = 0; i < 4; i++) {
            this.createSegment(SegmentTypes.STRAIGHT, 1);
        }
    }
}

window.SegmentTypes = SegmentTypes;
window.Directions = Directions;
window.EnvironmentManager = EnvironmentManager;

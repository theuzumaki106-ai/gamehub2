/**
 * Game.js - Central Game Engine, Loop, Mechanics & Collision Handling
 */

class Game {
    constructor() {
        this.container = document.getElementById('canvas-container');

        // Three.js Core
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Gameplay state - starts slow, gradually ramps up to fast thrilling escape
        this.startSpeed = 13.0; // Gentle, controllable starting pace
        this.baseSpeed = this.startSpeed;
        this.currentSpeed = this.startSpeed;
        this.maxSpeed = 33.0;   // High-intensity top speed
        this.elapsedPlayTime = 0;
        this.distance = 0;
        this.coinsCollected = 0;
        this.score = 0;
        this.scoreMultiplier = 1;

        // Active heading and path orientation
        this.currentDirIndex = 0; // 0: North, 1: East, 2: South, 3: West
        this.forwardVector = new THREE.Vector3(0, 0, -1);
        this.rightVector = new THREE.Vector3(1, 0, 0);
        this.playerWorldPos = new THREE.Vector3(0, 0, 0);

        // Turn management
        this.pendingTurnDir = null; // Buffered turn input (-1 = Left, +1 = Right)
        this.turnGraceDistance = 12.0;
        this.turnExecutedForSeg = null;

        // Active Power-up State
        this.activePowerup = null;
        this.powerupRemaining = 0;
        this.powerupDuration = 0;

        // Persistent Progression
        this.loadProgression();

        // Initialize Systems in correct dependency order
        this.initThree();

        this.stateManager = new StateManager();
        this.inputManager = new InputManager();
        this.collectibles = new CollectibleManager(this.scene);
        this.particles = new ParticleSystem(this.scene);
        this.character = new Character();
        this.scene.add(this.character.group);

        this.pursuer = new Pursuer();
        this.scene.add(this.pursuer.group);

        this.environment = new EnvironmentManager(this.scene, this.collectibles);
        this.cameraController = new CameraController(this.camera);

        this.ui = new UIManager(this);

        this.environment.reset();
        this.updateDirectionVectors();

        // Timing
        this.lastTime = performance.now();

        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Auto-pause when changing tab or losing focus
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.stateManager.gameState === GameStates.PLAYING) {
                this.pauseGame();
            }
        });
        window.addEventListener('blur', () => {
            if (this.stateManager.gameState === GameStates.PLAYING) {
                this.pauseGame();
            }
        });

        // Start animation loop
        requestAnimationFrame((t) => this.loop(t));
    }

    initThree() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x102116); // Lush tropical jungle canopy
        this.scene.fog = new THREE.Fog(0x102116, 50, 160); // Crisp linear fog: zero haze within 50m!

        this.camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 260);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Lighting: Bright, warm tropical sunlight with rich ambient contrast
        const ambientLight = new THREE.AmbientLight(0xffeedd, 0.88);
        this.scene.add(ambientLight);

        this.sunLight = new THREE.DirectionalLight(0xfffae6, 1.45);
        this.sunLight.position.set(25, 45, 25);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 1024;
        this.sunLight.shadow.mapSize.height = 1024;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 130;
        const d = 30;
        this.sunLight.shadow.camera.left = -d;
        this.sunLight.shadow.camera.right = d;
        this.sunLight.shadow.camera.top = d;
        this.sunLight.shadow.camera.bottom = -d;
        this.scene.add(this.sunLight);

        const hemiLight = new THREE.HemisphereLight(0xfff8e7, 0x2e4a30, 0.65);
        this.scene.add(hemiLight);
    }

    updateDirectionVectors() {
        const d = Directions[this.currentDirIndex];
        this.forwardVector.set(d.dx, 0, d.dz);
        this.rightVector.set(-d.dz, 0, d.dx);
    }

    startGame() {
        this.distance = 0;
        this.coinsCollected = 0;
        this.score = 0;
        this.elapsedPlayTime = 0;
        this.currentSpeed = this.startSpeed; // Slower start speed
        this.activePowerup = null;
        this.powerupRemaining = 0;
        this.pendingTurnDir = null;
        this.turnExecutedForSeg = null;
        this.currentDirIndex = 0;
        this.updateDirectionVectors();

        this.playerWorldPos.set(0, 0, 0);
        this.character.reset();
        this.pursuer.reset();
        this.collectibles.clear();
        this.particles.clear();
        this.environment.reset();

        // Monster shows only at start of game for 5 seconds, then recedes!
        this.pursuer.showForSeconds(5.0);

        this.cameraController.reset(this.playerWorldPos, this.forwardVector);

        this.stateManager.setGameState(GameStates.PLAYING);
        this.stateManager.setPlayerState(PlayerStates.RUNNING);

        if (window.soundSystem) {
            window.soundSystem.startMusic();
        }
    }

    pauseGame() {
        if (this.stateManager.gameState !== GameStates.PLAYING) return;
        this.stateManager.setGameState(GameStates.PAUSED);
        this.ui.showPauseScreen();
    }

    resumeGame() {
        if (this.stateManager.gameState !== GameStates.PAUSED) return;
        this.ui.hideAllScreens();

        // 3-second countdown before resuming active gameplay
        this.ui.startResumeCountdown(() => {
            this.lastTime = performance.now();
            this.stateManager.setGameState(GameStates.PLAYING);
            if (window.soundSystem) {
                window.soundSystem.startMusic();
            }
        });
    }

    onGameOver(reason = 'COLLISION') {
        if (this.stateManager.gameState === GameStates.GAME_OVER) return;
        this.stateManager.setGameState(GameStates.GAME_OVER);
        this.stateManager.setPlayerState(PlayerStates.DEAD);

        // Save high score and coins
        const isNewHigh = this.score > this.progression.highScore;
        if (isNewHigh) this.progression.highScore = this.score;
        if (this.distance > this.progression.bestDistance) this.progression.bestDistance = this.distance;
        this.progression.totalCoins += this.coinsCollected;
        this.saveProgression();

        if (window.soundSystem) {
            window.soundSystem.playCrash();
        }

        setTimeout(() => {
            this.ui.showGameOverScreen({
                score: this.score,
                distance: this.distance,
                coins: this.coinsCollected,
                highScore: this.progression.highScore
            }, isNewHigh);
        }, 900);
    }

    loop(timestamp) {
        requestAnimationFrame((t) => this.loop(t));

        const delta = Math.min(0.08, (timestamp - this.lastTime) / 1000.0);
        this.lastTime = timestamp;

        if (this.stateManager.gameState === GameStates.PLAYING) {
            this.updateGameplay(delta);
        } else if (this.stateManager.gameState === GameStates.MENU) {
            this.camera.position.x = Math.sin(timestamp * 0.0006) * 12;
            this.camera.position.z = Math.cos(timestamp * 0.0006) * 12;
            this.camera.position.y = 8;
            this.camera.lookAt(0, 1.5, 0);
        }

        this.renderer.render(this.scene, this.camera);
    }

    updateGameplay(delta) {
        // Handle Inputs
        this.processInput();

        // Speed Progression: Starts slow (13 m/s), smoothly accelerating over distance & elapsed time
        this.elapsedPlayTime += delta;
        const isBoost = (this.activePowerup === PowerupTypes.BOOST);
        const distanceSpeed = (this.distance / 90.0);      // +1 m/s every 90m
        const timeSpeed = (this.elapsedPlayTime / 14.0);    // +1 m/s every 14s
        const targetRunSpeed = isBoost ? 
            this.maxSpeed + 5.0 : 
            Math.min(this.maxSpeed, this.startSpeed + distanceSpeed + timeSpeed);
        this.currentSpeed += (targetRunSpeed - this.currentSpeed) * Math.min(1.0, delta * 1.8);

        // Advance forward
        const moveDist = this.currentSpeed * delta;
        this.distance += moveDist;
        this.score = Math.floor(this.distance + (this.coinsCollected * 10 * this.scoreMultiplier));

        this.playerWorldPos.addScaledVector(this.forwardVector, moveDist);

        // Update Character position & animation
        this.character.update(delta, this.currentSpeed);

        const charMeshPos = this.playerWorldPos.clone()
            .addScaledVector(this.rightVector, this.character.posX);
        charMeshPos.y = this.character.posY;
        this.character.group.position.copy(charMeshPos);

        const d = Directions[this.currentDirIndex];
        this.character.group.rotation.y = d.angle;

        // Footstep sounds & dust
        if (this.character.isGrounded && Math.sin(this.character.animTime * 12.0) > 0.95) {
            if (window.soundSystem) window.soundSystem.playFootstep();
            this.particles.spawnDust(charMeshPos.x, charMeshPos.y, charMeshPos.z, 2);
        }

        // Pursuer update
        this.updatePursuer(delta, charMeshPos);

        // Update Camera
        this.cameraController.update(delta, charMeshPos, this.forwardVector, this.rightVector);

        // Update Sun Light
        this.sunLight.position.set(charMeshPos.x + 25, charMeshPos.y + 45, charMeshPos.z + 25);
        this.sunLight.target.position.copy(charMeshPos);
        this.sunLight.target.updateMatrixWorld();

        // Update Collectibles (magnet & animations)
        const isMagnet = (this.activePowerup === PowerupTypes.MAGNET);
        this.collectibles.update(delta, charMeshPos, isMagnet);

        // Check Collisions (Coins, Powerups, Obstacles)
        this.checkCollisions(charMeshPos);

        // Turn & Intersection handling
        this.updateTurnCheck();

        // Update Active Powerup Timer
        this.updatePowerupTimer(delta);

        // Update Environment (Recycle and spawn new segments)
        this.environment.update(charMeshPos, 1);

        // Update Particles
        this.particles.update(delta, charMeshPos);

        // Update HUD
        this.ui.updateHUD(this.score, this.coinsCollected, this.distance);
    }

    processInput() {
        if (this.stateManager.isActionBlocked()) return;

        const action = this.inputManager.consumeAction();
        if (!action) return;

        switch (action) {
            case 'JUMP':
                if (this.character.jump()) {
                    this.stateManager.setPlayerState(PlayerStates.JUMPING);
                    if (window.soundSystem) window.soundSystem.playJump();
                }
                break;

            case 'SLIDE':
                if (this.character.slide()) {
                    this.stateManager.setPlayerState(PlayerStates.SLIDING);
                    if (window.soundSystem) window.soundSystem.playSlide();
                }
                break;

            case 'LEFT': {
                const turnSeg = this.canBufferTurn(-1);
                if (turnSeg) {
                    this.pendingTurnDir = -1;
                    if (this.playerWorldPos.distanceTo(turnSeg.intersectionCenter) <= 4.0) {
                        this.executeTurn(turnSeg);
                    }
                    if (window.soundSystem) window.soundSystem.playTurn();
                } else {
                    if (this.character.changeLane(-1)) {
                        if (window.soundSystem) window.soundSystem.playClick();
                    }
                }
                break;
            }

            case 'RIGHT': {
                const turnSeg = this.canBufferTurn(1);
                if (turnSeg) {
                    this.pendingTurnDir = 1;
                    if (this.playerWorldPos.distanceTo(turnSeg.intersectionCenter) <= 4.0) {
                        this.executeTurn(turnSeg);
                    }
                    if (window.soundSystem) window.soundSystem.playTurn();
                } else {
                    if (this.character.changeLane(1)) {
                        if (window.soundSystem) window.soundSystem.playClick();
                    }
                }
                break;
            }

            case 'PAUSE':
                this.pauseGame();
                break;
        }
    }

    canBufferTurn(turnDir) {
        for (const seg of this.environment.segments) {
            if (seg.isTurn && seg.turnDir === turnDir && seg !== this.turnExecutedForSeg) {
                const distToTurn = this.playerWorldPos.distanceTo(seg.intersectionCenter);
                if (distToTurn <= this.turnGraceDistance) {
                    return seg;
                }
            }
        }
        return null;
    }

    updateTurnCheck() {
        for (const seg of this.environment.segments) {
            if (seg.isTurn && seg !== this.turnExecutedForSeg) {
                const distToIntersection = this.playerWorldPos.distanceTo(seg.intersectionCenter);

                // If player buffered a matching turn and arrived at intersection
                if (this.pendingTurnDir === seg.turnDir && distToIntersection <= 4.0) {
                    this.executeTurn(seg);
                    return;
                }

                // If player failed to turn and ran past the intersection center into the wall
                const toPlayer = new THREE.Vector3().subVectors(this.playerWorldPos, seg.intersectionCenter);
                const forwardProjection = toPlayer.dot(this.forwardVector);

                if (forwardProjection > 2.5) {
                    this.cameraController.shake(0.8, 0.6);
                    this.onGameOver('COLLISION');
                    return;
                }
            }
        }
    }

    executeTurn(seg) {
        this.turnExecutedForSeg = seg;
        this.playerWorldPos.copy(seg.intersectionCenter);
        this.character.posX = 0;
        this.character.targetX = 0;
        this.character.currentLane = 0;

        this.currentDirIndex = seg.nextDirIndex;
        this.updateDirectionVectors();

        this.pendingTurnDir = null;
        if (window.soundSystem) window.soundSystem.playTurn();
    }

    checkCollisions(playerPos) {
        // 1. Collectible Coins
        for (let i = this.collectibles.coins.length - 1; i >= 0; i--) {
            const coin = this.collectibles.coins[i];
            if (coin.userData.collected) continue;

            const dist = playerPos.distanceTo(coin.position);
            if (dist < coin.userData.radius + this.character.colliderRadius) {
                coin.userData.collected = true;
                this.coinsCollected += (this.activePowerup === PowerupTypes.MULTIPLIER ? 2 : 1);
                this.particles.spawnCoinSparkle(coin.position.x, coin.position.y, coin.position.z);
                if (window.soundSystem) window.soundSystem.playCoin();
                this.collectibles.removeCoin(coin);
            }
        }

        // 2. Power-Up Pickups
        for (let i = this.collectibles.powerups.length - 1; i >= 0; i--) {
            const pup = this.collectibles.powerups[i];
            if (pup.userData.collected) continue;

            const dist = playerPos.distanceTo(pup.position);
            if (dist < pup.userData.radius + this.character.colliderRadius) {
                pup.userData.collected = true;
                this.activatePowerup(pup.userData.powerupType);
                this.particles.spawnImpactSparks(pup.position.x, pup.position.y, pup.position.z);
                if (window.soundSystem) window.soundSystem.playPowerup();
                this.collectibles.removePowerup(pup);
            }
        }

        // 3. Obstacle Collisions
        if (this.activePowerup === PowerupTypes.BOOST) return; // Invulnerable during Boost

        for (const seg of this.environment.segments) {
            if (seg.obstacles.length === 0) continue;

            // Convert world player position to segment local coordinate space
            const localPos = seg.group.worldToLocal(playerPos.clone());

            for (const obs of seg.obstacles) {
                if (!obs.userData.active) continue;
                const c = obs.userData.collider;

                // Obstacle is placed at local Z = -10.0
                const distZ = Math.abs(localPos.z - (-10.0));
                if (distZ < c.depth * 0.5) {
                    if (localPos.x >= c.minX && localPos.x <= c.maxX) {
                        let hit = false;
                        if (c.actionNeeded === 'JUMP') {
                            if (localPos.y < c.maxY) hit = true;
                        } else if (c.actionNeeded === 'SLIDE') {
                            if (!this.character.isSliding) hit = true;
                        } else if (c.actionNeeded === 'DODGE') {
                            hit = true;
                        }

                        if (hit) {
                            this.handleObstacleHit(obs);
                            return;
                        }
                    }
                }
            }
        }
    }

    handleObstacleHit(obstacle) {
        if (this.activePowerup === PowerupTypes.SHIELD) {
            this.activePowerup = null;
            this.powerupRemaining = 0;
            this.character.setShieldActive(false);
            this.cameraController.shake(0.5, 0.4);
            this.particles.spawnImpactSparks(this.character.group.position.x, 1.5, this.character.group.position.z);
            if (window.soundSystem) window.soundSystem.playCrash();
            obstacle.userData.active = false;
            return;
        }

        if (this.pursuer.threatLevel < 1) {
            this.pursuer.onPlayerStumble();
            this.character.currentAnimation = 'stumble';
            this.cameraController.shake(0.4, 0.35);
            if (window.soundSystem) window.soundSystem.playStumble();
            obstacle.userData.active = false;

            setTimeout(() => {
                if (this.stateManager.playerState !== PlayerStates.DEAD) {
                    this.character.currentAnimation = 'run';
                }
            }, 600);
        } else {
            this.pursuer.onPlayerCatch();
            this.cameraController.shake(0.7, 0.6);
            this.onGameOver('COLLISION');
        }
    }

    activatePowerup(type) {
        this.activePowerup = type;
        const upgradeLevel = this.progression.upgrades[type.toLowerCase()] || 1;

        if (type === PowerupTypes.MAGNET) {
            this.powerupDuration = 8.0 + upgradeLevel * 2.5;
        } else if (type === PowerupTypes.SHIELD) {
            this.powerupDuration = 12.0 + upgradeLevel * 2.0;
            this.character.setShieldActive(true);
        } else if (type === PowerupTypes.BOOST) {
            this.powerupDuration = 5.0 + upgradeLevel * 1.2;
            this.character.setBoostActive(true);
            this.cameraController.setSpeedBoost(true);
        } else if (type === PowerupTypes.MULTIPLIER) {
            this.powerupDuration = 10.0 + upgradeLevel * 2.0;
            this.scoreMultiplier = 2;
        }

        this.powerupRemaining = this.powerupDuration;
    }

    updatePowerupTimer(delta) {
        if (!this.activePowerup) {
            this.ui.updatePowerupBar(false);
            return;
        }

        this.powerupRemaining -= delta;
        this.ui.updatePowerupBar(true, this.activePowerup, this.powerupRemaining, this.powerupDuration);

        if (this.powerupRemaining <= 0) {
            if (this.activePowerup === PowerupTypes.SHIELD) {
                this.character.setShieldActive(false);
            } else if (this.activePowerup === PowerupTypes.BOOST) {
                this.character.setBoostActive(false);
                this.cameraController.setSpeedBoost(false);
            } else if (this.activePowerup === PowerupTypes.MULTIPLIER) {
                this.scoreMultiplier = 1;
            }
            this.activePowerup = null;
        }
    }

    updatePursuer(delta, playerPos) {
        this.pursuer.update(delta, playerPos, this.currentSpeed);

        if (!this.pursuer.group.visible) return;

        const beastPos = playerPos.clone()
            .addScaledVector(this.forwardVector, -this.pursuer.currentDistance);
        beastPos.y = 0;
        this.pursuer.group.position.copy(beastPos);

        const d = Directions[this.currentDirIndex];
        this.pursuer.group.rotation.y = d.angle;
    }

    loadProgression() {
        try {
            const raw = localStorage.getItem('temple_escape_save');
            if (raw) {
                this.progression = JSON.parse(raw);
            } else {
                this.progression = {
                    highScore: 0,
                    bestDistance: 0,
                    totalCoins: 0,
                    upgrades: { magnet: 1, shield: 1, boost: 1, multiplier: 1 }
                };
            }
        } catch (e) {
            this.progression = {
                highScore: 0,
                bestDistance: 0,
                totalCoins: 0,
                upgrades: { magnet: 1, shield: 1, boost: 1, multiplier: 1 }
            };
        }
    }

    saveProgression() {
        try {
            localStorage.setItem('temple_escape_save', JSON.stringify(this.progression));
        } catch (e) {
            console.warn('LocalStorage save error:', e);
        }
    }

    buyUpgrade(upgradeId, cost) {
        if (this.progression.totalCoins >= cost) {
            this.progression.totalCoins -= cost;
            this.progression.upgrades[upgradeId] = (this.progression.upgrades[upgradeId] || 1) + 1;
            this.saveProgression();
            return true;
        }
        return false;
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.templeGame = new Game();
});

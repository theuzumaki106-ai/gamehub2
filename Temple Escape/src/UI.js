/**
 * UI.js - User Interface Controller & Progression Manager
 */

class UIManager {
    constructor(game) {
        this.game = game;

        // Elements
        this.hud = document.getElementById('hud');
        this.hudScore = document.getElementById('hud-score');
        this.hudCoins = document.getElementById('hud-coins');
        this.hudDistance = document.getElementById('hud-distance');
        this.powerupBarContainer = document.getElementById('powerup-bar-container');
        this.powerupBarIcon = document.getElementById('powerup-bar-icon');
        this.powerupBarLabel = document.getElementById('powerup-bar-label');
        this.powerupBarFill = document.getElementById('powerup-bar-fill');

        // Overlays
        this.screenTitle = document.getElementById('screen-title');
        this.screenPause = document.getElementById('screen-pause');
        this.screenGameOver = document.getElementById('screen-game-over');
        this.screenShop = document.getElementById('screen-shop');
        this.screenSettings = document.getElementById('screen-settings');
        this.screenGuide = document.getElementById('screen-guide');

        // Results elements
        this.resultScore = document.getElementById('result-score');
        this.resultDistance = document.getElementById('result-distance');
        this.resultCoins = document.getElementById('result-coins');
        this.resultBest = document.getElementById('result-best');
        this.newBestBadge = document.getElementById('new-best-badge');

        // Progression displays
        this.titleBestScore = document.getElementById('title-best-score');
        this.titleTotalCoins = document.getElementById('title-total-coins');
        this.shopTotalCoins = document.getElementById('shop-total-coins');

        this.initButtons();
        this.updateProgressionDisplays();
    }

    initButtons() {
        // Pause Button
        document.getElementById('btn-pause').addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.soundSystem) window.soundSystem.playClick();
            this.game.pauseGame();
        });

        // Title Screen Buttons
        document.getElementById('btn-start').addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.soundSystem) {
                window.soundSystem.init();
                window.soundSystem.playClick();
            }
            this.hideAllScreens();
            this.game.startGame();
        });

        document.getElementById('btn-title-shop').addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.soundSystem) window.soundSystem.playClick();
            this.openShop();
        });

        document.getElementById('btn-title-settings').addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.soundSystem) window.soundSystem.playClick();
            this.openSettings();
        });

        document.getElementById('btn-title-guide').addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.soundSystem) window.soundSystem.playClick();
            this.openGuide();
        });

        // Pause Screen Buttons
        document.getElementById('btn-resume').addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.soundSystem) window.soundSystem.playClick();
            this.game.resumeGame();
        });

        document.getElementById('btn-pause-restart').addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.soundSystem) window.soundSystem.playClick();
            this.hideAllScreens();
            this.game.startGame();
        });

        document.getElementById('btn-pause-menu').addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.soundSystem) window.soundSystem.playClick();
            this.showTitleScreen();
        });

        // Game Over Buttons
        document.getElementById('btn-retry').addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.soundSystem) window.soundSystem.playClick();
            this.hideAllScreens();
            this.game.startGame();
        });

        document.getElementById('btn-gameover-shop').addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.soundSystem) window.soundSystem.playClick();
            this.openShop();
        });

        document.getElementById('btn-gameover-menu').addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.soundSystem) window.soundSystem.playClick();
            this.showTitleScreen();
        });

        // Shop Buttons
        document.getElementById('btn-close-shop').addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.soundSystem) window.soundSystem.playClick();
            this.screenShop.classList.remove('active');
            if (this.game.stateManager.gameState === GameStates.MENU) {
                this.screenTitle.classList.add('active');
            } else if (this.game.stateManager.gameState === GameStates.GAME_OVER) {
                this.screenGameOver.classList.add('active');
            }
        });

        // Settings Buttons & Sliders
        document.getElementById('btn-close-settings').addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.soundSystem) window.soundSystem.playClick();
            this.screenSettings.classList.remove('active');
            if (this.game.stateManager.gameState === GameStates.PAUSED) {
                this.screenPause.classList.add('active');
            } else {
                this.screenTitle.classList.add('active');
            }
        });

        const sfxSlider = document.getElementById('slider-sfx');
        if (sfxSlider && window.soundSystem) {
            sfxSlider.value = window.soundSystem.sfxVolume * 100;
            sfxSlider.addEventListener('input', (e) => {
                window.soundSystem.setSfxVolume(e.target.value / 100);
            });
        }

        const musicSlider = document.getElementById('slider-music');
        if (musicSlider && window.soundSystem) {
            musicSlider.value = window.soundSystem.musicVolume * 100;
            musicSlider.addEventListener('input', (e) => {
                window.soundSystem.setMusicVolume(e.target.value / 100);
            });
        }

        // Guide Button
        document.getElementById('btn-close-guide').addEventListener('click', () => {
            if (window.soundSystem) window.soundSystem.playClick();
            this.screenGuide.classList.remove('active');
            this.screenTitle.classList.add('active');
        });

        // On-screen touch buttons for mobile / mouse click
        const tLeft = document.getElementById('touch-left');
        const tRight = document.getElementById('touch-right');
        const tUp = document.getElementById('touch-up');
        const tDown = document.getElementById('touch-down');

        if (tLeft) tLeft.addEventListener('click', () => this.game.inputManager.pushAction('LEFT'));
        if (tRight) tRight.addEventListener('click', () => this.game.inputManager.pushAction('RIGHT'));
        if (tUp) tUp.addEventListener('click', () => this.game.inputManager.pushAction('JUMP'));
        if (tDown) tDown.addEventListener('click', () => this.game.inputManager.pushAction('SLIDE'));

        // Initialize upgrade cards
        this.renderUpgrades();
    }

    hideAllScreens() {
        const countdown = document.getElementById('screen-countdown');
        if (countdown) countdown.classList.remove('active');

        const screens = [
            this.screenTitle,
            this.screenPause,
            this.screenGameOver,
            this.screenShop,
            this.screenSettings,
            this.screenGuide
        ];
        screens.forEach(s => s && s.classList.remove('active'));
    }

    startResumeCountdown(onComplete) {
        const overlay = document.getElementById('screen-countdown');
        const numElem = document.getElementById('countdown-number');
        if (!overlay || !numElem) {
            if (onComplete) onComplete();
            return;
        }

        overlay.classList.add('active');
        let count = 3;

        const tick = () => {
            if (count > 0) {
                numElem.innerText = count;
                numElem.classList.remove('countdown-pop');
                void numElem.offsetWidth; // trigger reflow
                numElem.classList.add('countdown-pop');

                if (window.soundSystem) window.soundSystem.playCountdown(false);
                count--;
                setTimeout(tick, 950);
            } else if (count === 0) {
                numElem.innerText = 'GO!';
                numElem.classList.remove('countdown-pop');
                void numElem.offsetWidth;
                numElem.classList.add('countdown-pop');

                if (window.soundSystem) window.soundSystem.playCountdown(true);
                count--;
                setTimeout(tick, 700);
            } else {
                overlay.classList.remove('active');
                if (onComplete) onComplete();
            }
        };

        tick();
    }

    showTitleScreen() {
        this.hideAllScreens();
        this.screenTitle.classList.add('active');
        this.updateProgressionDisplays();
        this.game.stateManager.setGameState(GameStates.MENU);
        if (window.soundSystem) window.soundSystem.stopMusic();
    }

    showPauseScreen() {
        this.hideAllScreens();
        this.screenPause.classList.add('active');
        if (window.soundSystem) window.soundSystem.stopMusic();
    }

    showGameOverScreen(stats, isNewHigh) {
        this.hideAllScreens();
        this.screenGameOver.classList.add('active');

        this.resultScore.innerText = stats.score.toLocaleString();
        this.resultDistance.innerText = `${Math.floor(stats.distance)} m`;
        this.resultCoins.innerText = stats.coins.toLocaleString();
        this.resultBest.innerText = stats.highScore.toLocaleString();

        if (isNewHigh) {
            this.newBestBadge.style.display = 'inline-block';
        } else {
            this.newBestBadge.style.display = 'none';
        }

        this.updateProgressionDisplays();
        if (window.soundSystem) window.soundSystem.stopMusic();
    }

    openShop() {
        this.hideAllScreens();
        this.screenShop.classList.add('active');
        this.renderUpgrades();
    }

    openSettings() {
        this.hideAllScreens();
        this.screenSettings.classList.add('active');
    }

    openGuide() {
        this.hideAllScreens();
        this.screenGuide.classList.add('active');
    }

    updateHUD(score, coins, distance) {
        if (this.hudScore) this.hudScore.innerText = score.toLocaleString();
        if (this.hudCoins) this.hudCoins.innerText = coins.toLocaleString();
        if (this.hudDistance) this.hudDistance.innerText = `${Math.floor(distance)}m`;
    }

    updatePowerupBar(active, type, remainingSec, totalSec) {
        if (!active || remainingSec <= 0) {
            this.powerupBarContainer.style.display = 'none';
            return;
        }

        this.powerupBarContainer.style.display = 'flex';
        this.powerupBarLabel.innerText = type;

        const iconFile = type === 'MAGNET' ? 'icon-magnet.svg' :
                         (type === 'SHIELD' ? 'icon-shield.svg' :
                         (type === 'BOOST' ? 'icon-boost.svg' : 'icon-multiplier.svg'));
        this.powerupBarIcon.src = `assets/icons/${iconFile}`;

        const pct = Math.max(0, Math.min(100, (remainingSec / totalSec) * 100));
        this.powerupBarFill.style.width = `${pct}%`;
    }

    updateProgressionDisplays() {
        const p = this.game.progression;
        if (this.titleBestScore) this.titleBestScore.innerText = p.highScore.toLocaleString();
        if (this.titleTotalCoins) this.titleTotalCoins.innerText = p.totalCoins.toLocaleString();
        if (this.shopTotalCoins) this.shopTotalCoins.innerText = p.totalCoins.toLocaleString();
    }

    renderUpgrades() {
        const container = document.getElementById('upgrades-container');
        if (!container) return;
        container.innerHTML = '';

        const p = this.game.progression;
        const upgradeDefs = [
            { id: 'magnet', name: 'Coin Magnet', icon: 'icon-magnet.svg', maxLevel: 5, baseCost: 100 },
            { id: 'shield', name: 'Temple Shield', icon: 'icon-shield.svg', maxLevel: 5, baseCost: 150 },
            { id: 'boost', name: 'Speed Boost', icon: 'icon-boost.svg', maxLevel: 5, baseCost: 200 },
            { id: 'multiplier', name: 'Score Multiplier', icon: 'icon-multiplier.svg', maxLevel: 5, baseCost: 250 }
        ];

        upgradeDefs.forEach(u => {
            const currentLevel = p.upgrades[u.id] || 1;
            const cost = u.baseCost * currentLevel;
            const isMax = currentLevel >= u.maxLevel;
            const canAfford = p.totalCoins >= cost && !isMax;

            const card = document.createElement('div');
            card.className = 'upgrade-card';

            let dotsHtml = '';
            for (let i = 1; i <= u.maxLevel; i++) {
                dotsHtml += `<div class="level-dot ${i <= currentLevel ? 'active' : ''}"></div>`;
            }

            card.innerHTML = `
                <div class="upgrade-info">
                    <img src="assets/icons/${u.icon}" class="upgrade-icon" alt="${u.name}">
                    <div>
                        <div class="upgrade-name">${u.name} (Lv ${currentLevel})</div>
                        <div class="upgrade-level-dots">${dotsHtml}</div>
                    </div>
                </div>
                <div>
                    <button class="upgrade-buy-btn" data-id="${u.id}" ${canAfford ? '' : 'disabled'}>
                        ${isMax ? 'MAX' : `BUY ${cost}`}
                    </button>
                </div>
            `;

            const btn = card.querySelector('button');
            if (canAfford) {
                btn.addEventListener('click', () => {
                    this.game.buyUpgrade(u.id, cost);
                    this.renderUpgrades();
                    this.updateProgressionDisplays();
                    if (window.soundSystem) window.soundSystem.playPowerup();
                });
            }

            container.appendChild(card);
        });

        this.updateProgressionDisplays();
    }
}

window.UIManager = UIManager;

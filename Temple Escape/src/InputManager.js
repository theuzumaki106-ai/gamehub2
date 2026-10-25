/**
 * InputManager.js - Desktop Keyboard + Mobile Touch/Swipe Input Handler
 */

class InputManager {
    constructor() {
        this.actionQueue = [];
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.minSwipeDistance = 35; // Pixels
        this.maxSwipeTime = 500; // ms
        this.enabled = true;

        this.initKeyboard();
        this.initTouch();
    }

    initKeyboard() {
        window.addEventListener('keydown', (e) => {
            if (!this.enabled) return;

            // Prevent scrolling on arrows/space
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                case ' ':
                    this.pushAction('JUMP');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.pushAction('SLIDE');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.pushAction('LEFT');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.pushAction('RIGHT');
                    break;
                case 'Escape':
                case 'p':
                case 'P':
                    this.pushAction('PAUSE');
                    break;
            }
        });
    }

    initTouch() {
        // Touch events
        window.addEventListener('touchstart', (e) => {
            if (!this.enabled || e.touches.length === 0) return;
            // If touching an interactive UI button, let UI handle it
            if (e.target.closest('button, .ui-interactive, input, select')) return;

            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
            this.touchStartTime = performance.now();
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (!this.enabled) return;
            if (e.target.closest('button, .ui-interactive, input, select')) return;
            // Prevent bounce scroll on mobile
            e.preventDefault();
        }, { passive: false });

        window.addEventListener('touchend', (e) => {
            if (!this.enabled || e.changedTouches.length === 0) return;
            if (e.target.closest('button, .ui-interactive, input, select')) return;

            const touch = e.changedTouches[0];
            const dx = touch.clientX - this.touchStartX;
            const dy = touch.clientY - this.touchStartY;
            const dt = performance.now() - this.touchStartTime;

            if (dt > this.maxSwipeTime) return;

            const absX = Math.abs(dx);
            const absY = Math.abs(dy);

            if (Math.max(absX, absY) >= this.minSwipeDistance) {
                if (absX > absY) {
                    // Horizontal swipe
                    if (dx > 0) {
                        this.pushAction('RIGHT');
                    } else {
                        this.pushAction('LEFT');
                    }
                } else {
                    // Vertical swipe
                    if (dy > 0) {
                        this.pushAction('SLIDE');
                    } else {
                        this.pushAction('JUMP');
                    }
                }
            } else {
                // Quick tap - check if double tap or ability trigger
                this.pushAction('TAP');
            }
        }, { passive: false });

        // Mouse drag swipe support for desktop testing
        let isMouseDown = false;
        let mouseStartX = 0;
        let mouseStartY = 0;

        window.addEventListener('mousedown', (e) => {
            if (!this.enabled) return;
            if (e.target.closest('button, .ui-interactive, input, select')) return;
            isMouseDown = true;
            mouseStartX = e.clientX;
            mouseStartY = e.clientY;
        });

        window.addEventListener('mouseup', (e) => {
            if (!isMouseDown) return;
            isMouseDown = false;
            const dx = e.clientX - mouseStartX;
            const dy = e.clientY - mouseStartY;
            const absX = Math.abs(dx);
            const absY = Math.abs(dy);

            if (Math.max(absX, absY) >= this.minSwipeDistance) {
                if (absX > absY) {
                    if (dx > 0) this.pushAction('RIGHT');
                    else this.pushAction('LEFT');
                } else {
                    if (dy > 0) this.pushAction('SLIDE');
                    else this.pushAction('JUMP');
                }
            }
        });
    }

    pushAction(action) {
        // Buffer up to 2 actions to allow smooth combo inputs
        if (this.actionQueue.length < 2) {
            this.actionQueue.push({ action, time: performance.now() });
        }
    }

    consumeAction() {
        if (this.actionQueue.length === 0) return null;
        const item = this.actionQueue.shift();
        // Discard actions older than 400ms buffer
        if (performance.now() - item.time > 400) {
            return this.consumeAction();
        }
        return item.action;
    }

    clear() {
        this.actionQueue = [];
    }
}

window.InputManager = InputManager;

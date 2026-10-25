/**
 * StateManager.js - Finite State Machine for Player and Game State
 */

const PlayerStates = {
    RUNNING: 'RUNNING',
    TURNING: 'TURNING',
    JUMPING: 'JUMPING',
    SLIDING: 'SLIDING',
    FALLING: 'FALLING',
    COLLIDING: 'COLLIDING',
    STUMBLING: 'STUMBLING',
    REVIVING: 'REVIVING',
    DEAD: 'DEAD'
};

const GameStates = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER'
};

class StateManager {
    constructor() {
        this.gameState = GameStates.MENU;
        this.playerState = PlayerStates.RUNNING;
        this.previousPlayerState = PlayerStates.RUNNING;
        this.stateTime = 0;
        this.listeners = [];
    }

    setGameState(newState) {
        if (this.gameState === newState) return;
        const oldState = this.gameState;
        this.gameState = newState;
        this.notify('gameStateChange', { oldState, newState });
    }

    setPlayerState(newState) {
        if (this.playerState === newState) return;
        
        // State transition rules:
        // Cannot jump or slide while falling or dead
        if ((this.playerState === PlayerStates.FALLING || this.playerState === PlayerStates.DEAD) && 
            newState !== PlayerStates.REVIVING && newState !== PlayerStates.RUNNING) {
            return;
        }

        // Cannot jump while already jumping
        if (this.playerState === PlayerStates.JUMPING && newState === PlayerStates.JUMPING) {
            return;
        }

        // Cannot slide while sliding
        if (this.playerState === PlayerStates.SLIDING && newState === PlayerStates.SLIDING) {
            return;
        }

        this.previousPlayerState = this.playerState;
        this.playerState = newState;
        this.stateTime = 0;
        this.notify('playerStateChange', { oldState: this.previousPlayerState, newState });
    }

    update(delta) {
        this.stateTime += delta;
    }

    isInvulnerable() {
        return this.playerState === PlayerStates.REVIVING;
    }

    isActionBlocked() {
        return this.playerState === PlayerStates.DEAD ||
               this.playerState === PlayerStates.FALLING ||
               this.playerState === PlayerStates.COLLIDING;
    }

    on(event, callback) {
        this.listeners.push({ event, callback });
    }

    notify(event, data) {
        for (const l of this.listeners) {
            if (l.event === event) l.callback(data);
        }
    }
}

window.PlayerStates = PlayerStates;
window.GameStates = GameStates;
window.StateManager = StateManager;

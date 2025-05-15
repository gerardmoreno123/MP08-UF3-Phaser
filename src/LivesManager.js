class LivesManager {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.lives = 3; // Inicializar vidas
        console.log('Vidas iniciales:', this.lives);
    }

    loseLife() {
        if (this.lives > 1) {
            this.lives -= 1;
            console.log('Vidas restantes:', this.lives);
            this.player.sprite.setPosition(24, 192);
            this.player.canJump = true;
            if (this.player.idleTimer) {
                this.scene.time.removeEvent(this.player.idleTimer);
                this.player.idleTimer = null;
            }
            if (this.scene && this.scene.scene.key !== 'GameOverScene') {
                this.scene.events.emit('updateLives');
            }
        } else {
            console.log('¡Game Over! No quedan vidas.');
            this.scene.scene.start('GameOverScene');
        }
    }

    getLives() {
        return this.lives;
    }

    resetLives() {
        this.lives = 3;
        // Only emit updateLives if not in GameOverScene
        if (this.scene && this.scene.scene.key !== 'GameOverScene') {
            this.scene.events.emit('updateLives');
            console.log('Vidas reiniciadas:', this.lives);
        } else {
            console.log('Vidas reiniciadas sin emitir updateLives en GameOverScene:', this.lives);
        }
    }

    setSceneAndPlayer(scene, player) {
        this.scene = scene;
        this.player = player;
        console.log('LivesManager actualitzat amb nova escena i jugador, vides actuals:', this.lives);
    }
}
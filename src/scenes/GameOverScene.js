class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    preload() {
        this.load.image('GameOver', 'assets/backgrounds/GameOver.png');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Pausar la música al llegar a la escena final
        const musicManager = this.registry.get('MusicManager');
        if (musicManager) {
            musicManager.pause();
        }

        const bg = this.add.image(width / 2, height / 2, 'GameOver').setOrigin(0.5);
        bg.displayWidth = width;
        bg.displayHeight = height;

        const startButton = this.add.text(width / 2, height / 2 + 50, 'Reinicia', {
            fontSize: '32px',
            color: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        startButton.on('pointerdown', () => {
            const livesManager = this.registry.get('LivesManager');
            if (livesManager) {
                livesManager.resetLives();
            }
            // Do not reset coins here to allow persistence
            this.scene.stop('Level1Scene');
            this.scene.stop('Level2Scene');
            this.scene.start('Level1Scene');
        });

        startButton.on('pointerover', () => startButton.setStyle({ color: '#ffff00' }));
        startButton.on('pointerout', () => startButton.setStyle({ color: '#00ff00' }));
    }
}
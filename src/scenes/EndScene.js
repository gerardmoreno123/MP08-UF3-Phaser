class EndScene extends Phaser.Scene {
    constructor() {
        super('EndScene');
    }

    preload() {
        // Load the game over screen background
        this.load.image('StartScreen', 'assets/backgrounds/StartScreen.png');
    }

    create() {
        const width = this.cameras.main.width; // 512 pixels
        const height = this.cameras.main.height; // 256 pixels

        // Add the game over screen background
        const bg = this.add.image(width / 2, height / 2, 'StartScreen').setOrigin(0.5);
        bg.displayWidth = width;
        bg.displayHeight = height;

        // Add "Game Over" title with styling
        const title = this.add.text(width / 2, height / 2 - 80, 'Game Over', {
            fontSize: '36px',
            color: '#ff0000', // Red color for "Game Over"
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Get game data from registry
        const livesManager = this.registry.get('LivesManager');
        const gemManager = this.registry.get('GemManager');

        // Get remaining lives and collected coins
        const remainingLives = livesManager ? livesManager.getLives() : 0;
        const collectedCoins = gemManager ? gemManager.getCoins() : 0;
        const totalCoins = 8;

        // Display remaining lives
        const livesText = this.add.text(width / 2, height / 2 - 20, `Vidas Restantes: ${remainingLives}`, {
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Display collected coins and total coins
        const coinsText = this.add.text(width / 2, height / 2 + 10, `Monedas: ${collectedCoins} / ${totalCoins}`, {
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Add restart button with styling and hover effect
        const restartButton = this.add.text(width / 2, height / 2 + 80, 'Reiniciar', {
            fontSize: '32px',
            color: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 25, y: 12 },
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setInteractive();

        // Button interactions
        restartButton.on('pointerdown', () => {
            // Reset lives and coins if needed
            if (livesManager) livesManager.resetLives();
            if (gemManager) gemManager.resetCoins();
            this.scene.start('Level1Scene');
        });

        restartButton.on('pointerover', () => {
            restartButton.setStyle({ color: '#ffff00', scale: 1.1 });
        });

        restartButton.on('pointerout', () => {
            restartButton.setStyle({ color: '#00ff00', scale: 1.0 });
        });

        // Fade-in effect for all elements
        this.tweens.add({
            targets: [bg, title, livesText, coinsText, restartButton],
            alpha: { from: 0, to: 1 },
            duration: 1000,
            ease: 'Power2'
        });
    }
}
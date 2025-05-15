class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    preload() {
        // Load the start screen background and character sprite
        this.load.image('StartScreen', 'assets/backgrounds/StartScreen.png');
    }

    create() {
        const width = this.cameras.main.width; // 512 pixels
        const height = this.cameras.main.height; // 256 pixels

        // Add the start screen background
        const bg = this.add.image(width / 2, height / 2, 'StartScreen').setOrigin(0.5);
        bg.displayWidth = width;
        bg.displayHeight = height;

        // Add title text with improved styling
        const title = this.add.text(width / 2, height / 2 - 80, 'The Hollow Hood', {
            fontSize: '36px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Add start button with enhanced styling and hover effect
        const startButton = this.add.text(width / 2, height / 2 + 80, 'Comença', {
            fontSize: '32px',
            color: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 25, y: 12 },
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setInteractive();

        // Button interactions
        startButton.on('pointerdown', () => {
            this.scene.start('Level1Scene');
        });

        startButton.on('pointerover', () => {
            startButton.setStyle({ color: '#ffff00', scale: 1.1 });
        });

        startButton.on('pointerout', () => {
            startButton.setStyle({ color: '#00ff00', scale: 1.0 });
        });

        // Optional: Add a subtle fade-in effect for all elements
        this.tweens.add({
            targets: [bg, title, startButton],
            alpha: { from: 0, to: 1 },
            duration: 1000,
            ease: 'Power2'
        });
    }
}
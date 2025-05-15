class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    preload() {
        // Cargar el fondo de la pantalla de inicio
        this.load.image('StartScreen', 'assets/backgrounds/StartScreen.png');

        // Inicializar MusicManager y cargar la música
        this.musicManager = new MusicManager(this);
        this.musicManager.preload();
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Reproducir la música a través de MusicManager
        this.musicManager.create();

        // Crear el fondo y el botón para comenzar
        const bg = this.add.image(width / 2, height / 2, 'StartScreen').setOrigin(0.5);
        bg.displayWidth = width;
        bg.displayHeight = height;

        const title = this.add.text(width / 2, height / 2 - 80, 'The Hollow Hood', {
            fontSize: '36px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        const startButton = this.add.text(width / 2, height / 2 + 80, 'Comença', {
            fontSize: '32px',
            color: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 25, y: 12 },
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setInteractive();

        startButton.on('pointerdown', () => {
            // Asegurarse de que la música esté reproduciéndose (por políticas de reproducción automática)
            this.musicManager.play();
            this.scene.start('Level1Scene');
        });

        startButton.on('pointerover', () => {
            startButton.setStyle({ color: '#ffff00', scale: 1.1 });
        });

        startButton.on('pointerout', () => {
            startButton.setStyle({ color: '#00ff00', scale: 1.0 });
        });

        this.tweens.add({
            targets: [bg, title, startButton],
            alpha: { from: 0, to: 1 },
            duration: 1000,
            ease: 'Power2'
        });
    }
}
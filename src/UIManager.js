class UIManager {
    constructor(scene, livesManager, gemManager) {
        this.scene = scene;
        this.livesManager = livesManager;
        this.gemManager = gemManager;
        this.lives = livesManager.getLives();
        this.coins = gemManager.getCoins();
        this.maxLives = 3;
        this.heartsGroup = this.scene.add.group();
        this.coinIcon = null;
        this.coinText = null;

        this.scene.events.once('create', this.initializeUI.bind(this));
    }

    initializeUI() {
        if (this.heartsGroup) {
            this.heartsGroup.clear(true, true);
        } else {
            this.heartsGroup = this.scene.add.group();
        }

        const startX = this.scene.cameras.main.centerX - (this.maxLives * 20) / 2;
        const startY = 15;
        const spacing = 40;

        this.createAnimations();

        for (let i = 0; i < this.maxLives; i++) {
            const heart = this.scene.add.sprite(startX + (i * spacing), startY, 'hearts', 26);
            heart.setScale(4);
            this.heartsGroup.add(heart);

            if (i < this.lives) {
                heart.play('heartAppear');
                heart.on('animationcomplete', () => heart.setFrame(39));
            } else {
                if (this.scene.scene.key === 'Level2Scene') {
                    heart.play('emptyHeartAppear');
                    heart.on('animationcomplete', () => heart.setFrame(54));
                } else {
                    heart.setFrame(54);
                }
            }
        }

        const coinX = this.scene.cameras.main.width - 60;
        const coinY = 15;

        this.coinIcon = this.scene.add.sprite(coinX, coinY, 'coin');
        this.coinIcon.setScale(2);
        this.coinIcon.play('spin');

        this.coinText = this.scene.add.text(coinX + 30, coinY, `${this.coins}`, {
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.scene.events.off('updateLives', this.updateHearts, this);
        this.scene.events.off('updateCoins', this.updateCoins, this);
        this.scene.events.on('updateLives', this.updateHearts, this);
        this.scene.events.on('updateCoins', this.updateCoins, this);

        console.log(`Initialized ${this.heartsGroup.getLength()} hearts for ${this.lives} lives and ${this.coins} coins in ${this.scene.scene.key}`);
    }

    createAnimations() {
        if (!this.scene.anims.exists('heartAppear')) {
            this.scene.anims.create({
                key: 'heartAppear',
                frames: this.scene.anims.generateFrameNumbers('hearts', { start: 27, end: 38 }),
                frameRate: 8,
                repeat: 0
            });
        }
        if (!this.scene.anims.exists('emptyHeartAppear')) {
            this.scene.anims.create({
                key: 'emptyHeartAppear',
                frames: this.scene.anims.generateFrameNumbers('hearts', { start: 14, end: 25 }),
                frameRate: 8,
                repeat: 0
            });
        }
    }

    updateHearts() {
        if (!this.scene || this.scene.scene.key === 'GameOverScene' || !this.heartsGroup || !this.heartsGroup.scene || !this.heartsGroup.getChildren) {
            console.log('Skipping updateHearts: Invalid scene or heartsGroup', {
                sceneKey: this.scene?.scene?.key,
                heartsGroupExists: !!this.heartsGroup,
                heartsGroupScene: this.heartsGroup?.scene
            });
            return;
        }

        const currentLives = this.livesManager.getLives();
        const hearts = this.heartsGroup.getChildren();

        if (currentLives < this.lives) {
            const heartToDamage = hearts[currentLives];
            if (!heartToDamage) {
                console.warn(`No heart sprite found for index ${currentLives}. Hearts array length: ${hearts.length}`);
                return;
            }

            const damageAnimKey = `heartDamage_${currentLives}`;

            if (!this.scene.anims.exists(damageAnimKey)) {
                this.scene.anims.create({
                    key: damageAnimKey,
                    frames: this.scene.anims.generateFrameNumbers('hearts', { start: 40, end: 39 }),
                    frameRate: 6,
                    repeat: 1
                });
            }

            console.log('Corazón dañado:', currentLives);
            heartToDamage.play(damageAnimKey);
            heartToDamage.on('animationcomplete', () => {
                heartToDamage.setFrame(54);
            });
        }

        this.lives = currentLives;
    }

    updateCoins() {
        if (!this.scene || this.scene.scene.key === 'GameOverScene' || !this.coinText || !this.coinText.scene) {
            console.log('Skipping updateCoins: Invalid scene or coinText', {
                sceneKey: this.scene?.scene?.key,
                coinTextExists: !!this.coinText,
                coinTextScene: this.coinText?.scene
            });
            return;
        }

        this.coins = this.gemManager.getCoins();
        this.coinText.setText(`${this.coins}`);
        console.log('Monedas actualizadas en UI:', this.coins);
    }

    setScene(scene) {
        if (this.scene) {
            this.scene.events.off('updateLives', this.updateHearts, this);
            this.scene.events.off('updateCoins', this.updateCoins, this);
        }

        this.scene = scene;
        this.livesManager.setSceneAndPlayer(scene, scene.player);
        this.gemManager.setScene(scene);

        this.heartsGroup = this.scene.add.group();
        this.initializeUI(); // Reinitialize UI for the new scene
    }

    resetUI() {
        this.lives = this.livesManager.getLives();
        this.coins = this.gemManager.getCoins();
        if (this.scene && this.scene.scene.key !== 'GameOverScene') {
            this.initializeUI();
        } else {
            console.log('Skipping UI initialization in GameOverScene');
        }
    }
}
class Level1Scene extends Phaser.Scene {
    constructor() {
        super('Level1Scene');
        this.canRestart = true;
        this.hasInitialized = false;
    }

    preload() {
        this.load.tilemapTiledJSON('level1_map', 'assets/tilemaps/level1.json');
        this.load.image('nature-paltformer-tileset-16x16', 'assets/tiles/nature-paltformer-tileset-16x16.png');
        this.load.image('Dimensional_Portal', 'assets/sprites/Dimensional_Portal.png');
        this.load.image('Coin', 'assets/sprites/coin.png');
        this.load.spritesheet('enemy', 'assets/sprites/enemy.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet('player', 'assets/sprites/player.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet('portal', 'assets/sprites/Dimensional_Portal.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet('hearts', 'assets/sprites/hearts.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet('coin', 'assets/sprites/coin.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        // Debug log for preload
        this.load.once('complete', () => {
            console.log('Preloading assets, checking enemy.png:', this.textures.exists('enemy'));
        }, this);
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const map = this.make.tilemap({ key: 'level1_map' });
        const tilesetNature = map.addTilesetImage('nature-paltformer-tileset-16x16', 'nature-paltformer-tileset-16x16');
        const tilesetPortal = map.addTilesetImage('Dimensional_Portal', 'Dimensional_Portal');
        const tilesetCoin = map.addTilesetImage('Coin', 'Coin');

        if (!tilesetNature || !tilesetPortal || !tilesetCoin) {
            console.error('Tileset no carregat correctament!');
            return;
        }

        const backgroundLayer = map.createLayer('BackgroundLayer', tilesetNature, 0, 0);
        const decorationLayer = map.createLayer('DecorationLayer', tilesetNature, 0, 0);
        const floorLayer = map.createLayer('FloorLayer', tilesetNature, 0, 0);
        const floorLayer2 = map.createLayer('FloorLayer2', tilesetNature, 0, 0);
        const waterLayer = map.createLayer('WaterLayer', tilesetNature, 0, 0);
        const portalLayer = map.createLayer('PortalLayer', tilesetPortal, 0, 0);
        const coinLayer = map.createLayer('CoinLayer', tilesetCoin, 0, 0);

        // Debug log for layers
        console.log('Available layers:', map.layers.map(layer => layer.name));

        floorLayer.setCollisionByExclusion([-1]);
        floorLayer2.setCollisionByExclusion([-1]);
        waterLayer.setCollisionByProperty({ collides: true });
        decorationLayer.setCollisionByExclusion([-1], true, false);

        // Animation creation
        if (!this.anims.exists('portal_anim')) {
            this.anims.create({
                key: 'portal_anim',
                frames: this.anims.generateFrameNumbers('portal', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        }
        if (!this.anims.exists('spin')) {
            this.anims.create({
                key: 'spin',
                frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 3 }),
                frameRate: 6,
                repeat: -1
            });
        }


        const portals = [];
        const portalPositions = new Set();

        portalLayer.forEachTile(tile => {
            if (tile.index !== -1 && !tile.processed) {
                const x = Math.round(tile.getCenterX());
                const y = Math.round(tile.getCenterY());
                const positionKey = `${x},${y}`;

                if (!portalPositions.has(positionKey)) {
                    const portalSprite = this.physics.add.sprite(x + 8, y - 5, 'portal');
                    portalSprite.setScale(1.3);
                    portalSprite.body.setSize(16, 32);
                    portalSprite.play('portal_anim');
                    portalSprite.body.setAllowGravity(false);
                    portals.push(portalSprite);
                    portalPositions.add(positionKey);
                }

                tile.alpha = 0;
                tile.processed = true;
            }
        });
        portalLayer.setVisible(false);
        console.log('Portales creados:', portals.length);
        portals.forEach((portal, index) => {
            console.log(`Portal ${index}: x=${portal.x}, y=${portal.y}`);
        });

        // Coin collection
        const coins = [];
        const coinPositions = new Set();

        coinLayer.forEachTile(tile => {
            if (tile.index !== -1 && !tile.processed) {
                const x = Math.round(tile.getCenterX());
                const y = Math.round(tile.getCenterY());
                const positionKey = `${x},${y}`;

                if (!coinPositions.has(positionKey)) {
                    const coinSprite = this.physics.add.sprite(x, y, 'coin');
                    coinSprite.setScale(1.5);
                    coinSprite.body.setSize(8, 8);
                    coinSprite.play('spin');
                    coinSprite.body.setAllowGravity(false);
                    coins.push(coinSprite);
                    coinPositions.add(positionKey);
                }

                tile.alpha = 0;
                tile.processed = true;
            }
        });
        coinLayer.setVisible(false);
        console.log('Monedas creados:', coins.length);
        coins.forEach((coin, index) => {
            console.log(`Moneda ${index}: x=${coin.x}, y=${coin.y}`);
        });

        const mapWidth = map.widthInPixels;
        const mapHeight = map.heightInPixels;

        this.player = new Player(this, 24, 192); // Mantengo la posición original del jugador
        const playerSprite = this.player.getSprite();

        // Instantiate LivesManager and GemManager
        this.livesManager = new LivesManager(this, this.player);
        this.registry.set('LivesManager', this.livesManager);

        this.gemManager = new GemManager(this);
        this.registry.set('GemManager', this.gemManager);

        this.uiManager = new UIManager(this, this.livesManager, this.gemManager);
        this.registry.set('UIManager', this.uiManager);

        // Instantiate EnemyManager
        this.enemyManager = new EnemyManager(this);
        this.registry.set('EnemyManager', this.enemyManager);

        // Manually spawn enemy at (256, 80) - trying a slightly higher position
        this.enemyManager.spawnEnemy(300, 80);

        // Debug: Add a rectangle to visualize enemy position
        this.enemies = this.enemyManager.getEnemies();
        if (this.enemies.length > 0) {
            this.add.rectangle(this.enemies[0].x, this.enemies[0].y, 32, 32); // Red semi-transparent rectangle
            console.log('Debug rectangle added at enemy position:', this.enemies[0].x, this.enemies[0].y);
        }

        this.physics.add.collider(playerSprite, floorLayer);
        this.physics.add.collider(playerSprite, floorLayer2);
        this.physics.add.collider(this.enemyManager.getEnemies(), floorLayer);
        this.physics.add.collider(this.enemyManager.getEnemies(), floorLayer2);

        this.physics.add.overlap(playerSprite, waterLayer, (player, tile) => {
            if (this.canRestart && this.hasInitialized && tile.index !== -1) {
                console.log(`Colisión con agua detectada en: x=${playerSprite.x}, y=${playerSprite.y}, tile en: x=${tile.x * 16}, y=${tile.y * 16}`);
                this.canRestart = false;
                this.livesManager.loseLife();
                this.time.delayedCall(500, () => {
                    this.canRestart = true;
                });
            }
        }, null, this);

        this.physics.add.overlap(playerSprite, portals, () => {
            console.log('Portal tocado, trasladando a Level2Scene');
            this.scene.start('Level2Scene');
        }, null, this);

        this.physics.add.overlap(playerSprite, coins, (player, coin) => {
            coin.destroy();
            this.gemManager.collectCoin();
            console.log('Moneda recolectada en Level1Scene');
        }, null, this);

        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        this.cameras.main.startFollow(playerSprite);

        this.time.delayedCall(100, () => {
            this.hasInitialized = true;
            console.log('Escena inicializada, colisiones activadas');
        }, [], this);
    }

    update() {
        if (this.player) {
            this.player.update();
        }
        if (this.enemyManager) {
            this.enemyManager.update();
        }
    }
}
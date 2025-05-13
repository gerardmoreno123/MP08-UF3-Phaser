import Phaser from 'phaser';
import Player from '../Player.js';
import LivesManager from '../LivesManager.js';
import UIManager from '../UIManager.js';
import GemManager from '../GemManager.js';
import player from "../Player.js";

class Level2Scene extends Phaser.Scene {
    constructor() {
        super('Level2Scene');
        this.canRestart = true;
        this.hasInitialized = false;
    }

    preload() {
        this.load.tilemapTiledJSON('level2_map', 'assets/tilemaps/level2.json');
        this.load.image('Dungeon Tile Set', 'assets/tiles/Dungeon Tile Set.png');
        this.load.image('Dimensional_Portal', 'assets/sprites/Dimensional_Portal.png');
        this.load.image('Coin', 'assets/sprites/coin.png');

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
    }

    create() {
        const map = this.make.tilemap({ key: 'level2_map' });
        const tilesetDungeon = map.addTilesetImage('Dungeon Tile Set', 'Dungeon Tile Set');
        const tilesetPortal = map.addTilesetImage('Dimensional_Portal', 'Dimensional_Portal');
        const tilesetCoin = map.addTilesetImage('Coin', 'Coin');

        if (!tilesetDungeon || !tilesetPortal || !tilesetCoin) {
            console.error('Error: Tilesets failed to load in Level2Scene');
            return;
        }

        const backgroundLayer = map.createLayer('BackgroundLayer', tilesetDungeon, 0, 0);
        const floorLayer1 = map.createLayer('FloorLayer1', tilesetDungeon, 0, 0);
        const slabLayer = map.createLayer('SlabLayer', tilesetDungeon, 0, 0);
        const coinLayer = map.createLayer('CoinLayer', tilesetCoin, 0, 0);
        const decorationLayer = map.createLayer('DecorationLayer', tilesetDungeon, 0, 0);
        const deathLayer = map.createLayer('DeathLayer', tilesetDungeon, 0, 0);
        const portalLayer = map.createLayer('PortalLayer', tilesetPortal, 0, 0);

        coinLayer.setDepth(1);
        decorationLayer.setDepth(2);
        backgroundLayer.setDepth(0);

        floorLayer1.setCollisionByExclusion([-1]);
        slabLayer.setCollisionByExclusion([-1]);
        deathLayer.setCollisionByProperty({ collides: true });
        decorationLayer.setCollisionByExclusion([-1], true, false);
        backgroundLayer.setCollisionByExclusion([-1], true, false);

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
                    portalSprite.body.setSize(32, 32);
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
                    coinSprite.body.setSize(16, 16);
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
        console.log('Monedas creadas:', coins.length);
        coins.forEach((coin, index) => {
            console.log(`Moneda ${index}: x=${coin.x}, y=${coin.y}`);
        });

        const mapWidth = map.widthInPixels;
        const mapHeight = map.heightInPixels;

        this.load.once('complete', () => {
            this.player = new Player(this, 24, 192);
            const playerSprite = this.player.getSprite();

            // Set up managers
            this.livesManager = this.registry.get('LivesManager');
            if (!this.livesManager) {
                console.warn('LivesManager not found in registry. Creating new instance.');
                this.livesManager = new LivesManager(this, this.player);
                this.registry.set('LivesManager', this.livesManager);
            } else {
                this.livesManager.setSceneAndPlayer(this, this.player);
                console.log('LivesManager reused with', this.livesManager.getLives(), 'lives');
            }

            // Reuse GemManager from registry
            this.gemManager = this.registry.get('GemManager');
            if (!this.gemManager) {
                console.warn('GemManager not found in registry. Creating new instance.');
                this.gemManager = new GemManager(this);
                this.registry.set('GemManager', this.gemManager);
            } else {
                this.gemManager.setScene(this);
                console.log('GemManager reused with', this.gemManager.getCoins(), 'coins');
            }

            this.uiManager = this.registry.get('UIManager');
            if (!this.uiManager) {
                console.warn('UIManager not found in registry. Creating new instance.');
                this.uiManager = new UIManager(this, this.livesManager, this.gemManager);
                this.registry.set('UIManager', this.uiManager);
            } else {
                this.uiManager.setScene(this);
                console.log('UIManager reused with', this.livesManager.getLives(), 'lives and', this.gemManager.getCoins(), 'coins');
            }

            this.physics.add.collider(playerSprite, floorLayer1);
            this.physics.add.collider(playerSprite, slabLayer);

            this.physics.add.overlap(playerSprite, deathLayer, (player, tile) => {
                if (this.canRestart && this.hasInitialized && tile.index !== -1) {
                    console.log(`Colisión con DeathLayer detectada en: x=${playerSprite.x}, y=${playerSprite.y}, tile en: x=${tile.x * 16}, y=${tile.y * 16}`);
                    this.canRestart = false;
                    this.livesManager.loseLife();
                    this.time.delayedCall(500, () => {
                        if (this.livesManager.getLives() <= 0) {
                            this.scene.start('GameOverScene');
                        } else {
                            this.player.sprite.setPosition(24, 192);
                            this.player.canJump = true;
                            if (this.player.idleTimer) {
                                this.scene.time.removeEvent(this.player.idleTimer);
                                this.player.idleTimer = null;
                            }
                            this.canRestart = true;
                        }
                    });
                }
            }, null, this);

            this.physics.add.overlap(playerSprite, portals, () => {
                console.log('Portal tocado en Level2Scene, trasladando a GameOverScene');
                this.scene.start('GameOverScene');
            }, null, this);

            this.physics.add.overlap(playerSprite, coins, (player, coin) => {
                coin.destroy();
                this.gemManager.collectCoin();
                console.log('Moneda recolectada en Level2Scene');
            }, null, this);

            this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

            this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
            this.cameras.main.startFollow(playerSprite);

            this.time.delayedCall(100, () => {
                this.hasInitialized = true;
                console.log('Escena inicializada, colisiones activadas');
            }, [], this);
        }, this);

        if (this.load.totalComplete === this.load.totalToLoad) {
            this.load.emit('complete');
        } else {
            this.load.start();
        }
    }

    update() {
        if (this.player) {
            this.player.update();
        }
    }
}

export default Level2Scene;
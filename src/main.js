const TILE_SIZE = 16;
const TILES_X = 32;
const TILES_Y = 16;

const GAME_WIDTH = TILE_SIZE * TILES_X;   // 512
const GAME_HEIGHT = TILE_SIZE * TILES_Y;  // 256

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    pixelArt: true,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    scene: [StartScene, Level1Scene, Level2Scene, GameOverScene, EndScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    }
};

const game = new Phaser.Game(config);
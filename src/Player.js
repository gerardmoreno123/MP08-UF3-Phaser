import Phaser from 'phaser';

class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setScale(1);
        this.sprite.body.setSize(16, 24);
        this.sprite.body.setOffset(8, 8);

        this.isMoving = false;
        this.isLyingDown = true;
        this.isStandingUp = false;
        this.isAttacking = false;
        this.idleTimer = null;
        this.canJump = true;

        this.sprite.setFrame(35);

        // Define animations
        this.scene.anims.create({
            key: 'idle',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
            frameRate: 2,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'walk',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 16, end: 19 }),
            frameRate: 10,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'jump',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 40, end: 48 }),
            frameRate: 10,
            repeat: 0
        });
        this.scene.anims.create({
            key: 'lie_down',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 32, end: 35 }),
            frameRate: 5,
            repeat: 0
        });
        this.scene.anims.create({
            key: 'stand_up',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 36, end: 37 }),
            frameRate: 2,
            repeat: 0
        });
        this.scene.anims.create({
            key: 'attack',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 64, end: 71 }),
            frameRate: 12,
            repeat: 0
        });

        // Set up mouse input
        this.scene.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.handleAttack();
            }
        });
    }

    handleAttack() {
        // Prevent attacking if already attacking, lying down, standing up, or in mid-jump
        if (this.isAttacking || this.isLyingDown || this.isStandingUp || !this.sprite.body.onFloor()) {
            return;
        }

        this.isAttacking = true;
        this.isMoving = false; // Stop movement
        this.sprite.setVelocityX(0); // Halt horizontal movement
        if (this.idleTimer) {
            this.scene.time.removeEvent(this.idleTimer);
            this.idleTimer = null;
        }

        this.sprite.play('attack', true);
        this.sprite.once('animationcomplete', (animation) => {
            if (animation.key === 'attack') {
                this.isAttacking = false;
                // Return to idle if no other input is detected
                if (!this.isMoving && !this.isLyingDown && this.sprite.body.onFloor()) {
                    this.sprite.play('idle', true);
                }
            }
        });
    }

    update() {
        const cursors = this.scene.input.keyboard.createCursorKeys();
        const speed = 100;
        const jumpSpeed = -180;

        // Prevent movement, jumping, or lying down while attacking
        if (this.isAttacking) {
            return;
        }

        // Detect movement
        if (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown) {
            if (!this.isStandingUp) {
                if (!this.isMoving) {
                    this.isMoving = true;
                    if (this.isLyingDown) {
                        this.sprite.play('stand_up', true);
                        this.isLyingDown = false;
                        this.isStandingUp = true;
                        this.sprite.once('animationcomplete', (animation) => {
                            if (animation.key === 'stand_up') {
                                this.isStandingUp = false;
                                this.scene.time.delayedCall(500, () => {
                                    if (this.isMoving) {
                                        this.sprite.play('walk', true);
                                    } else {
                                        this.sprite.play('idle', true);
                                    }
                                    console.log('Stand_up completed');
                                }, [], this);
                            }
                        });
                    } else if (!this.sprite.anims.isPlaying || this.sprite.anims.currentAnim.key === 'idle') {
                        this.sprite.play('walk', true);
                    }
                }
            }
            if (this.idleTimer) {
                this.scene.time.removeEvent(this.idleTimer);
                this.idleTimer = null;
            }
        } else {
            if (this.isMoving && !this.isStandingUp) {
                this.isMoving = false;
                this.sprite.play('idle', true);
            }
            if (!this.idleTimer && this.sprite.body.onFloor() && !this.isLyingDown && !this.sprite.anims.isPlaying) {
                this.idleTimer = this.scene.time.delayedCall(1000, () => {
                    this.sprite.play('idle', true);
                    this.scene.time.delayedCall(4000, () => {
                        this.sprite.play('lie_down', true);
                        this.isLyingDown = true;
                        this.idleTimer = null;
                    }, [], this);
                }, [], this);
            }
        }

        // Activar lie_down al presionar la tecla de abajo
        if (cursors.down.isDown && !this.isLyingDown && this.sprite.body.onFloor() && !this.isStandingUp) {
            this.sprite.play('lie_down', true);
            this.isLyingDown = true;
            this.idleTimer = null;
        }

        // Movimiento horizontal
        if (!this.isStandingUp) {
            if (cursors.left.isDown) {
                this.sprite.setVelocityX(-speed);
                this.sprite.setFlipX(true);
            } else if (cursors.right.isDown) {
                this.sprite.setVelocityX(speed);
                this.sprite.setFlipX(false);
            } else {
                this.sprite.setVelocityX(0);
            }
        }

        // Salto
        if (!this.isStandingUp && Phaser.Input.Keyboard.JustDown(cursors.up) && this.canJump && this.sprite.body.onFloor()) {
            this.sprite.setVelocityY(jumpSpeed);
            this.sprite.play('jump', true);
            this.canJump = false;
            if (this.idleTimer) {
                this.scene.time.removeEvent(this.idleTimer);
                this.idleTimer = null;
            }
            this.isLyingDown = false;
        }

        // Mantener animación de salto mientras está en el aire
        if (!this.sprite.body.onFloor() && !this.isStandingUp && this.sprite.anims.currentAnim && this.sprite.anims.currentAnim.key !== 'jump') {
            this.sprite.play('jump', true);
        }

        // Restaurar capacidad de salto al tocar el suelo
        if (this.sprite.body.onFloor() && !this.canJump) {
            this.canJump = true;
        }

        // Gravedad siempre activa
        this.sprite.body.setAllowGravity(true);
    }

    getSprite() {
        return this.sprite;
    }
}

export default Player;
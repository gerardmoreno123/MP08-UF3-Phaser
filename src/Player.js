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
        this.idleTimer = null;
        this.canJump = true;

        this.sprite.setFrame(35);
    }

    update() {
        const cursors = this.scene.input.keyboard.createCursorKeys();
        const speed = 100;
        const jumpSpeed = -180;

        // Detectar movimiento
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
                this.idleTimer = null; // Cancelar y reiniciar temporizador al moverse
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
        if (cursors.down.isDown && !this.isLyingDown && this.sprite.body.onFloor() && !this.isStandingUp ) {
            this.sprite.play('lie_down', true);
            this.isLyingDown = true;
            this.idleTimer = null; // Cancelar temporizador al presionar hacia abajo
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

        // Salto (activar con pulsación inicial y mantener animación en el aire)
        if (!this.isStandingUp && Phaser.Input.Keyboard.JustDown(cursors.up) && this.canJump && this.sprite.body.onFloor()) {
            this.sprite.setVelocityY(jumpSpeed); // Impulso de salto
            this.sprite.play('jump', true); // Reproducir animación de salto
            this.canJump = false; // Bloquear saltos adicionales
            if (this.idleTimer) {
                this.scene.time.removeEvent(this.idleTimer);
                this.idleTimer = null; // Cancelar temporizador al saltar
            }
            this.isLyingDown = false; // Cancelar lie_down al saltar
        }

        // Mantener animación de salto mientras está en el aire
        if (!this.sprite.body.onFloor() && !this.isStandingUp && this.sprite.anims.currentAnim && this.sprite.anims.currentAnim.key !== 'jump') {
            this.sprite.play('jump', true); // Reproducir o mantener jump en el aire
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
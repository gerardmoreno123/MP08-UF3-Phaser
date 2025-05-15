class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = [];
        this.enemySpeed = 50;
        this.patrolRange = 47;

        this.scene.anims.create({
            key: 'enemy-walk',
            frames: this.scene.anims.generateFrameNumbers('enemy', {start: 16, end: 19}),
            frameRate: 8,
            repeat: -1
        });
    }

    spawnEnemy(x, y) {
        const enemy = this.scene.physics.add.sprite(x, y, 'enemy');
        enemy.setScale(1.3  );
        enemy.body.setSize(15, 15);
        enemy.body.setOffset(9, 8);
        enemy.body.setAllowGravity(true);

        enemy.setFrame(0);

        console.log('Enemy spawned at:', x, y);

        enemy.originalX = x;
        enemy.direction = 1;

        // Iniciar la animación por defecto
        enemy.anims.play('enemy-walk');

        this.enemies.push(enemy);

        // Lógica de patrulla con animación dinámica según dirección
        this.scene.time.addEvent({
            delay: 100,
            callback: () => {
                if (enemy.active && enemy.body) {
                    const distance = Math.abs(enemy.x - enemy.originalX);
                    if (distance >= this.patrolRange) {
                        enemy.direction *= -1;
                    }
                    enemy.setVelocityX(this.enemySpeed * enemy.direction);

                    // Ajustar la dirección visualmente con FlipX
                    enemy.setFlipX(enemy.direction === -1);
                }
            },
            loop: true
        });

        console.log('Enemigos creados:', this.enemies.length);
        this.enemies.forEach((enemy, index) => {
            console.log(`Enemigo ${index}: x=${enemy.x}, y=${enemy.y}`);
        });
    }

    checkPlayerCollision(playerSprite) {
        this.enemies.forEach((enemy) => {
            if (enemy.active && this.scene.physics.overlap(playerSprite, enemy)) {
                if (!this.scene.player.isAttacking) {
                    console.log(`Jugador tocado por enemigo en x=${enemy.x}, y=${enemy.y}`);
                    this.scene.livesManager.loseLife();
                }
            }
        });
    }

    checkAttackCollision(playerSprite) {
        this.enemies.forEach((enemy, index) => {
            if (enemy.active && this.scene.physics.overlap(playerSprite, enemy)) {
                if (this.scene.player.isAttacking) {
                    enemy.destroy();
                    this.enemies.splice(index, 1);
                    console.log('Enemigo derrotado!');
                }
            }
        });
    }

    update() {
        this.checkPlayerCollision(this.scene.player.getSprite());
        this.checkAttackCollision(this.scene.player.getSprite());
    }

    getEnemies() {
        return this.enemies;
    }
}
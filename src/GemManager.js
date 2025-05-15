class GemManager {
    constructor(scene) {
        this.scene = scene;
        this.coins = 0; // Initial coin count
        console.log('Monedas iniciales:', this.coins);
    }

    collectCoin() {
        this.coins += 1;
        console.log('Moneda recolectada, total:', this.coins);
        if (this.scene && this.scene.scene.key !== 'GameOverScene') {
            this.scene.events.emit('updateCoins');
        }
    }

    getCoins() {
        return this.coins;
    }

    resetCoins() {
        this.coins = 0;
        if (this.scene && this.scene.scene.key !== 'GameOverScene') {
            this.scene.events.emit('updateCoins');
        }
        console.log('Monedas reiniciadas:', this.coins);
    }

    setScene(scene) {
        this.scene = scene;
        console.log('GemManager actualizado con nueva escena, monedas actuales:', this.coins);
    }
}
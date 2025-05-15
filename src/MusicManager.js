class MusicManager {
    constructor(scene) {
        this.scene = scene;
        this.music = null;
    }

    preload() {
        // Cargar el archivo de música de fondo
        this.scene.load.audio('backgroundMusic', 'assets/audio/exploration-chiptune-rpg-adventure-theme-336428.mp3');
    }

    create() {
        // Crear y reproducir la música
        this.music = this.scene.sound.add('backgroundMusic', {
            loop: true, // Reproducir en bucle
            volume: 0.5 // Ajustar volumen
        });
        this.music.play();

        // Guardar la instancia de MusicManager en el registry para acceder desde otras escenas
        this.scene.registry.set('MusicManager', this);
    }

    play() {
        if (this.music && !this.music.isPlaying) {
            this.music.play();
        }
    }

    pause() {
        if (this.music && this.music.isPlaying) {
            this.music.pause();
        }
    }

    stop() {
        if (this.music) {
            this.music.stop();
        }
    }

    setVolume(volume) {
        if (this.music) {
            this.music.setVolume(volume); // Volumen entre 0.0 y 1.0
        }
    }
}
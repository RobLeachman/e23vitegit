import 'phaser';

export class PlayerUI extends Phaser.Scene {
    constructor() {
        super("PlayerUI");
    }

    preload() {
    }

    create() {
        console.log("UI shit goes here")
        this.scene.launch("BootGame")
    }

    update() {
    }
}

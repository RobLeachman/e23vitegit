import 'phaser';

export class Four extends Phaser.Scene {
    zotBackButton: Phaser.GameObjects.Sprite;
    constructor() {
        super("Four");
    }
    create() {
        //zotBackButton = this.add.sprite(300, 875, 'zotBackButton').setOrigin(0, 0);
        this.zotBackButton = this.add.sprite(300, 875, 'atlas', 'arrowDown.png').setOrigin(0, 0).setName("zotBackButton");
        this.zotBackButton.setVisible(true); this.zotBackButton.setDepth(1); this.zotBackButton.setInteractive({ cursor: 'pointer' });

        this.zotBackButton.on('pointerdown', () => {
            console.log("Four back");
        });

        this.events.on('wake', () => {
            console.log("Four awakes")
        });
    }

    update() {

    }
}

import 'phaser';
import Slots from "../objects/slots"
import Recorder from "../objects/recorder"
import PlayerUI from './playerUI';

const _SCENENAME = "Blank";
let myUI: PlayerUI;
let slots: Slots;
let recorder: Recorder;


let roomReturnWall: number; // return here from other scene back button

let viewWall = 0; // production start at 0
let currentWall = -1;
let previousWall = 0;
let updateWall = false;

let leftButton: Phaser.GameObjects.Sprite;
let rightButton: Phaser.GameObjects.Sprite;
let backButton: Phaser.GameObjects.Sprite;

// Scene is room...
const walls = new Array();

export class Blank extends Phaser.Scene {
    constructor() {
        super(_SCENENAME);
    }

    create() {
        console.log(_SCENENAME + " create")
        myUI = this.scene.get("PlayerUI") as PlayerUI;
        this.scene.bringToTop();
        this.scene.bringToTop("PlayerUI");
        myUI.setActiveScene(_SCENENAME);
        var camera = this.cameras.main;
        camera.setPosition(0, myUI.getCameraHack());

        slots = myUI.getSlots();
        recorder = slots.recorder;
        const thisscene = this;

        ////////////// SCENE IMPLEMENTATION - CREATE //////////////
        // Scene is room...
        leftButton = this.add.sprite(80, 950, 'atlas', 'arrowLeft.png').setName("leftButton").setDepth(1);
        recorder.addMaskSprite('leftButton', leftButton);
        rightButton = this.add.sprite(640, 950, 'atlas', 'arrowRight.png').setName("rightButton").setDepth(1);
        recorder.addMaskSprite('rightButton', rightButton);
        backButton = this.add.sprite(300, 875, 'atlas', 'arrowDown.png').setOrigin(0, 0).setName("backButton").setDepth(1);
        recorder.addMaskSprite('backButton', backButton);

        rightButton.on('pointerdown', () => {
            viewWall++;
            if (viewWall > 3)
                viewWall = 0;
        });
        leftButton.on('pointerdown', () => {
            viewWall--;
            if (viewWall < 0)
                viewWall = 3;
        });
        backButton.on('pointerdown', () => {
            recorder.recordObjectDown(backButton.name, thisscene);
            viewWall = previousWall;

            console.log(`${_SCENENAME} Back!`);

            backButton.removeInteractive(); // fix up the cursor displayed on main scene
/*
            this.scene.moveUp("PlayGame");
            this.scene.sleep();
            this.scene.wake("PlayGame");            
*/            
        });

        // Generic.. use either left/right or back
        leftButton.setVisible(true); leftButton.setInteractive({ cursor: 'pointer' });
        rightButton.setVisible(true); rightButton.setInteractive({ cursor: 'pointer' });
        backButton.setVisible(true); backButton.setInteractive({ cursor: 'pointer' });

        // start from the wall declared in variable init
        updateWall = true;

        this.events.on('wake', () => {
            console.log(`${_SCENENAME} awakes! return to ${roomReturnWall}`)
            this.scene.bringToTop();
            this.scene.bringToTop("PlayerUI")
            myUI.setActiveScene(_SCENENAME);

            // Scene is room...
            viewWall = roomReturnWall;
            updateWall = true;
        });
    }

    update() {
        ////////////// SCENE IMPLEMENTATION - UPDATE //////////////
        if ((viewWall != currentWall || updateWall)) {
            roomReturnWall = viewWall;
            currentWall = viewWall;
            updateWall = false;

            walls[previousWall].setVisible(false);
            walls[viewWall].setVisible(true);
            previousWall = viewWall;
        }
        
        backButton.setVisible(true); backButton.setDepth(1); backButton.setInteractive({ cursor: 'pointer' });
        // Record any movement or clicks
        if (recorder.getMode() == "record")
            recorder.checkPointer(this);
    }

    preload() {
        // Scene is room...
        walls[0] = this.add.image(0, 0, "room2 south").setOrigin(0, 0).setVisible(false);
        walls[1] = this.add.image(0, 0, "room2 west").setOrigin(0, 0).setVisible(false);
        walls[2] = this.add.image(0, 0, "room2 north").setOrigin(0, 0).setVisible(false);
        walls[3] = this.add.image(0, 0, "room2 east").setOrigin(0, 0).setVisible(false);
    }

    // @ts-ignore
    registryUpdate(parent: Phaser.Game, key: string, data: any) {
        console.log(`${_SCENENAME} registry update ${key}`)

        if (key == "replayObject") {
            const spriteName = data.split(':')[0];
            const spriteScene = data.split(':')[1];
            if (spriteScene == _SCENENAME) {
                let object = recorder.getMaskSprite(spriteName);
                object?.emit('pointerdown')
            }
        }
    }
}

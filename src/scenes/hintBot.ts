import 'phaser';
import Slots from "../objects/slots"
import Recorder from "../objects/recorder"
import PlayerUI from './playerUI';

const _SCENENAME = "HintBot";
let myUI: PlayerUI;
let slots: Slots;
let recorder: Recorder;

let roomReturnWall: number; // return here from other scene back button...

let viewWall = 0; // production start at 0
let currentWall = -1;
let previousWall = 0;
let updateWall = false;
let firstClue = true;

let hintBackButton: Phaser.GameObjects.Sprite;
let clueText: Phaser.GameObjects.Text

// Scene is room...
const walls = new Array();

export class HintBot extends Phaser.Scene {
    constructor() {
        super(_SCENENAME);
    }

    create() {
        this.scene.bringToTop();
        this.scene.bringToTop("PlayerUI");
        myUI = this.scene.get("PlayerUI") as PlayerUI;
        //myUI.setActiveScene("hints"); // can be called from any scene
        var camera = this.cameras.main;
        camera.setPosition(0, myUI.getCameraHack());

        slots = myUI.getSlots();
        recorder = slots.recorder;

        this.registry.events.on('changedata', this.registryUpdate, this);
        this.registry.set('replayObject', "0:init"); // need to seed the function in create, won't work without

        // Record all clicks on this scene
        const thisscene = this;

        // @ts-ignore   pointer is unused until we get fancy...
        this.input.on('gameobjectdown', function (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
            recorder.recordObjectDown((gameObject as Phaser.GameObjects.Sprite).name, thisscene);
        });

        ////////////// SCENE IMPLEMENTATION - CREATE //////////////
        hintBackButton = this.add.sprite(300, 875, 'atlas', 'arrowDown.png').setOrigin(0, 0).setName("hintBackButton").setDepth(1);
        recorder.addMaskSprite('hintBackButton', hintBackButton);

        hintBackButton.on('pointerdown', () => {
            recorder.recordObjectDown(hintBackButton.name, thisscene);
            viewWall = previousWall;

            //console.log(`${_SCENENAME} Back!`);

            hintBackButton.removeInteractive(); // fix up the cursor displayed on main scene
            //console.log("return to active: " + myUI.getActiveScene())

            if (myUI.getActiveScene() == "PlayGame" || myUI.getActiveScene() == "RoomTwo")
                myUI.showSettings();

            this.scene.moveUp(myUI.getActiveScene());
            this.scene.sleep();
            myUI.restoreUILayer();
            myUI.hideGreenQuestion();
            this.scene.wake(myUI.getActiveScene());
        });

        hintBackButton.setVisible(true); hintBackButton.setInteractive({ cursor: 'pointer' });

        // start from the wall declared in variable init
        updateWall = true;

        clueText = this.make.text({
            x: 25,
            y: 350,
            text: 'clue goes here',
            style: {
                font: '30px Verdana',
                //fill: '#ffffff'
            }
        });
        clueText.setDepth(99);
  
        this.events.on('wake', () => {
            //console.log(`${_SCENENAME} awakes! return to ${roomReturnWall}`)
            this.scene.bringToTop();
            this.scene.bringToTop("PlayerUI");

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

            const hintObjective = myUI.getHintObjective();
            clueText.text = "Right now you should:\n\n" + hintObjective;
            if (firstClue) {
                firstClue = false;
                clueText.text = "The game features a hint system.\n\nNew clues become available\nas you progress.\n\n" +clueText.text;              
            }
        }

        hintBackButton.setVisible(true); hintBackButton.setDepth(1); hintBackButton.setInteractive({ cursor: 'pointer' });
        // Record any movement or clicks
        if (recorder.getMode() == "record")
            recorder.checkPointer(this);
    }

    preload() {
        // Scene is room...
        walls[0] = this.add.image(0, 0, "wallHint").setOrigin(0, 0).setVisible(false);
        //walls[1] = this.add.image(0, 0, "room2 west").setOrigin(0, 0).setVisible(false);
        //walls[2] = this.add.image(0, 0, "room2 north").setOrigin(0, 0).setVisible(false);
        //walls[3] = this.add.image(0, 0, "room2 east").setOrigin(0, 0).setVisible(false);
    }

    // @ts-ignore
    registryUpdate(parent: Phaser.Game, key: string, data: any) {
        //console.log(`${_SCENENAME} registry update ${key}`)

        if (key == "replayObject") {
            const spriteName = data.split(':')[0];
            const spriteScene = data.split(':')[1];
            //console.log("registry scene:" + spriteName)
            if (spriteScene == _SCENENAME) {
                let object = recorder.getMaskSprite(spriteName);
                object?.emit('pointerdown')
            }
        }
    }
}

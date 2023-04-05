import 'phaser';
import Slots from "../objects/slots"
import Recorder from "../objects/recorder"
import PlayerUI from './playerUI';

const _SCENENAME = "RoomTwo";
let myUI: PlayerUI;
let slots: Slots;
let recorder: Recorder;

let roomReturnWall: number; // return here from other scene back button

let viewWall = 0; // production start at 0
let currentWall = -1;
let previousWall = 0;
let updateWall = false;

let fourMask: Phaser.GameObjects.Sprite;
let fourSolved: Phaser.GameObjects.Sprite;
let twoDoorMask: Phaser.GameObjects.Sprite;
let leftButton: Phaser.GameObjects.Sprite;
let rightButton: Phaser.GameObjects.Sprite;
let backButton: Phaser.GameObjects.Sprite;

let fourInit = true;

let zotTableInit = true;
let zotTableMask: Phaser.GameObjects.Sprite;

let boxHasZot = false;
let boxPostitTaken = false;
let zotBoxColor = 0;

let farZots = new Array();
let farZotPlaced: Phaser.GameObjects.Sprite;
let farZotPlacedReverse: Phaser.GameObjects.Sprite;
let farZotPostit: Phaser.GameObjects.Sprite;

const walls = new Array();

export class RoomTwo extends Phaser.Scene {
    constructor() {
        super(_SCENENAME);
    }

    create() {
        myUI = this.scene.get("PlayerUI") as PlayerUI;
        this.scene.bringToTop();
        this.scene.bringToTop("PlayerUI");
        myUI.setActiveScene(_SCENENAME);
        var camera = this.cameras.main;
        camera.setPosition(0, myUI.getCameraHack());        

        slots = myUI.getSlots();
        recorder = slots.recorder;

        this.registry.events.on('changedata', this.registryUpdate, this);

        ////////////// SCENE IMPLEMENTATION - CREATE //////////////
        fourSolved = this.add.sprite(450, 457, 'atlas', 'newFourSolved.png').setOrigin(0, 0).setVisible(false).setDepth(1);

        fourMask = this.add.sprite(450, 457, 'atlas', 'newFourMask.png').setName('fourMask').setOrigin(0, 0).setDepth(1);
        recorder.addMaskSprite('fourMask', fourMask);
        fourMask.on('pointerdown', () => {

            roomReturnWall = 1;
            if (fourInit) {
                fourInit = false;
                this.scene.launch("Four", { slots: slots, playerName: recorder.getPlayerName() })
                this.scene.sleep();
            } else {
                this.scene.wake("Four");
                this.scene.sleep();
            }
        });

        twoDoorMask = this.add.sprite(235, 381, 'atlas', 'twoDoorMask.png').setName('twoDoorMask').setOrigin(0, 0).setDepth(1);
        recorder.addMaskSprite('twoDoorMask', twoDoorMask);
        twoDoorMask.on('pointerdown', () => {
            roomReturnWall = 0;
            this.scene.wake("PlayGame");
            this.scene.sleep();
        });

        zotTableMask = this.add.sprite(102, 608, 'atlas', 'newzotTableMask.png').setOrigin(0, 0).setName("zotTableMask");
        recorder.addMaskSprite('zotTableMask', zotTableMask);
        zotTableMask.on('pointerdown', () => {
            roomReturnWall = 0;
            if (zotTableInit) {
                zotTableInit = false;
                this.scene.launch("ZotTable", { slots: slots })
                this.scene.sleep();
            } else {
                this.scene.wake("ZotTable");
                this.scene.sleep();
            }
        });


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
            console.log(`${_SCENENAME} Back!`);
            console.log("Return from closeup?");
            viewWall = previousWall;
        });

        leftButton.setVisible(true); leftButton.setInteractive({ cursor: 'pointer' });
        rightButton.setVisible(true); rightButton.setInteractive({ cursor: 'pointer' });
        // Generic back not needed for this room
        backButton.setVisible(false)

        for (let i = 0; i < 9; i++) {
            const fz = "farzot-" + i + ".png"
            farZots[i] = this.add.sprite(168, 641, 'atlas', fz).setOrigin(0, 0).setVisible(false).setDepth(1);
        }

        farZotPlaced = this.add.sprite(172, 629, 'atlas', 'farZotPlaced.png').setOrigin(0, 0).setVisible(false).setDepth(1);
        farZotPlacedReverse = this.add.sprite(172, 629, 'atlas', 'farZotPlacedReverse.png').setOrigin(0, 0).setVisible(false).setDepth(1);
        farZotPostit = this.add.sprite(183, 642, 'atlas', 'farZotPostit.png').setOrigin(0, 0).setVisible(false).setDepth(1);

        updateWall = true;

        this.events.on('wake', () => {
            //console.log(`${_SCENENAME} awakes! return to ${roomReturnWall}`)
            this.scene.bringToTop();
            this.scene.bringToTop("PlayerUI")
            myUI.setActiveScene(_SCENENAME);

            // Scene is room...
            viewWall = roomReturnWall;
            updateWall = true;
        });
    }

    update() {
        if ((viewWall != currentWall || updateWall)) {
            roomReturnWall = viewWall;
            currentWall = viewWall;
            updateWall = false;

            walls[previousWall].setVisible(false);
            walls[viewWall].setVisible(true);
            previousWall = viewWall;

            fourMask.setVisible(false)
            fourSolved.setVisible(false);
            if (viewWall == 1) {
                if (myUI.getFourSolved())
                    fourSolved.setVisible(true).setDepth(1);
                fourMask.setVisible(true); fourMask.setInteractive({ cursor: 'pointer' });
            }

            zotTableMask.setVisible(false);
            for (let i = 0; i < 9; i++) {
                farZots[i].setVisible(false);
            }
            farZotPlaced.setVisible(false);
            farZotPlacedReverse.setVisible(false);
            farZotPostit.setVisible(false);                        
            if (viewWall == 0) {
                zotTableMask.setVisible(true); zotTableMask.setDepth(100); zotTableMask.setInteractive({ cursor: 'pointer' });

                farZots[zotBoxColor].setVisible(true);

                if (boxHasZot) {
                    if (zotBoxColor == 1 || zotBoxColor == 2)
                        farZotPlaced.setVisible(true);
                    else if (zotBoxColor == 6)
                        farZotPlacedReverse.setVisible(true);
                }
                if (zotBoxColor == 6 && !boxPostitTaken)
                    farZotPostit.setVisible(true);
            }

            twoDoorMask.setVisible(false)
            if (viewWall == 2) {
                twoDoorMask.setVisible(true); twoDoorMask.setInteractive({ cursor: 'pointer' });
            }
        }

        // Record any movement or clicks
        if (recorder.getMode() == "record")
            recorder.checkPointer(this);
    }

    preload() {
        walls[0] = this.add.image(0, 0, "room2 south").setOrigin(0, 0).setVisible(false);
        walls[1] = this.add.image(0, 0, "room2 west").setOrigin(0, 0).setVisible(false);
        walls[2] = this.add.image(0, 0, "room2 north").setOrigin(0, 0).setVisible(false);
        walls[3] = this.add.image(0, 0, "room2 east").setOrigin(0, 0).setVisible(false);
    }

    // @ts-ignore
    registryUpdate(parent: Phaser.Game, key: string, data: any) {
        console.log(`${_SCENENAME} registry update ${key}`)

        if (key == "boxHasZot") {
            boxHasZot = data;
        }
        if (key == "boxPostitTaken") {
            boxPostitTaken = data;
        }
        if (key == "boxColor") {
            zotBoxColor = data;
        }

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

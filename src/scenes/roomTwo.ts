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
let twoDoorMask2: Phaser.GameObjects.Sprite;
let leftButton2: Phaser.GameObjects.Sprite;
let rightButton2: Phaser.GameObjects.Sprite;
let backButton2: Phaser.GameObjects.Sprite;
let twoWaySolved: Phaser.GameObjects.Sprite;
let twoWaySolvedWest: Phaser.GameObjects.Sprite;

let fourInit = true;

let zotTableInit = true;
let zotTableMask: Phaser.GameObjects.Sprite;

let twoWayInit = true;
let twoWayMask: Phaser.GameObjects.Sprite;

let boxHasZot = false;
let boxPostitTaken = false;
let zotBoxColor = 0;
let twoWayIsSolved = false

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
        //myUI = this.scene.get("PlayerUI") as PlayerUI; // needed in preload to know which wall to use
        this.scene.bringToTop();
        this.scene.bringToTop("PlayerUI");
        myUI.setActiveScene(_SCENENAME);
        var camera = this.cameras.main;
        camera.setPosition(0, myUI.getCameraHack());

        slots = myUI.getSlots();
        recorder = slots.recorder;

        this.registry.events.on('changedata', this.registryUpdate, this);

        // Record all clicks on this scene
        let thisscene = this;
        // @ts-ignore   pointer is unused until we get fancy...
        this.input.on('gameobjectdown', function (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
            recorder.recordObjectDown((gameObject as Phaser.GameObjects.Sprite).name, thisscene);
        });


        twoWaySolved = this.add.sprite(431, 598, 'atlas', 'twoWaySolved.png').setOrigin(0, 0).setVisible(false).setDepth(1);
        twoWaySolvedWest = this.add.sprite(0, 632, 'atlas', 'twoWaySolvedWest.png').setOrigin(0, 0).setVisible(false).setDepth(1);
        if (myUI.getFourWayPuzzle() == "BigTime")
            fourSolved = this.add.sprite(450, 457, 'atlas', 'newFourSolved.png').setOrigin(0, 0).setVisible(false).setDepth(1); //BIG TIME
        else
            fourSolved = this.add.sprite(450, 457, 'atlas', 'fourSolved_shock.png').setOrigin(0, 0).setVisible(false).setDepth(1);

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

        twoDoorMask2 = this.add.sprite(235, 381, 'atlas', 'twoDoorMask.png').setName('twoDoorMask2').setOrigin(0, 0).setDepth(1);
        recorder.addMaskSprite('twoDoorMask2', twoDoorMask2);
        twoDoorMask2.on('pointerdown', () => {
            roomReturnWall = 0;
            this.scene.moveUp("PlayGame");
            this.scene.sleep();
            this.scene.wake("PlayGame");
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

        twoWayMask = this.add.sprite(410, 610, 'atlas', 'newzotTableMask.png').setOrigin(0, 0).setName("twoWayMask");
        recorder.addMaskSprite('twoWayMask', twoWayMask);
        twoWayMask.on('pointerdown', () => {
            //console.log("go two way")

            roomReturnWall = 0;
            if (twoWayInit) {
                twoWayInit = false;
                this.scene.launch("TwoWay", { slots: slots })
                this.scene.sleep();
            } else {
                this.scene.wake("TwoWay");
                this.scene.sleep();
            }
        });

        leftButton2 = this.add.sprite(80, 950, 'atlas', 'arrowLeft.png').setName("leftButton2").setDepth(1);
        recorder.addMaskSprite('leftButton2', leftButton2);
        rightButton2 = this.add.sprite(640, 950, 'atlas', 'arrowRight.png').setName("rightButton2").setDepth(1);
        recorder.addMaskSprite('rightButton2', rightButton2);
        backButton2 = this.add.sprite(300, 875, 'atlas', 'arrowDown.png').setOrigin(0, 0).setName("backButton2").setDepth(1);
        recorder.addMaskSprite('backButton2', backButton2);

        rightButton2.on('pointerdown', () => {
            viewWall++;
            if (viewWall > 3)
                viewWall = 0;
        });
        leftButton2.on('pointerdown', () => {
            viewWall--;
            if (viewWall < 0)
                viewWall = 3;
        });
        backButton2.on('pointerdown', () => {
            console.log(`${_SCENENAME} Back!`);
            console.log("Return from closeup?");
            viewWall = previousWall;
        });

        leftButton2.setVisible(true); leftButton2.setInteractive({ cursor: 'pointer' });
        rightButton2.setVisible(true); rightButton2.setInteractive({ cursor: 'pointer' });
        // Generic back not needed for this room
        backButton2.setVisible(false)

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

            twoWaySolved.setVisible(false)
            twoWaySolvedWest.setVisible(false)
            twoWayMask.setVisible(false);

            walls[previousWall].setVisible(false);
            walls[viewWall].setVisible(true);
            previousWall = viewWall;

            fourMask.setVisible(false)
            fourSolved.setVisible(false);
            if (viewWall == 1) {
                if (twoWayIsSolved)
                    twoWaySolvedWest.setVisible(true)

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
                if (twoWayIsSolved)
                    twoWaySolved.setVisible(true)
                zotTableMask.setVisible(true); zotTableMask.setDepth(100); zotTableMask.setInteractive({ cursor: 'pointer' });
                let box9hack = false;
                if (zotBoxColor == 9) {
                    zotBoxColor = 6;
                    box9hack = true;
                }
                farZots[zotBoxColor].setVisible(true);
                if (boxHasZot) {
                    if (zotBoxColor == 1 || zotBoxColor == 2)
                        farZotPlaced.setVisible(true);
                    else if (zotBoxColor == 6 && box9hack) {
                        farZotPlacedReverse.setVisible(true);
                    }
                }
                if (zotBoxColor == 6 && !boxPostitTaken)
                    farZotPostit.setVisible(true);
                twoWayMask.setVisible(true); twoWayMask.setDepth(100); twoWayMask.setInteractive({ cursor: 'pointer' });

            }

            twoDoorMask2.setVisible(false);
            if (viewWall == 2) {
                twoDoorMask2.setVisible(true); twoDoorMask2.setInteractive({ cursor: 'pointer' });
            }
        }

        // Record any movement or clicks
        if (recorder.getMode() == "record")
            recorder.checkPointer(this);
    }

    preload() {
        myUI = this.scene.get("PlayerUI") as PlayerUI;
        if (myUI.getFourWayPuzzle() == "BigTime") {
            walls[1] = this.add.image(0, 0, "room2 west-BigTime").setOrigin(0, 0).setVisible(false);
        } else {
            walls[1] = this.add.image(0, 0, "room2 west-Shock").setOrigin(0, 0).setVisible(false);
        }
        walls[0] = this.add.image(0, 0, "room2 south").setOrigin(0, 0).setVisible(false);
        walls[2] = this.add.image(0, 0, "room2 north").setOrigin(0, 0).setVisible(false);
        walls[3] = this.add.image(0, 0, "room2 east").setOrigin(0, 0).setVisible(false);
    }

    // @ts-ignore
    registryUpdate(parent: Phaser.Game, key: string, data: any) {
        //console.log(`${_SCENENAME} registry update ${key}`)

        if (key == "boxHasZot") {
            boxHasZot = data;
        }
        if (key == "boxPostitTaken") {
            boxPostitTaken = data;
        }
        if (key == "boxColor") {
            zotBoxColor = data;
            //console.log(`new box color: ${zotBoxColor}`)
        }
        if (key == "twoWaySolved") {
            //console.log(data)
            twoWayIsSolved = data;
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

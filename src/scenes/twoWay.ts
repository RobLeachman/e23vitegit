import 'phaser';
import Slots from "../objects/slots"
import Recorder from "../objects/recorder"
import PlayerUI from './playerUI';

const _SCENENAME = "TwoWay";
let myUI: PlayerUI;
let slots: Slots;
let recorder: Recorder;

let roomReturnWall: number; // return here from other scene back button

let viewWall = 0;
let currentWall = -1;
let previousWall = 0;
let updateWall = false;

let backButtonTwoWay: Phaser.GameObjects.Sprite;
let leftButton: Phaser.GameObjects.Sprite;
let rightButton: Phaser.GameObjects.Sprite;
let centerButton: Phaser.GameObjects.Sprite;
let leftButtonMask: Phaser.GameObjects.Sprite;
let rightButtonMask: Phaser.GameObjects.Sprite;
let centerButtonMask: Phaser.GameObjects.Sprite;
let keyMaskTwoWay: Phaser.GameObjects.Sprite;
let keyImage: Phaser.GameObjects.Sprite;

let checkWin = false;
let tookKey = false;
let isOpen = false;

let showLeft = -1;
let showRight = -1;

let sequence = [-1, -1, -1, -1, -1, -1, -1, -1]; // L R R R L L R L

const walls = new Array();

export class TwoWay extends Phaser.Scene {
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
        const thisscene = this;

        // Record all clicks on this scene
        // @ts-ignore   pointer is unused until we get fancy...
        this.input.on('gameobjectdown', function (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
            recorder.recordObjectDown((gameObject as Phaser.GameObjects.Sprite).name, thisscene);
        });
        this.registry.events.on('changedata', this.registryUpdate, this);

        this.registry.set('twoWaySolved', false);




        backButtonTwoWay = this.add.sprite(300, 875, 'atlas', 'arrowDown.png').setOrigin(0, 0).setName("backButtonTwoWay").setDepth(1);
        recorder.addMaskSprite('backButtonTwoWay', backButtonTwoWay);

        backButtonTwoWay.on('pointerdown', () => {
            recorder.recordObjectDown(backButtonTwoWay.name, thisscene); // must record, won't be captured by global method
            viewWall = previousWall;

            backButtonTwoWay.removeInteractive(); // fix up the cursor displayed on main scene

            this.scene.moveUp("RoomTwo");
            this.scene.sleep();
            this.scene.wake("RoomTwo");

        });
        backButtonTwoWay.setVisible(true); backButtonTwoWay.setInteractive({ cursor: 'pointer' });

        leftButtonMask = this.add.sprite(215, 604, 'atlas', 'twoway-button-mask.png').setOrigin(0, 0).setName("leftButtonMask").setDepth(1);
        recorder.addMaskSprite('leftButtonMask', leftButtonMask);
        leftButtonMask.on('pointerdown', () => {
            showLeft = this.time.now;
            leftButton.setVisible(true);
            sequence.shift();
            sequence.push(1);

            this.sound.play('sfx', { name: 'tone1', start: Phaser.Math.Between(0, 2), duration: .2 });

            checkWin = true;
        });
        leftButtonMask.setVisible(true); leftButtonMask.setInteractive({ cursor: 'pointer' });

        rightButtonMask = this.add.sprite(367, 604, 'atlas', 'twoway-button-mask.png').setOrigin(0, 0).setName("rightButtonMask").setDepth(1);
        recorder.addMaskSprite('rightButtonMask', rightButtonMask);
        rightButtonMask.on('pointerdown', () => {
            showRight = this.time.now;
            rightButton.setVisible(true);
            sequence.shift();
            sequence.push(2);

            this.sound.play('sfx', { name: 'tone1', start: Phaser.Math.Between(0, 2), duration: .2 });
            checkWin = true;
        });
        rightButtonMask.setVisible(true); rightButtonMask.setInteractive({ cursor: 'pointer' });

        centerButtonMask = this.add.sprite(290, 604, 'atlas', 'twoway-button-mask.png').setOrigin(0, 0).setName("centerButtonMask").setDepth(1);
        recorder.addMaskSprite('centerButtonMask', centerButtonMask);
        centerButtonMask.on('pointerdown', () => {
            viewWall = 1;
            leftButton.setVisible(false)
            rightButton.setVisible(false)
            centerButton.setVisible(false)
            centerButtonMask.setVisible(false)
            isOpen = true;
            checkWin = true;
            this.registry.set('twoWaySolved', true);
        });
        keyMaskTwoWay = this.add.sprite(290, 604, 'atlas', 'twoway-button-mask.png').setOrigin(0, 0).setName("keyMaskTwoWay").setDepth(1);
        recorder.addMaskSprite('keyMaskTwoWay', keyMaskTwoWay);
        keyMaskTwoWay.on('pointerdown', () => {
            console.log("key take");
            tookKey = true;
            checkWin = true;
            keyMaskTwoWay.setVisible(false);
            keyImage.setVisible(false);
            slots.addIcon("icon - keyB.png", "objKeyB", "altobjKeyB");
        });

        leftButton = this.add.sprite(268, 651, 'atlas', 'twoway-left.png').setOrigin(0, 0).setDepth(1).setVisible(false);
        rightButton = this.add.sprite(426, 651, 'atlas', 'twoway-right.png').setOrigin(0, 0).setDepth(1).setVisible(false);
        centerButton = this.add.sprite(327, 646, 'atlas', 'twoway-center.png').setOrigin(0, 0).setDepth(1).setVisible(false);
        keyImage = this.add.sprite(331, 688, 'atlas', 'twoway-key.png').setOrigin(0, 0).setDepth(1).setVisible(false);

        updateWall = true;

        this.events.on('wake', () => {
            //console.log(`${_SCENENAME} awakes! return to ${roomReturnWall}`)
            this.scene.bringToTop();
            this.scene.bringToTop("PlayerUI")
            myUI.setActiveScene(_SCENENAME);

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
            backButtonTwoWay.setVisible(true); backButtonTwoWay.setDepth(1); backButtonTwoWay.setInteractive({ cursor: 'pointer' });
        }

        if (showLeft > 0) {
            if ((this.time.now - showLeft) > 500) {
                showLeft = -1;
                leftButton.setVisible(false);
            }
        }
        if (showRight > 0) {
            if ((this.time.now - showRight) > 500) {
                showRight = -1;
                rightButton.setVisible(false);
            }
        }

        if (checkWin) {
            checkWin = false;
            const checkWinSeq = JSON.stringify(sequence);
            if (checkWinSeq == '[1,2,2,2,1,1,2,1]') {  // production win L R R R L L R L
                //if (checkWinSeq == '[-1,-1,-1,-1,-1,-1,-1,1]') {
                leftButtonMask.setVisible(false); showLeft = -1;
                rightButtonMask.setVisible(false); showRight = -1;
                leftButton.setVisible(true);
                rightButton.setVisible(true);
                centerButton.setVisible(true);
                centerButtonMask.setVisible(true); centerButtonMask.setInteractive({ cursor: 'pointer' });
                sequence = [];
            }
            if (isOpen && !tookKey) {
                keyMaskTwoWay.setVisible(true); keyMaskTwoWay.setInteractive({ cursor: 'pointer' });
                keyImage.setVisible(true);
            }
        }

        // Record any movement or clicks
        if (recorder.getMode() == "record")
            recorder.checkPointer(this);
    }

    preload() {
        walls[0] = this.add.image(0, 0, "twoway - closed").setOrigin(0, 0).setVisible(false);
        walls[1] = this.add.image(0, 0, "twoway - open").setOrigin(0, 0).setVisible(false);
    }

    // @ts-ignore
    registryUpdate(parent: Phaser.Game, key: string, data: any) {
        //console.log(`${_SCENENAME} registry update ${key}`)

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

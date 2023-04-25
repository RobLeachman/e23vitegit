import 'phaser';
import Slots from "../objects/slots"
import Recorder from "../objects/recorder"
import PlayerUI from './playerUI';

const _SCENENAME = "TwoWay";
let myUI: PlayerUI;
let slots: Slots;
let recorder: Recorder;

let updateWall = false;

let backButtonTwoWay: Phaser.GameObjects.Sprite;
let leftButton: Phaser.GameObjects.Sprite;
let rightButton: Phaser.GameObjects.Sprite;
let centerButton: Phaser.GameObjects.Sprite;
let leftButtonMask: Phaser.GameObjects.Sprite;
let rightButtonMask: Phaser.GameObjects.Sprite;
let centerButtonMask: Phaser.GameObjects.Sprite;
let keyMaskTwoWay: Phaser.GameObjects.Sprite;
let noKeyImage: Phaser.GameObjects.Sprite;
let openIt: Phaser.GameObjects.Video;
let openItAnim: Phaser.GameObjects.Sprite;

let checkWin = false;
let didWin = false;
let tookKey = false;

let showLeft = -1;
let showRight = -1;

let sequence = [-1, -1, -1, -1, -1, -1, -1, -1]; // L R R R L L R L, see update() for check

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

        // loading here gets it ready early? but can't be sure until we try it
        openIt = this.add.video(0, 241, 'openIt').setOrigin(0, 0).setDepth(2);

        backButtonTwoWay = this.add.sprite(300, 875, 'atlas', 'arrowDown.png').setOrigin(0, 0).setName("backButtonTwoWay").setDepth(22);
        recorder.addMaskSprite('backButtonTwoWay', backButtonTwoWay);

        backButtonTwoWay.on('pointerdown', () => {
            recorder.recordObjectDown(backButtonTwoWay.name, thisscene); // must record, won't be captured by global method

            backButtonTwoWay.removeInteractive(); // fix up the cursor displayed on main scene

            this.scene.moveUp("RoomTwo");
            this.scene.sleep();
            this.scene.wake("RoomTwo");

        });
        backButtonTwoWay.setVisible(true); backButtonTwoWay.setInteractive({ cursor: 'pointer' });

        leftButtonMask = this.add.sprite(169, 593, 'atlas', 'twoway-button-mask.png').setOrigin(0, 0).setName("leftButtonMask").setDepth(1);
        recorder.addMaskSprite('leftButtonMask', leftButtonMask);
        leftButtonMask.on('pointerdown', () => {
            showLeft = this.time.now;
            leftButton.setVisible(true);
            sequence.shift();
            sequence.push(1);
            this.sound.play('sfx', { name: 'tone1', start: Phaser.Math.Between(0, 2), duration: .2 });
            checkWin = true;
            myUI.didGoal('openTwoWay');
        });
        leftButtonMask.setVisible(true); leftButtonMask.setInteractive({ cursor: 'pointer' });

        rightButtonMask = this.add.sprite(429, 593, 'atlas', 'twoway-button-mask.png').setOrigin(0, 0).setName("rightButtonMask").setDepth(1);
        recorder.addMaskSprite('rightButtonMask', rightButtonMask);
        rightButtonMask.on('pointerdown', () => {
            showRight = this.time.now;
            rightButton.setVisible(true);
            sequence.shift();
            sequence.push(2);

            this.sound.play('sfx', { name: 'tone1', start: Phaser.Math.Between(0, 2), duration: .2 });
            checkWin = true;
            myUI.didGoal('openTwoWay');
        });
        rightButtonMask.setVisible(true); rightButtonMask.setInteractive({ cursor: 'pointer' });

        centerButtonMask = this.add.sprite(329, 593, 'atlas2', 'twoway-buttonCenter-mask.png').setOrigin(0, 0).setName("centerButtonMask").setDepth(1);
        recorder.addMaskSprite('centerButtonMask', centerButtonMask);
        centerButtonMask.on('pointerdown', () => {
            if (didWin) {
                leftButton.setVisible(false)
                rightButton.setVisible(false)
                centerButton.setVisible(false)
                centerButtonMask.setVisible(false)
                checkWin = true;
                this.registry.set('twoWaySolved', true);
                myUI.didGoal('getTealClue');

                keyMaskTwoWay.setVisible(false);

                openIt.setLoop(false);
                openIt.setPaused(false);
                openIt.on('complete', () => {
                    keyMaskTwoWay.setVisible(true); keyMaskTwoWay.setInteractive({ cursor: 'pointer' });
                });

                if (!openIt.isPlaying()) {
                    openItAnim = this.add.sprite(0, 367, "animated").setDepth(1).setVisible(true).setOrigin(0, 0);
                    openItAnim.play('openItAnim');
                    keyMaskTwoWay.setVisible(true); keyMaskTwoWay.setInteractive({ cursor: 'pointer' });
                }

                this.sound.play('sfx', { name: 'twoWayOpen', start: 4, duration: 2 });
            } else {
                this.sound.play('sfx', { name: 'sadHmm', start: 17, duration: 1 });
            }

        });
        centerButtonMask.setVisible(true); centerButtonMask.setInteractive({ cursor: 'pointer' });

        keyMaskTwoWay = this.add.sprite(290, 604, 'atlas', 'twoway-button-mask.png').setOrigin(0, 0).setName("keyMaskTwoWay").setDepth(1);
        recorder.addMaskSprite('keyMaskTwoWay', keyMaskTwoWay);
        keyMaskTwoWay.on('pointerdown', () => {
            tookKey = true;
            checkWin = true;
            keyMaskTwoWay.setVisible(false);
            noKeyImage.setVisible(true);
            slots.addIcon("icon - keyB.png", "objKeyB", "altobjKeyB", false);
            this.sound.play('sfx', { name: 'winTone', start: 9, duration: 2 });
            myUI.didGoal('getTwoWayKey');
        });
        keyMaskTwoWay.setVisible(false);

        leftButton = this.add.sprite(274, 647, 'atlas', 'two-way-left.png').setOrigin(0, 0).setDepth(1).setVisible(false);
        rightButton = this.add.sprite(435, 647, 'atlas', 'two-way-right.png').setOrigin(0, 0).setDepth(1).setVisible(false);
        centerButton = this.add.sprite(335, 641, 'atlas', 'two-way-center.png').setOrigin(0, 0).setDepth(1).setVisible(false);
        noKeyImage = this.add.sprite(330, 690, 'atlas', 'two-way-no-key.png').setOrigin(0, 0).setDepth(22).setVisible(false);

        updateWall = true;

        this.events.on('wake', () => {
            //console.log(`${_SCENENAME} awakes! return to ${roomReturnWall}`)
            this.scene.bringToTop();
            this.scene.bringToTop("PlayerUI")
            myUI.setActiveScene(_SCENENAME);

            updateWall = true;
        });
    }

    update() {
        // could simplify this, but why
        if (updateWall) {
            updateWall = false;

            backButtonTwoWay.setVisible(true); backButtonTwoWay.setInteractive({ cursor: 'pointer' });

            if (tookKey)
                noKeyImage.setVisible(true)
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
                //if (checkWinSeq == '[-1,-1,-1,-1,-1,-1,-1,1]') { // test left
                leftButton.setVisible(true);
                rightButton.setVisible(true);
                centerButton.setVisible(true);
                didWin = true;

                leftButtonMask.setVisible(false); showLeft = -1;
                rightButtonMask.setVisible(false); showRight = -1;

                sequence = [];
            }
        }

        // Record any movement or clicks
        if (recorder.getMode() == "record")
            recorder.checkPointer(this);
    }

    preload() {
        this.add.image(0, 0, "twoway - closed").setOrigin(0, 0);
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

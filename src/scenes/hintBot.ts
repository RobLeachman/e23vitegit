import 'phaser';
import Slots from "../objects/slots"
import Recorder from "../objects/recorder"
import PlayerUI from './playerUI';

const _SCENENAME = "HintBot";
let myUI: PlayerUI;
let slots: Slots;
let recorder: Recorder;

let updateWall = false;
let firstClue = true;

let spoilerMask: Phaser.GameObjects.Sprite;
let hintBackButton: Phaser.GameObjects.Sprite;
let clueText: Phaser.GameObjects.Text;
let objectiveText: Phaser.GameObjects.Text;
let oldObjective: string;

let showFourSolution: Phaser.GameObjects.Image;
let showTwoSolution: Phaser.GameObjects.Image;

class Spoiler {
    scene: Phaser.Scene;
    spoilerHint: string;
    spoilerText: Phaser.GameObjects.Text;
    spoilerBox: Phaser.GameObjects.Sprite;
    spoilerIcon: Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene, spoilerHint: string, index: number) {
        this.scene = scene;
        this.spoilerHint = spoilerHint;
        //console.log(">> new spoiler " + index)

        this.spoilerText = this.scene.make.text({
            x: 160,
            y: 500 + (index * 100) + 15,
            text: spoilerHint,
            style: {
                font: '24px Verdana',
                //fill: '#ffffff'
            }
        });
        this.spoilerText.setDepth(1);

        this.spoilerBox = this.scene.add.sprite(155, 500 + (index * 100) + 15, 'atlas2', 'spoiler panel.png').setOrigin(0, 0);
   
        this.spoilerBox.setDepth(2);
        this.spoilerIcon = this.scene.add.sprite(50, 500 + (index * 100), 'atlas', 'smallKey-yellow.png').setOrigin(0, 0).setScale(.5);
    }
    delete() {
        this.spoilerText.destroy();
        this.spoilerBox.destroy();
        this.spoilerIcon.setTexture('atlas2', 'smallKey-blank.png');
    }
    showSpoiler() {
        this.scene.tweens.add({
            targets: this.spoilerBox,
            alpha: { value: 0, duration: 1000, ease: 'Power1' },
            //alphaBottomRight: { value: 0, duration: 10000, ease: 'Power1' },
            //alphaBottomLeft: { value: 0, duration: 5000, ease: 'Power1', delay: 5000 },
            //yoyo: false,
            //loop: -1
        });
        this.spoilerIcon.setTexture('atlas', 'smallKey-gray.png');
    }
    getSpoiler() {
        return this.spoilerHint;
    }
}

export class HintBot extends Phaser.Scene {
    theSpoilers: Spoiler[] = [];
    spoilerCount: number;
    currentSpoiler: number;

    constructor() {
        super(_SCENENAME);
    }

    create() {
        this.scene.bringToTop();
        this.scene.bringToTop("PlayerUI");
        myUI = this.scene.get("PlayerUI") as PlayerUI;
        this.registry.set('Four-specialCase', "yet another wrinkle"); // a hack to control Four's display of solved art
        this.scene.sleep(myUI.getActiveScene()); // can be called from any scene
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

        hintBackButton = this.add.sprite(300, 875, 'atlas', 'arrowDown.png').setOrigin(0, 0).setName("hintBackButton").setDepth(1);
        recorder.addMaskSprite('hintBackButton', hintBackButton);
        hintBackButton.on('pointerdown', () => {
            recorder.recordObjectDown(hintBackButton.name, thisscene);
            hintBackButton.removeInteractive(); // fix up the cursor displayed on main scene

            if (myUI.getActiveScene() == "PlayGame" || myUI.getActiveScene() == "RoomTwo")
                myUI.showSettingsButton();

            this.scene.moveUp(myUI.getActiveScene());
            this.scene.sleep();
            myUI.restoreUILayer();
            myUI.hideGreenQuestion();
            this.scene.wake(myUI.getActiveScene());
        });
        hintBackButton.setVisible(true); hintBackButton.setInteractive({ cursor: 'pointer' });

        spoilerMask = this.add.sprite(50, 500, 'atlas2', 'spoilerMask.png').setOrigin(0, 0).setName("spoilerMask").setDepth(1);
        recorder.addMaskSprite('spoilerMask', spoilerMask);
        spoilerMask.on('pointerdown', () => {
            //console.log(`there are ${this.spoilerCount} spoilers length ${this.theSpoilers.length}`);
            //console.log(`show spoiler ${this.currentSpoiler}`)
            if (this.currentSpoiler < this.spoilerCount) {
                this.sound.play('sfx', { name: 'hmmQuestion', start: 16, duration: 1 });
                const revealed = this.theSpoilers[this.currentSpoiler].getSpoiler();
                if (revealed == "It needs to look like this:") {
                    showFourSolution = this.add.image(450, 750, 'fourArtWhole-BigTime').setOrigin(0, 0).setDepth(2).setScale(.36);
                }
                if (revealed == "Observe which flap moves. Like this:")
                    showTwoSolution = this.add.image(450, 750, 'clue2 hint').setOrigin(0, 0).setDepth(2).setScale(.36);
                this.theSpoilers[this.currentSpoiler].showSpoiler();
                this.currentSpoiler++;
                recorder.timePenalty();
            }
            if (this.currentSpoiler == this.spoilerCount) {
                spoilerMask.removeInteractive();
            }
        });
        spoilerMask.setVisible(true); spoilerMask.setInteractive({ cursor: 'pointer' });

        updateWall = true;

        clueText = this.make.text({
            x: 50,
            y: 350,
            text: 'clue goes here',
            style: {
                font: '18px Verdana'
            }
        });
        clueText.setDepth(99);

        this.make.text({
            x: 50,
            y: 985,
            text: 'Spoilers cost 30 seconds and the first one is free.\nViewing this objectives screen has no penalty.',
            style: {
                font: '18px Verdana',
                color: '#ffff00'
            }
        });
        clueText.setDepth(99);

        objectiveText = this.make.text({
            x: 25,
            y: 420,
            text: 'next objective',
            style: {
                font: '30px Verdana',
                color: '#ff0'
            }
        });
        objectiveText.setDepth(99);

        this.events.on('wake', () => {
            //console.log(`${_SCENENAME} awakes! return to ${roomReturnWall}`)
            this.scene.bringToTop();
            this.scene.bringToTop("PlayerUI");
            this.registry.set('Four-specialCase', "yet another wrinkle");

            this.scene.sleep(myUI.getActiveScene()); // can be called from any scene

            const hintObjective = myUI.getHintObjective();
            if (hintObjective != oldObjective) {
                this.newSpoilers();
            }
        });
        updateWall = true;
    }

    newSpoilers() {
        const hintObjective = myUI.getHintObjective();
        //clueText.text = "Right now you should:\n\n" + hintObjective;
        clueText.text = "Right now you should:";
        if (firstClue) {
            firstClue = false;
            clueText.text = "The game features a hint system. New clues become available\nas you progress. Right now you should:";
        }
        objectiveText.text = hintObjective;
        objectiveText.setX(0)
        const width = objectiveText.getBottomRight().x!;
        objectiveText.setX((720 - width) / 2);

        if (hintObjective != oldObjective) {
            oldObjective = hintObjective;
            this.theSpoilers.forEach((spoiler) => {
                spoiler.delete();
            });
            spoilerMask.setVisible(true); spoilerMask.setInteractive({ cursor: 'pointer' });
            this.currentSpoiler = 0;
        }

        const allSpoilers = myUI.getSpoilers();
        const spoilers = allSpoilers.split(';');
        spoilers.forEach((spoiler, idx) => {
            if (spoiler.length > 0) {
                const spoilerObject = new Spoiler(this, spoiler, idx);
                this.theSpoilers[idx] = spoilerObject;
            }
        });
        this.spoilerCount = spoilers.length - 1;
        this.currentSpoiler = 0;
        if (showTwoSolution) {
            showTwoSolution.destroy();
        }
        if (showFourSolution) {
            showFourSolution.destroy();
        }
    }

    update() {
        ////////////// SCENE IMPLEMENTATION - UPDATE //////////////
        if (updateWall) {
            updateWall = false;
            this.newSpoilers();

        }

        hintBackButton.setVisible(true); hintBackButton.setDepth(1); hintBackButton.setInteractive({ cursor: 'pointer' });
        // Record any movement or clicks
        if (recorder.getMode() == "record")
            recorder.checkPointer(this);
    }

    preload() {
        // Scene is room...
        this.add.image(0, 0, "wallHint").setOrigin(0, 0);
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

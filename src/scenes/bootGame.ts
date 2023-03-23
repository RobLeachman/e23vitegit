/* global Phaser */
//import { assetsDPR } from '../index';

import Slots from "../objects/slots"
import Recorder from "../objects/recorder"

const testingFour = false;

let running = false;
var slots: Slots;
var recorder: Recorder;

let loadDone: Phaser.GameObjects.Text;

var viewportPointer: Phaser.GameObjects.Sprite;
var viewportPointerClick: Phaser.GameObjects.Sprite;

// UI stuff
var invBar: Phaser.GameObjects.Sprite;
var plusButton: Phaser.GameObjects.Sprite;
var plusModeButton: Phaser.GameObjects.Sprite;
var failed: Phaser.GameObjects.Sprite;
var interfaceClueFull: Phaser.GameObjects.Sprite;
var interfaceClueCombine: Phaser.GameObjects.Sprite;

export class BootGame extends Phaser.Scene {
    // load a background for before preload starts
    // http://labs.phaser.io/edit.html?src=src/3.60/loader/scene%20payload/scene%20files%20payload.js
    constructor() {
        super("BootGame");
    }
    preload() {
        //console.log("BOOT")

        // On the fence about DPI, it all seems just fine...
        //var fontSize = 16*assetsDPR;
        //this.add.text(10, 10, "Loading...", { font: `${fontSize}px Verdana`, fill: '#00ff00' });
        //this.add.text(10, 10, "Loading...", { font: `${fontSize}px Verdana`});

        /* Need fonts and noise...
                this.load.bitmapFont('gameplay-black', 'assets/fonts/gameplay-1987-black.png', 'assets/fonts/gameplay-1987-bw.fnt');
                this.load.bitmapFont('gameplay-white', 'assets/fonts/gameplay-1987-white.png', 'assets/fonts/gameplay-1987-bw.fnt');
        
                this.load.bitmapFont('xolonium-black', 'assets/fonts/Xolonium-Regular-Black-72.png', 'assets/fonts/Xolonium-Regular-Black-72.fnt');
                this.load.bitmapFont('xolonium-white', 'assets/fonts/Xolonium-Regular-White-72.png', 'assets/fonts/Xolonium-Regular-White-72.fnt');
        
                this.load.audio('testNoise', 'assets/sound/41525__Jamius__BigLaser_trimmed.wav');
        */

        if (!testingFour) {
            console.log("whole game")
            this.load.atlas('atlas', 'assets/graphics/texture.png', 'assets/graphics/texture.json');
            this.load.image('eyeButton', 'assets/sprites/eyeOff.png');
            this.load.image('eyeButtonOn', 'assets/sprites/eyeOn.png');
            this.load.image('eyeHint', 'assets/sprites/eyeHint.png');
            this.load.image('interfaceInspect', 'assets/sprites/interfaceInspect.png');

            // used XnConvert to switch to webp, nice!
            this.load.image('myViewport', 'assets/backgrounds/viewport.webp');

            this.load.image('wall1', 'assets/backgrounds/invroom - room - empty.webp');
            this.load.image('wall2', 'assets/backgrounds/invroom - room - west.webp');
            this.load.image('wall3', 'assets/backgrounds/invroom - room - south.webp');
            this.load.image('wall4', 'assets/backgrounds/invroom - room - east.webp');
            this.load.image('wallUnlocked', 'assets/backgrounds/invroom - room - unlocked.webp');
            this.load.image('wallWinner', 'assets/backgrounds/invroom - room - winner.webp');
            this.load.image('wallHint', 'assets/backgrounds/invroom - help1 - background.webp');

            this.load.image('objDonut', 'assets/backgrounds/invroom - obj - donut.webp');
            this.load.image('objPlate', 'assets/backgrounds/invroom - obj - plate.webp');
            this.load.image('objKeyA', 'assets/backgrounds/invroom - obj - keyA.webp');
            this.load.image('objKeyB', 'assets/backgrounds/invroom - obj - keyB.webp');
            this.load.image('objKeyWhole', 'assets/backgrounds/invroom - obj - keyWhole.webp');
            this.load.image('objDonutPlated', 'assets/backgrounds/invroom - obj - donutPlated.webp');
            this.load.image('objRoach', 'assets/backgrounds/invroom - obj - roach.webp');

            this.load.image('objBattery', 'assets/backgrounds/invroom - obj - battery.webp');
            this.load.image('objZot', 'assets/backgrounds/invroom - obj - zot.webp');

            this.load.image('altobjDonut', 'assets/backgrounds/invroom - altobj - donut.webp');
            this.load.image('altobjPlateKey', 'assets/backgrounds/invroom - altobj - plate key.webp');
            this.load.image('altobjKeyA', 'assets/backgrounds/invroom - altobj - keyA.webp');
            this.load.image('altobjKeyB', 'assets/backgrounds/invroom - altobj - keyB.webp');
            this.load.image('altobjKeyWhole', 'assets/backgrounds/invroom - altobj - keyWhole.webp');
            this.load.image('altobjDonutPlated', 'assets/backgrounds/invroom - altobj - donutPlated.webp');
            this.load.image('altobjRoach', 'assets/backgrounds/invroom - altobj - roach.webp');
            this.load.image('altobjPlateEmpty', 'assets/backgrounds/invroom - altobj - plate empty.webp');

            this.load.image('altobjBattery', 'assets/backgrounds/invroom - altobj - battery.webp');
            this.load.image('altobjZot', 'assets/backgrounds/invroom - altobj - zot.webp');

            this.load.image('interfaceClueFull', 'assets/backgrounds/invroom - interface.webp');
            this.load.image('interfaceCombine', 'assets/backgrounds/invroom - interface - combine.webp');
            this.load.image('table', 'assets/backgrounds/invroom - table - empty.webp');

            this.load.image('zotTableOff', 'assets/backgrounds/zot - off.webp');
            this.load.image('zotTableBack', 'assets/backgrounds/zot - back.webp');
            this.load.image('zotTableOffFlipped', 'assets/backgrounds/zot - flip - off.webp');
            this.load.image('zotTableBackFlipped', 'assets/backgrounds/zot - flip - back.webp');
            this.load.image('zotBatteryClosed', 'assets/backgrounds/zot - battery - closed.webp');
            this.load.image('zotBatteryEmpty', 'assets/backgrounds/zot - battery - empty.webp');
            this.load.image('zotBatteryPlaced', 'assets/backgrounds/zot - battery - placed.webp');


            // preload pacifier https://gamedevacademy.org/creating-a-preloading-screen-in-phaser-3/
            var width = this.cameras.main.width;
            var height = this.cameras.main.height;

            var progressBar = this.add.graphics();
            var progressBox = this.add.graphics();
            progressBox.fillStyle(0x333333, 0.8);
            progressBox.fillRect(width / 2 - 10 - 160, height / 2 - 60, 320, 50);

            var loadingText = this.make.text({
                x: width / 2,
                y: height / 2 - 80,
                text: 'Loading...',
                style: {
                    font: '20px monospace',
                    //fill: '#ffffff'
                }
            });
            loadingText.setOrigin(0.5, 0.5);
            var percentText = this.make.text({
                x: width / 2,
                y: height / 2 - 36,
                text: '0%',
                style: {
                    font: '18px monospace',
                    //fill: '#ffffff'
                }
            });
            percentText.setOrigin(0.5, 0.5);

            //this.add.text(10, 90, "OK! Click to continue...", { font: `${fontSize}px Verdana`});
            loadDone = this.make.text({
                x: 50,
                y: 50,
                text: 'Click to start',
                style: {
                    font: '20px Verdana',
                    //fill: '#ffffff'
                }
            });
            loadDone.setX(1000);

            this.load.on('progress', function (value: number) {
                var myParseIntValue;
                // @ts-ignore
                myParseIntValue = parseInt(value * 100, 10)
                percentText.setText(myParseIntValue + '%');
                progressBar.clear();
                progressBar.fillStyle(0xffffff, 1);
                progressBar.fillRect(width / 2 - 160, height / 2 - 50, 300 * value, 30);
            });

            this.load.on('fileprogress', function () {
                //console.log(file.src);
            });
            this.load.on('complete', function () {
                //console.log('complete');
                progressBar.destroy();
                progressBox.destroy();
                loadingText.destroy();
                percentText.destroy();
                loadDone.setX(50);
            });
        }
    }

    create() {
        // SCENERECORD: Capture all mask clicks on this scene

        let thisscene = this;
        // @ts-ignore   pointer is unused until we get fancy...
        this.input.on('gameobjectdown', function (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
            // need extra sauce because this scene always runs and would capture other clicks too
            const spriteName = (gameObject as Phaser.GameObjects.Sprite).name
            if (spriteName == "plusButton" || spriteName == "plusModeButton") {
                recorder.recordObjectDown(spriteName, thisscene);
            } else {
                //console.log("not ours")
            }
        });

        this.registry.events.on('changedata', this.registryUpdate, this);

        //this.add.image(0, 0, 'myViewport').setOrigin(0, 0);
        viewportPointerClick = this.add.sprite(1000, 0, 'atlas', 'pointerClicked.png');
        viewportPointer = this.add.sprite(1000, 0, 'atlas', 'pointer.png').setOrigin(0, 0);

        invBar = this.add.sprite(109, 1075, 'atlas', 'inventory cells.png').setOrigin(0, 0);

        interfaceClueFull = this.add.sprite(0, 0, 'interfaceClueFull').setOrigin(0, 0);
        interfaceClueCombine = this.add.sprite(0, 0, 'interfaceCombine').setOrigin(0, 0);
        interfaceClueFull.setVisible(false);
        interfaceClueCombine.setVisible(false);

        const iconSelected = this.add.sprite(1000, 1078, 'atlas', "icon - selected.png").setOrigin(0, 0);

        recorder = new Recorder(this.input.activePointer, viewportPointer, viewportPointerClick);
        slots = new Slots(this, iconSelected, recorder, invBar, interfaceClueFull, interfaceClueCombine);

        // THESE NEED TO BE ADDED TO DICTIONARY
        //plusButton = this.add.sprite(80, 950, 'plusButton');
        //plusModeButton = this.add.sprite(80, 950, 'plusModeButton');
        plusButton = this.add.sprite(80, 950, 'atlas', 'plus - unselected.png').setName("plusButton");
        plusModeButton = this.add.sprite(80, 950, 'atlas', 'plus - selected.png').setName("plusModeButton");
        recorder.addMaskSprite('plusButton', plusButton);
        recorder.addMaskSprite('plusModeButton', plusModeButton);
        plusButton.setVisible(false);
        plusModeButton.setVisible(false);

        plusModeButton.on('pointerdown', () => {
            //console.log("combine mode cancelled");
            slots.combining = ""; // so slots object knows what is happening
            plusModeButton.setVisible(false);
            plusButton.setVisible(true); plusButton.setDepth(110); plusButton.setInteractive({ cursor: 'pointer' });
        });
        plusButton.on('pointerdown', () => {
            slots.combining = "trying"; // so slots object knows what is happening            
            plusButton.setVisible(false);
            plusModeButton.setVisible(true); plusModeButton.setDepth(110); plusModeButton.setInteractive({ cursor: 'pointer' });;
        });

        //failed = this.add.sprite(1000, 950, 'fail'); // 640 is displayed
        failed = this.add.sprite(1000, 950, 'atlas', 'fail.png'); // 640 is displayed

        if (true) {

            if (testingFour) {
                slots.displayInventoryBar(false); slots.hideEye()
                this.scene.run("Four");
            } else {
                loadDone.destroy()
                this.scene.run("PlayGame", { slots: slots, plusButton: plusButton, plusModeButton: plusModeButton, failed: failed });
            }

        } else {
            if (true) {
                this.input.on("pointerup", this.handleClick, this);
            } else {
                this.scene.start("PlayGame", { mobile: false })
            }
        }
        slots.setActiveScene("PlayGame");
    }

    // @ts-ignore
    // no clue what parent is
    registryUpdate(parent: Phaser.Game, key: string, data: string) {
        //console.log("----------BOOT reg check " + data)
        if (key == "replayObject") {
            const spriteName = data.split(':')[0];
            const spriteScene = data.split(':')[1];
            //console.log("BOOT OBJECT replay=" + spriteName + " on scene " + spriteScene)
            if (spriteScene == "BootGame") {
                //console.log("it is bootgame")
                let object = recorder.getMaskSprite(spriteName);
                object?.emit('pointerdown')
            }
        }
    }

    update() {
        //console.log("BOOT LIVES")
    }

    handleClick() {
        //console.log("click to start!!!!!!")
        if (!running) {
            running = true;

            var pointer = this.input.activePointer;
            if (pointer.wasTouch) {
                console.log("TOUCH")
                //this.scene.start("PlayGame", { mobile: true }) // don't forget slots...
                this.scene.run("PlayGame", { slots: slots }) // don't forget slots...
            }
            else {
                console.log("CLICK");
                this.scene.run("PlayGame", { slots: slots })
            }
        }
        /*
        if (0)
            this.scene.start("TestScene");
        else {
            this.scene.start("PlayGame");
        }
        */
    }
}
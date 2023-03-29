/* global Phaser */
//import { assetsDPR } from '../index';

import Slots from "../objects/slots"
import Recorder from "../objects/recorder"
import PlayerUI from './playerUI';

import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'
import { setCookie, getCookie } from "../utils/cookie";

const skipClickToStart = true;
const skipCloud = true;
const testingFour = false;
const skipBackgroundsLoad = false;

let myUI: PlayerUI;

let welcomeBack = false;

let playerName = "";
const playerNameCookie = "escape23player1";
let playerCount = -1;
let playButtonIsHidden = true;

var slots: Slots;
var recorder: Recorder;

let theRecording: string;

let playButton: Phaser.GameObjects.Sprite;

let splashScreen: Phaser.GameObjects.Image;
let thePlayer: Phaser.GameObjects.Text;
let greetings: Phaser.GameObjects.Text;
let greets1: Phaser.GameObjects.Text;
let greets2: Phaser.GameObjects.Text;
let greets3: Phaser.GameObjects.Text;
let greets4: Phaser.GameObjects.Text;
let greets5: Phaser.GameObjects.Text;



export class BootGame extends Phaser.Scene {
    rexUI: RexUIPlugin;  // Declare scene property 'rexUI' as RexUIPlugin type    

    // load a background for before preload starts
    // http://labs.phaser.io/edit.html?src=src/3.60/loader/scene%20payload/scene%20files%20payload.js
    constructor() {
        super({
            pack: {
                files: [
                    { type: 'image', key: 'splash', url: 'assets/backgrounds/splash.webp' },
                ]
            },
            key: 'BootGame'
        });
    }

    preload() {
        //console.log("BOOT")
        splashScreen = this.add.image(0, 0, 'splash').setOrigin(0, 0);

        var url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexyoutubeplayerplugin.min.js';
        this.load.plugin('rexyoutubeplayerplugin', url, true);

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
        //this.load.atlas('atlas', 'assets/graphics/texture.png', 'assets/graphics/texture.json');
        this.load.image('playButton', 'assets/sprites/playButton.png');

        if (!testingFour) {
            console.log("asset load for whole game")
            if (!skipBackgroundsLoad) {
                this.load.image('eyeButton', 'assets/sprites/eyeOff.png');
                this.load.image('eyeButtonOn', 'assets/sprites/eyeOn.png');
                this.load.image('eyeHint', 'assets/sprites/eyeHint.png');

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

                this.load.image('table', 'assets/backgrounds/invroom - table - empty.webp');

                this.load.image('zotTableOff', 'assets/backgrounds/zot - off.webp');
                this.load.image('zotTableBack', 'assets/backgrounds/zot - back.webp');
                this.load.image('zotTableOffFlipped', 'assets/backgrounds/zot - flip - off.webp');
                this.load.image('zotTableBackFlipped', 'assets/backgrounds/zot - flip - back.webp');
                this.load.image('zotBatteryClosed', 'assets/backgrounds/zot - battery - closed.webp');
                this.load.image('zotBatteryEmpty', 'assets/backgrounds/zot - battery - empty.webp');
                this.load.image('zotBatteryPlaced', 'assets/backgrounds/zot - battery - placed.webp');

                this.load.image('fourBackground', 'assets/backgrounds/four wall.webp');
                this.load.image('fourFrame', 'assets/backgrounds/4x4 frame1a.webp');
                this.load.image('watchTheVideo', 'assets/backgrounds/watchTheYoutube.webp');

                //const graphicPrefix = "pg2"; const youtubeID = 'PBAl9cchQac' // Big Time... so much larger than life
                //const graphicPrefix = "pg1a"; const youtubeID = 'feZluC5JheM' // The Court... while the pillars all fall
                //const graphicPrefix = "pg3a"; const youtubeID = 'CnVf1ZoCJSo' // Shock the Monkey... cover me when I run
                this.load.image('fourArtWhole', 'assets/backgrounds/four_pg2.webp');

            }

            //let windowHeight = window.innerHeight;
            //let windowWidth = window.innerWidth;
            //const dims = this.add.text(640, 280, windowWidth + "x" + windowHeight, { fontSize:'24px' })
            //dims.setOrigin(0.5, 0.5)            

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
                if (!skipBackgroundsLoad) {
                    progressBar.destroy();
                    progressBox.destroy();
                    loadingText.destroy();
                    percentText.destroy();
                }

            });
            //console.log("boot preload finishes")
        }
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


    async create() {
        myUI = this.scene.get("PlayerUI") as PlayerUI;

        // SCENERECORD: Capture all mask clicks on this scene
        let thisscene = this;
        // @ts-ignore   pointer is unused until we get fancy...
        this.input.on('gameobjectdown', function (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
            // need extra sauce because this scene always runs and would capture other clicks too
            const spriteName = (gameObject as Phaser.GameObjects.Sprite).name
            if (spriteName == "plusButton" || spriteName == "plusModeButton") {
                //console.log("saucy sauce")
                recorder.recordObjectDown(spriteName, thisscene);
            } else {
                //console.log("no mask sauce")
            }
        });

        this.registry.events.on('changedata', this.registryUpdate, this);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        playButton = this.add.sprite(width / 2 - 10 - 160, height / 2 - 60 - 50, "playButton").setOrigin(0, 0).setDepth(1);
        playButton.setVisible(false)

        playButton.on('pointerdown', () => {
            setCookie(playerNameCookie, playerName, 365); // bake for a year
            recorder.setPlayerName(playerName);

            thePlayer.destroy();
            playButton.destroy();
            splashScreen.destroy();
            greetings.destroy();
            greets1.destroy();
            greets2.destroy();
            greets3.destroy();
            greets4.destroy();
            greets5.destroy();

            myUI.displayInventoryBar(true); slots.showEye()

            if (playerName == "qqq" || playerName == "Qqq") {
                //console.log("do not record by default, Quazar")
                // this messes with roach replay... hmm
                //recorder.setMode("idle")
            } else {
                recorder.setMode("record")
            }

            var pointer = this.input.activePointer;
            if (pointer.wasTouch) {
                this.scene.run("PlayGame", { mobile: true, theRecording: theRecording });
            }
            else {
                this.scene.run("PlayGame", { mobile: false, theRecording: theRecording });
            }
        });

        recorder = myUI.getRecorder();
        slots = myUI.getSlots();

        myUI.displayInventoryBar(false); slots.hideEye();


        ////////////// PLAYER NAME REGISTRATION //////////////
        if (skipCloud) {
            theRecording = "NO RECORDING"
            playerCount = 999;
            playerName = "Quazar"
            welcomeBack = true;
        } else {
            const recordingFilename = recorder.getRecordingFilename();
            //console.log("BOOT filename=" + recordingFilename);
            if (recordingFilename.length > 0)
                theRecording = await recorder.getRecording();
            else
                theRecording = "NO RECORDING";
            console.log("BOOT recording= " + theRecording);

            playerCount = await this.getPlayerCount(); // async call to recorder's increment

            let playerCookie = getCookie(playerNameCookie);
            playerCookie = playerCookie.replace(/[^a-z0-9]/gi, ''); // no shenanigans

            // Let the remain the same player number?
            //if (playerCookie.substring(0, 6) != "Player") {
            if (playerCookie.length > 0) {
                playerName = playerCookie;
                welcomeBack = true;
            }
            if (playerName.length < 1)
                playerName = "Player" + playerCount;
        }






        ////////////// PLAYER NAME //////////////

        let greets = "What can I call you?";
        if (welcomeBack)
            greets = "Welcome back! Change your nick?"
        greets1 = this.add.text(50, 30, greets, {
            //fontFamily: 'Quicksand',
            //font: '40px Verdana italic',
            fontFamily: 'Helvetica',
            fontSize: '30px',
            color: '#ff0',
        });
        if (welcomeBack)
            greets1.setColor('#fff');
        greets2 = this.add.text(50, 70, 'Nicknames can be letters and numbers only', {
            //fontFamily: 'Quicksand',
            //font: '40px Verdana italic',
            fontFamily: 'Helvetica',
            fontSize: '20px',
            color: '#fff',
        })
        greets3 = this.add.text(50, 1060, 'By clicking play you consent to debug telemetry.', {
            //fontFamily: 'Quicksand',
            //font: '40px Verdana italic',
            fontFamily: 'Helvetica',
            fontSize: '20px',
            color: '#aaa',
        })
        greets4 = this.add.text(50, 1085, 'Your play will be recorded to improve the quality of my buggy game.', {
            //fontFamily: 'Quicksand',
            //font: '40px Verdana italic',
            fontFamily: 'Helvetica',
            fontSize: '20px',
            color: '#aaa',
        })
        greets5 = this.add.text(50, 1110, 'I would love to hear from you! Email escape@bitblaster.com', {
            //fontFamily: 'Quicksand',
            //font: '40px Verdana italic',
            fontFamily: 'Helvetica',
            fontSize: '20px',
            color: '#fff',
        })


        greetings = this.make.text({
            x: 50,
            y: 300,
            text: 'Greetings',
            style: {
                fontFamily: 'Helvetica',
                fontSize: '40px',
                fontStyle: 'italic'
                //fill: '#ffffff'
            },

        });

        greetings.setText("Thanks for testing, " + playerName + "!");

        thePlayer = this.add.text(320, 150, playerName, {
            fixedWidth: 400,
            fixedHeight: 100,
            fontFamily: 'Helvetica',
            fontSize: '48px',
            color: '#fff',
            backgroundColor: 'grey',
            padding: { x: 20, y: 20 }


        })
        thePlayer.setOrigin(0.5, 0.5)
        // https://blog.ourcade.co/posts/2020/phaser-3-add-text-input-rexui/
        thePlayer.setInteractive().on('pointerdown', () => {

            this.rexUI.edit(thePlayer, {
                onClose: () => {
                    // TEST FOR BLANK ENTRY!

                    playerName = (thePlayer as Phaser.GameObjects.Text).text;
                    playerName = playerName.replace(/[^a-z0-9]/gi, '');
                    greetings.setText("Thanks for testing, " + playerName + "!");
                    setCookie(playerNameCookie, playerName, 365); // bake for a year
                    recorder.setPlayerName(playerName);
                }
            })
        })

        ////////////// BOOT THE GAME //////////////

        if (skipClickToStart) {
            recorder.setPlayerName("qqq");
            thePlayer.destroy();
            playButton.destroy();
            splashScreen.destroy();
            greetings.destroy();
            greets1.destroy();
            greets2.destroy();
            greets3.destroy();
            greets4.destroy();
            greets5.destroy();

            myUI.displayInventoryBar(true); slots.showEye()

            //loadDone.destroy()
            if (testingFour) {

                this.scene.run("Five");
            } else {

                this.scene.run("PlayGame", { mobile: false, theRecording: theRecording });
            }
        }
    }

    async getPlayerCount() {
        return await recorder.incrementPlayerCount();
    }

    update() {
        // wait for cloud load to finish
        if (playButtonIsHidden && !skipClickToStart) {
            if (playerCount > -1) {
                playButton.setInteractive({ cursor: 'pointer' });
                playButton.setVisible(true)
                playButtonIsHidden = false;
            }
        }
    }
}
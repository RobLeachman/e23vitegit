/* global Phaser */
//import { assetsDPR } from '../index';

import Recorder from "../objects/recorder"
import PlayerUI from './playerUI';

import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'
import { setCookie, getCookie } from "../utils/cookie";

//const skipClickToStart = true; const skipCloud = true;
let skipClickToStart = false;
let skipCloud = false;

const testingNewRoom = false;
const skipBackgroundsLoad = false;

let myUI: PlayerUI;
var recorder: Recorder;

let welcomeBack = false;
let asyncCreateDone = false;

let playerName = "";
const playerNameCookie = "escape23player1";
let playerCount = -1;
let playButtonReady = false;
let initSplash = true;

let theRecording: string;

let startButton: Phaser.GameObjects.Sprite;
let playButton: Phaser.GameObjects.Sprite;

let splashScreen: Phaser.GameObjects.Image;
let regScreen: Phaser.GameObjects.Image;
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
                    { type: 'image', key: 'frontSplash', url: 'assets/backgrounds/frontSplash.webp' },
                ]
            },
            key: 'BootGame'
        });
    }

    preload() {
        //console.log("BOOT preload")

        if (getCookie("skipStart") == "skip") {
            skipClickToStart = true;
            skipCloud = true;
        }

        splashScreen = this.add.image(0, 0, 'frontSplash').setOrigin(0, 0);

        var url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexyoutubeplayerplugin.min.js';
        this.load.plugin('rexyoutubeplayerplugin', url, true);

        // On the fence about DPI, it all seems just fine... maybe another project?
        //var fontSize = 16*assetsDPR;
        //this.add.text(10, 10, "Loading...", { font: `${fontSize}px Verdana`, fill: '#00ff00' });
        //this.add.text(10, 10, "Loading...", { font: `${fontSize}px Verdana`});

        /* Need fonts?
                this.load.bitmapFont('gameplay-black', 'assets/fonts/gameplay-1987-black.png', 'assets/fonts/gameplay-1987-bw.fnt');
                this.load.bitmapFont('gameplay-white', 'assets/fonts/gameplay-1987-white.png', 'assets/fonts/gameplay-1987-bw.fnt');
        
                this.load.bitmapFont('xolonium-black', 'assets/fonts/Xolonium-Regular-Black-72.png', 'assets/fonts/Xolonium-Regular-Black-72.fnt');
                this.load.bitmapFont('xolonium-white', 'assets/fonts/Xolonium-Regular-White-72.png', 'assets/fonts/Xolonium-Regular-White-72.fnt');

        */
        this.load.atlas('atlas2', 'assets/graphics/atlas2.png', 'assets/graphics/atlas2.json');
        this.load.image('startButton', 'assets/sprites/startButton.png');
        this.load.image('playButton', 'assets/sprites/playButton.png');

        /* will skip if testing...
        this.load.audio('sfx', [
            'assets/audio/soundSheet1.ogg',
            'assets/audio/soundSheet1.mp3'
        ]);
        this.load.video('questionSpinning', 'assets/graphics/question_180.mp4');
        this.load.video('openIt', 'assets/graphics/openIt_silent.mp4');
        */

        // CORS?
        //this.load.setCORS('anonymous');
        //this.load.audio('musicTrack', 'http://bitblaster.com/banal23/unlicensed/testloops2.mp3');

        this.load.audio('musicTrack', 'assets/audio/music.mp3', { loop: true });

        if (testingNewRoom) {
            this.load.image('wall1', 'assets/backgrounds/invroom - room - empty.webp');
            this.load.image('wall2', 'assets/backgrounds/invroom - room - west.webp');
            this.load.image('wall3', 'assets/backgrounds/invroom - room - south.webp');
            this.load.image('wall4', 'assets/backgrounds/invroom - room - east.webp');
            this.load.image('on', 'assets/sprites/on.png');
            this.load.image('off', 'assets/sprites/off.png');

            this.load.image('registrationScreen', 'assets/backgrounds/splash1.webp');
        } else {
            this.load.image('wall1', 'assets/backgrounds/invroom - room - empty.webp');
            this.load.image('wall2', 'assets/backgrounds/invroom - room - west.webp');
            this.load.image('wall3', 'assets/backgrounds/invroom - room - south.webp');
            this.load.image('wall4', 'assets/backgrounds/invroom - room - east.webp');
            this.load.image('wallHint', 'assets/backgrounds/invroom - help - background.webp');


            if (!skipBackgroundsLoad) {
                this.load.audio('sfx', [
                    'assets/audio/soundSheet1.ogg',
                    'assets/audio/soundSheet1.mp3'
                ]);
                this.load.video('questionSpinning', 'assets/graphics/question_180.mp4');
                this.load.video('openIt', 'assets/graphics/openIt_silent.mp4');

                this.load.image('eyeButton', 'assets/sprites/eyeOff.png');
                this.load.image('eyeButtonOn', 'assets/sprites/eyeOn.png');
                this.load.image('eyeHint', 'assets/sprites/eyeHint.png');
                this.load.image('on', 'assets/sprites/on.png');
                this.load.image('off', 'assets/sprites/off.png');

                this.load.image('registrationScreen', 'assets/backgrounds/splash1.webp');

                // used XnConvert to switch to webp, nice!
                this.load.image('myViewport', 'assets/backgrounds/viewport.webp');
                this.load.image('timeFail', 'assets/backgrounds/time fail.webp');

                this.load.image('wall1', 'assets/backgrounds/invroom - room - empty.webp');
                this.load.image('wall2', 'assets/backgrounds/invroom - room - west.webp');
                this.load.image('wall3', 'assets/backgrounds/invroom - room - south.webp');
                this.load.image('wall4', 'assets/backgrounds/invroom - room - east.webp');
                this.load.image('wallUnlocked', 'assets/backgrounds/invroom - room - unlocked.webp');
                this.load.image('wallWinner', 'assets/backgrounds/invroom - room - winner.webp');
                this.load.image('wallHint', 'assets/backgrounds/invroom - help - background.webp');
                this.load.image('wall3doorOpen', 'assets/backgrounds/invroom - room - southOpen.webp');

                this.load.image('room2 north', 'assets/backgrounds/room2 - north.webp');
                this.load.image('room2 south', 'assets/backgrounds/room2 - south.webp');
                this.load.image('room2 east', 'assets/backgrounds/room2 - east.webp');

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

                this.load.image('objRedKeyA', 'assets/backgrounds/invroom - obj - redKeyA.webp');
                this.load.image('objRedKeyB', 'assets/backgrounds/invroom - obj - redKeyB.webp');
                this.load.image('altobjRedKeyA', 'assets/backgrounds/invroom - altobj - redKeyA.webp');
                this.load.image('altobjRedKeyB', 'assets/backgrounds/invroom - altobj - redKeyB.webp');

                this.load.image('altobjKeyWhole', 'assets/backgrounds/invroom - altobj - keyWhole.webp');
                this.load.image('altobjDonutPlated', 'assets/backgrounds/invroom - altobj - donutPlated.webp');
                this.load.image('altobjRoach', 'assets/backgrounds/invroom - altobj - roach.webp');
                this.load.image('altobjPlateEmpty', 'assets/backgrounds/invroom - altobj - plate empty.webp');

                this.load.image('altobjBattery', 'assets/backgrounds/invroom - altobj - battery.webp');
                this.load.image('altobjZot', 'assets/backgrounds/invroom - altobj - zot.webp');

                this.load.image('objPostit', 'assets/backgrounds/room2 - obj - postit.webp');
                this.load.image('altobjPostit', 'assets/backgrounds/room2 - altobj - postit.webp');
                this.load.image('objRedKey', 'assets/backgrounds/clue2 - obj - redkey.webp');
                this.load.image('altobjRedKey', 'assets/backgrounds/clue2 - altobj - redkey.webp');

                this.load.image('table', 'assets/backgrounds/invroom - table - empty.webp');

                this.load.image('zotTableOff', 'assets/backgrounds/newzot - off.webp');
                this.load.image('zotTableBack', 'assets/backgrounds/newzot - back.webp');
                this.load.image('zotTableOffFlipped', 'assets/backgrounds/newzot - flip - off.webp');
                this.load.image('zotTableBackFlipped', 'assets/backgrounds/newzot - flip - back.webp');
                this.load.image('zotBatteryClosed', 'assets/backgrounds/newzot - battery - closed.webp');
                this.load.image('zotBatteryEmpty', 'assets/backgrounds/newzot - battery - empty.webp');
                this.load.image('zotBatteryPlaced', 'assets/backgrounds/newzot - battery - placed.webp');

                this.load.image('clue2 closed', 'assets/backgrounds/clue2 - closed.webp');
                this.load.image('clue2 left', 'assets/backgrounds/clue2 - left.webp');
                this.load.image('clue2 open', 'assets/backgrounds/clue2 - open.webp');
                this.load.image('clue2 right', 'assets/backgrounds/clue2 - right.webp');
                this.load.image('twoway - closed', 'assets/backgrounds/twoway - closed.webp');

                this.load.image('fiveBackground', 'assets/backgrounds/5 words box.webp');

                // can't instantiate UI yet?
                /*
                if (myUI.getFourWayPuzzle() == "BigTime") {
                    this.load.image('fourArtWhole', 'assets/backgrounds/four_pg2.webp');                    
                } else {
                    this.load.image('fourArtWhole', 'assets/backgrounds/four_pg3a.webp');                    
                }

                this.load.image('fourArtWhole', 'assets/backgrounds/four_pg2.webp');                    

                */
                //const graphicPrefix = "pg2"; const youtubeID = 'PBAl9cchQac' // Big Time... so much larger than life
                //const graphicPrefix = "pg1a"; const youtubeID = 'feZluC5JheM' // The Court... while the pillars all fall
                //const graphicPrefix = "pg3a"; const youtubeID = 'CnVf1ZoCJSo' // Shock the Monkey... cover me when I run
                //this.load.image('fourArtWhole', 'assets/backgrounds/four_pg2.webp');
                this.load.image('fourArtWhole-BigTime', 'assets/backgrounds/four_pg2.webp'); // Big Time
                this.load.image('fourArtWhole-Shock', 'assets/backgrounds/four_pg3a.webp'); // Shock the Monkey
                this.load.image('room2 west-BigTime', 'assets/backgrounds/room2 - west_Big Time.webp');
                this.load.image('room2 west-Shock', 'assets/backgrounds/room2 - west_Shock.webp');

                this.load.image('fourBackground', 'assets/backgrounds/four wall.webp');
                this.load.image('fourFrame', 'assets/backgrounds/4x4 frame1a.webp');
                this.load.image('watchTheVideo', 'assets/backgrounds/watchTheYoutube.webp');
            }

            //let windowHeight = window.innerHeight;
            //let windowWidth = window.innerWidth;
            //const dims = this.add.text(640, 280, windowWidth + "x" + windowHeight, { fontSize:'24px' })
            //dims.setOrigin(0.5, 0.5)            

            // preload pacifier https://gamedevacademy.org/creating-a-preloading-screen-in-phaser-3/
            var width = this.cameras.main.width;
            var height = this.cameras.main.height;

            const fudge = -180;

            var progressBar = this.add.graphics();
            var progressBox = this.add.graphics();
            progressBox.fillStyle(0x333333, 0.8);
            progressBox.fillRect(width / 2 - 10 - 160, height / 2 - 60 + fudge, 320, 50);

            var loadingText = this.make.text({
                x: width / 2,
                y: height / 2 - 80 + fudge,
                text: 'Loading...',
                style: {
                    font: '20px monospace',
                    //fill: '#ffffff'
                }
            });
            loadingText.setOrigin(0.5, 0.5);
            var percentText = this.make.text({
                x: width / 2,
                y: height / 2 - 36 + fudge,
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
                progressBar.fillRect(width / 2 - 160, height / 2 - 50 + fudge, 300 * value, 30);
            });

            this.load.on('fileprogress', function () {
                //console.log(file.src);
            });
            //var cache = this.textures;
            //var data = cache.get('frontSplash');               
            //data.destroy();
            this.load.on('complete', function () {
                //console.log('complete');

                // ???? if (!skipBackgroundsLoad) { 
                progressBar.destroy();
                progressBox.destroy();
                loadingText.destroy();
                percentText.destroy();
            });
            //console.log("boot preload finishes")
        }
    }

    async create() {
        myUI = this.scene.get("PlayerUI") as PlayerUI;
        //var camera = this.cameras.main;
        //camera.setPosition(0,-240); // didn't fudge the camera but instead repositioned everything in better spot, for now

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        recorder = myUI.getRecorder();

        console.log("BOJ recorder mode=" + recorder.getMode());
        if (recorder.getMode() == "replay")
            skipClickToStart = true;

        myUI.initMusic();

        if (recorder.getMusicMuted() == "muted") {
            //console.log("BOOT MUTE MUSIC")
            myUI.setMusicSetting(false);
        } else {
            myUI.setMusicSetting(true);
        }

        if (recorder.getSoundMuted() == "muted") {
            //console.log("BOOT MUTE SOUND")
            myUI.setSoundSetting(false);
        } else {
            myUI.setSoundSetting(true);
        }

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
            //console.log("BOOT recording= " + theRecording);

            //playerCount = await this.getPlayerCount(); // async call to recorder's increment
            playerCount = await recorder.incrementPlayerCount();

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

        ////////////// GET PLAYER NAME //////////////
        thePlayer = this.add.text(160, 250, playerName, {
            fixedWidth: 400,
            fixedHeight: 100,
            fontFamily: 'Helvetica',
            fontSize: '48px',
            color: '#fff',
            backgroundColor: 'grey',
            padding: { x: 20, y: 20 }
        })
        thePlayer.setOrigin(0, 0).setVisible(false).setDepth(1);

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

        const startFudge = -270;
        startButton = this.add.sprite(width / 2 - 10 - 160, height / 2 + startFudge, "startButton").setOrigin(0, 0).setDepth(1);
        startButton.setVisible(false)
        startButton.on('pointerdown', () => {
            splashScreen.destroy();
            startButton.setVisible(false);
            regScreen = this.add.image(0, 0, 'registrationScreen').setOrigin(0, 0);
            this.showGreetings(playerName);
            playButtonReady = true;
            thePlayer.setVisible(true)
        });

        playButton = this.add.sprite(width / 2 - 10 - 160, height / 2 - 175, "playButton").setOrigin(0, 0).setDepth(1);
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
            regScreen.destroy();

            myUI.displayInventoryBar(true); myUI.showEye()

            // not sure what I want... force cookies if qqq?
            //recorder.setMode("record");

            if (playerName == "qqq" || playerName == "Qqq") {
                console.log("do not record by default, Quazar")
                // this messes with roach replay... hmm
                //recorder.setMode("idle")
            } else {
                //console.log("record by default...")
                recorder.setMode("record")
            }

            recorder.setTimeStart(Date.now());

            var pointer = this.input.activePointer;
            if (pointer.wasTouch) {
                this.scene.run("PlayGame", { mobile: true, theRecording: theRecording });
            }
            else {
                this.scene.run("PlayGame", { mobile: false, theRecording: theRecording });
            }
        });

        myUI.displayInventoryBar(false); myUI.hideEye();

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
            //console.log("BOOT recording= " + theRecording);

            //playerCount = await this.getPlayerCount(); // async call to recorder's increment
            playerCount = await recorder.incrementPlayerCount();

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

        ////////////// BOOT THE GAME //////////////
        if (skipClickToStart) {
            recorder.setPlayerName("qqq");
            thePlayer.destroy();
            playButton.destroy();
            splashScreen.destroy();

            myUI.displayInventoryBar(true);

            recorder.setTimeStart(Date.now());
            if (testingNewRoom) {
                this.scene.run("Settings");
            } else {

                this.scene.run("PlayGame", { mobile: false, theRecording: theRecording });
            }
        }

        asyncCreateDone = true;
    }

    ////////////// GREETINGS TEXT //////////////
    showGreetings(playerName: string) {
        const greetsFudge = -200;

        let greets = "What can I call you?";
        if (welcomeBack)
            greets = "Welcome back! Change your nick?"
        greets1 = this.add.text(50, 350 + greetsFudge, greets, {
            //fontFamily: 'Quicksand',
            //font: '40px Verdana italic',
            fontFamily: 'Helvetica',
            fontSize: '30px',
            color: '#ff0',
        });
        if (welcomeBack)
            greets1.setColor('#fff');
        greets2 = this.add.text(50, 390 + greetsFudge, 'Nicknames can be letters and numbers only', {
            //fontFamily: 'Quicksand',
            //font: '40px Verdana italic',
            fontFamily: 'Helvetica',
            fontSize: '20px',
            color: '#fff',
        })
        greets3 = this.add.text(50, 875, 'By clicking play you consent to debug telemetry.', {
            //fontFamily: 'Quicksand',
            //font: '40px Verdana italic',
            fontFamily: 'Helvetica',
            fontSize: '20px',
            color: '#aaa',
        })
        greets4 = this.add.text(50, 900, 'Your play will be recorded to improve the quality of my buggy game.', {
            //fontFamily: 'Quicksand',
            //font: '40px Verdana italic',
            fontFamily: 'Helvetica',
            fontSize: '20px',
            color: '#aaa',
        })
        //greets5 = this.add.text(50, 1110, 'I would love to hear from you! Email escape@bitblaster.com', {
        greets5 = this.add.text(50, 925, 'I would love to hear from you! Email escape@bitblaster.com', {
            //fontFamily: 'Quicksand',
            //font: '40px Verdana italic',
            fontFamily: 'Helvetica',
            fontSize: '20px',
            color: '#fff',
        })

        greetings = this.make.text({
            x: 50,
            y: 815,
            text: 'Greetings',
            style: {
                fontFamily: 'Helvetica',
                fontSize: '40px',
                fontStyle: 'italic'
                //fill: '#ffffff'
            },

        });

        greetings.setText("Thanks for testing, " + playerName + "!");
    }

    // BootGame create must be async for cloud data retrieval so latch here and wait for load to finish before offering play button
    update() {
        if (asyncCreateDone) {
            if (initSplash) {
                initSplash = false;
                startButton.setInteractive({ cursor: 'pointer' });
                startButton.setVisible(true);
            }
        }
        if (playButtonReady && !skipClickToStart) {
            if (playerCount > -1) {
                playButton.setInteractive({ cursor: 'pointer' });
                playButton.setVisible(true)
                playButtonReady = false;
            }
        }
    }
}
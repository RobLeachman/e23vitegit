/****************
 * An escape room coded in Phaser.
 * - Sign in with GitHub
 * 
 * 
 * - 3x3 slider puzzle
  * -- show question mark when stuck
 * - Fireworks on winner screen
  * - Screen shake on bad guess
 * 
 * Scratch-off ticket https://blog.ourcade.co/posts/2020/phaser-3-object-reveal-scratch-off-alpha-mask/


** 4x4 background should be gray not white

** clue bot
** discord webhook
** setting screen
** music

** double-click icon to open it
** spin five words at init
** itch.io
** patreon
    pop up at BOJ
    banner
    like https://gammafp.com/tool/animator/
** PWA
** supabase
** cache youtube video
** full splash screen
    https://phaser.discourse.group/t/play-and-skip-intro-video-phaser-3/10081
** save game
** timer

3.60:
    - no auto fallback, why am I specifying webGL?
    https://github.com/photonstorm/phaser/blob/master/changelog/3.60/Game.md



*/


import 'phaser';
import Slots from "../objects/slots"
import Recorder from "../objects/recorder"
import PlayerUI from './playerUI';

//import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import InputText from 'phaser3-rex-plugins/plugins/inputtext.js';

let myUI: PlayerUI;
let slots: Slots;
let recorder: Recorder;

let debugUpdateOnce = false;
let debugPanel = false; // debug panel on top of screen

var viewWall = 0; // production start at 2
var currentWall = -1;
var previousWall = -1;
var updateWall = false;
let roomReturnWall: number; // return here from other scene back button

const walls = new Array();
const icons = new Array();
const obj = new Array();
const altObj = new Array();
const tableView = new Array();
const closeView = new Array();
const clue2states = new Array();

var leftButton: Phaser.GameObjects.Sprite;
var rightButton: Phaser.GameObjects.Sprite;
var backButton: Phaser.GameObjects.Sprite;

let mobile: boolean;
let zoomed = false;

let takeMask: Phaser.GameObjects.Sprite;
let tableMask: Phaser.GameObjects.Sprite;
let doorMask: Phaser.GameObjects.Sprite;
let rangerMask: Phaser.GameObjects.Sprite;
let funzMask: Phaser.GameObjects.Sprite;

//var hintMask: Phaser.GameObjects.Sprite; // maybe Ranger picture will be another view?
var battMask: Phaser.GameObjects.Sprite;

var fiveMask: Phaser.GameObjects.Sprite;
var fiveOpen: Phaser.GameObjects.Sprite;
var fiveBatt: Phaser.GameObjects.Sprite;
var twoDoorMask: Phaser.GameObjects.Sprite;

var clue2Mask: Phaser.GameObjects.Sprite;

let twoDoorUnlockedWall: Phaser.GameObjects.Image;

var tableState = 0;

var egress = false;

let clue2Init = true;
let clue2state = 0;
let twoDoorUnlocked = false;

var fiveInit = true;
var twoInit = true;

var viewportText: any;                                     //??
var viewportPointer: Phaser.GameObjects.Sprite;
var viewportPointerClick: Phaser.GameObjects.Sprite;
var pointer: Phaser.Input.Pointer;


let myText: InputText; //TODO: not sure why we need 2 items here
//let theText: InputText; // text box displayed in the middle of the header

let myPaste: InputText; //TODO: not sure why we need 2 items here

export class PlayGame extends Phaser.Scene {
    //rexUI: RexUIPlugin;  // Declare scene property 'rexUI' as RexUIPlugin type
    //rexInputText: InputText; // Declare scene property 'rexInputText' as InputText type

    constructor() {
        super("PlayGame");
    }

    async getRecording(filename: string) {
        console.log("TEST GET IT")
        const theRecording = await recorder.fetchRecording(filename);
        console.log("TEST GOT IT " + theRecording)
        return theRecording;
    }

    async update() {
        //console.log("main update")

        // did we just hit the keyboard to start replaying?
        if (this.input.activePointer.rightButtonDown() && location.hostname == "localhost") {
            console.log("right mouse button action! bounce bounce");
        }

        if (myText.text == "init") {
            if (location.hostname == "localhost") {
                //console.log("BONUS TEST ZOTS")
                slots.addIcon("icon - red key.png", "objRedKey", "altobjRedKey");
                slots.addIcon("icon - keyWhole.png", "objKeyWhole", "altobjKeyWhole");
                //slots.addIcon("iconZot.png", "objZot", "altobjZot"); // it is the zot
                //slots.addIcon("iconBattery.png", "objBattery", "altobjBattery");
                //slots.addIcon("icon - donut.png", "objDonut", "altobjDonut");
                //slots.addIcon("icon - keyA.png", "objKeyA", "altobjKeyA");
                //slots.addIcon("icon - keyB.png", "objKeyB", "altobjKeyB");
                slots.addIcon(icons[6], obj[6], altObj[6], false, 11); // roach
            }

            myText.text = "off";
            myText.resize(0, 0);
            myPaste.resize(0, 0);
        }

        if (myPaste.text != "pasteit" && myPaste.text != "init") {
            const getRec = myPaste.text;
            myPaste.text = "pasteit";

            console.log("lets fetch " + getRec)
            const theRecording = await this.getRecording(getRec)
            console.log("we fetched:")
            console.log(theRecording)
            if (theRecording == "fail") {
                myText.text = "ERROR"
            } else {
                myText.text = "success"
                recorder.setRecordingFilename(getRec);
            }
        }

        //this.input.keyboard.on('keydown', this.handleKey);


        if (debugUpdateOnce) {
            debugUpdateOnce = false;
            //var txt = this.add.rexCanvasInput(50, 150, 100, 200, config);
            //this.showRecording();
            return;

        }


        ////////////// MAIN SCENE RECORDER DEBUGGER TEXT //////////////

        let debugTheRecorder = recorder.getMode();
        //if (debugging || debugTheRecorder == "record" || debugTheRecorder == "replay" || debugTheRecorder == "replayOnce") {
        if (debugPanel) {
            let displayDebugMode = "RECORDING!";
            if (debugTheRecorder == "replay" || debugTheRecorder == "replayOnce")
                displayDebugMode = "REPLAY"
            viewportText.setText([
                'x: ' + pointer.worldX,
                'y: ' + pointer.worldY,
                'rightButtonDown: ' + pointer.rightButtonDown(),
                'isDown: ' + pointer.isDown,
                '',
                displayDebugMode + '  time: ' + Math.floor(this.time.now) + '   length: ' + recorder.getSize()
            ]);
        }


        ////////////// SCENE RECORDER/REPLAY //////////////

        // Be sure we have the pointer, and then record any movement or clicks
        if (recorder.getMode() == "record")
            recorder.checkPointer(this);

        //console.log("Main recorder mode=" + recorder.getMode())

        if (slots.fakeClicks == 3) {
            //console.log("BRING THE ROACH");
            //slots.clearItem(this, "fake");
            slots.fakeClicks = 4;
            slots.addIcon(icons[6], obj[6], altObj[6], false, 11); // roach
        }
        if (slots.fakeClicks == 10) {
            recorder.setMode("roachReplay");
            slots.fakeClicks = -1;
            //console.log("roach replay " + slots.getSelected());
            let selectedThing = slots.getSelected();
            if (selectedThing.thing == "objRoach") {  /// ROACH REPLAY IS BROKEN
                recorder.setReplaySpeed("fast")
            } else {
                recorder.setReplaySpeed("perfect")
            }
            window.location.reload();
        }

        ////////////// ROOM VIEW //////////////

        if ((viewWall != currentWall || updateWall)) {
            roomReturnWall = viewWall;
            currentWall = viewWall;
            updateWall = false;

            fiveOpen.setVisible(false);
            fiveBatt.setVisible(false);

            if (egress) {
                this.add.image(0, 0, walls[8]).setOrigin(0, 0);
                leftButton.setVisible(false);
                rightButton.setVisible(false);
                myUI.hideEye();
                viewportPointer.setDepth(-1);
                viewportPointerClick.setDepth(-1);
                let fadeClicks = 10;
                while (fadeClicks-- > 0) {
                    recorder.fadeClick();
                }

                recorder.setFourPuzzleSolvedOnce(myUI.getFourWayPuzzle()); // bake for a week
                this.sound.play('sfx', { name: 'applause', start: 11, duration: 5 });

                currentWall = viewWall;
                updateWall = false;
                var sentence = "Nice job slugger!\nTry it again for the bonus?\nJust reload the page";
                if (myUI.getBonus()) {
                    this.add.sprite(360, 800, 'atlas', 'winner donutPlated.png');
                    sentence = "You did it :)\n\nThanks for testing!";
                } else {
                    //failed.setDepth(400);
                    //failed.setX(360); failed.setY(800);
                    this.add.sprite(360, 800, 'atlas', 'fail.png').setDepth(100);
                }

                const style = 'margin: auto; background-color: black; color:white; width: 520px; height: 100px; font: 40px Arial';
                this.add.dom(350, 1100, 'div', style, sentence);

                myUI.hideUILayer();
                slots.clearAll();
                takeMask.setVisible(false);
                tableMask.setVisible(false);
                rangerMask.setVisible(false);
                funzMask.setVisible(false);
                clue2Mask.setVisible(false);
                doorMask.setVisible(false);
                battMask.setVisible(false);

                fiveMask.setVisible(false);
                fiveOpen.setVisible(false);
                fiveBatt.setVisible(false);

                updateWall = false;
                viewWall = currentWall;

                // the game is over, now see what comes next...
                if (recorder.getMode() == "replayOnce") {
                    recorder.setMode("idle")
                }

                if (recorder.getMode() == "record") {
                    recorder.setMode("idle")
                    //this.showRecording()
                }

                viewportText.setDepth(-1);
                return; // that's all we need to do on egress
            }

            // TODO: should not be adding images willy nilly!
            if (myUI.getDoorUnlocked() && viewWall == 0) {
                this.add.image(0, 0, walls[7]).setOrigin(0, 0);
            } else {
                this.add.image(0, 0, walls[viewWall]).setOrigin(0, 0);
            }

            // ranger view wall? was prototype hint system
            if (viewWall == 9)
                previousWall = 2;

            if (viewWall == 0) {
                this.add.sprite(542, 650, 'atlas', tableView[tableState]).setOrigin(0, 0);
            }

            if (viewWall == 4)
                //this.add.sprite(180, 544, closeView[tableState]).setOrigin(0, 0);
                this.add.sprite(180, 544, 'atlas', closeView[tableState]).setOrigin(0, 0);

            if (viewWall > 3) { // viewing table not room wall, or inventory view
                leftButton.setVisible(false);
                rightButton.setVisible(false);
                backButton.setVisible(true); backButton.setDepth(110); backButton.setInteractive({ cursor: 'pointer' });
            } else {
                leftButton.setVisible(true); leftButton.setDepth(100); leftButton.setInteractive({ cursor: 'pointer' });
                rightButton.setVisible(true); rightButton.setDepth(100); rightButton.setInteractive({ cursor: 'pointer' });
                backButton.setVisible(false);
            }

            tableMask.setVisible(false);
            doorMask.setVisible(false);
            if (viewWall == 0) {
                tableMask.setVisible(true); tableMask.setDepth(100); tableMask.setInteractive({ cursor: 'pointer' });
                doorMask.setVisible(true); doorMask.setDepth(100); doorMask.setInteractive({ cursor: 'pointer' });
                //doorMask.input.cursor = 'url(assets/input/cursors/pen.cur), pointer';
                doorMask.input.cursor = 'pointer';
            }

            clue2Mask.setVisible(false);
            if (viewWall == 1) {
                clue2Mask.setVisible(true); clue2Mask.setDepth(100); clue2Mask.setInteractive({ cursor: 'pointer' });
                this.add.sprite(343, 595, 'atlas', clue2states[clue2state]).setOrigin(0, 0);
            }

            //hintMask.setVisible(false); // ranger
            twoDoorMask.setVisible(false);
            twoDoorUnlockedWall.setVisible(false);
            rangerMask.setVisible(false);
            funzMask.setVisible(false)
            if (viewWall == 2) {
                rangerMask.setVisible(true); rangerMask.setDepth(100); rangerMask.setInteractive({ cursor: 'pointer' });
                funzMask.setVisible(true); funzMask.setDepth(100); funzMask.setInteractive({ cursor: 'pointer' });
                // hintMask.setVisible(true); hintMask.setDepth(100); hintMask.setInteractive({ cursor: 'pointer' }); // ranger
                twoDoorMask.setVisible(true); twoDoorMask.setDepth(100); twoDoorMask.setInteractive({ cursor: 'pointer' });
                if (twoDoorUnlocked)
                    twoDoorUnlockedWall.setVisible(true);
            }

            fiveMask.setVisible(false);
            if (viewWall == 3) {
                fiveMask.setVisible(true); fiveMask.setDepth(100); fiveMask.setInteractive({ cursor: 'pointer' });

                const fiveState = myUI.getFiveState();
                if (fiveState == 1)
                    fiveBatt.setVisible(true)
                if (fiveState == 2)
                    fiveOpen.setVisible(true);
            }

            if (viewWall == 4) { // the table
                //takeMask.setVisible(true); takeMask.setDepth(100); takeMask.setInteractive();
                //takeMask.input.cursor = 'url(assets/input/cursors/pen.cur), pointer';
                takeMask.setVisible(true); takeMask.setDepth(100);
                // pointer cursor if stuff remains on table, else default, is how this is done
                takeMask.setInteractive();
                if (tableState > 2)
                    takeMask.input.cursor = 'default';
                else
                    takeMask.input.cursor = 'pointer';
            } else {
                takeMask.setVisible(false);
            }
        }
    }

    // @ts-ignore
    // data will be boolean or number, so "any" here is legit!
    registryUpdate(parent: Phaser.Game, key: string, data: any) {
        //console.log(`main registry update ${key}`)

        if (key == "clue2state") {
            clue2state = data;
        }

        if (key == "replayObject") {
            const spriteName = data.split(':')[0];
            const spriteScene = data.split(':')[1];
            //console.log(`--> main replay ${spriteScene} ${spriteName}`)
            if (spriteScene == "PlayGame") {
                let object = recorder.getMaskSprite(spriteName);
                object?.emit('pointerdown')
            }
        }
    }

    create(data: {
        mobile: boolean;
        theRecording: string;
    }) {

        mobile = data.mobile;
        //console.log(`main create ${mobile}`)

        myUI = this.scene.get("PlayerUI") as PlayerUI;
        this.scene.bringToTop();
        this.scene.bringToTop("PlayerUI");
        myUI.setActiveScene("PlayGame");
        let camera = this.cameras.main;
        camera.setPosition(0, myUI.getCameraHack());

        slots = myUI.getSlots();

        // will be important later...
        if (mobile) {
            console.log("mobile device")
        }

        this.registry.events.on('changedata', this.registryUpdate, this);
        this.registry.set('replayObject', "0:init"); // need to seed the function in create, won't work without

        // SCENERECORD: Capture all mask clicks on this scene
        let thisscene = this;
        // @ts-ignore   pointer is unused until we get fancy...
        this.input.on('gameobjectdown', function (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
            recorder.recordObjectDown((gameObject as Phaser.GameObjects.Sprite).name, thisscene);
        });

        recorder = slots.recorder;
        //const playerName = recorder.getPlayerName();
        //console.log("MAIN PLAYER " + playerName);
        //debugInput = (playerName == "qqq" || playerName == "Qqq" || playerName == "INIT");
        viewportPointer = recorder.pointerSprite;
        viewportPointerClick = recorder.clickSprite;


        // not sure about any of this in main...

        //console.log("Recorder mode: " + recorder.getMode());
        if (recorder.getMode() == "idleButReplayAgainSoon")
            recorder.setMode("replay")
        if (recorder.getMode() == "roachReplay")
            recorder.setMode("replayOnce")

        if (recorder.getMode() == "replay" || recorder.getMode() == "replayOnce")
            debugPanel = true;

        viewportPointer.setDepth(100);
        viewportPointerClick.setDepth(100);
        pointer = this.input.activePointer;

        myText = new InputText(this, 300, 100, 300, 100, {
            type: 'textarea',
            text: 'init',
            fontSize: '24px',
        });
        //theText = this.add.existing(myText);
        //this.add.existing(myText);

        myPaste = new InputText(this, 300, 150, 300, 100, {
            type: 'textarea',
            text: 'init',
            fontSize: '24px',
        });
        //this.add.existing(myPaste);

        //SCENERECORD add to recorder dictionary every sprite that can be clicked 
        leftButton = this.add.sprite(80, 950, 'atlas', 'arrowLeft.png').setName("leftButton");
        recorder.addMaskSprite('leftButton', leftButton);
        rightButton = this.add.sprite(640, 950, 'atlas', 'arrowRight.png').setName("rightButton");
        recorder.addMaskSprite('rightButton', rightButton);
        backButton = this.add.sprite(300, 875, 'atlas', 'arrowDown.png').setOrigin(0, 0).setName("backButton");
        recorder.addMaskSprite('backButton', backButton);

        rightButton.on('pointerdown', () => {
            viewWall++;
            if (viewWall > 3)
                viewWall = 0;
            myUI.didGoal('searchAndSolve');
        });
        leftButton.on('pointerdown', () => {
            viewWall--;
            if (viewWall < 0)
                viewWall = 3;
            myUI.didGoal('searchAndSolve');
        });
        backButton.on('pointerdown', () => {
            //console.log("back to " + previousWall)
            slots.combining = ""; // cancel any combine action
            if (viewWall == 4) // looking at table
                viewWall = 0;
            else
                viewWall = previousWall;
        });

        /* hintMask is now for Ranger and at the moment obsolete...

        hintMask = this.add.sprite(110, 446, 'atlas', 'hintMask.png').setName("hintMask").setOrigin(0, 0);
        recorder.addMaskSprite('hintMask', hintMask);
        hintMask.on('pointerdown', () => {
            viewWall = 9;
        });
        */

        // Add item to inventory list when picked up. In this test it's easy, just 3 stacked items.
        // Add it and then remove from view and flag for an update.
        //takeMask = this.add.sprite(155, 530, 'takeMask').setOrigin(0, 0);
        takeMask = this.add.sprite(155, 530, 'atlas', 'takeMask.png').setName("takeMask").setOrigin(0, 0);
        recorder.addMaskSprite('takeMask', takeMask);
        takeMask.on('pointerdown', () => {
            if (tableState < 3) {
                if (tableState == 2)
                    slots.addIcon(icons[10], obj[9], altObj[9], true); // TODO: renumber the objects, used to be simple:
                else
                    slots.addIcon(icons[tableState], obj[tableState], altObj[tableState], true); // TODO: get name from sprite
                this.add.sprite(190, 560, closeView[tableState]).setOrigin(0, 0);
                if (tableState == 1)
                    myUI.didGoal('pickUpPlate')
                if (tableState == 2)
                    myUI.didGoal('getZot');
                tableState++;
                if (tableState > 2) {
                    this.input.setDefaultCursor('default');
                }
                updateWall = true;
            }
        });

        //tableMask = this.add.sprite(440, 615, 'tableMask').setOrigin(0, 0);
        tableMask = this.add.sprite(440, 615, 'atlas', 'tableMask.png').setOrigin(0, 0).setName("tableMask");
        recorder.addMaskSprite('tableMask', tableMask);
        tableMask.on('pointerdown', () => {
            viewWall = 4; roomReturnWall = 4;
            myUI.didGoal('searchDonutTable');
        });

        rangerMask = this.add.sprite(34, 433, 'atlas2', 'rangerMask.png').setOrigin(0, 0).setName("rangerMask");
        recorder.addMaskSprite('rangerMask', rangerMask);
        rangerMask.on('pointerdown', () => {
            const cam = this.cameras.main;
            if (zoomed) {
                zoomed = false;
                cam.pan(360, 640, 100)
                cam.zoomTo(1, 100);
                myUI.restoreUILayer();
            } else {
                myUI.hideUILayer();
                zoomed = true;
                cam.pan(120, 500, 100)
                cam.zoomTo(3.5, 100);
            }
        });

        funzMask = this.add.sprite(600, 690, 'atlas2', 'rangerMask.png').setOrigin(0, 0).setName("funzMask");
        recorder.addMaskSprite('funzMask', funzMask);
        funzMask.on('pointerdown', () => {
            const cam = this.cameras.main;
            if (zoomed) {
                zoomed = false;
                cam.pan(360, 640, 500)
                cam.zoomTo(1, 500);
                myUI.restoreUILayer();
            } else {
                myUI.hideUILayer();
                zoomed = true;
                cam.pan(674, 773, 1000)
                cam.zoomTo(28, 1000);
            }
        });

        clue2Mask = this.add.sprite(340, 634, 'atlas', 'zotTableMask.png').setOrigin(0, 0).setName("clue2Mask");
        recorder.addMaskSprite('clue2Mask', clue2Mask);
        clue2Mask.on('pointerdown', () => {
            roomReturnWall = 1;
            if (clue2Init) {
                clue2Init = false;
                this.scene.launch("Clue2", { slots: slots })
                this.scene.sleep();
            } else {
                this.scene.wake("Clue2");
                this.scene.sleep();
            }
        });

        battMask = this.add.sprite(320, 926, 'atlas', 'battMask.png').setName("battMask").setOrigin(0, 0);
        recorder.addMaskSprite('battMask', battMask);
        battMask.on('pointerdown', () => {
            slots.addIcon(icons[8], obj[7], altObj[7]);
            updateWall = true;
        });


        fiveOpen = this.add.sprite(500, 652, 'atlas', 'fiveOpen.png').setOrigin(0, 0).setVisible(false).setDepth(100);
        fiveBatt = this.add.sprite(500, 652, 'atlas', 'fiveBatt.png').setOrigin(0, 0).setVisible(false).setDepth(100);

        fiveMask = this.add.sprite(468, 533, 'atlas', 'fiveMask.png').setName("fiveMask").setOrigin(0, 0);
        recorder.addMaskSprite('fiveMask', fiveMask);
        fiveMask.on('pointerdown', () => {
            roomReturnWall = 3;
            if (fiveInit) {
                fiveInit = false;
                this.scene.launch("Five", { playerName: recorder.getPlayerName(), slots: slots })
                this.scene.sleep();
            } else {
                this.scene.wake("Five");
                this.scene.sleep();
            }
        });

        twoDoorMask = this.add.sprite(235, 381, 'atlas', 'twoDoorMask.png').setName('twoDoorMask').setOrigin(0, 0);
        recorder.addMaskSprite('twoDoorMask', twoDoorMask);
        twoDoorMask.on('pointerdown', () => {
            let transit = false;
            let selectedThing = slots.getSelected();
            if (selectedThing.thing == "objRedKey") {
                //console.log("unlock red!");
                slots.clearItem("objRedKey");
                slots.clearSelect();
                twoDoorUnlocked = true;
                transit = true;
            }
            if (twoDoorUnlocked)
                transit = true;
            if (transit) {
                myUI.didGoal('enterSecond');
                roomReturnWall = 0;
                if (twoInit) {
                    twoInit = false;
                    this.scene.launch("RoomTwo");
                    this.scene.sleep();
                } else {
                    this.scene.wake("RoomTwo");
                    this.scene.sleep();
                }
            } else {
                this.sound.play('sfx', { name: 'doorLocked', start: 3, duration: .5 });
            }
        });

        twoDoorUnlockedWall = this.add.image(0, 0, 'wall3doorOpen').setOrigin(0, 0).setDepth(1).setVisible(false);

        doorMask = this.add.sprite(274, 398, 'atlas', 'doorMask.png').setName("doorMask").setOrigin(0, 0);
        recorder.addMaskSprite('doorMask', doorMask);
        doorMask.on('pointerdown', () => {
            let selectedThing = slots.getSelected();
            if (myUI.getDoorUnlocked()) {
                egress = true; // TODO doorUnlocked needs multiple states... then drop this flag
                updateWall = true;
            } else if (selectedThing.thing == "objKeyWhole") {
                myUI.setDoorUnlocked(true);
                updateWall = true;
                //slots.clearItem(this, "objKeyWhole");
                slots.clearItem("objKeyWhole");
                slots.clearSelect(); // TODO why not do this automatically on clearItem()??
            } else {
                this.sound.play('sfx', { name: 'doorLocked', start: 3, duration: .5 });

            }
        });

        // Debugger text
        viewportText = this.add.text(10, 10, '');
        viewportText.setDepth(3001); // TODO: rationalize the crazy depths!

        // Fakey test debug icon
        slots.addIcon(icons[7], "fake", "fake", false, 10); // TODO: get name from sprite?!

        this.events.on('wake', () => {
            //console.log(`Main awakes! return to ${roomReturnWall}`)
            this.scene.bringToTop();
            this.scene.bringToTop("PlayerUI")
            myUI.setActiveScene("PlayGame");

            viewWall = roomReturnWall;
            updateWall = true;
        });

        this.cameras.main.fadeIn(500);

        // Fancy cursors can wait...
        //this.input.setDefaultCursor('url(assets/input/cursors/blue.cur), auto');
        //this.input.setDefaultCursor(
        // "url(" + require("./assets/input/cursors/blue.cur") + "), auto");       
    }


    preload() {
        walls[0] = "wall1";
        walls[1] = "wall2";
        walls[2] = "wall3";
        walls[3] = "wall4";
        walls[4] = "table";
        walls[5] = "(item view)";
        walls[6] = "(item view alt)";
        walls[7] = "wallUnlocked";
        walls[8] = "wallWinner";
        //walls[9] = "wallHint"; // now maybe ranger close up view?

        icons[0] = "icon - donut.png";
        icons[1] = "icon - plate.png";
        icons[2] = "icon - keyB.png";
        icons[3] = "icon - keyA.png";
        icons[4] = "icon - keyWhole.png";
        icons[5] = "icon - donutPlated.png";
        icons[6] = "icon - roach.png";
        icons[7] = "icon - empty.png";
        icons[8] = "iconBattery.png";
        icons[9] = "DELETED";
        icons[10] = "iconZot.png";

        obj[0] = "objDonut";
        obj[1] = "objPlate";
        obj[2] = "objKeyB";
        obj[3] = "objKeyA";
        obj[4] = "objKeyWhole";
        obj[5] = "objDonutPlated";
        obj[6] = "objRoach";
        obj[7] = "objBattery";
        obj[8] = "DELETED";
        obj[9] = "objZot";


        altObj[0] = "altobjDonut";
        altObj[1] = "altobjPlateKey";
        altObj[2] = "altobjKeyB";
        altObj[3] = "altobjKeyA";
        altObj[4] = "altobjKeyWhole";
        altObj[5] = "altobjDonutPlated";
        altObj[6] = "altobjRoach";
        altObj[7] = "altobjBattery";
        altObj[8] = "DELETED";
        altObj[9] = "altobjZot";

        tableView[0] = "tableDonut.png";
        tableView[1] = "tablePlate.png";
        tableView[2] = "tableKey.png";
        tableView[3] = "tableEmpty.png";

        closeView[0] = "closeDonut.png"
        closeView[1] = "closePlate.png"
        closeView[2] = "closeKey.png"
        closeView[3] = "closeEmpty.png"

        clue2states[0] = "clue2-closed.png";
        clue2states[1] = "clue2-left.png";
        clue2states[2] = "clue2-open.png";
        clue2states[3] = "clue2-right.png";
    }
}

import 'phaser';
import Slots from "../objects/slots"
import Recorder from "../objects/recorder"
import { setCookie, getCookie } from "../utils/cookie";

import InputText from 'phaser3-rex-plugins/plugins/inputtext.js';

let useCookieRecordings = true; // use cookies not the cloud
const debugRecorderPlayPerfectSkip = 0; // how many steps to skip before fast stops and perfect begins
let debugInput = true; // display pastebox for input of debug data
if (location.hostname != "localhost")
    debugInput = false;

let cameraHack = 0;

let fourWayPuzzle = "BigTime" // BigTime or Shock?
//const fourWayPuzzle = "Shock" // BigTime or Shock?

let invBar: Phaser.GameObjects.Sprite;
let interfaceClueFull: Phaser.GameObjects.Sprite;
let interfaceClueCombine: Phaser.GameObjects.Sprite;
let viewportPointerClick: Phaser.GameObjects.Sprite;
let viewportPointer: Phaser.GameObjects.Sprite;
let iconSelected: Phaser.GameObjects.Sprite;
let failed: Phaser.GameObjects.Sprite;
let interfaceInspect: Phaser.GameObjects.Sprite;
let interfaceClick: Phaser.GameObjects.Sprite;
let clickLine: Phaser.GameObjects.Sprite;
let hintQuestion: Phaser.GameObjects.Sprite;
let hintQuestionGreen: Phaser.GameObjects.Sprite;
let questionSpinning: Phaser.GameObjects.Video;

let plusButton: Phaser.GameObjects.Sprite;
let plusModeButton: Phaser.GameObjects.Sprite;
let eyeButton: Phaser.GameObjects.Sprite;
let objectMask: Phaser.GameObjects.Sprite;
let hintButton: Phaser.GameObjects.Sprite;

let stateEyeButton: boolean;
let stateInterfaceInspect: boolean;
let stateInterfaceClick: boolean;
let stateClickLine: boolean;
let stateHintQuestionGreen: boolean;

let UIbackButton: Phaser.GameObjects.Sprite;
let objectImage: Phaser.GameObjects.Image;
let settingsButton: Phaser.GameObjects.Sprite;

let slots: Slots;
let recorder: Recorder;

let activeSceneName: string;
let activeSceneNameOld: string;
let playSound = true; // toggled to true at BOJ unless muted
let playMusic = false; // toggled to true at BOJ unless muted
// @ts-ignore
let music;

let uiObjectView = false;
let uiObjectViewDirty = false;
let flipIt = false;
let hasSearched = false;
let hasCombined = false;
let currentSelectedIndex: number;

let hintBotInit = true;
let hintObjectiveText: string;
let settingsInit = true;
let uiHadSettingsButton = false;

// special for key hidden on back of plate
let keyMask: Phaser.GameObjects.Sprite;
let foundHalfKey = false; // enable the key mask when key part is visible
let haveHalfKey = false; // don't show key part on plate back if already taken

// tricky stuff for combined plate
let doorUnlocked = false;
let didBonus = false;

let showXtime = -1;

let fourSolved = false;
let fiveState = 0;

let theRecording: string;
let myText: InputText;
let pasteBox: InputText;
let mainHasStarted = false;
let spinQuestionBOJ = true;
let actions: [string, number, number, number, string][] = [["BOJ", 0, 0, 0, "scn"]];
let nextActionTime = 0;
let recordingEndedFadeClicks = 0;
const minDelayReplay = 10;
let lastKeyDebouncer = "";
let mainReplayRequest = "no key just pressed";

let seededRNG = new Phaser.Math.RandomDataGenerator;

let sceneUI: Phaser.Scene;
let scenePlayGame: Phaser.Scene;
let sceneZotTable: Phaser.Scene;
let sceneFour: Phaser.Scene;
let sceneFive: Phaser.Scene;

let needNewClue = true;
let clueText: Phaser.GameObjects.Text;
let debugHints = false;

let clueMap = new Map<string, string>(); // clue key, clue text
let clueObjective = new Map<string, boolean>();
clueMap.set("searchAndSolve", "Search around, solve all the puzzles,\nescape the room!") // until clicked an arrow
// Tap the arrows to move right, left, back.
clueMap.set("searchDonutTable", "Search the donut table") // until looked at table
// Look for the table by the door. 
// It has a donut on it.
// Click on the table to look at it.
clueMap.set("pickUpPlate", "Pick up the plate"); // until picked up plate
// Click the table to look at it.
// Click the donut to pick it up.
// Click the plate to pick it up.
clueMap.set("searchPlate", "Search the plate"); // 3 until see the key
// Click the plate icon and then the eyeball to inspect the plate.
// Looking at the plate, click it to look at the back.
clueMap.set("takeKeyFromPlate", "Take half red key from plate"); // 4 until took the key
// Click the plate icon and then the eyeball to inspect the plate.
// Looking at the plate, click it to look at the back.
// Click the part of the key taped to the plate to pick it up.
clueMap.set("openTeal", "Open the Teal Box"); // 5 until box is open
// Find the table with the teal box.
// Click the table to look at the box.
// Click the button twice to open the box.
clueMap.set("takeKeyFromTeal", "Pick up half red key from teal box"); // 6 until took the key
// Find the table with the teal box, click to look at it.
// Click the button twice to open the box.
// Click the part of the key to pick it up.
clueMap.set("assembleRed", "Assemble red key"); // 7 until assembled the key
// Click a red key part icon and then the eyeball to inspect it.
// Click the plus button.
// Click the other red key part to combine the items and assemble the key.
clueMap.set("enterSecond", "Enter second room"); // 8 until entered second room
// Find the dark door.
// Select the red key icon.
// Click the door to unlock it and again to enter the second room.
clueMap.set("solveFour", "Solve 4x4 puzzle"); // 9 until 4x4 is solved
// Find the 4x4 puzzle in the second room.
// Select a piece and then another piece to swap.
// IT NEEDS TO LOOK LIKE THIS:
clueMap.set("solveFive", "Solve Five Words puzzle"); // 10 until 5x5 is looked at after 4x4 is solved
// Find the box with 5 words in the first room. 
// Click the words to spin.
// Make a 5-word phrase.
clueMap.set("getFourClue", "Solve Five Words puzzle.\nGet clue from 4x4 puzzle?"); // 11 until 5x5 is solved
// Watch the 4x4 YouTube for about 30 seconds and listen carefully. Click the words to spin.
// Listen for a 5-word phrase.
// "So much larger than life".
clueMap.set("getBattery", "Get battery"); // 12 until took the battery
// Find the box with 5 words in the first room.
// Take the battery.
clueMap.set("getZot", "Get zot from donut table"); // 13 until took the zot
// Find the table that had the donut and plate on it.
// Take the lightning bolt.
clueMap.set("openGreen", "Open Perspective box (green)"); // 14 until green box is opened
// Spin the box back-to-front and top-to-bottom.
// Put the lighting bolt on the top and the battery on the bottom.
// Be sure the box is facing up so the drawer will open.
clueMap.set("getGreenKey", "Get half yellow key"); // 15 until took the key
// Click the part of the yellow key from the green box to pick it up. 
clueMap.set("openTwoWay", "Open Two-Way box (red)"); // 16 until button is pressed
// Find the two-way box in the second room.
// Click right and left in sequence to open it.
// Get the clue from the teal box.
clueMap.set("getTealClue", "Open Two-Way box (red)\nGet Two-Way clue from Teal Mystery box?"); // 17 until two-way solved
// Click the button on the teal box until it closes.
// Click the button and observe which flap moves.
// Enter the sequence on the red two-way box: L R R R L L R L
clueMap.set("getTwoWayKey", "Get half yellow key"); // 18 until key is taken
// Click the part of the yellow key from the red box to pick it up. 
clueMap.set("assembleYellow", "Assemble yellow key"); // 19 until key is assembled
// Click a red key part icon and then the eyeball to inspect it.
// Click the plus button.
// Click the other red key part to combine the items and assemble the key.
clueMap.set("exit", "Escape!"); // 20 until win
// Unlock the door.
// Consider the bonus. What could it be? There is a clue on a wall.
// You can only exit now, or one last thing which was impossible earlier.
clueMap.set("win", "Winner!"); // 21 chicken dinner

// https://stackoverflow.com/questions/52347756/read-console-log-output-form-javascript
let consoleStorage: string[] = [];

for (let key of clueMap.keys()) {
    clueObjective.set(key, false);
}

export default class PlayerUI extends Phaser.Scene {
    constructor() {
        super("PlayerUI");
    }

    //loadMusic() {
    //    musicTrack = this.sound.add('musicTrack', 'assets/audio/testloops2.mp3', {loop:true});
    //}

    getSoundEnabled() {
        return playSound;
    }
    getMusicEnabled() {
        return playMusic;
    }

    setSoundSetting(newSetting: boolean) {
        playSound = newSetting;
        if (playSound) {
            recorder.setSoundMuted(false);
            this.sound.setMute(false);
        } else {
            recorder.setSoundMuted(true);
            this.sound.setMute(true);
        }
    }
    setMusicSetting(newSetting: boolean) {
        playMusic = newSetting;
        if (playMusic) {
            recorder.setMusicMuted(false);
            // @ts-ignore
            music.play();            
        } else {
            recorder.setMusicMuted(true);
            // @ts-ignore
            music.pause();
        }
    }
    initMusic() {
        music = this.sound.add('musicTrack', { loop: true });        
    }


    didGoal(objective: string) {
        //console.log("GOAL COMPLETE! " + objective)
        clueObjective.set(objective, true);
        needNewClue = true;
    }

    getSeededRNG() {
        return seededRNG;
    }

    getFourWayPuzzle() {
        return fourWayPuzzle;
    }

    setActiveScene(theScene: string) {
        //console.log(">> Active Scene:" + theScene)
        activeSceneName = theScene;
    }

    getActiveScene() {
        return activeSceneName;
    }

    getFourGraphicPrefix() {
        //const graphicPrefix = "pg2"; const youtubeID = 'PBAl9cchQac' // Big Time... so much larger than life
        //const graphicPrefix = "pg1a"; const youtubeID = 'feZluC5JheM' // The Court... while the pillars all fall
        //const graphicPrefix = "pg3a"; const youtubeID = 'CnVf1ZoCJSo' // Shock the Monkey... cover me when I run        
        return "four_pg2";
    }

    displayInventoryBar(showBar: boolean) {
        if (showBar)
            invBar.setVisible(true)
        else
            invBar.setVisible(false)
    }

    displayInterfaceClueFull(showIt: boolean) {
        if (showIt) {
            interfaceClueFull.setVisible(true);
            interfaceClueCombine.setVisible(true);
        } else
            interfaceClueFull.setVisible(false);
        interfaceClueCombine.setVisible(false);
    }

    displayInterfaceClueCombine(showIt: boolean) {
        if (showIt) {
            interfaceClueCombine.setVisible(true);
        } else
            interfaceClueCombine.setVisible(false);
    }

    getViewportPointer() {
        return viewportPointer;
    }
    getViewportPointerClick() {
        return viewportPointerClick;
    }
    getIconSelected() { //USED?
        return iconSelected;
    }

    getRecorder() {
        return recorder;
    }

    getSlots() {
        return slots;
    }

    setEyeTexture(textureName: string) {
        eyeButton.setTexture(textureName);
    }
    turnEyeOff() {
        eyeButton.setTexture('eyeButton');
        eyeButton.setName("eyeButton");
    }
    hideEye() {
        eyeButton.setVisible(false);
    }
    showEye() {
        eyeButton.setVisible(true);
    }
    showInspectClue() {
        interfaceInspect.setVisible(true);
        interfaceClick.setVisible(true);
        clickLine.setVisible(true);
        clickLine.play("clickLineMoves");
        this.showEye();
    }

    getBonus() {
        return didBonus;
    }

    // has to be here because of bonus logic
    getDoorUnlocked() {
        return doorUnlocked;
    }
    setDoorUnlocked(unlockedIt: boolean) {
        doorUnlocked = unlockedIt;
    }

    // bridge main scene to four
    getFourSolved() {
        return fourSolved;
    }
    setFourSolved(solvedIt: boolean) {
        fourSolved = solvedIt;
    }
    getFiveState() {
        return fiveState;
    }
    setFiveState(newState: number) {
        fiveState = newState;
    }
    getCameraHack() {
        return cameraHack;
    }
    /*
    hideSpinningQuestion() {
        questionSpinning.setPaused(true);
        questionSpinning.setVisible(false)
        hintQuestion.setVisible(true);
    }
    */
    hideGreenQuestion() {
        hintQuestionGreen.setVisible(false)
    }

    getUIObjectViewOpen() {
        return uiObjectView;
    }
    getHintObjective() {
        return hintObjectiveText;
    }

    hideSettings() {
        settingsButton.setVisible(false);
    }

    showSettingsButton() {
        settingsButton.setVisible(true); settingsButton.setInteractive({ cursor: 'pointer' });
    }

    // Must preload a few elements for UI
    preload() {
        this.load.atlas('atlas', 'assets/graphics/atlas1.png', 'assets/graphics/atlas1.json');
        this.load.spritesheet('animated', 'assets/graphics/animated.png', { frameWidth: 26, frameHeight: 19 });


        // capture console on mobile
        /*
        console.log = function (msg) {
            consoleStorage.push(msg);
            console.warn(msg); // if you need to print the output
        }
        */
    }

    dumpConsole() {
        consoleStorage.forEach(msg => {
            console.log(msg);
        });
    }

    create() {
        if (this.sys.game.device.browser.mobileSafari)
            cameraHack = -100;

        var camera = this.cameras.main;
        camera.setPosition(0, cameraHack);

        //console.log("scale size");
        //const mySize = this.scale.parentSize;
        //console.log(mySize.height * 4);
        //console.log(1280 - mySize.height * 4);

        const randomSeed = Math.random().toString();
        //const randomSeed = "0.123"
        seededRNG = new Phaser.Math.RandomDataGenerator([randomSeed]);

        let hostname = location.hostname;
        //console.log(hostname);



        // Debug line above inventory
        if (false) {
            const mobileTest = this.make.text({
                x: 5,
                y: 1045,
                text: 'Hostname:' + hostname + "  Safari:" + this.sys.game.device.browser.mobileSafari + " ver " + this.sys.game.device.browser.safariVersion,
                style: {
                    font: '18px Verdana',
                    //fill: '#ffffff'
                }
            });
            //console.log(this.sys.game.device.browser)
            mobileTest.setDepth(99)
        }

        if (hostname != "localhost")
            useCookieRecordings = false;

        invBar = this.add.sprite(109, 1075, 'atlas', 'inventory cells.png').setOrigin(0, 0).setVisible(false).setDepth(1);
        interfaceClueFull = this.add.sprite(485, 774, 'atlas', 'interfaceClueSearch.png').setOrigin(0, 0).setVisible(false).setDepth(1);
        interfaceClueCombine = this.add.sprite(17, 305, 'atlas', 'interfaceClueCombine.png').setOrigin(0, 0).setVisible(false).setDepth(1);
        viewportPointerClick = this.add.sprite(1000, 0, 'atlas', 'pointerClicked.png');
        viewportPointer = this.add.sprite(1000, 0, 'atlas', 'pointer3.png').setOrigin(0, 0);
        iconSelected = this.add.sprite(1000, 1078, 'atlas', "icon - selected.png").setOrigin(0, 0).setDepth(1);
        failed = this.add.sprite(1000, 950, 'atlas', 'fail.png').setDepth(1); // 640 is displayed

        interfaceClick = this.add.sprite(15, 1075, 'atlas', 'interface-click-hint.png').setOrigin(0, 0).setVisible(false);
        interfaceInspect = this.add.sprite(5, 1176, 'atlas', 'interface-inspect.png').setOrigin(0, 0).setVisible(false);
        clickLine = this.add.sprite(15 + 70, 1075 + 35, "animated").setDepth(1).setVisible(false);
        hintQuestion = this.add.sprite(620, 1050, 'atlas', 'questionGray.png').setOrigin(0, 0).setVisible(false);
        hintQuestionGreen = this.add.sprite(620, 1050, 'atlas', 'questionGreen.png').setDepth(1).setOrigin(0, 0).setVisible(false);

        this.anims.create({
            key: "clickLineMoves",
            frameRate: 7,
            frames: this.anims.generateFrameNumbers("animated", { start: 0, end: 3 }),
            repeat: -1
        });
        clickLine.play("clickLineMoves");

        recorder = new Recorder(viewportPointer, viewportPointerClick, cameraHack, randomSeed);
        slots = new Slots(this, iconSelected, recorder);

        plusButton = this.add.sprite(80, 950, 'atlas', 'plus - unselected.png').setName("plusButton").setDepth(1).setVisible(false);
        plusModeButton = this.add.sprite(80, 950, 'atlas', 'plus - selected.png').setName("plusModeButton").setDepth(1).setVisible(false);
        recorder.addMaskSprite('plusButton', plusButton);
        recorder.addMaskSprite('plusModeButton', plusModeButton);

        console.log(`Solved four: ${recorder.getFourPuzzleSolvedOnce(fourWayPuzzle)}`);

        settingsButton = this.add.sprite(360, 950, 'atlas', 'settings.png').setName("leftButton").setDepth(1).setVisible(false);
        recorder.addMaskSprite('settingsButton', settingsButton);
        settingsButton.on('pointerdown', () => {
            this.hideUILayer();
            this.scene.sleep(activeSceneName);

            if (settingsInit) {
                settingsInit = false;
                this.scene.launch("Settings")
            } else {
                this.scene.wake("Settings");
            }
        });

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

        eyeButton = this.add.sprite(15, 1070, 'atlas', 'eyeOff.png').setName("eyeButton").setOrigin(0, 0).setDepth(1);
        recorder.addMaskSprite('eyeButton', eyeButton);
        eyeButton.setVisible(false); eyeButton.setInteractive({ cursor: 'pointer' });

        eyeButton.on('pointerdown', () => {
            //console.log(`EYE CLICK recorder mode= ${recorder.getMode()}`);
            if (recorder.getMode() == "record")
                recorder.recordObjectDown("eyeButton", this);

            if (eyeButton.name != "eyeButtonOn") {
                //console.log("view selected eyeball")
                let selectedThing = slots.getSelected();
                //console.log("**** selected thing=" + selectedThing.thing)
                if (selectedThing.thing.length == 0 || selectedThing.thing == "empty")
                    return;
                eyeButton.setTexture('eyeButtonOn');
                eyeButton.setName("eyeButtonOn");
                interfaceInspect.setVisible(false);
                interfaceClick.setVisible(false);
                clickLine.setVisible(false);

                UIbackButton.setVisible(true); UIbackButton.setInteractive({ cursor: 'pointer' });
                plusButton.setVisible(true); plusButton.setInteractive({ cursor: 'pointer' });
                objectMask.setVisible(true); objectMask.setInteractive({ cursor: 'pointer' });
                //objectMask.input.cursor = 'url(assets/input/cursors/pen.cur), pointer'; // deluxe

                //console.log("sleeping " + activeSceneName)
                this.scene.sleep(activeSceneName)
                flipIt = false;
                uiObjectView = true;
                uiObjectViewDirty = true;

            } else {
                this.closeObjectUI();

            }
        });

        hintButton = this.add.sprite(620, 1070, 'atlas', 'hintButtonMask.png').setName("hintButton").setOrigin(0, 0).setDepth(1);
        recorder.addMaskSprite('hintButton', hintButton);
        hintButton.setVisible(true); hintButton.setInteractive({ cursor: 'pointer' });
        hintButton.on('pointerdown', () => {
            this.hideUILayer();

            if (hintBotInit) {
                hintBotInit = false;
                this.scene.launch("HintBot")
            } else {
                this.scene.wake("HintBot");
            }
        });

        UIbackButton = this.add.sprite(300, 875, 'atlas', 'arrowDown.png').setOrigin(0, 0).setName("UIbackButton").setDepth(3).setVisible(false);
        recorder.addMaskSprite('UIbackButton', UIbackButton);
        UIbackButton.on('pointerdown', () => {
            this.closeObjectUI();

        });

        objectMask = this.add.sprite(170, 410, 'atlas', 'object-maskC.png').setOrigin(0, 0).setName("objectMask").setDepth(2).setVisible(false);
        recorder.addMaskSprite('objectMask', objectMask);
        // Flip object over. Need to adjust for key presence if it's the plate. Awkward!
        objectMask.on('pointerdown', () => {
            flipIt = !flipIt;
            hasSearched = true;
            uiObjectViewDirty = true;
            /*
            if (slots.inventoryViewObj == "objRoach" && viewWall == 5) {
                if (recorder.getMode() == "replay") {
                    recorder.setMode("idle")
                } else {
                    recorder.setMode("record")
                    window.location.reload();
                }
            }
            */
        });

        // Found the key and clicked it. We need to update the inventory view with empty plate.
        keyMask = this.add.sprite(315, 540, 'atlas', 'keyMask.png').setName("keyMask").setOrigin(0, 0).setDepth(1).setVisible(false);
        recorder.addMaskSprite('keyMask', keyMask);
        keyMask.on('pointerdown', () => {
            slots.addIcon("icon - red keyA.png", "objRedKeyA", "altobjRedKeyA", false);
            this.sound.play('sfx', { name: 'winTone', start: 9, duration: 2 });
            haveHalfKey = true;
            this.didGoal('takeKeyFromPlate');

            uiObjectViewDirty = true;
        });

        ////////////// RECORDER INIT //////////////
        //console.log("MAIN PLAYER: " + recorder.getPlayerName());

        myText = new InputText(this, 220, 55, 300, 100, {
            type: 'textarea',
            text: 'init',
            fontSize: '24px',
        });
        this.add.existing(myText);

        pasteBox = new InputText(this, 220, 105, 300, 100, {
            type: 'textarea',
            text: 'init',
            fontSize: '24px',
        });
        this.add.existing(pasteBox);
        myText.setVisible(true)
        pasteBox.setVisible(true)

        recorder.setCookieRecorderMode(useCookieRecordings);

        if (location.hostname == "localhost") {
            this.input.keyboard!.on('keydown', this.handleKey);
        }

        scenePlayGame = this.scene.get("PlayGame");
        sceneZotTable = this.scene.get("ZotTable");
        sceneFour = this.scene.get("Four");
        sceneFive = this.scene.get("Five");
        sceneUI = this;

        let thisscene = this;
        // @ts-ignore   pointer is unused until we get fancy...
        this.input.on('gameobjectdown', function (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
            recorder.recordObjectDown((gameObject as Phaser.GameObjects.Sprite).name, thisscene);
        });
        //console.log("UI create recorder mode: " + recorder.getMode())

        //var clueBox = this.add.graphics();
        //clueBox.fillStyle(0x000000);
        //clueBox.fillRect(5, 250, 400, 30);
        clueText = this.make.text({
            x: 10,
            y: 175,
            text: 'clue goes here',
            style: {
                font: '24px Verdana',
                //fill: '#ffffff'
            }
        });
        clueText.setDepth(99);
        hintObjectiveText = clueMap.get('searchAndSolve')!;
        clueText.text = hintObjectiveText;
        if (!debugHints) {
            clueText.setVisible(false)
        }

        this.scene.launch("BootGame")
    }

    showClueDebug() {
        debugHints = true;
        clueText.setVisible(true);
    }

    async update() {
        //console.log("UI update")

        /* Don't give up on full screen option!
        https://labs.phaser.io/edit.html?src=src/scalemanager/full%20screen%20game.js&v=3.55.2
                    if (this.scale.isFullscreen)
                    {
                        
                        this.scale.stopFullscreen();
                    }
                    else
                    {
                        this.scale.startFullscreen();
                    }
        */

        ////////////// RECORDER PREP //////////////

        if (mainReplayRequest == "do the damn replay") { // trap if key pressed and not reloaded yet
            return;
        }

        if (activeSceneName != activeSceneNameOld) {
            //console.log("scene switch")
            activeSceneNameOld = activeSceneName;
            settingsButton.setVisible(false);
            if (activeSceneName == "PlayGame" || activeSceneName == "RoomTwo") {
                settingsButton.setVisible(true); settingsButton.setInteractive({ cursor: 'pointer' });
            }
        }

        if (myText.text == "init") {
            //console.log("UI Recorder mode: " + recorder.getMode());
            if (recorder.getMode() == "idleButReplayAgainSoon")
                recorder.setMode("replay")

            let replaying = false;
            if (recorder.getMode() == "replay" || recorder.getMode() == "replayOnce")
                replaying = true;
            if (debugInput && !replaying) {
                myText.text = "status";
                pasteBox.text = "pasteit";
            } else {
                myText.text = "off";
                //theText.resize(0, 0);
                myText.resize(0, 0);
                pasteBox.resize(0, 0);
            }

            theRecording = "NO RECORDING";
            if (replaying) {
                // Get the recording from the cloud or cookies
                if (useCookieRecordings) {
                    theRecording = recorder.getRecordingFromCookies();
                } else {
                    const recordingFilename = recorder.getRecordingFilename();
                    //console.log("UI filename=" + recordingFilename);
                    if (recordingFilename.length > 0)
                        theRecording = await recorder.getRecording();
                }
                //console.log("UI recording= " + theRecording);
                //console.log("reseed random " + recorder.getRNGSeed())

                seededRNG = new Phaser.Math.RandomDataGenerator([recorder.getRNGSeed()]);

                // Prep recording stack for replay
                if (recorder.getReplaySpeed() == "fast") {
                    theRecording = recorder.makeFast(theRecording, debugRecorderPlayPerfectSkip);
                }
                const actionString = theRecording.split(":");
                //console.log("recording stack prepped, count=" + actionString.length )
                actionString.forEach((action) => {
                    if (action.length > 0) {
                        let splitAction = action.split(',');
                        actions.push([splitAction[0], parseInt(splitAction[1], 10), parseInt(splitAction[2], 10), parseInt(splitAction[3], 10), splitAction[4]]);
                    }
                });
                actions = actions.slice(1); // drop the first element, just used to instantiate the array
                nextActionTime = actions[0][3]; // the first action will fire when the current timer reaches this
                //console.log("FIRST ACTION: " + nextActionTime)
                //nextActionTime = -1; // the first action might not start for quite awhile, includes boot time fiddling with name  

                //console.log("Recording action dump:");
                //actions.forEach((action) => {
                //    console.log(action)
                //});
            }
        }

        ////////////// RECORDER PASTEBOX //////////////
        if (!mainHasStarted) {
            const mainStarted = this.scene.isActive("PlayGame");
            if (mainStarted) {
                pasteBox.setVisible(true);
                myText.setVisible(true);
                mainHasStarted = true;
                //console.log(`main has started, mode=${recorder.getMode()}`)
            }
        }
        if (pasteBox.text != "pasteit" && pasteBox.text != "init") {  // pastebox latch
            const getRec = pasteBox.text;
            pasteBox.text = "pasteit";

            console.log("lets fetch " + getRec)
            const theRecording = await recorder.fetchRecording(getRec);

            console.log("we fetched:")
            console.log(theRecording)
            if (theRecording == "fail") {
                myText.text = "ERROR"
            } else {
                myText.text = "success"
                recorder.setRecordingFilename(getRec);
            }
        }

        if (recorder.getMode() == "record" && activeSceneName != undefined) {
            //console.log("UI checkpointer, scene=" + activeSceneName)
            recorder.checkPointer(this);
        }

        ////////////// REPLAY //////////////
        if (mainHasStarted && (recorder.getMode() == "replay" || recorder.getMode() == "replayOnce")) {
            if (actions[0][0] != "mousemove" && actions[0][0] != "mouseclick") {
                //console.log("replay action:" + actions[0]);
            }

            // TRY AGAIN WITH QUICK FIRST ACTION
            //if (nextActionTime < 0) // first replay action
            //    nextActionTime = this.time.now + 1000;
            if (this.time.now >= nextActionTime) {
                let replayAction = actions[0][0];
                const targetScene = actions[0][4].split('%')[1];

                if (replayAction == "mouseclick") {
                    viewportPointer.setX(actions[0][1]);
                    viewportPointer.setY(actions[0][2]);

                    //console.log("show click on " + targetScene)
                    switch (targetScene) {
                        case "PlayerUI":
                            recorder.showClick(sceneUI, actions[0][1], actions[0][2]);
                            break;

                        /***** all clicks are on UI layer now! */
                        case "PlayGame":
                            recorder.showClick(scenePlayGame, actions[0][1], actions[0][2]);
                            break;
                        case "ZotTable":
                            recorder.showClick(sceneZotTable, actions[0][1], actions[0][2]);
                            break;
                        case "Four":
                            recorder.showClick(sceneFour, actions[0][1], actions[0][2]);
                            break;
                        case "Five":
                            recorder.showClick(sceneFive, actions[0][1], actions[0][2]);
                            break;
                        default:
                            console.log("ERROR Unregistered scene " + targetScene);
                    }
                } else if (replayAction == "mousemove") {
                    viewportPointer.setX(actions[0][1]);
                    viewportPointer.setY(actions[0][2]);
                } else {
                    let target = actions[0][0];
                    let targetType = target.split('=')[0];
                    let targetObject = target.split('=')[1];

                    //////////////                        
                    // The money maker: call this scene's objects just like they were executed and recorded,
                    // or click the icon just that same way.
                    //////////////
                    if (targetType == "object") {

                        //console.log("check target scene: " + targetScene)

                        // TODO Need to check unmapped objects
                        let object = recorder.getMaskSprite(targetObject);
                        //console.log("recorder replay object " + object)

                        // if (object?.scene.sys.settings.key != "PlayGame") {
                        if (object?.scene === this) {
                            //console.log("simulating UI " + targetObject)
                            object?.emit('pointerdown')
                        } else {
                            //console.log(`simulate sprite ${targetObject} on scene ${targetScene}`)
                            this.registry.set('replayObject', targetObject + ":" + targetScene);
                        }
                    } else if (targetType == "icon") {
                        //console.log("simulate icon " + targetObject);
                        slots.recordedClickIt(targetObject);   // here's how we click an icon!
                    }
                }
                // get next action
                actions = actions.slice(1);
                //console.log(actions.length + " actions pending");
                if (actions.length == 0) {
                    //console.log("recorder EOJ")
                    if (recorder.getMode() == "replayOnce") {
                        //console.log("did once... roach mode EOJ")
                        recorder.setMode("idle");
                    } else {
                        // need a little hack here so we can set the mode but do replay again on reload
                        //console.log("recording done, reload to try it again")
                        recorder.setMode("idleButReplayAgainSoon");

                    }

                    ////////////////viewportText.setDepth(-1);
                    recordingEndedFadeClicks = 20;
                } else {
                    if (actions[0][3] > minDelayReplay)
                        nextActionTime += actions[0][3]; // wait for this amount of time to elapse then do the next
                    else {
                        //console.log("too fast!")
                        nextActionTime += minDelayReplay;
                    }
                }
            }
            recorder.fadeClick();
        }
        if (recordingEndedFadeClicks-- > 0) { // clear any clicks left displayed when the recording ended
            recorder.fadeClick();
            viewportPointer.setX(1000);
        }


        ////////////// INVENTORY UI //////////////
        if (slots.getSelectedIndex() != currentSelectedIndex) {
            currentSelectedIndex = slots.getSelectedIndex();
            uiObjectViewDirty = true;
            flipIt = false;
        }

        if (uiObjectView && uiObjectViewDirty) {
            uiHadSettingsButton = settingsButton.visible;
            this.hideSettings();
            uiObjectViewDirty = false;
            const viewIt = slots.viewSelected();
            this.hideHintIcons();

            // special hidden key on back of plate logic stuff
            foundHalfKey = false;
            if (viewIt.objectView == "objPlate" && flipIt) {
                //console.log("discovered key!")
                foundHalfKey = true;
                this.didGoal('searchPlate')
            }
            if (haveHalfKey && viewIt.objectViewAlt == "altobjPlateKey") {
                viewIt.objectViewAlt = "altobjPlateEmpty";
            }
            keyMask.setVisible(false)
            if (foundHalfKey && !haveHalfKey) {
                keyMask.setVisible(true); keyMask.setDepth(200); keyMask.setInteractive({ cursor: 'pointer' });
            }

            //console.log(`VIEW ${viewIt.objectView} alt ${viewIt.objectViewAlt}`)
            if (objectImage != undefined)
                objectImage.destroy();
            if (flipIt)
                objectImage = this.add.image(0, 0, viewIt.objectViewAlt).setOrigin(0, 0);
            else
                objectImage = this.add.image(0, 0, viewIt.objectView).setOrigin(0, 0);

            this.displayInterfaceClueFull(false);
            this.displayInterfaceClueCombine(false);
            if (!hasSearched) {
                this.displayInterfaceClueFull(true);
            }
            if (!hasCombined) {
                this.displayInterfaceClueCombine(true);
            }
            if (viewIt.objectView == "objRoach") {
                this.displayInterfaceClueFull(false);
                this.displayInterfaceClueCombine(false);
            }
        }

        ////////////// INVENTORY COMBINE //////////////
        // Can't combine the plate and donut if door is locked
        if (slots.combining.split(':')[3] == "objDonutPlated" && !doorUnlocked) {
            slots.combining = "bad combine:"
        }

        if (slots.combining.split(':')[0] == "bad combine") {
            hasCombined = true;
            //console.log("BAD COMBINE")
            slots.combining = "";
            plusModeButton.setVisible(false);
            plusButton.setVisible(true); plusButton.setDepth(110); plusButton.setInteractive({ cursor: 'pointer' });

            failed.setX(640);
            showXtime = this.time.now;
        }

        if (slots.combining.split(':')[0] == "good combine") {
            hasCombined = true;
            // remove the first item, note the position of the second item then clear it,
            slots.clearItem(slots.combining.split(':')[1]);
            const slotRepl = slots.selectItem(slots.combining.split(':')[2]); //select the slot of the combine click
            slots.clearItem(slots.combining.split(':')[2]);
            this.sound.play('sfx', { name: 'winTone', start: 9, duration: 2 });

            if (slots.combining.split(':')[3] == "objDonutPlated") {
                slots.inventoryViewObj = "objDonutPlated";
                slots.inventoryViewAlt = "altobjDonutPlated";
                slots.addIcon("icon - donutPlated.png", slots.inventoryViewObj, slots.inventoryViewAlt, false, slotRepl);

                slots.selectItem(slots.combining.split(':')[3]);
                didBonus = true;

                // switch view to new goodly combined object
                objectImage.destroy();
                objectImage = this.add.image(0, 0, "objDonutPlated").setOrigin(0, 0);
            } else if (slots.combining.split(':')[3] == "objKeyWhole") {
                slots.inventoryViewObj = "objKeyWhole";
                slots.inventoryViewAlt = "altobjKeyWhole";
                slots.addIcon("icon - keyWhole.png", slots.inventoryViewObj, slots.inventoryViewAlt, false, slotRepl);
                slots.selectItem(slots.combining.split(':')[3]);
                this.didGoal('assembleYellow');

                objectImage.destroy();
                objectImage = this.add.image(0, 0, "objKeyWhole").setOrigin(0, 0);

            } else if (slots.combining.split(':')[3] == "objRedKey") {
                slots.inventoryViewObj = "objRedKey";
                slots.inventoryViewAlt = "altobjRedKey";
                slots.addIcon("icon - red key.png", slots.inventoryViewObj, slots.inventoryViewAlt, false, slotRepl);
                slots.selectItem(slots.combining.split(':')[3]);
                this.didGoal('assembleRed');

                objectImage.destroy();
                objectImage = this.add.image(0, 0, "objRedKey").setOrigin(0, 0);

            } else {
                slots.addIcon("icon - roach.png", "objRoach", "altobjRoach", false, slotRepl); // it is a bug
            }
            slots.combining = "";
            plusModeButton.setVisible(false);
            plusButton.setVisible(true); plusButton.setDepth(110); plusButton.setInteractive({ cursor: 'pointer' });
        }

        if (showXtime > 0) { // clear the big red X after awhile
            if ((this.time.now - showXtime) > 500) {
                showXtime = -1;
                failed.setX(1000);
            }
        }

        ////////////// CLUES //////////////
        if (mainHasStarted && spinQuestionBOJ) {
            spinQuestionBOJ = false;
            questionSpinning = this.add.video(620, 1050, 'questionSpinning').setOrigin(0, 0).setDepth(2);
            questionSpinning.setLoop(true);
            questionSpinning.play(true);
            questionSpinning.setPaused(false);
        }

        if (needNewClue) {
            const oldClue = clueText.text;
            let nextObjective: string = "";
            let foundNext = false;
            clueObjective.forEach((objectiveCompleted, idx) => {
                //console.log(`${idx} is ${objectiveCompleted}`)
                if (!objectiveCompleted && !foundNext) {
                    nextObjective = idx;
                    foundNext = true;
                }
            });
            //console.log("next objective is " + nextObjective);

            hintObjectiveText = clueMap.get(nextObjective)!;
            clueText.text = hintObjectiveText;
            if (oldClue != clueText.text)
                hintQuestionGreen.setVisible(true);
            needNewClue = false;
        }


        /*                    
                    // ROACH DEBUG RECORDER START/STOP
        
                    //console.log("IDLE IT? OR REPLAY");
                    if (slots.inventoryViewObj == "objRoach") {
                        if (recorder.getMode() == "record") {
                            recorder.setMode("idle")
        
                            //this.showRecording()
                        } else {
                            // TODO write proper exit function, called twice and did it here wrongly
                            recorder.setMode("idle")
        
                            viewportText.setDepth(-1);
                            recordingEndedFadeClicks = 20;
                        }
                    }
        */
    }

    closeObjectUI() {
        //console.log("UI back to " + activeSceneName);
        uiObjectView = false;

        objectImage.destroy();
        this.restoreHintIcons();

        slots.combining = ""; // cancel any combine action
        this.turnEyeOff();
        UIbackButton.setVisible(false);
        objectMask.setVisible(false);
        interfaceClueCombine.setVisible(false);
        interfaceClueFull.setVisible(false);
        plusButton.setVisible(false);
        plusModeButton.setVisible(false);
        this.scene.wake(activeSceneName);
        if (uiHadSettingsButton) {
            this.showSettingsButton();
        }
    }

    // From normal (not object) view, hide all the gadgets
    hideUILayer() {
        this.hideHintIcons();
        stateEyeButton = eyeButton.visible;
        stateInterfaceInspect = interfaceInspect.visible;
        stateInterfaceClick = interfaceClick.visible;
        stateClickLine = clickLine.visible;

        eyeButton.setVisible(false);
        interfaceInspect.setVisible(false);
        interfaceClick.setVisible(false);
        clickLine.setVisible(false);
        invBar.setVisible(false);
        slots.hideSlots();
        slots.clearSelect();
        this.hideSettings();
    }

    restoreUILayer() {
        this.restoreHintIcons();
        eyeButton.setVisible(stateEyeButton);
        interfaceInspect.setVisible(stateInterfaceInspect);
        interfaceClick.setVisible(stateInterfaceClick);
        clickLine.setVisible(stateClickLine);
        invBar.setVisible(true);
        slots.displaySlots();
    }

    hideHintIcons() {
        stateHintQuestionGreen = hintQuestionGreen.visible;
        questionSpinning.setVisible(false);
        hintQuestion.setVisible(false);
        hintQuestionGreen.setVisible(false);
        hintButton.setVisible(false);
    }

    restoreHintIcons() {
        //questionSpinning.setVisible(stateQuestionSpinning);
        if (hintBotInit)
            questionSpinning.setVisible(true);
        //console.log(`hintQuestion ${stateHintQuestion} hintQuestionGreen ${stateHintQuestionGreen}`)
        hintQuestion.setVisible(true);
        hintQuestionGreen.setVisible(stateHintQuestionGreen);
        hintButton.setVisible(true); hintButton.setInteractive({ cursor: 'pointer' });
    }

    handleKey(event: KeyboardEvent) {
        if (event.key == lastKeyDebouncer)
            return;
        //console.log("keycode " + event.key)
        lastKeyDebouncer = event.key;

        switch (event.key) {
            case "F1":
                //console.log("new recording");
                recorder.setMode("record")
                window.location.reload();
                break;
            case "F2":
                //console.log("new recording");
                recorder.setMode("replayOnce")
                window.location.reload();
                break;
            case "1":
                //console.log("fast replay")
                recorder.setReplaySpeed("fast")
                break;
            case "2":
                //console.log("perfect replay")
                recorder.setReplaySpeed("perfect")
                break;
            case "`":
                //console.log("play recording");
                recorder.setMode("replay")
                mainReplayRequest = "do the damn replay"
                window.location.reload();
                break;
            case "x":
                console.log("toggle skip start");
                const skipStart = getCookie("skipStart");
                if (skipStart == "skip") {
                    setCookie("skipStart", "noskip", 30); // bake for a month
                } else {
                    setCookie("skipStart", "skip", 30); // bake for a month
                }

                break;
            case "Escape":
                //;console.log("quit recorder");
                recorder.setMode("idle")
                ///////////////////////////////viewportText.setDepth(-1);
                break;
        }
    }

}


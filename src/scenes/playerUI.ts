import 'phaser';
import Slots from "../objects/slots"
import Recorder from "../objects/recorder"
import { setCookie, getCookie } from "../utils/cookie";

import InputText from 'phaser3-rex-plugins/plugins/inputtext.js';

let useCookieRecordings = false; // use cookies not the cloud
let debugShowReplayActionCount = false;
const debugRecorderPlayPerfectSkip = 0; // how many steps to skip before fast stops and perfect begins

let debugInput = true; // display pastebox for input of debug data
let debugHints = false;

// override hardcoded debug flags in production to be sure they are disabled
let localBuild = false;
if (location.hostname == "localhost")
    localBuild = true;

if (!localBuild) {
    debugInput = false;
    debugHints = false;
}

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
let musicLength: number;
let stepVolumeUp = 0;
let stepVolumeDown = 0;
let stepVolumeLevel: number;
let stepVolumeUpTime: number;
let musicStopped = false;

let uiObjectView = false;
let uiObjectViewDirty = false;
let flipIt = false;
let hasSearched = false;
let hasCombined = false;
let currentSelectedIndex: number;
let oldElapsedMinutes = -1;
const maxTime = 59;
let timeFail = false;

let hintBotInit = true;
let hintObjectiveText: string;
let settingsInit = true;
let uiHadSettingsButton = false;
let hintIconsHidden = false;

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
let pasteResultText: InputText;
let pasteBox: InputText;
let mainHasStarted = false;
let spinQuestionBOJ = true;
let actions: [string, number, number, number, string][] = [["BOJ", 0, 0, 0, "scn"]];
let nextActionTime = 0;
let recordingEndedFadeClicks = 0;
const minDelayReplay = 1;
let debugReplayActionCounter = 0;
let lastKeyDebouncer = "";
let mainReplayRequest = "";

let seededRNG = new Phaser.Math.RandomDataGenerator;

let sceneUI: Phaser.Scene;
let scenePlayGame: Phaser.Scene;
let sceneZotTable: Phaser.Scene;
let sceneFour: Phaser.Scene;
let sceneFive: Phaser.Scene;

let needNewClue = true;
let clueText: Phaser.GameObjects.Text;
let timeText: Phaser.GameObjects.Text;
let nextObjective: string = "";

let clueMap = new Map<string, string>(); // clue key, clue text
let clueObjective = new Map<string, boolean>();
let spoilerMap = new Map<string, string>(); // clue key, clue text
clueMap.set("searchAndSolve", "Search around, solve all the puzzles,\nescape the room!") // until clicked an arrow
spoilerMap.set("searchAndSolve-1", "Tap the arrows to move right, left, back.");
spoilerMap.set("searchAndSolve-2", "Click/Tap is the only input you will need,\nno gestures.");

clueMap.set("searchDonutTable", "Search the donut table") // until looked at table
spoilerMap.set("searchDonutTable-1", "Look for the table by the door.");
spoilerMap.set("searchDonutTable-2", "It has a donut on it.");
spoilerMap.set("searchDonutTable-3", "Click on the table to look at it.");

clueMap.set("pickUpPlate", "Pick up the plate"); // until picked up plate
spoilerMap.set("pickUpPlate-1", "Click on the table to look at it.");
spoilerMap.set("pickUpPlate-2", "Click the donut to pick it up.");
spoilerMap.set("pickUpPlate-3", "Click the plate to pick it up.");

clueMap.set("searchPlate", "Search the plate"); // 3 until see the key
spoilerMap.set("searchPlate-1", "Click the plate icon and then the eyeball\nto inspect the plate.");
spoilerMap.set("searchPlate-2", "Looking at the plate, click it to look\nat the back.");

clueMap.set("takeKeyFromPlate", "Take half red key from plate"); // 4 until took the key
spoilerMap.set("takeKeyFromPlate-1", "Click the plate icon and then the eyeball\nto inspect the plate.");
spoilerMap.set("takeKeyFromPlate-2", "Looking at the plate, click it to look\nat the back.");
spoilerMap.set("takeKeyFromPlate-3", "Click the part of the key taped to the\nplate to pick it up.");

clueMap.set("openTeal", "Open the Teal Box"); // 5 until box is open
spoilerMap.set("openTeal-1", "Find the table with the teal box.");
spoilerMap.set("openTeal-2", "Click the table to look at the box.");
spoilerMap.set("openTeal-3", "Click the button twice to open the box.");

clueMap.set("takeKeyFromTeal", "Pick up half red key from teal box"); // 6 until took the key
spoilerMap.set("takeKeyFromTeal-1", "Find the table with the teal box,\nclick to look at it.");
spoilerMap.set("takeKeyFromTeal-2", "Click the button twice to open the box.");
spoilerMap.set("takeKeyFromTeal-3", "Click the part of the key to pick it up.");

clueMap.set("assembleRed", "Assemble red key"); // 7 until assembled the key
spoilerMap.set("assembleRed-1", "Click a key part icon and then\nclick the eyeball to inspect it.");
spoilerMap.set("assembleRed-2", "Click the plus button.");
spoilerMap.set("assembleRed-3", "Click the other key part to combine\nthe items and assemble the key.");

clueMap.set("enterSecond", "Enter second room"); // 8 until entered second room
spoilerMap.set("enterSecond-1", "Find the dark door.");
spoilerMap.set("enterSecond-2", "Select the red key icon.");
spoilerMap.set("enterSecond-3", "Click the door to unlock it and\nagain to enter the second room.");

clueMap.set("solveFour", "Solve 4x4 puzzle"); // 9 until 4x4 is solved
spoilerMap.set("solveFour-1", "Find the 4x4 puzzle in the second room.");
spoilerMap.set("solveFour-2", "Select a piece and then select another\npiece to swap.");
spoilerMap.set("solveFour-3", "It needs to look like this:");

clueMap.set("solveFive", "Solve Five Words puzzle"); // 10 until 5x5 is looked at after 4x4 is solved
spoilerMap.set("solveFive-1", "Find the box with 5 words in the\nfirst room. Click the words to spin.");
spoilerMap.set("solveFive-2", "Make a 5-word phrase.");
spoilerMap.set("solveFive-3", "Check your short-term memory?");

clueMap.set("getFourClue", "Solve Five Words puzzle.\nGet clue from 4x4 puzzle?"); // 11 until 5x5 is solved
spoilerMap.set("getFourClue-1", "Watch the 4x4 YouTube for about\n30 seconds. Click the words to spin.");
spoilerMap.set("getFourClue-2", "Listen for a 5-word phrase.");
spoilerMap.set("getFourClue-3", '"So much larger than life"');

clueMap.set("getBattery", "Get battery"); // 12 until took the battery
spoilerMap.set("getBattery-1", "Find the box with 5 words in the\nfirst room.");
spoilerMap.set("getBattery-2", "Take the battery.");

clueMap.set("getZot", "Get zot from donut table"); // 13 until took the zot
spoilerMap.set("getZot-1", "Find the table that had the donut\nand plate on it.");
spoilerMap.set("getZot-2", "Take the lightning bolt.");

clueMap.set("openGreen", "Open Perspective Box (green)"); // 14 until green box is opened
spoilerMap.set("openGreen-1", "Spin the box back-to-front and\ntop-to-bottom.");
spoilerMap.set("openGreen-2", "Put the lighting bolt on the top and\nthe battery on the bottom.");
spoilerMap.set("openGreen-3", "Be sure the box is facing up so\nthe drawer will open.");

clueMap.set("getGreenKey", "Get half yellow key"); // 15 until took the key
spoilerMap.set("getGreenKey-1", "Click the part of the yellow key from\nthe green box to pick it up. ");

clueMap.set("openTwoWay", "Open Two-Way box (red)"); // 16 until button is pressed
spoilerMap.set("openTwoWay-1", "Find the two-way box in the second room.");
spoilerMap.set("openTwoWay-2", "Click right and left buttons to open.");
spoilerMap.set("openTwoWay-3", "The teal box displays the sequence.");

clueMap.set("getTealClue", "Open Two-Way box (red)\nGet Two-Way clue from Teal Mystery box?"); // 17 until two-way solved
spoilerMap.set("getTealClue-1", "Click the button on the teal box until\nit closes. Click and observe.");
spoilerMap.set("getTealClue-2", "Observe which flap moves. Like this:");
spoilerMap.set("getTealClue-3", "Enter the sequence: L R R R L L R L");

clueMap.set("getTwoWayKey", "Get half yellow key"); // 18 until key is taken
spoilerMap.set("getTwoWayKey-1", "Click the part of the yellow key from\nthe red box to pick it up. ");

clueMap.set("assembleYellow", "Assemble yellow key"); // 19 until key is assembled
spoilerMap.set("assembleYellow-1", "Click a yellow key part icon\nand then the eyeball to inspect it.");
spoilerMap.set("assembleYellow-2", "Click the plus button.");
spoilerMap.set("assembleYellow-3", "Click the other yellow key part to\ncombine the items and assemble the key.");

clueMap.set("exit", "Escape!"); // 20 until win
spoilerMap.set("exit-1", "Unlock the door.");
spoilerMap.set("exit-2", "Consider the bonus. What could it be?\nThere is a clue on a wall.");
spoilerMap.set("exit-3", "You can only exit now, or do one last\nthing which was impossible earlier.");

clueMap.set("win", "Winner!"); // 21 chicken dinner
spoilerMap.set("win-1", "You did it!");

// https://stackoverflow.com/questions/52347756/read-console-log-output-form-javascript
let consoleStorage: string[] = [];

for (let key of clueMap.keys()) {
    clueObjective.set(key, false);
}

export default class PlayerUI extends Phaser.Scene {
    constructor() {
        super("PlayerUI");
    }

    getLocalBuild() {
        return localBuild;
    }

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
            music.setVolume(.1);
            // @ts-ignore
            music.play();
            this.resumeMusic();
        } else {
            recorder.setMusicMuted(true); // sets cookie for next time
            this.pauseMusic(false);
        }
    }
    initMusic() {
        music = this.sound.add('musicTrack', { loop: true });
        musicLength = music.duration;
        if (musicLength < 350) {
            const musicTest = this.make.text({
                x: 620,
                y: 1045,
                text: 'test music',
                style: {
                    font: '18px Verdana',
                    color: 'yellow'
                }
            });
            //console.log(this.sys.game.device.browser)
            musicTest.setDepth(99);
            if (!localBuild)
                musicTest.setY(400)
        }
    }
    pauseMusic(temporary: boolean) {
        if (stepVolumeDown != 0 || stepVolumeUp != 0) {
            //console.log("********JITTER*******") // if they goof with the settings and want it off, force it off
            // @ts-ignore
            music.pause();
        } else {
            stepVolumeDown = 10;
            stepVolumeLevel = .95;
            stepVolumeUpTime = this.time.now + 50;
            // @ts-ignore
            music.setVolume(stepVolumeLevel);
        }
        if (!musicStopped) {
            musicStopped = true;
            if (!temporary)
                recorder.setStoppedMusicTime(true);
        }

    }
    resumeMusic() {
        if (playMusic) {
            // @ts-ignore
            music.resume();
            stepVolumeUp = 10;
            stepVolumeLevel = 0;
            stepVolumeUpTime = this.time.now + 150;
            // @ts-ignore
            music.setVolume(stepVolumeLevel);
        }
    }
    getMusicPlayTime() {
        if (!musicStopped)
            return "enjoyed music"
        else
            return recorder.getRecordedMusicPlayTime();
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

    setEyeTexture() {
        eyeButton.setTexture('atlas2', 'eyeHint.png');
    }
    hideEye() {
        eyeButton.setVisible(false);
    }
    showEye() {
        eyeButton.setVisible(true);
    }
    showClickClue() {
        interfaceClick.setVisible(true);
        clickLine.setVisible(true);
        clickLine.play('clickLine');
    }
    showInspectClue() {
        interfaceInspect.setVisible(true);
        this.showEye();
    }
    hideClickClue() {
        interfaceClick.setVisible(false);
        clickLine.setVisible(false);
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

    getTimeFail() {
        return timeFail;
    }


    // Must preload a few elements for UI
    preload() {
        this.load.atlas('atlas', 'assets/graphics/atlas1.png', 'assets/graphics/atlas1.json');
        this.load.atlas('atlas2', 'assets/graphics/atlas2.png', 'assets/graphics/atlas2.json');
        this.load.atlas('animated', 'assets/graphics/animated.png', 'assets/graphics/animated.json');

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

        let hostname = location.hostname;
        //console.log(hostname);

        // Debug line above inventory
        if (false) {
            const mobileTest = this.make.text({
                x: 5,
                y: 1045,
                text: 'debug it',
                style: {
                    font: '18px Verdana',
                    //fill: '#ffffff'
                }
            });
            //console.log(this.sys.game.device.browser)
            mobileTest.setDepth(99);
            mobileTest.text = 'Hostname:' + hostname + "  Safari:" + this.sys.game.device.browser.mobileSafari + " ver " + this.sys.game.device.browser.safariVersion;
        }

        if (!localBuild)
            useCookieRecordings = false;

        this.anims.create({ key: 'clickLine', frames: this.anims.generateFrameNames('animated', { prefix: 'clickbar', suffix: '.png', end: 3, zeroPad: 4 }), repeat: -1, frameRate: 7 });
        this.anims.create({ key: 'openItAnim', frames: this.anims.generateFrameNames('animated', { prefix: '2way-anim', suffix: '.png', end: 3, zeroPad: 4 }), repeat: 0, frameRate: 7 });

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

        const RNGSeed = Math.random().toString();
        //const RNGSeed = "0.123"
        seededRNG = new Phaser.Math.RandomDataGenerator([RNGSeed]);

        recorder = new Recorder(viewportPointer, viewportPointerClick, cameraHack, RNGSeed);
        slots = new Slots(this, iconSelected, recorder);

        plusButton = this.add.sprite(80, 950, 'atlas', 'plus - unselected.png').setName("plusButton").setDepth(1).setVisible(false);
        plusModeButton = this.add.sprite(80, 950, 'atlas', 'plus - selected.png').setName("plusModeButton").setDepth(1).setVisible(false);
        recorder.addMaskSprite('plusButton', plusButton);
        recorder.addMaskSprite('plusModeButton', plusModeButton);

        //console.log(`Solved four: ${recorder.getFourPuzzleSolvedOnce(fourWayPuzzle)}`);

        settingsButton = this.add.sprite(655, 310, 'atlas', 'settings1.png').setName("leftButton").setDepth(1).setVisible(false);
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

        eyeButton = this.add.sprite(15, 1070, 'atlas2', 'eyeOff.png').setName("eyeButton").setOrigin(0, 0).setDepth(1);
        recorder.addMaskSprite('eyeButton', eyeButton);
        eyeButton.setVisible(false); eyeButton.setInteractive({ cursor: 'pointer' });

        eyeButton.on('pointerdown', () => {
            //console.log(`EYE CLICK recorder mode = ${ recorder.getMode() }`);
            if (recorder.getMode() == "record")
                recorder.recordObjectDown("eyeButton", this);

            if (eyeButton.name != "eyeButtonOn") {
                //console.log("view selected eyeball")
                let selectedThing = slots.getSelected();
                //console.log("**** selected thing=" + selectedThing.thing)
                if (selectedThing.thing.length == 0 || selectedThing.thing == "empty")
                    return;
                eyeButton.setTexture('atlas2', 'eyeOn.png');
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

        pasteResultText = new InputText(this, 220, 105, 300, 100, {
            type: 'textarea',
            text: 'init',
            fontSize: '24px',
        });
        this.add.existing(pasteResultText);

        pasteBox = new InputText(this, 220, 55, 300, 100, {
            type: 'textarea',
            text: 'init',
            fontSize: '24px',
        });
        this.add.existing(pasteBox);
        pasteResultText.setVisible(false)
        pasteBox.setVisible(true)

        recorder.setCookieRecorderMode(useCookieRecordings);

        if (localBuild) {
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
            y: 105,
            text: 'clue goes here',
            style: {
                font: '24px Verdana',
            }
        });
        clueText.setDepth(99);
        clueText.setVisible(false);
        hintObjectiveText = clueMap.get('searchAndSolve')!;
        clueText.text = hintObjectiveText;
        if (debugHints) {
            clueText.setVisible(false)
        }

        timeText = this.make.text({
            x: 10,
            y: 205,
            text: 'Only 10 minutes remain',
            style: {
                font: '24px Verdana',
            }
        });

        timeText.setDepth(99);
        timeText.setVisible(false);

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
        if (mainReplayRequest == "replayRequested") { // trap if key pressed and not reloaded yet
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

        if (pasteResultText.text == "init") {
            //console.log("UI Recorder mode: " + recorder.getMode());
            if (recorder.getMode() == "idleNowReplayOnReload")
                recorder.setMode("replay")

            let replaying = false;
            if (recorder.getMode() == "replay" || recorder.getMode() == "replayOnce")
                replaying = true;
            pasteResultText.setVisible(false);
            if (debugInput && !replaying) {
                pasteResultText.text = "status";
                pasteBox.text = "pasteit";
            } else {
                pasteResultText.text = "off";
                pasteBox.setVisible(false);
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
                        //console.log(`REPLAYING ${splitAction[0]} ${splitAction[3]}`)
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

        const elapsed = recorder.getElapsedMinutes();
        if (elapsed != oldElapsedMinutes && !timeFail) {
            oldElapsedMinutes = elapsed;
            const minutesRemaining = maxTime - elapsed;
            if (minutesRemaining < 6) {
                timeText.setVisible(true);
                if (minutesRemaining > 1) {
                    timeText.text = "Only " + minutesRemaining + " minutes remain";
                } else {
                    if (minutesRemaining < 1 && !timeFail) {
                        console.log("TIME FAIL")
                        timeFail = true;
                        timeText.setVisible(false);

                        // Settings is the only modal as we have available so reuse it
                        this.hideUILayer();
                        this.scene.sleep(activeSceneName);

                        if (settingsInit) {
                            settingsInit = false;
                            this.scene.launch("Settings")
                        } else {
                            this.scene.wake("Settings");
                        }

                    } else {
                        timeText.text = "Only ONE MINUTE minute remains";
                    }
                }
            }

        }

        ////////////// RECORDER PASTEBOX //////////////
        if (!mainHasStarted) {
            const mainStarted = this.scene.isActive("PlayGame");
            if (mainStarted) {
                if (debugInput)
                    pasteBox.setVisible(true);
                pasteResultText.setVisible(false);
                mainHasStarted = true;
                //console.log(`UI started, mode = ${ recorder.getMode() }`)
            }
        }
        if (pasteBox.text != "pasteit" && pasteBox.text != "init") {  // pastebox latch
            const getRec = pasteBox.text;
            pasteBox.text = "pasteit";

            console.log("lets fetch " + getRec)
            const theRecording = await recorder.fetchRecording(getRec);

            console.log("we fetched:")
            console.log(theRecording);
            pasteResultText.setVisible(true);
            if (theRecording == "fail") {
                pasteResultText.text = "ERROR"
            } else {
                pasteResultText.text = "replaying..."
                recorder.setRecordingFilename(getRec);
                recorder.setMode("replay")
                window.location.reload();
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
                if (debugShowReplayActionCount) {
                    console.log(`>${debugReplayActionCounter++} ${actions[0][0]}`)
                }
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

                        // TODO Need to check unmapped objects
                        let object = recorder.getMaskSprite(targetObject);
                        //console.log("recorder replay object " + object)

                        if (object?.scene === this) {
                            //console.log("simulating UI " + targetObject)
                            object?.emit('pointerdown')
                        } else {
                            //console.log(`simulate sprite ${ targetObject } on scene ${ targetScene }`)
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
                        recorder.setMode("idleNowReplayOnReload");
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

            if (!hintIconsHidden)
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

            //console.log(`VIEW ${ viewIt.objectView } alt ${ viewIt.objectViewAlt }`)
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
            questionSpinning.setPaused(false);

            if (!questionSpinning.isPlaying()) {
                hintQuestionGreen.setVisible(true);
            }
        }

        if (needNewClue) {
            //console.log("need new clue")
            const oldClue = clueText.text;

            let foundNext = false;
            clueObjective.forEach((objectiveCompleted, idx) => {
                //console.log(`${ idx } is ${ objectiveCompleted }`)
                if (!objectiveCompleted && !foundNext) {
                    nextObjective = idx;
                    foundNext = true;
                }
            });
            //console.log("next objective is " + nextObjective);

            hintObjectiveText = clueMap.get(nextObjective)!;
            clueText.text = hintObjectiveText;

            if (oldClue != clueText.text) {
                if (uiObjectView) {
                    stateHintQuestionGreen = true;
                } else {
                    hintQuestionGreen.setVisible(true);
                }
            }
            needNewClue = false;
        }

        // fancy fading volume controls
        if (stepVolumeUp > 0 && this.time.now > stepVolumeUpTime) {
            stepVolumeUp--;
            stepVolumeUpTime = this.time.now + 150;
            stepVolumeLevel += .1;
            // @ts-ignore
            music.setVolume(stepVolumeLevel);
        }
        if (stepVolumeDown > 0 && this.time.now > stepVolumeUpTime) {
            stepVolumeDown--;
            stepVolumeUpTime = this.time.now + 50;
            stepVolumeLevel -= .1;
            // @ts-ignore
            music.setVolume(stepVolumeLevel);
            if (stepVolumeLevel < .1)
                // @ts-ignore
                music.pause();
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

    getSpoilers() {
        let theSpoilers = "";
        //console.log("spoiler! " + nextObjective);
        for (let key of spoilerMap.keys()) {
            //clueObjective.set(key, false);
            if (key.split('-')[0] == nextObjective) {
                //console.log("GET " + spoilerMap.get(key));
                theSpoilers += spoilerMap.get(key) + ';';
            }
        }
        return theSpoilers;
    }

    closeObjectUI() {
        //console.log("UI back to " + activeSceneName);
        uiObjectView = false;

        objectImage.destroy();
        this.restoreHintIcons();

        slots.combining = ""; // cancel any combine action
        eyeButton.setTexture('atlas2', 'eyeOff.png');
        eyeButton.setName("eyeButton");

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
        hintIconsHidden = true;
        stateHintQuestionGreen = hintQuestionGreen.visible;
        questionSpinning.setVisible(false);
        hintQuestion.setVisible(false);
        hintQuestionGreen.setVisible(false);
        hintButton.setVisible(false);
    }

    restoreHintIcons() {
        hintIconsHidden = false;
        //questionSpinning.setVisible(stateQuestionSpinning);
        if (hintBotInit)
            questionSpinning.setVisible(true);
        //console.log(`RESTORE hintQuestionGreen ${stateHintQuestionGreen}`)
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
                mainReplayRequest = "replayRequested"
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


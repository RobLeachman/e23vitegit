/****************
 * An escape room coded in Phaser.
 * 
 * - Recorder
 * - Rework combination logic
 * - Rework hints
 * -- show question mark when stuck
 * - Changing cursor
 * - Sound
 * - Fireworks on winner screen
 * - Fade scene in
 * 
 * Scratch-off ticket https://blog.ourcade.co/posts/2020/phaser-3-object-reveal-scratch-off-alpha-mask/
 */

import 'phaser';

import Slots from "./objects/slots"
import Recorder from "./objects/recorder"

let debugUpdateOnce = false;

var viewWall = 0;

const walls = new Array();
const icons = new Array();
const obj = new Array();
const altObj = new Array();
const tableView = new Array();
const closeView = new Array();
var currentWall = -1;
var previousWall = -1;

var invBar: Phaser.GameObjects.Sprite;
var leftButton: Phaser.GameObjects.Sprite;
var rightButton: Phaser.GameObjects.Sprite;
var backButton: Phaser.GameObjects.Sprite;
var plusButton: Phaser.GameObjects.Sprite;
var plusModeButton: Phaser.GameObjects.Sprite;
var failed: Phaser.GameObjects.Sprite;

var fullClue: Phaser.GameObjects.Image;
var combineClue: Phaser.GameObjects.Image;

var takeItemMask: Phaser.GameObjects.Sprite;
var viewTableMask: Phaser.GameObjects.Sprite;
var viewDoorMask: Phaser.GameObjects.Sprite;
var objectMask: Phaser.GameObjects.Sprite;
var keyMask: Phaser.GameObjects.Sprite;
var hintMask: Phaser.GameObjects.Sprite;

var tableState = 0;
var updateWall = false;
var flipIt = false;
var foundHalfKey = false; // enable the key mask when key part is visible
var snagged = false;
var haveHalfKey = false; // don't show key part on plate back if already taken
var doorUnlocked = false;
var egress = false;
var didBonus = false;
var hasSearched = false;
var hasCombined = false;

var slots: Slots;

var showXtime = -1;

var recorder: Recorder;
var viewportText: any;                                     //??
var viewportPointer: Phaser.GameObjects.Sprite;
var viewportPointerClick: Phaser.GameObjects.Sprite;
var pointer: Phaser.Input.Pointer;

let lastKeyDebouncer = ""; //
let recorderMode = "?";
let recording = "";
let actions: [string, number, number, number][] = [["BOJ", 0, 0, 0]];
let nextActionTime = 0;
let recordingEndedFadeClicks = 0;
let debugging = false;

var content = [
    "The sky above the port was the color of television, tuned to a dead channel.",
    "'It's not like I'm using,' Case heard someone say, as he shouldered his way ",
    "through the crowd around the door of the Chat. 'It's like my body's developed ",
    "this massive drug deficiency.' It was a Sprawl voice and a Sprawl joke."
];
/*
var contentString =
    "The sky above the port was the color of television, tuned to a dead channel." +
    "'It's not like I'm using,' Case heard someone say, as he shouldered his way " +
    "through the crowd around the door of the Chat. 'It's like my body's developed " +
    "this massive drug deficiency.' It was a Sprawl voice and a Sprawl joke."
*/



class PlayGame extends Phaser.Scene {
    update() {

        this.input.keyboard.on('keydown', this.handleKey);
        //console.log("rightright");
        if (this.input.activePointer.rightButtonDown()) {
            this.showRecording();
        }

        if (debugUpdateOnce) {
            debugUpdateOnce = false;
            //var txt = this.add.rexCanvasInput(50, 150, 100, 200, config);
            this.showRecording();
            return;

        }

        // Can't combine the plate and donut if door is locked
        if (slots.combining.split(':')[3] == "objDonutPlated" && !doorUnlocked) {
            slots.combining = "bad combine:"
        }
        if (slots.combining.split(':')[0] == "bad combine") {
            hasCombined = true;
            combineClue.setDepth(-1);
            //console.log("BAD COMBINE")
            slots.combining = "";
            plusModeButton.setVisible(false);
            plusButton.setVisible(true); plusButton.setDepth(110); plusButton.setInteractive();

            failed.setDepth(200);
            showXtime = this.time.now;
        }
        if (slots.combining.split(':')[0] == "good combine") {
            hasCombined = true;
            combineClue.setDepth(-1);
            //console.log("clear out " + slots.combining.split(':')[1])
            slots.clearItem(this, slots.combining.split(':')[1]);
            const slotRepl = slots.selectItem(slots.combining.split(':')[2]); //select the slot of the combine click
            //console.log("replacing " + slotRepl)
            //slots.replaceItem(this, slots.combining.split(':')[2]);
            slots.clearItem(this, slots.combining.split(':')[2]);
            if (slots.combining.split(':')[3] == "objDonutPlated") {
                slots.addIcon(this, icons[5].toString(), obj[5], altObj[5], slotRepl);
                slots.selectItem(slots.combining.split(':')[3]);
                didBonus = true;
                // switch view to new goodly combined object
                this.add.image(0, 0, obj[5]).setOrigin(0, 0);
            } else if (slots.combining.split(':')[3] == "objKeyWhole") {
                slots.addIcon(this, icons[4].toString(), obj[4], altObj[4], slotRepl);
                slots.selectItem(slots.combining.split(':')[3]);
                this.add.image(0, 0, obj[4]).setOrigin(0, 0);
            } else {
                slots.addIcon(this, icons[6].toString(), obj[6], altObj[6], slotRepl); // it is a bug
            }
            slots.combining = "";
            plusModeButton.setVisible(false);
            plusButton.setVisible(true); plusButton.setDepth(110); plusButton.setInteractive();
        }

        if (debugging || recorderMode == "record" || recorderMode == "replay" || recorderMode == "replayOnce") {
            let displayDebugMode = "RECORDING";
            if (recorderMode == "replay" || recorderMode == "replayOnce")
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
        if (recorderMode == "record") {
            recorder.fixPointer(this.input.activePointer)
            recorder.checkPointer(this);
        } else if (recorderMode == "replay" || recorderMode == "replayOnce") {
            //console.log("action " + nextActionTime + "now " + this.time.now)
            //console.log("replay " + actions[0]);
            //console.log(" at " + actions[0][3]);
            if (this.time.now >= nextActionTime) {
                let replayAction = actions[0][0];
                if (replayAction == "mouseclick") {
                    viewportPointer.setX(actions[0][1]);
                    viewportPointer.setY(actions[0][2]);
                    recorder.showClick(this, actions[0][1], actions[0][2]);
                } else if (replayAction == "mousemove") {
                    viewportPointer.setX(actions[0][1]);
                    viewportPointer.setY(actions[0][2]);
                } else {
                    let target = actions[0][0];
                    let targetType = target.split('=')[0];
                    let targetObject = target.split('=')[1];
                    if (targetType == "object") {
                        //console.log("do object " + targetObject);
                        //elsewhere
                        switch (targetObject) {
                            case "right": {
                                rightButton.emit('pointerdown');
                                break;
                            }
                            case "left": {
                                leftButton.emit('pointerdown');
                                break;
                            }
                            case "down": {
                                backButton.emit('pointerdown');
                                break;
                            }
                            case "tableMask": {
                                viewTableMask.emit('pointerdown');
                                break;
                            }
                            case "takeMask": {
                                takeItemMask.emit('pointerdown');
                                break;
                            }
                            case "objectMask": {
                                objectMask.emit('pointerdown');
                                break;
                            }
                            case "keyMask": {
                                keyMask.emit('pointerdown');
                                break;
                            }
                            case "doorMask": {
                                viewDoorMask.emit('pointerdown');
                                break;
                            }
                            case "hintMask": {
                                hintMask.emit('pointerdown');
                                break;
                            }
                            case "plusButton": {
                                plusButton.emit('pointerdown');
                                break;
                            }
                            case "plusModeButton": {
                                plusModeButton.emit('pointerdown');
                                break;
                            }
                            default: {
                                throw new Error('Unmapped replay action ' + targetObject);
                            }
                        }

                    } else if (targetType == "icon") {
                        //console.log("do icon " + targetObject);
                        slots.recordedClickIt(targetObject);   // here's how we click an icon!
                    }
                }

                actions = actions.slice(1);
                //console.log(actions.length);
                if (actions.length == 0) {
                    console.log("recorder EOJ")
                    if (recorderMode == "replayOnce") {
                        console.log("did once")
                        recorder.setMode("idle");
                    }
                    recorderMode = "idle";

                    viewportText.setDepth(-1);
                    recordingEndedFadeClicks = 20;
                } else {
                    nextActionTime += actions[0][3];
                }
            }
            recorder.fadeClick(this);
            //console.log("REPLAY STUFF");
            //console.log(actions);
        }
        //console.log("MODE IS " + recorderMode)
        if (recordingEndedFadeClicks-- > 0) {
            recorder.fadeClick(this);
            viewportPointer.setX(1000);
        }
        if (slots.fakeClicks == 3) {
            console.log("BRING THE ROACH");
            //slots.clearItem(this, "fake");
            slots.fakeClicks = 4;
            slots.addIcon(this, icons[6].toString(), obj[6], altObj[6], 5); // roach
        }
        if (slots.fakeClicks == 10) {
            recorder.setMode("replayOnce");
            slots.fakeClicks = -1;
            console.log("roach replay " + slots.getSelected());
            if (slots.getSelected() == "objRoach")
                recorder.setReplaySpeed("fast")
            else
                recorder.setReplaySpeed("perfect")
            window.location.reload();            
        }

        if (showXtime > 0) {
            if ((this.time.now - showXtime) > 500) {
                showXtime = -1;
                failed.setDepth(-1);
            }
        }

        // VIEW INVENTORY OR ROOM
        if (slots.inventoryView) {

            slots.currentMode = "item"; // so slots object knows what is happening
            if (viewWall < 5)
                previousWall = viewWall;
            // only show key when looking at back of plate
            keyMask.setVisible(false);
            if (haveHalfKey && slots.inventoryViewAlt == "altobjPlateKey") {
                slots.inventoryViewAlt = "altobjPlateEmpty";
            }
            if (snagged) {
                currentWall = 5; flipIt = true;
                snagged = false;
                slots.inventoryViewAlt = "altobjPlateEmpty";
            }
            if (currentWall == 5 && flipIt) {
                hasSearched = true;
                this.add.image(0, 0, slots.inventoryViewAlt).setOrigin(0, 0);
                viewWall = 6; currentWall = 6;
                // only make the piece available if seen...
                if (foundHalfKey && !haveHalfKey) {
                    keyMask.setVisible(true); keyMask.setDepth(200); keyMask.setInteractive({ cursor: 'pointer' });
                }
            } else {
                this.add.image(0, 0, slots.inventoryViewObj).setOrigin(0, 0);
                viewWall = 5; currentWall = 5;
                //console.log("IDLE IT? OR REPLAY");
                if (slots.inventoryViewObj == "objRoach") {
                    if (recorderMode == "record") {
                        recorder.setMode("idle")
                        recorderMode = "idle";
                        this.showRecording()

                        //recorder.setMode("replay");
                        //window.location.reload();
                    } else {
                        // TODO write proper exit function, called twice and did it here wrongly
                        recorder.setMode("idle")
                        recorderMode = "idle";
                        viewportText.setDepth(-1);
                        recordingEndedFadeClicks = 20;
                    }
                }
            }
            flipIt = false;

            invBar.setDepth(100);
            slots.inventoryView = false;

            leftButton.setVisible(false);
            rightButton.setVisible(false);
            backButton.setVisible(true); backButton.setDepth(100); backButton.setInteractive({ cursor: 'pointer' });
            console.log(slots.inventoryViewObj)
            plusButton.setVisible(true); plusButton.setDepth(110); plusButton.setInteractive();

            if (!hasSearched) {
                fullClue.setDepth(10);
                combineClue.setDepth(-1)
            } else {
                if (!hasCombined) {
                    combineClue.setDepth(10)
                    fullClue.setDepth(-1)
                }
            };
            if (slots.inventoryViewObj == "objRoach") {
                fullClue.setDepth(-1);
                combineClue.setDepth(-1)
            }


            takeItemMask.setVisible(false);
            viewTableMask.setVisible(false);
            viewDoorMask.setVisible(false);

            objectMask.setVisible(true);
            objectMask.setDepth(100);
            objectMask.setInteractive({ cursor: 'pointer' });
            //objectMask.input.cursor = 'url(assets/input/cursors/pen.cur), pointer';

        } else if ((viewWall != currentWall || updateWall)) {
            fullClue.setDepth(-1);
            combineClue.setDepth(-1)
            if (egress) {
                this.add.image(0, 0, walls[8]).setOrigin(0, 0);
                leftButton.setVisible(false);
                rightButton.setVisible(false);
                viewportPointer.setDepth(-1);
                viewportPointerClick.setDepth(-1);
                let fadeClicks = 10;
                while (fadeClicks-- > 0) {
                    recorder.fadeClick(this);
                }

                currentWall = viewWall;
                updateWall = false;
                var sentence = "Nice job slugger!\nTry it again for the bonus?\nJust reload the page";
                if (didBonus) {
                    this.add.image(360, 800, "winnerDonut")
                    sentence = "You did it :)\n\nThanks for testing!";
                } else {
                    failed.setVisible(true);
                    failed.setDepth(400);
                    failed.setX(360); failed.setY(800);
                }

                const style = 'margin: auto; background-color: black; color:white; width: 520px; height: 100px; font: 40px Arial';
                this.add.dom(350, 1100, 'div', style, sentence);

                invBar.setDepth(0);
                slots.clearAll(this);
                takeItemMask.setVisible(false);
                viewTableMask.setVisible(false);
                viewDoorMask.setVisible(false);

                updateWall = false;
                viewWall = currentWall;

                console.log("egress EOJ " + recorder.getMode())
                if (recorderMode == "replayOnce") {
                    recorder.setMode("idle")
                    recorderMode = "idle";
                }
                viewportText.setDepth(-1);

                return;
            }

            slots.currentMode = "room";
            if (viewWall > -1) { //?
                if (doorUnlocked && viewWall == 0) {
                    this.add.image(0, 0, walls[7]).setOrigin(0, 0);
                } else {
                    this.add.image(0, 0, walls[viewWall]).setOrigin(0, 0);
                }
            }

            // need to build out hint system
            if (viewWall == 9)
                previousWall = 2;

            slots.displaySlots(); // TODO: is this really required every time the wall changes?
            invBar.setDepth(100); // TODO: surely no.
            currentWall = viewWall;
            updateWall = false;

            if (viewWall == 0)
                this.add.sprite(540, 650, tableView[tableState]).setOrigin(0, 0);
            if (viewWall == 4)
                this.add.sprite(176, 532, closeView[tableState]).setOrigin(0, 0);

            if (viewWall > 3) { // viewing table not room wall, or inventory view
                leftButton.setVisible(false);
                rightButton.setVisible(false);
                backButton.setVisible(true); backButton.setDepth(100); backButton.setInteractive({ cursor: 'pointer' });
            } else {
                leftButton.setVisible(true); leftButton.setDepth(100); leftButton.setInteractive({ cursor: 'pointer' });
                rightButton.setVisible(true); rightButton.setDepth(100); rightButton.setInteractive({ cursor: 'pointer' });
                backButton.setVisible(false);
            }

            plusButton.setVisible(false);
            plusModeButton.setVisible(false);

            if (viewWall == 0) {
                viewTableMask.setVisible(true); viewTableMask.setDepth(100); viewTableMask.setInteractive({ cursor: 'pointer' });
                viewDoorMask.setVisible(true); viewDoorMask.setDepth(100); viewDoorMask.setInteractive({ cursor: 'pointer' });

                //viewDoorMask.input.cursor = 'url(assets/input/cursors/pen.cur), pointer';
                viewDoorMask.input.cursor = 'pointer';
            } else {
                viewTableMask.setVisible(false);
                viewDoorMask.setVisible(false);
            }

            if (viewWall == 2) {
                hintMask.setVisible(true); hintMask.setDepth(100); hintMask.setInteractive({ cursor: 'pointer' });
            } else {
                hintMask.setVisible(false);
            }

            if (viewWall == 4) { // the table
                //takeItemMask.setVisible(true); takeItemMask.setDepth(100); takeItemMask.setInteractive();
                //takeItemMask.input.cursor = 'url(assets/input/cursors/pen.cur), pointer';
                takeItemMask.setVisible(true); takeItemMask.setDepth(100); takeItemMask.setInteractive({ cursor: 'pointer' });
            } else {
                takeItemMask.setVisible(false);
            }
            objectMask.setVisible(false);
        }
    }

    constructor() {
        super("PlayGame");
    }

    create() {
        /*        
                var text = this.add.text(10, 10, 'Please login to play', { color: 'white', fontFamily: 'Arial', fontSize: '32px ' });
        
                var element = this.add.dom(400, 600).createFromCache('nameform');
        
        
                element.addListener('click');
        
                element.on('click', function (event:MouseEvent) {
        
                    if (event.target.name === 'loginButton')
                    {
                        var inputUsername = element.getChildByName('username');
            
                        //  Have they entered anything?
                        if (inputUsername.value !== '' && inputPassword.value !== '')
        
                        //console.log("FORM CLICK");
                        //console.log(element)
                        console.log("USER")
                        
                        var user = element.getChildByName('username');
                        console.dir(user.value);
                });
        */

        /*
        element.addListener('click');

        element.on('click', function (event) {
            if (event.target.name === 'loginButton')
                console.log("FOO");
        }
        */

        /*
                console.log("FORM");
                console.log(element.getChildByName('loginButton'))
                
                var user = element.getChildByName('username');
                user.addEventListener("change", function(event) {
                    const text = user.value;
                    
                  });
        */


        //element.setPerspective(800);
        /*        
                element.on('click', () => {
                    console.log("submit")
        
                    var inputUsername = element.getChildByName('username');
                    var inputPassword = element.getChildByName('password');
        
                    //  Have they entered anything?
                    console.log("INPUT " + inputUsername)
        
                });
        */



        let scene = this;
        // @ts-ignore   not using pointer but don't want to break right now while trying for build
        this.input.on('gameobjectdown', function (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
            recorder.recordObjectDown((gameObject as Phaser.GameObjects.Sprite).texture.key, scene);
        });

        fullClue = this.add.image(0, 0, 'interfaceClue').setOrigin(0, 0);
        combineClue = this.add.image(0, 0, 'interfaceCombine').setOrigin(0, 0);

        /*
                // So weird and frustrating. Uncomment this, observe the fillstyles go in backward
        
                const chatIntroText = this.add.text(100, 100, "Add the text you want to use for testing purposes");
                chatIntroText.setFixedSize(200, 0);
                chatIntroText.setWordWrapWidth(chatIntroText.width);
        
                const chatTextMaskGraphic = this.add.graphics().setPosition(chatIntroText.x, chatIntroText.y);
                chatTextMaskGraphic.fillRect(0, 0, chatIntroText.displayWidth, 400);
                chatTextMaskGraphic.fillStyle(0x00008f) // IlTimido text is BLUE
                chatIntroText.setMask(chatTextMaskGraphic.createGeometryMask());
                chatTextMaskGraphic.setDepth(8000)
        */
        // My test code:
        /*        
                var text = this.add.text(160, 460, content,
                    { fontFamily: 'Arial', color: '#00ff00', wordWrap: { width: 310 } }).setOrigin(0);
        
                var graphics = this.add.graphics({
                    x: 0,
                    y: 0
                });
                graphics.fillRect(150, 450, 400, 250);
                graphics.fillStyle(0x000000) // My test text is RED
                graphics.setDepth(3000)
                var mask = new Phaser.Display.Masks.GeometryMask(this, graphics);
                var text = this.add.text(160, 460, content,
                    { fontFamily: 'Arial', color: '#00ff00', wordWrap: { width: 310 } }).setOrigin(0);
                text.setMask(mask);
                text.setDepth(5000);
        */

        
        this.add.image(0, 0, 'myViewport').setOrigin(0, 0);
        viewportPointer = this.add.sprite(1000, 0, 'clckrLoc').setOrigin(0, 0);
        viewportPointerClick = this.add.sprite(1000, 0, 'clckrClk');
        recorder = new Recorder(this.input.activePointer, viewportPointer, viewportPointerClick);
        console.log("Recorder mode=" + recorder.getMode())
        viewportPointer.setDepth(3001);
        viewportPointerClick.setDepth(3001);
        pointer = this.input.activePointer;

        slots = new Slots(this, "iconEmpty", "iconSelected", "iconSelectedSecond", recorder);
        slots.displaySlots();
        slots.currentMode = "room";

        invBar = this.add.sprite(0, 1040, 'inventory').setOrigin(0, 0);
        leftButton = this.add.sprite(80, 950, 'left');
        rightButton = this.add.sprite(640, 950, 'right');
        backButton = this.add.sprite(300, 875, 'down').setOrigin(0, 0);
        plusButton = this.add.sprite(80, 950, 'plusButton');
        plusModeButton = this.add.sprite(80, 950, 'plusModeButton');
        failed = this.add.sprite(640, 950, 'fail');

        rightButton.on('pointerdown', () => {
            viewWall++;
            if (viewWall > 3)
                viewWall = 0;
        });
        leftButton.on('pointerdown', () => {
            viewWall--;
            if (viewWall < 0)
                viewWall = 3;
        });
        backButton.on('pointerdown', () => {
            //console.log("back to " + previousWall)
            if (viewWall == 4)
                viewWall = 0;
            else
                viewWall = previousWall;
            // after recorder fix this!                
            //            slots.clearSecondSelect();
            slots.currentMode = "room";
        });

        plusModeButton.on('pointerdown', () => {
            //console.log("combine mode cancelled");
            slots.combining = ""; // so slots object knows what is happening
            plusModeButton.setVisible(false);
            plusButton.setVisible(true); plusButton.setDepth(110); plusButton.setInteractive();
        });


        plusButton.on('pointerdown', () => {
            plusButton.setVisible(false);
            plusModeButton.setVisible(true); plusModeButton.setDepth(110); plusModeButton.setInteractive();
            slots.combining = "trying"; // so slots object knows what is happening
        });


        hintMask = this.add.sprite(110, 446, 'hintMask').setOrigin(0, 0);
        hintMask.on('pointerdown', () => {
            viewWall = 9;
        });

        // Add item to inventory list when picked up. In this test it's easy, just 3 stacked items.
        // Add it and then remove from view and flag for an update.
        takeItemMask = this.add.sprite(155, 530, 'takeMask').setOrigin(0, 0);
        takeItemMask.on('pointerdown', () => {
            if (tableState < 3) {
                slots.addIcon(this, icons[tableState].toString(), obj[tableState], altObj[tableState]); // TODO: get name from sprite
                this.add.sprite(190, 560, closeView[tableState]).setOrigin(0, 0);
                tableState++;

                updateWall = true;
            }
        });

        viewTableMask = this.add.sprite(440, 615, 'tableMask').setOrigin(0, 0);
        viewTableMask.on('pointerdown', () => {
            //console.log("view table!")
            if (viewWall == 0)
                viewWall = 4;

        });

        viewDoorMask = this.add.sprite(274, 398, 'doorMask').setOrigin(0, 0);

        viewDoorMask.on('pointerdown', () => {
            if (doorUnlocked) {
                egress = true; // TODO doorUnlocked needs multiple states... then drop this flag
                updateWall = true;
            } else if (slots.getSelected() == "objKeyWhole") {
                doorUnlocked = true;
                updateWall = true;
                //slots.clearItem(this, "objKeyWhole");
                slots.clearItem(this, "objKeyWhole");
                slots.clearSelect(); // TODO why not do this automatically on clearItem()??
            }
        });

        objectMask = this.add.sprite(87, 423, 'objectMask').setOrigin(0, 0);
        // Flip object over. Need to adjust for key presence if it's the plate. Awkward!
        objectMask.on('pointerdown', () => {
            flipIt = true;
            foundHalfKey = false;

            if (slots.inventoryViewObj == "objPlate" && viewWall == 5) {
                foundHalfKey = true;
            }
            if (slots.inventoryViewObj == "objRoach" && viewWall == 5) {
                if (recorderMode == "replay") {
                    recorder.setMode("idle")
                    recorderMode = "idle";
                } else {
                    //console.log("RECORD IT! mode was " + recorderMode);
                    recorder.setMode("record")
                    window.location.reload();
                }
            }

            slots.inventoryView = true;
        });

        keyMask = this.add.sprite(315, 540, 'keyMask').setOrigin(0, 0);
        keyMask.on('pointerdown', () => {
            slots.inventoryView = true;
            flipIt = false;
            snagged = true;
            haveHalfKey = true;

            slots.addIcon(this, icons[3].toString(), obj[3], altObj[3]); // TODO: get name from sprite!!
        });

        slots.addIcon(this, icons[7].toString(), "fake", "fake", 4); // TODO: get name from sprite?!
        //slots.addIcon(this, icons[6].toString(), obj[6], altObj[6], 5); // TODO: get name from sprite?!

        // Debug recorder debugger
        viewportText = this.add.text(10, 10, '');
        viewportText.setDepth(3001); // TODO: rationalize the crazy depths!

        recorderMode = recorder.getMode();
        //console.log("Recordermode: " + recorderMode);
        if (recorderMode == "replay" || recorderMode == "replayOnce") {
            recording = recorder.getRecording();
            if (recorder.getReplaySpeed() == "fast") {
                recording = recorder.makeFast(recording);
            }
            console.log("REPLAY " + recorderMode);

            const actionString = recording.split(":");
            actionString.forEach((action) => {
                //console.log(action.length);
                if (action.length > 0) {
                    let splitAction = action.split(',');
                    actions.push([splitAction[0], parseInt(splitAction[1], 10), parseInt(splitAction[2], 10), parseInt(splitAction[3], 10)]);
                }
            });
            actions = actions.slice(1); // drop the first element, just used to instantiate the array
            nextActionTime = actions[0][3];
            if (recorder.getReplaySpeed() == "perfect")
                console.log("playperfect-mode: first action at " + nextActionTime);
            else
                console.log("FAST");
            //console.log(actions);
        }

        // What is typescript type for this?!
        /*
                style = {
                    'margin': 'auto',
                    'background-color': '#000',
                    'width': '520px',
                    'height': '100px',
                    'font': '40px Arial',
                    'color': 'white'
                };
        */
        //this.input.setDefaultCursor('url(assets/input/cursors/blue.cur), auto');
        //this.input.setDefaultCursor(
        // "url(" + require("./assets/input/cursors/blue.cur") + "), auto");       
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
                console.log("fast replay")
                recorder.setReplaySpeed("fast")
                break;
            case "2":
                console.log("perfect replay")
                recorder.setReplaySpeed("perfect")
                break;
            case "`":
                //console.log("play recording");
                recorder.setMode("replay")
                window.location.reload();
                break;
            case "Escape":
                console.log("quit recorder");
                recorder.setMode("idle")
                recorderMode = "idle";
                viewportText.setDepth(-1);
                //window.location.reload();
                break;
        }
    }

    showRecording() {
        recorder.setMode("idle")
        recorderMode = "idle";
        viewportText.setDepth(-1);
        viewportPointer.setDepth(-1);
        viewportPointerClick.setDepth(-1);


        let style = 'background-color: #000000; color:white; width: 570px; height: 150px; font: 8px Monaco; font-family: "Lucida Console", "Courier New", monospace;';
        this.add.dom(300, 250, 'div', style, recorder.getFormattedRecording(110));
        //style = 'background-color: #000000; color:yellow; width: 570px; height: 90px; font: 20px Monaco; font-family: "Lucida Console", "Courier New", monospace;';
        //this.add.dom(300, 50, 'div', style, "Please send this to Quazar. Copy and paste into email or whatevs... thank you!\n\ncallmerob@gmail.com");

        var text = this.add.text(160, 460, content,
            { fontFamily: 'Arial', color: '#00ff00', wordWrap: { width: 310 } }).setOrigin(0);

        const beg = "Please share this with Quazar. Copy and paste\nto email or whatevs... Thank you!\n  escape@bitblaster.com"
        text = this.add.text(32, 22, beg, { fontSize: '25px', fontFamily: 'Lucida Console', color: "#00ff00" });
        text.setDepth(9000); // use bringToTop if in a container

        /*
                var graphics = this.add.graphics().setPosition(20, 0);
                
                graphics.fillRect(80, 300, 600, 250);
                graphics.fillStyle(0xFF0000) // My test text is RED
                graphics.setDepth(3000)
                var mask = new Phaser.Display.Masks.GeometryMask(this, graphics);
                var text = this.add.text(150, 460, beg,
                    { fontFamily: 'Lucida Console', color: '#00ff00', fontSize: '25px', wordWrap: { width: 700 } }).setOrigin(0,0);
                text.setMask(mask);
                text.setDepth(5000); 
        */

        var black = this.add.graphics({
            x: 0,
            y: 0
        });
        black.fillStyle(0x000000);
        black.fillRect(0, 0, 720, 1280);
        black.setDepth(3000);

        invBar.setDepth(0);
        slots.clearAll(this);
    }

    // https://codereview.stackexchange.com/questions/171832/text-wrapping-function-in-javascript
    formatTextWrap(text: string, maxLineLength: number) {
        const words = text.replace(/[\r\n]+/g, ' ').split(' ');
        let lineLength = 0;

        // use functional reduce, instead of for loop 
        return words.reduce((result: string, word: string) => {
            if (lineLength + word.length >= maxLineLength) {
                lineLength = word.length;
                return result + `\n${word}`; // don't add spaces upfront
            } else {
                lineLength += word.length + (result ? 1 : 0);
                return result ? result + ` ${word}` : `${word}`; // add space only when needed
            }
        }, '');
    }


    preload() {
        //this.load.plugin('rexcanvasinputplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexcanvasinputplugin.min.js', true);
        this.load.html('nameform', 'assets/text/example_loginform.html');



        this.load.image('myViewport', 'assets/backgrounds/viewport.png');
        this.load.image('clckrLoc', 'assets/sprites/pointer.png');
        this.load.image('clckrClk', 'assets/sprites/pointerClicked.png');

        this.load.image('wall1', 'assets/backgrounds/invroom - room - empty.png');
        this.load.image('wall2', 'assets/backgrounds/invroom - room - west.png');
        this.load.image('wall3', 'assets/backgrounds/invroom - room - south.png');
        this.load.image('wall4', 'assets/backgrounds/invroom - room - east.png');
        this.load.image('wallUnlocked', 'assets/backgrounds/invroom - room - unlocked.png');
        this.load.image('wallWinner', 'assets/backgrounds/invroom - room - winner.png');
        this.load.image('wallHint', 'assets/backgrounds/invroom - help1 - background.png');

        walls[0] = "wall1";
        walls[1] = "wall2";
        walls[2] = "wall3";
        walls[3] = "wall4";
        walls[4] = "table";
        walls[5] = "(item view)";
        walls[6] = "(item view alt)";
        walls[7] = "wallUnlocked";
        walls[8] = "wallWinner";
        walls[9] = "wallHint";

        this.load.image('table', 'assets/backgrounds/invroom - table - empty.png');

        this.load.image('right', 'assets/sprites/arrowRight.png');
        this.load.image('left', 'assets/sprites/arrowLeft.png');
        this.load.image('down', 'assets/sprites/arrowDown.png');
        this.load.image('plusButton', 'assets/sprites/plus - unselected.png');
        this.load.image('plusModeButton', 'assets/sprites/plus - selected.png');
        this.load.image('fail', 'assets/sprites/fail.png');
        this.load.image('winnerDonut', 'assets/sprites/winner donutPlated.png');

        this.load.image('inventory', 'assets/sprites/inventory cells.png');

        this.load.image('iconEmpty', 'assets/sprites/icon - empty.png');
        this.load.image('iconSelected', 'assets/sprites/icon - selected.png');
        this.load.image('iconSelectedSecond', 'assets/sprites/icon - selectedSecond.png');

        this.load.image('iconDonut', 'assets/sprites/icon - donut.png');
        this.load.image('iconPlate', 'assets/sprites/icon - plate.png');
        this.load.image('iconKeyA', 'assets/sprites/icon - keyA.png');
        this.load.image('iconKeyB', 'assets/sprites/icon - keyB.png');
        this.load.image('iconKeyWhole', 'assets/sprites/icon - keyWhole.png');
        this.load.image('iconDonutPlated', 'assets/sprites/icon - donutPlated.png');
        this.load.image('iconRoach', 'assets/sprites/icon - roach.png');
        this.load.image('iconFake', 'assets/sprites/icon - empty.png');

        icons[0] = "iconDonut";
        icons[1] = "iconPlate";
        icons[2] = "iconKeyB";
        icons[3] = "iconKeyA";
        icons[4] = "iconKeyWhole";
        icons[5] = "iconDonutPlated";
        icons[6] = "iconRoach";
        icons[7] = "iconFake";

        this.load.image('objDonut', 'assets/backgrounds/invroom - obj - donut.png');
        this.load.image('objPlate', 'assets/backgrounds/invroom - obj - plate.png');
        this.load.image('objKeyA', 'assets/backgrounds/invroom - obj - keyA.png');
        this.load.image('objKeyB', 'assets/backgrounds/invroom - obj - keyB.png');
        this.load.image('objKeyWhole', 'assets/backgrounds/invroom - obj - keyWhole.png');
        this.load.image('objDonutPlated', 'assets/backgrounds/invroom - obj - donutPlated.png');
        this.load.image('objRoach', 'assets/backgrounds/invroom - obj - roach.png');

        obj[0] = "objDonut";
        obj[1] = "objPlate";
        obj[2] = "objKeyB";
        obj[3] = "objKeyA";
        obj[4] = "objKeyWhole";
        obj[5] = "objDonutPlated";
        obj[6] = "objRoach";

        this.load.image('altobjDonut', 'assets/backgrounds/invroom - altobj - donut.png');
        this.load.image('altobjPlateKey', 'assets/backgrounds/invroom - altobj - plate key.png');
        this.load.image('altobjKeyA', 'assets/backgrounds/invroom - altobj - keyA.png');
        this.load.image('altobjKeyB', 'assets/backgrounds/invroom - altobj - keyB.png');
        this.load.image('altobjKeyWhole', 'assets/backgrounds/invroom - altobj - keyWhole.png');
        this.load.image('altobjDonutPlated', 'assets/backgrounds/invroom - altobj - donutPlated.png');
        this.load.image('altobjRoach', 'assets/backgrounds/invroom - altobj - roach.png');

        this.load.image('altobjPlateEmpty', 'assets/backgrounds/invroom - altobj - plate empty.png');
        altObj[0] = "altobjDonut";
        altObj[1] = "altobjPlateKey";
        altObj[2] = "altobjKeyB";
        altObj[3] = "altobjKeyA";
        altObj[4] = "altobjKeyWhole";
        altObj[5] = "altobjDonutPlated";
        altObj[6] = "altobjRoach";

        this.load.image('interfaceClue', 'assets/backgrounds/invroom - interface.png');
        this.load.image('interfaceCombine', 'assets/backgrounds/invroom - interface - combine.png');

        this.load.image('tableDonut', 'assets/sprites/tableDonut.png');
        this.load.image('tablePlate', 'assets/sprites/tablePlate.png');
        this.load.image('tableKey', 'assets/sprites/tableKey.png');
        this.load.image('tableEmpty', 'assets/sprites/tableEmpty.png');
        tableView[0] = "tableDonut";
        tableView[1] = "tablePlate";
        tableView[2] = "tableKey";
        tableView[3] = "tableEmpty";

        this.load.image('closeDonut', 'assets/sprites/closeDonut.png');
        this.load.image('closePlate', 'assets/sprites/closePlate.png');
        this.load.image('closeKey', 'assets/sprites/closeKey.png');
        this.load.image('closeEmpty', 'assets/sprites/closeEmpty.png');
        closeView[0] = "closeDonut"
        closeView[1] = "closePlate"
        closeView[2] = "closeKey"
        closeView[3] = "closeEmpty"

        this.load.image('tableMask', 'assets/sprites/tableMask.png');
        this.load.image('takeMask', 'assets/sprites/takeMask.png');
        this.load.image('objectMask', 'assets/sprites/object-maskB.png');
        this.load.image('keyMask', 'assets/sprites/keyMask.png');
        this.load.image('doorMask', 'assets/sprites/doorMask.png');
        this.load.image('hintMask', 'assets/sprites/hintMask.png');

        //this.load.image('testplateShown', 'src/assets/sprites/closePlate.png'); 
        //this.load.image('testplateIcon', 'src/assets/sprites/icon - plate.png');
    }
}


let config = {
    type: Phaser.WEBGL,
    //type: Phaser.CANVAS,
    backgroundColor: '#222222',
    scale: {
        mode: Phaser.Scale.FIT,
        width: 720,
        height: 1280,
        parent: 'thegame',
    },
    dom: {
        createContainer: true
    },
    disableContextMenu: true, // ready for right-click if needed
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
    scene: PlayGame
};

new Phaser.Game(config);
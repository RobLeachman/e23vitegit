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
import Slots from "../objects/slots"
import Recorder from "../objects/recorder"

//import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import InputText from 'phaser3-rex-plugins/plugins/inputtext.js';

let debugInput = true;
let debugUpdateOnce = false;

var viewWall = 1;
var currentWall = -1;
var previousWall = -1;
var updateWall = false;

const walls = new Array();
const icons = new Array();
const obj = new Array();
const altObj = new Array();
const tableView = new Array();
const closeView = new Array();
const dictionary = new Map<string, Phaser.GameObjects.Sprite>();

var leftButton: Phaser.GameObjects.Sprite;
var rightButton: Phaser.GameObjects.Sprite;
var backButton: Phaser.GameObjects.Sprite;
var plusButton: Phaser.GameObjects.Sprite;
var plusModeButton: Phaser.GameObjects.Sprite;

var failed: Phaser.GameObjects.Sprite;

var fullClue: Phaser.GameObjects.Image;
var combineClue: Phaser.GameObjects.Image;

var takeMask: Phaser.GameObjects.Sprite;
var tableMask: Phaser.GameObjects.Sprite;
var doorMask: Phaser.GameObjects.Sprite;
var objectMask: Phaser.GameObjects.Sprite;
var keyMask: Phaser.GameObjects.Sprite;
var hintMask: Phaser.GameObjects.Sprite;
var battMask: Phaser.GameObjects.Sprite;
var zotMask: Phaser.GameObjects.Sprite;
var zotTableMask: Phaser.GameObjects.Sprite;

var tableState = 0;

var flipIt = false;
var foundHalfKey = false; // enable the key mask when key part is visible
var snagged = false;
var haveHalfKey = false; // don't show key part on plate back if already taken
var doorUnlocked = false;
var egress = false;
var didBonus = false;
var hasSearched = false;
var hasCombined = false;
var haveZot = false;
var haveBatt = false;
var zotTableInit = true;
var zotIsRunning = false;

var slots: Slots;
//var bootGameScene: Phaser.Scene;


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

let inputText: InputText;
let theText: InputText;

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



export class PlayGame extends Phaser.Scene {
    //rexUI: RexUIPlugin;  // Declare scene property 'rexUI' as RexUIPlugin type
    rexInputText: InputText; // Declare scene property 'rexInputText' as InputText type

    constructor() {
        super("PlayGame");
    }

    parseRecording(input: string) {
        let output = input;

        let re = /\_/g; output = output.replace(re, "");
        re = /\n/g; output = output.replace(re, "");
        //re = /\w/g; output = output.replace(re, "");

        console.log(output);

        let recInCheck = output.split('?')[0];
        console.log("cksum in " + recInCheck)

        // @ts-ignore
        // with luck will need version checking later
        let recInVersion = output.split('?')[2];
        let recIn = output.split('?')[1];
        console.log("REC IN " + recIn)
        if (recIn === undefined) {
            inputText.text = "ERROR";
            return;
        }
        re = /mousemove,/g; recIn = recIn.replace(re, "#");
        re = /#/g; recIn = recIn.replace(re, "mousemove,");
        re = /!/g; recIn = recIn.replace(re, "mouseclick,");
        re = /=/g; recIn = recIn.replace(re, "object=");
        re = /\-/g; recIn = recIn.replace(re, "icon=");

        console.log("PARSED")
        console.log(recIn);


        if (recInCheck == recorder.checksum(recIn)) {
            inputText.text = "success";
            recorder.saveCookies(output);
        } else {
            inputText.text = "error";
            console.log("cksum in   " + (recorder.checksum(recIn)))
            console.log("cksum calc " + recInCheck)
        }
    }

    update() {
        //console.log("main update")
        if (inputText.text == "init") {

            //console.log("BONUS TEST ZOTS")
            //slots.addIcon("iconZot", "objZot", "altobjZot", 0); // it is the zot
            //slots.addIcon("iconBattery", "objBattery", "altobjBattery");


            //this.scene.swapPosition("PlayGame", "BootGame");            
            this.scene.bringToTop("BootGame"); //TODO: do this in create?

            if (debugInput && recorder.getMode() != "replay") {
                //console.log("let's rock")
                inputText.text = "pastebox";
                //theText.resize(100, 200);
            } else {
                console.log("no text");
                inputText.text = "off";
                theText.resize(0, 0);
            }
        }


        if (inputText.text != "init" &&
            inputText.text != "off" &&
            inputText.text != "error" &&
            inputText.text != "success" &&
            inputText.text != "pastebox") {
            this.parseRecording(inputText.text)
        }

        this.input.keyboard.on('keydown', this.handleKey);
        if (this.input.activePointer.rightButtonDown()) {
            this.showRecording();
        }

        if (debugUpdateOnce) {
            debugUpdateOnce = false;
            //var txt = this.add.rexCanvasInput(50, 150, 100, 200, config);
            this.showRecording();
            return;

        }

        ////////////// INVENTORY VIEW COMBINE //////////////

        if (showXtime > 0) { // clear the big red X after awhile
            if ((this.time.now - showXtime) > 500) {
                showXtime = -1;
                failed.setX(1000);
            }
        }

        // FIRST ROOM ...
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
            plusButton.setVisible(true); plusButton.setDepth(110); plusButton.setInteractive({ cursor: 'pointer' });

            failed.setX(640);
            showXtime = this.time.now;
        }

        if (slots.combining.split(':')[0] == "good combine") {
            hasCombined = true;
            combineClue.setDepth(-1);
            //console.log("clear out " + slots.combining.split(':')[1])
            // Clear the first object...
            // ... unless it's a knife
            // if (slots.combining.split(':')[1] != "objKnife") // keep some items when affecting others, save the knife
            //     slots.clearItem(this, slots.combining.split(':')[1]);
            slots.clearItem(slots.combining.split(':')[1]);

            const slotRepl = slots.selectItem(slots.combining.split(':')[2]); //select the slot of the combine click
            //console.log("replacing " + slotRepl)
            //slots.replaceItem(this, slots.combining.split(':')[2]);
            slots.clearItem(slots.combining.split(':')[2]);
            if (slots.combining.split(':')[3] == "objDonutPlated") {
                slots.inventoryViewObj = obj[5];
                slots.inventoryViewAlt = altObj[5];
                slots.addIcon(icons[5].toString(), slots.inventoryViewObj, slots.inventoryViewAlt, slotRepl);

                slots.selectItem(slots.combining.split(':')[3]);
                didBonus = true;

                // !!!!!!!!!!!!! adding more images in update is always wrong !!!!!!!!!!!!

                // switch view to new goodly combined object
                this.add.image(0, 0, obj[5]).setOrigin(0, 0);
            } else if (slots.combining.split(':')[3] == "objKeyWhole") {
                slots.inventoryViewObj = obj[4];
                slots.inventoryViewAlt = altObj[4];
                slots.addIcon(icons[4].toString(), slots.inventoryViewObj, slots.inventoryViewAlt, slotRepl);
                slots.selectItem(slots.combining.split(':')[3]);
                this.add.image(0, 0, obj[4]).setOrigin(0, 0);
            } else {
                slots.addIcon(icons[6].toString(), obj[6], altObj[6], slotRepl); // it is a bug
            }
            slots.combining = "";

            plusModeButton.setVisible(false);
            plusButton.setVisible(true); plusButton.setDepth(110); plusButton.setInteractive({ cursor: 'pointer' });
            viewWall = 5; currentWall = 5;
            //updateWall = true;
        }

        ////////////// RECORDER SHIT //////////////

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
                        // TODO much blood was spilt here. Check unmapped object.
                        let object = dictionary.get(targetObject);
                        object?.emit('pointerdown')
                    } else if (targetType == "icon") {
                        //console.log("do icon " + targetObject);
                        slots.recordedClickIt(targetObject);   // here's how we click an icon!
                    }
                }

                actions = actions.slice(1);
                //console.log(actions.length);
                if (actions.length == 0) {
                    //console.log("recorder EOJ")
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
            //console.log("BRING THE ROACH");
            //slots.clearItem(this, "fake");
            slots.fakeClicks = 4;
            slots.addIcon(icons[6].toString(), obj[6], altObj[6], 11); // roach
        }
        if (slots.fakeClicks == 10) {
            recorder.setMode("replayOnce");
            slots.fakeClicks = -1;
            //console.log("roach replay " + slots.getSelected());
            if (slots.getSelected() == "objRoach")
                recorder.setReplaySpeed("fast")
            else
                recorder.setReplaySpeed("perfect")
            window.location.reload();
        }

        //console.log(`main is visible ${this.scene.isActive("PlayGame")}`);
        if (zotIsRunning)
            return;


        ////////////// VIEW INVENTORY OR ROOM //////////////

        // If an icon is clicked, slots will tell us we need to switch to inventory view mode.
        if (slots.inventoryViewSwitch) {
            slots.currentMode = "item"; // so slots object knows we did indeed switch

            // Turn off room navigation. If viewing a wall, return to the same wall
            leftButton.setVisible(false);
            rightButton.setVisible(false);
            if (viewWall < 5)
                previousWall = viewWall;

            // FIRST ROOM IMPLEMENTATION //   
            if (haveHalfKey && slots.inventoryViewAlt == "altobjPlateKey") {
                slots.inventoryViewAlt = "altobjPlateEmpty";
            }
            if (snagged) {
                currentWall = 5; flipIt = true;
                snagged = false;
                slots.inventoryViewAlt = "altobjPlateEmpty";
            }
            // only show key when looking at back of plate
            keyMask.setVisible(false);
            // only make the piece available if seen...
            if (currentWall == 5 && foundHalfKey && !haveHalfKey) {
                keyMask.setVisible(true); keyMask.setDepth(200); keyMask.setInteractive({ cursor: 'pointer' });
            }



            if (currentWall == 5 && flipIt) { // they just clicked the object, show alt view
                hasSearched = true;
                this.add.image(0, 0, slots.inventoryViewAlt).setOrigin(0, 0);
                viewWall = 6; currentWall = 6;
            } else {
                this.add.image(0, 0, slots.inventoryViewObj).setOrigin(0, 0);
                viewWall = 5; currentWall = 5;

                // DEBUG RECORDER START/STOP

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

            slots.displayInventoryBar(true);
            slots.inventoryViewSwitch = false;

            backButton.setVisible(true); backButton.setDepth(100); backButton.setInteractive({ cursor: 'pointer' });
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

            // turn off all scene masks, and turn on the object alternate view mask
            takeMask.setVisible(false);
            tableMask.setVisible(false);
            zotTableMask.setVisible(false);
            doorMask.setVisible(false);
            battMask.setVisible(false);
            zotMask.setVisible(false);

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
                    failed.setDepth(400);
                    failed.setX(360); failed.setY(800);
                }

                const style = 'margin: auto; background-color: black; color:white; width: 520px; height: 100px; font: 40px Arial';
                this.add.dom(350, 1100, 'div', style, sentence);

                slots.displayInventoryBar(false);
                slots.clearAll();
                takeMask.setVisible(false);
                tableMask.setVisible(false);
                zotTableMask.setVisible(false);
                doorMask.setVisible(false);
                battMask.setVisible(false);
                zotMask.setVisible(false);

                updateWall = false;
                viewWall = currentWall;

                if (recorderMode == "replayOnce") {
                    recorder.setMode("idle")
                    recorderMode = "idle";
                }

                if (recorderMode == "record") {
                    recorder.setMode("idle")
                    recorderMode = "idle";
                    this.showRecording()
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

            slots.displayInventoryBar(true);
            currentWall = viewWall;
            updateWall = false;

            if (viewWall == 0)
                this.add.sprite(540, 650, tableView[tableState]).setOrigin(0, 0);
            if (viewWall == 2) {
                if (!haveZot)
                    this.add.sprite(493, 555, "zotShown").setOrigin(0, 0);
                if (!haveBatt)
                    this.add.sprite(349, 602, "battShown").setOrigin(0, 0);
            }

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

            tableMask.setVisible(false);
            doorMask.setVisible(false);
            if (viewWall == 0) {
                tableMask.setVisible(true); tableMask.setDepth(100); tableMask.setInteractive({ cursor: 'pointer' });
                doorMask.setVisible(true); doorMask.setDepth(100); doorMask.setInteractive({ cursor: 'pointer' });
                //doorMask.input.cursor = 'url(assets/input/cursors/pen.cur), pointer';
                doorMask.input.cursor = 'pointer';
            }

            zotTableMask.setVisible(false);
            if (viewWall == 1)
                zotTableMask.setVisible(true); zotTableMask.setDepth(100); zotTableMask.setInteractive({ cursor: 'pointer' });

            hintMask.setVisible(false);
            if (viewWall == 2)
                hintMask.setVisible(true); hintMask.setDepth(100); hintMask.setInteractive({ cursor: 'pointer' });

            battMask.setVisible(false);
            if (viewWall == 2 && !haveBatt)
                battMask.setVisible(true); battMask.setDepth(100); battMask.setInteractive({ cursor: 'pointer' });

            zotMask.setVisible(false);

            if (viewWall == 2 && !haveZot)
                zotMask.setVisible(true); zotMask.setDepth(100); zotMask.setInteractive({ cursor: 'pointer' });

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
            objectMask.setVisible(false);
        }
    }

    create(data: {
        slots: Slots,
        plusButton: Phaser.GameObjects.Sprite,
        plusModeButton: Phaser.GameObjects.Sprite,
        failed: Phaser.GameObjects.Sprite
    }) {
        slots = data.slots;
        plusButton = data.plusButton;
        plusModeButton = data.plusModeButton;
        failed = data.failed;

        //bootGameScene = this.scene.get("BootGame"); // unused... 
        // oh right we can get an arbitrary scene not pass it around!

        //console.log("main create")
        let scene = this;
        // @ts-ignore   pointer is unused until we get fancy...
        this.input.on('gameobjectdown', function (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
            recorder.recordObjectDown((gameObject as Phaser.GameObjects.Sprite).texture.key, scene);
        });

        fullClue = this.add.image(0, 0, 'interfaceClue').setOrigin(0, 0);
        fullClue.setDepth(-1);
        combineClue = this.add.image(0, 0, 'interfaceCombine').setOrigin(0, 0);
        combineClue.setDepth(-1);

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

        console.log("Recorder mode=" + recorder.getMode());

        inputText = new InputText(this, 300, 100, 300, 100, {
            type: 'textarea',
            text: 'init',
            fontSize: '24px',
        });
        theText = this.add.existing(inputText);

        viewportPointer.setDepth(3001);
        viewportPointerClick.setDepth(3001);
        pointer = this.input.activePointer;

        //slots = new Slots(this, "iconEmpty", "iconSelected", "iconSelectedSecond", recorder);
        slots.displaySlots(1);
        slots.currentMode = "room";


        leftButton = this.add.sprite(80, 950, 'leftButton');
        dictionary.set('leftButton', leftButton);
        rightButton = this.add.sprite(640, 950, 'rightButton');
        dictionary.set('rightButton', rightButton);
        backButton = this.add.sprite(300, 875, 'backButton').setOrigin(0, 0);
        dictionary.set('backButton', backButton);

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
            slots.currentMode = "room";
        });

        hintMask = this.add.sprite(110, 446, 'hintMask').setOrigin(0, 0);
        hintMask.on('pointerdown', () => {
            viewWall = 9;
        });

        // Add item to inventory list when picked up. In this test it's easy, just 3 stacked items.
        // Add it and then remove from view and flag for an update.
        takeMask = this.add.sprite(155, 530, 'takeMask').setOrigin(0, 0);
        dictionary.set('takeMask', takeMask);
        takeMask.on('pointerdown', () => {
            if (tableState < 3) {
                slots.addIcon(icons[tableState].toString(), obj[tableState], altObj[tableState]); // TODO: get name from sprite
                this.add.sprite(190, 560, closeView[tableState]).setOrigin(0, 0);
                tableState++;
                if (tableState > 2) {
                    this.input.setDefaultCursor('default');
                }
                updateWall = true;
            }
        });

        tableMask = this.add.sprite(440, 615, 'tableMask').setOrigin(0, 0);
        dictionary.set('tableMask', tableMask);
        tableMask.on('pointerdown', () => {
            //console.log("view table!")
            if (viewWall == 0)
                viewWall = 4;

        });

        zotTableMask = this.add.sprite(340, 634, 'zotTableMask').setOrigin(0, 0);
        dictionary.set('zotTableMask', zotTableMask);
        zotTableMask.on('pointerdown', () => {
            zotIsRunning = true;
            //console.log("zot table!")

            // the worst kind of hack, it will work but bad idea so TODO whenever...
            // if this was a portal on a wall with lots of stuff would need to turn it all off...
            // TODO idk
            zotTableMask.setVisible(false);

            if (zotTableInit) {
                this.scene.run("ZotTable", { slots: slots, plusButton: plusButton, plusModeButton: plusModeButton })
                //this.scene.moveBelow("BootGame","ZotTable");
                //this.scene.bringToTop("ZotTable");
                //this.scene.bringToTop("BootGame");
                //this.scene.sleep();
                zotTableInit = false
            } else {
                this.scene.wake("ZotTable");
                this.scene.moveUp("ZotTable");
            }
        });

        battMask = this.add.sprite(339, 590, 'battMask').setOrigin(0, 0);
        dictionary.set('battMask', battMask);
        battMask.on('pointerdown', () => {
            haveBatt = true;

            slots.addIcon(icons[8].toString(), obj[7], altObj[7]); // TODO: get name from sprite!
            this.add.sprite(487, 786, "battPicked").setOrigin(0, 0); // TODO this would be better done in create()
            updateWall = true;
        });
        zotMask = this.add.sprite(493, 555, 'zotMask').setOrigin(0, 0);
        dictionary.set('zotMask', zotMask);
        zotMask.on('pointerdown', () => {
            haveZot = true;

            slots.addIcon(icons[10].toString(), obj[9], altObj[9]); // TODO: get name from sprite
            this.add.sprite(312, 980, "zotPicked").setOrigin(0, 0); // TODO this would be better done in create()
            updateWall = true;
        });

        doorMask = this.add.sprite(274, 398, 'doorMask').setOrigin(0, 0);
        dictionary.set('doorMask', doorMask);
        doorMask.on('pointerdown', () => {
            if (doorUnlocked) {
                egress = true; // TODO doorUnlocked needs multiple states... then drop this flag
                updateWall = true;
            } else if (slots.getSelected() == "objKeyWhole") {
                doorUnlocked = true;
                updateWall = true;
                //slots.clearItem(this, "objKeyWhole");
                slots.clearItem("objKeyWhole");
                slots.clearSelect(); // TODO why not do this automatically on clearItem()??
            }
        });

        objectMask = this.add.sprite(87, 423, 'objectMask').setOrigin(0, 0);
        dictionary.set('objectMask', objectMask);
        // Flip object over. Need to adjust for key presence if it's the plate. Awkward!
        objectMask.on('pointerdown', () => {
            //console.log("main object view")
            flipIt = true;
            slots.inventoryViewSwitch = true;

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
        });

        // Found the key and clicked it. We need to update the inventory view with empty plate.
        keyMask = this.add.sprite(315, 540, 'keyMask').setOrigin(0, 0);
        dictionary.set('keyMask', keyMask);
        keyMask.on('pointerdown', () => {
            //console.log("KEYMASK")
            slots.inventoryViewSwitch = true; // force inventory view update.
            flipIt = false;
            snagged = true; // swap out plate with key for the empty plate
            haveHalfKey = true;

            slots.addIcon(icons[3].toString(), obj[3], altObj[3]); // TODO: get name from sprite!!
        });

        // Fakey test debug icon
        slots.addIcon(icons[7].toString(), "fake", "fake", 10); // TODO: get name from sprite?!

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
            //console.log("REPLAY " + recorderMode);

            const actionString = recording.split(":");
            actionString.forEach((action) => {
                if (action.length > 0) {
                    let splitAction = action.split(',');
                    actions.push([splitAction[0], parseInt(splitAction[1], 10), parseInt(splitAction[2], 10), parseInt(splitAction[3], 10)]);
                }
            });
            actions = actions.slice(1); // drop the first element, just used to instantiate the array
            nextActionTime = actions[0][3];
        }

        this.events.on('wake', () => {
            //console.log("MAIN AWAKES")
            zotIsRunning = false;
            viewWall = 1;
            updateWall = true;

        });

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
                window.location.reload();
                break;
            case "Escape":
                //;console.log("quit recorder");
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

        slots.displayInventoryBar(false);
        slots.clearAll();
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


        icons[0] = "iconDonut";
        icons[1] = "iconPlate";
        icons[2] = "iconKeyB";
        icons[3] = "iconKeyA";
        icons[4] = "iconKeyWhole";
        icons[5] = "iconDonutPlated";
        icons[6] = "iconRoach";
        icons[7] = "iconFake";
        icons[8] = "iconBattery";
        icons[9] = "DELETED";
        icons[10] = "iconZot";


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

        tableView[0] = "tableDonut";
        tableView[1] = "tablePlate";
        tableView[2] = "tableKey";
        tableView[3] = "tableEmpty";

        closeView[0] = "closeDonut"
        closeView[1] = "closePlate"
        closeView[2] = "closeKey"
        closeView[3] = "closeEmpty"

    }
}

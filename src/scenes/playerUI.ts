import 'phaser';
import Slots from "../objects/slots"
import Recorder from "../objects/recorder"

let invBar: Phaser.GameObjects.Sprite;
let interfaceClueFull: Phaser.GameObjects.Sprite;
let interfaceClueCombine: Phaser.GameObjects.Sprite;
let viewportPointerClick: Phaser.GameObjects.Sprite;
let viewportPointer: Phaser.GameObjects.Sprite;
let iconSelected: Phaser.GameObjects.Sprite;
let failed: Phaser.GameObjects.Sprite;
let interfaceInspect: Phaser.GameObjects.Sprite;

var plusButton: Phaser.GameObjects.Sprite;
var plusModeButton: Phaser.GameObjects.Sprite;
var eyeButton: Phaser.GameObjects.Sprite;
var objectMask: Phaser.GameObjects.Sprite;

let UIbackButton: Phaser.GameObjects.Sprite;
let objectImage: Phaser.GameObjects.Image;

/*
viewportPointerClick = this.add.sprite(1000, 0, 'atlas', 'pointerClicked.png');
viewportPointer = this.add.sprite(1000, 0, 'atlas', 'pointer.png').setOrigin(0, 0);

const iconSelected = this.add.sprite(1000, 1078, 'atlas', "icon - selected.png").setOrigin(0, 0);
*/

let slots: Slots;
let recorder: Recorder;
let activeSceneName: string;

let uiObjectView = false;
let uiObjectViewDirty = false;
let flipIt = false;
let hasSearched = false;
let hasCombined = false;
let currentSelectedIndex: number;

// special for key hidden on back of plate
var keyMask: Phaser.GameObjects.Sprite;
let foundHalfKey = false; // enable the key mask when key part is visible
let haveHalfKey = false; // don't show key part on plate back if already taken

// tricky stuff for combined plate
var doorUnlocked = false;
let didBonus = false;

let showXtime = -1;

let fourSolved = false;
let fiveState = 0;

export default class PlayerUI extends Phaser.Scene {
    constructor() {
        super("PlayerUI");
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



    // Must preload initial UI sprites -- for the stuff done in BootGame TODO goal is nothing like this
    preload() {
        //console.log("playerUI preload")
        this.load.atlas('atlas', 'assets/graphics/texture.png', 'assets/graphics/texture.json');
        //this.load.atlas('uiatlas', 'assets/graphics/texture.png', 'assets/graphics/texture.json');
    }

    create() {
        //console.log("UI shit goes here")
        invBar = this.add.sprite(109, 1075, 'atlas', 'inventory cells.png').setOrigin(0, 0).setVisible(false).setDepth(1);
        interfaceClueFull = this.add.sprite(485, 774, 'atlas', 'interfaceClueSearch.png').setOrigin(0, 0).setVisible(false).setDepth(1);
        interfaceClueCombine = this.add.sprite(17, 305, 'atlas', 'interfaceClueCombine.png').setOrigin(0, 0).setVisible(false).setDepth(1);
        viewportPointerClick = this.add.sprite(1000, 0, 'atlas', 'pointerClicked.png');
        viewportPointer = this.add.sprite(1000, 0, 'atlas', 'pointer.png').setOrigin(0, 0);
        iconSelected = this.add.sprite(1000, 1078, 'atlas', "icon - selected.png").setOrigin(0, 0).setDepth(1);
        failed = this.add.sprite(1000, 950, 'atlas', 'fail.png').setDepth(1); // 640 is displayed
        //interfaceInspect = this.add.sprite(5, 1070, 'atlas', 'interfaceInspect.png').setOrigin(0, 0).setVisible(false);\
        interfaceInspect = this.add.sprite(5, 1070, 'atlas', 'interfaceInspect.png').setOrigin(0, 0).setVisible(false);

        recorder = new Recorder(viewportPointer, viewportPointerClick);
        slots = new Slots(this, iconSelected, recorder);

        plusButton = this.add.sprite(80, 950, 'atlas', 'plus - unselected.png').setName("plusButton").setDepth(1).setVisible(false);
        plusModeButton = this.add.sprite(80, 950, 'atlas', 'plus - selected.png').setName("plusModeButton").setDepth(1).setVisible(false);
        recorder.addMaskSprite('plusButton', plusButton);
        recorder.addMaskSprite('plusModeButton', plusModeButton);

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

        eyeButton = this.add.sprite(15, 1120, 'atlas', 'eyeOff.png').setName("eyeButton").setOrigin(0, 0).setDepth(1);
        recorder.addMaskSprite('eyeButton', eyeButton);
        eyeButton.setVisible(true); eyeButton.setInteractive({ cursor: 'pointer' });

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
            slots.addIcon("icon - keyB.png", "objKeyB", "altobjKeyB");
            haveHalfKey = true;

            uiObjectViewDirty = true;
        });

        let thisscene = this;
        // @ts-ignore   pointer is unused until we get fancy...
        this.input.on('gameobjectdown', function (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
            recorder.recordObjectDown((gameObject as Phaser.GameObjects.Sprite).name, thisscene);
        });

        this.scene.launch("BootGame")
    }

    closeObjectUI() {
        //console.log("UI back to " + activeSceneName);
        uiObjectView = false;

        objectImage.destroy();

        slots.combining = ""; // cancel any combine action
        this.turnEyeOff();
        UIbackButton.setVisible(false);
        objectMask.setVisible(false);
        interfaceClueCombine.setVisible(false);
        interfaceClueFull.setVisible(false);
        plusButton.setVisible(false);
        plusModeButton.setVisible(false);
        this.scene.wake(activeSceneName)
    }

    update() {
        //console.log("UI update")
        //scene.registry.set('replayObject', "zotBackButton:ZotTable");

        if (slots.getSelectedIndex() != currentSelectedIndex) {
            currentSelectedIndex = slots.getSelectedIndex();
            uiObjectViewDirty = true;
            flipIt = false;
        }

        if (uiObjectView && uiObjectViewDirty) {
            uiObjectViewDirty = false;
            const viewIt = slots.viewSelected();

            // special hidden key on back of plate logic stuff
            foundHalfKey = false;
            if (viewIt.objectView == "objPlate" && flipIt) {
                console.log("discovered key!")
                foundHalfKey = true;
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

            if (slots.combining.split(':')[3] == "objDonutPlated") {
                slots.inventoryViewObj = "objDonutPlated";
                slots.inventoryViewAlt = "altobjDonutPlated";
                slots.addIcon("icon - donutPlated.png", slots.inventoryViewObj, slots.inventoryViewAlt, slotRepl);

                slots.selectItem(slots.combining.split(':')[3]);
                didBonus = true;

                // switch view to new goodly combined object
                objectImage.destroy();
                objectImage = this.add.image(0, 0, "objDonutPlated").setOrigin(0, 0);
            } else if (slots.combining.split(':')[3] == "objKeyWhole") {
                slots.inventoryViewObj = "objKeyWhole";
                slots.inventoryViewAlt = "altobjKeyWhole";
                slots.addIcon("icon - keyWhole.png", slots.inventoryViewObj, slots.inventoryViewAlt, slotRepl);
                slots.selectItem(slots.combining.split(':')[3]);

                objectImage.destroy();
                objectImage = this.add.image(0, 0, "objKeyWhole").setOrigin(0, 0);
            } else {
                slots.addIcon("icon - roach.png", "objRoach", "altobjRoach", slotRepl); // it is a bug
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

        /*        
         // If an icon is clicked... slots will tell us we need to switch to inventory view mode.
        
                if (slots.inventoryViewSwitch) {
        
                    slots.inventoryViewSwitch = false;
        
        
                    myUI.displayInterfaceClueFull(false);
                    myUI.displayInterfaceClueCombine(false);
                    if (!slots.getSearched()) {
                        myUI.displayInterfaceClueFull(true);
                    }
                    if (!slots.getCombined()) {
                        myUI.displayInterfaceClueCombine(true);
                    }
        
                    if (slots.inventoryViewObj == "objRoach") {
                        myUI.displayInterfaceClueFull(false);
                        myUI.displayInterfaceClueCombine(false);
                    }
        
                    //objectMask.input.cursor = 'url(assets/input/cursors/pen.cur), pointer';
        
                }
        */



        /*
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
        */



        /*                    
                if (currentWall == 5 && flipIt) { // they just clicked the object, show alt view
                    slots.setSearched(true);
                    this.add.image(0, 0, slots.inventoryViewAlt).setOrigin(0, 0);
                    viewWall = 6; currentWall = 6;
                } else {
                    this.add.image(0, 0, slots.inventoryViewObj).setOrigin(0, 0);
                    viewWall = 5; currentWall = 5;
        
                    // DEBUG RECORDER START/STOP
        
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
                }
                flipIt = false;
        */


    }
}

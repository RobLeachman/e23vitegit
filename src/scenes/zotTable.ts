import 'phaser';
import Slots from "../objects/slots"
import Recorder from "../objects/recorder"

var recorder: Recorder;

let viewWall = 0;
let currentWall = -1;
let updateWall = false;

let backStack = new Array();

const walls = new Array();
walls[0] = "zotTableOff";
walls[1] = "zotTableBack";
walls[2] = "zotTableOffFlipped";
walls[3] = "zotTableBackFlipped";

// these regions are so big I suppose won't bother with sprites
walls[7] = "zotBatteryClosed";
walls[8] = "zotBatteryEmpty";
walls[9] = "zotBatteryPlaced";

const zotState = new Array();
zotState[0] = "zotState-off.png";
zotState[1] = "zotState-yellow.png";
zotState[2] = "zotState-green.png";
zotState[3] = "zotState-key.png";
zotState[4] = "zotState-empty.png";

const zotStateFlipped = new Array();
zotStateFlipped[0] = "zotStateFlipped-green.png_removed"; // impossible, upside down green is red
zotStateFlipped[1] = "zotStateFlipped-yellow.png";
zotStateFlipped[2] = "zotStateFlipped-red.png";

let zotDrawerState = 0;
let batteryPlaced = false;
let drawerOpen = 0;
let keyTaken = false;

let zotBackButton: Phaser.GameObjects.Sprite;
let backFrontButton: Phaser.GameObjects.Sprite;
let topBottomButton: Phaser.GameObjects.Sprite;
let batteryMask: Phaser.GameObjects.Sprite;

let zotPlaced: Phaser.GameObjects.Sprite;
let zotPlacedFlipped: Phaser.GameObjects.Sprite;
let zotBottomMask: Phaser.GameObjects.Sprite;
let zotTopMask: Phaser.GameObjects.Sprite;
let zotDrawerMask: Phaser.GameObjects.Sprite;

let zotObjectMask: Phaser.GameObjects.Sprite; // TODO should be a way to make this common but I got tired
var zot_flipIt = false;

let haveZot = false;

var slots: Slots;
var plusButton: Phaser.GameObjects.Sprite;
var plusModeButton: Phaser.GameObjects.Sprite;

export class ZotTable extends Phaser.Scene {
    constructor() {
        super("ZotTable");
    }
    create(data: {
        slots: Slots,
        plusButton: Phaser.GameObjects.Sprite,
        plusModeButton: Phaser.GameObjects.Sprite
    }) {
        //console.log("ZotTable create")
        slots = data.slots;
        plusButton = data.plusButton;
        plusModeButton = data.plusModeButton;

        recorder = slots.recorder;
        // SCENERECORD: Capture all mask clicks on this scene

        this.registry.events.on('changedata', this.registryUpdate, this);

        let thisscene = this;
        // @ts-ignore   pointer is unused until we get fancy...
        this.input.on('gameobjectdown', function (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
            recorder.recordObjectDown((gameObject as Phaser.GameObjects.Sprite).name, thisscene);
        });

        this.registry.set('boxHasZot', haveZot);
        this.registry.set('boxColor', "off");

        //zotBackButton = this.add.sprite(300, 875, 'zotBackButton').setOrigin(0, 0);
        zotBackButton = this.add.sprite(300, 875, 'atlas', 'arrowDown.png').setOrigin(0, 0).setName("zotBackButton");
        recorder.addMaskSprite('zotBackButton', zotBackButton);
        zotBackButton.setVisible(true);

        zotBackButton.on('pointerdown', () => {
            slots.combining = ""; // cancel any combine action
            slots.currentMode = "room"; // definitely not in view object mode
            slots.turnEyeOff()
            zotObjectMask.setVisible(false);

            // record the last back action, it won't be captured by global method
            if (backStack.length == 0) {
                recorder.recordObjectDown(zotBackButton.name, thisscene);
                console.log("exit zottable")

                zotBackButton.setVisible(false);
                zotBackButton.removeInteractive(); // fix up the cursor displayed on main scene

                this.scene.moveUp("PlayGame");
                this.scene.sleep();
                this.scene.wake("PlayGame");
            } else {
                const returnTo = backStack.pop();
                console.log("return to view " + returnTo);
                viewWall = returnTo;
            }


            //console.log(`go back from ${viewWall} to ${previousWall}, previous battery wall is ${previousWallHack}`)


            /*
             if (viewWall > 6) { // battery closeup
                 //console.log(`will exit from ${viewWall} after returning to ${previousWall}`)
                 viewWall = previousWall;
                 previousWall = -1;
                 //updateWall = true;
             } else if (viewWall == 5 || viewWall == 6) {
                 //console.log("still struggling")
                 viewWall = previousWall;
             }
             //console.log(`now go view ${viewWall} and previous ${previousWall}`)
             // need a hack here for returning from looking at an object while viewing a battery wall... ugh
             if (viewWall == previousWall) {
                 //console.log("HACK " + previousWallHack);
                 previousWall = previousWallHack
             }
             */
        });


        //backFrontButton = this.add.sprite(65, 625, 'backFrontButton'); // forgot setOrigin so fudged this in
        backFrontButton = this.add.sprite(65, 625, 'atlas', 'backFrontButton.png').setName("backFrontButton");
        recorder.addMaskSprite('backFrontButton', backFrontButton);
        backFrontButton.on('pointerdown', () => {
            if (viewWall == 0)
                viewWall = 1;
            else if (viewWall == 1)
                viewWall = 0;
            else if (viewWall == 2)
                viewWall = 3;
            else if (viewWall == 3)
                viewWall = 2;
        });

        //topBottomButton = this.add.sprite(360, 315, 'topBottomButton'); // fudge, forgot setOrigin
        topBottomButton = this.add.sprite(360, 315, 'atlas', 'topBottomButton.png').setName("topBottomButton");
        recorder.addMaskSprite('topBottomButton', topBottomButton);
        topBottomButton.on('pointerdown', () => {
            if (viewWall == 0)
                viewWall = 2;
            else if (viewWall == 2)
                viewWall = 0;
            else if (viewWall == 1)
                viewWall = 3;
            else if (viewWall == 3)
                viewWall = 1;
        });

        zotPlaced = this.add.sprite(302, 483, 'atlas', 'zotPlaced.png').setOrigin(0, 0);
        zotPlacedFlipped = this.add.sprite(293, 478, 'atlas', 'zotPlacedFlipped.png').setOrigin(0, 0);

        //zotTopMask = this.add.sprite(294, 466, 'zotTopMask').setOrigin(0, 0);
        zotTopMask = this.add.sprite(294, 466, 'atlas', 'takeMask.png').setName("zotTopMask").setOrigin(0, 0);
        recorder.addMaskSprite('zotTopMask', zotTopMask);
        zotTopMask.on('pointerdown', () => {
            let selectedThing = slots.getSelected();
            if (selectedThing.thing == "objZot") {
                //console.log("ADD IT")
                slots.clearItem("objZot")
                slots.clearSelect();
                haveZot = true;
                this.registry.set('boxHasZot', haveZot);
                updateWall = true;
            }
        });

        zotBottomMask = this.add.sprite(298, 450, 'atlas', 'zotBottomMask.png').setName("zotBottomMask").setOrigin(0, 0);
        recorder.addMaskSprite('zotBottomMask', zotBottomMask);
        zotBottomMask.on('pointerdown', () => {
            console.log("bottom mask return to " + viewWall)
            backStack.push(viewWall)
            viewWall = 7;
        });

        zotDrawerMask = this.add.sprite(134, 659, 'atlas', 'zotDrawerMask.png').setName("zotDrawerMask").setOrigin(0, 0);
        recorder.addMaskSprite('zotDrawerMask', zotDrawerMask);
        zotDrawerMask.on('pointerdown', () => {
            console.log(`open the drawer? state=${zotDrawerState} wall ${viewWall}`)
            if (viewWall == 2) // tease the drawer but can't open if flipped
                return;
            if (zotDrawerState < 2)
                return;
            if (drawerOpen == 1) {
                keyTaken = true;
                drawerOpen = 2; // key has been taken from open drawer
                slots.addIcon("icon - keyA.png", "objKeyA", "altobjKeyA");
            }
            if (!keyTaken) {
                console.log("can take it")
                drawerOpen = 1; // drawer is open and key is displayed
            }
            updateWall = true;
        });

        //batteryMask = this.add.sprite(90, 307, 'batteryMask').setOrigin(0, 0);
        batteryMask = this.add.sprite(90, 307, 'atlas', 'zotBatteryMask.png').setName("batteryMask").setOrigin(0, 0);
        recorder.addMaskSprite('batteryMask', batteryMask);
        batteryMask.on('pointerdown', () => {
            //console.log("viewing " + viewWall)
            if (viewWall == 9) { // cover open, battery placed
                viewWall = 7;
            } else if (viewWall == 8) { // cover open, empty
                let selectedThing = slots.getSelected();
                if (selectedThing.thing == "objBattery") {
                    slots.clearItem("objBattery")
                    slots.clearSelect();
                    batteryPlaced = true;
                    viewWall = 9;
                } else {
                    viewWall = 7;
                }
                updateWall = true;
            } else if (viewWall == 7) { // cover closed
                viewWall = 8;
                if (batteryPlaced)
                    viewWall = 9;
            }
        });

        //zotObjectMask = this.add.sprite(170, 410, 'zotObjectMask').setOrigin(0, 0);
        zotObjectMask = this.add.sprite(170, 410, 'atlas', 'object-maskC.png').setOrigin(0, 0).setName("zotObjectMask");
        recorder.addMaskSprite('zotObjectMask', zotObjectMask);

        // Flip object over. TODO: must adjust for key presence if it's the plate. Awkward! ??????
        zotObjectMask.on('pointerdown', () => {
            zot_flipIt = true;
            slots.inventoryViewSwitch = true;
        });

        this.events.on('wake', () => {
            viewWall = 0;
            updateWall = true;
        });
    }

    // @ts-ignore
    // no clue what parent is
    registryUpdate(parent: Phaser.Game, key: string, data: string) {
        //console.log("----------ZOT reg check " + data)
        if (key == "replayObject") {
            const spriteName = data.split(':')[0];
            const spriteScene = data.split(':')[1];
            //console.log("ZOT OBJECT replay=" + spriteName + " on scene " + spriteScene)
            if (spriteScene == "ZotTable") {
                //console.log("it is zot")
                let object = recorder.getMaskSprite(spriteName);
                object?.emit('pointerdown')
            }
        }
    }

    update() {
        // Be sure we have the pointer, and then record any movement or clicks
        if (recorder.getMode() == "record") {
            recorder.fixPointer(this.input.activePointer)
            recorder.checkPointer(this);
        }

        if (slots.inventoryViewSwitch) {
            //console.log(`Zot Item View   view=${viewWall} previous=${previousWall}`)
            slots.currentMode = "item"; // so slots object knows we switched

            // Turn off room navigation. If viewing a wall, return to the same wall
            backFrontButton.setVisible(false);
            topBottomButton.setVisible(false);

            //just started inspecting an object
            if (viewWall < 5 || viewWall > 6) {
                backStack.push(viewWall);
            }

            // ZOT ROOM IMPLEMENTATION //   

            if (currentWall == 5 && zot_flipIt) { // they just clicked the object, show alt view
                slots.setSearched(true);
                this.add.image(0, 0, slots.inventoryViewAlt).setOrigin(0, 0);
                viewWall = 6; currentWall = 6;
            } else {
                this.add.image(0, 0, slots.inventoryViewObj).setOrigin(0, 0);
                viewWall = 5; currentWall = 5;
            }
            zot_flipIt = false;

            slots.displayInventoryBar(true);
            slots.inventoryViewSwitch = false;

            zotBackButton.setVisible(true); zotBackButton.setDepth(10010); zotBackButton.setInteractive({ cursor: 'pointer' });
            plusButton.setVisible(true); plusButton.setDepth(10010); plusButton.setInteractive();

            if (!slots.getSearched()) {
                slots.displayInterfaceClueFull(true);
                slots.displayInterfaceClueCombine(false);
            } else {
                if (!slots.getCombined()) {
                    slots.displayInterfaceClueCombine(true);
                    slots.displayInterfaceClueFull(false);
                }
            };
            if (slots.inventoryViewObj == "objRoach") {
                slots.displayInterfaceClueFull(false);
                slots.displayInterfaceClueCombine(false);
            }

            // turn off all scene masks, and turn on the object alternate view mask
            batteryMask.setVisible(false);
            zotTopMask.setVisible(false);
            zotBottomMask.setVisible(false);
            zotDrawerMask.setVisible(false);
            zotPlaced.setDepth(-1);
            zotPlacedFlipped.setDepth(-1);

            zotObjectMask.setVisible(true);
            zotObjectMask.setDepth(1);
            zotObjectMask.setInteractive({ cursor: 'pointer' });

            slots.displayInventoryBar(true);
            slots.inventoryViewSwitch = false;

        } else if ((viewWall != currentWall || updateWall)) {
            slots.displayInterfaceClueFull(false);
            slots.displayInterfaceClueCombine(false);
            //console.log("zot view wall=" + viewWall)
            this.add.image(0, 0, walls[viewWall]).setOrigin(0, 0);

            zotPlacedFlipped.setDepth(-1);
            zotPlaced.setDepth(-1);

            zotDrawerMask.setVisible(false);
            if (viewWall == 0 || viewWall == 2) { // front view, right side up or flipped
                zotDrawerState = 0;
                if (haveZot)
                    zotDrawerState++;
                if (batteryPlaced)
                    zotDrawerState++;
                if (keyTaken)
                    zotDrawerState = 0;
            }
            this.registry.set('zotBoxColor', zotDrawerState);

            if (viewWall == 0) {
                zotDrawerMask.setVisible(true); zotDrawerMask.setDepth(1); zotDrawerMask.setInteractive({ cursor: 'pointer' });
                if (keyTaken) {
                    drawerOpen = 0;
                    zotDrawerMask.setVisible(false); // done with the drawer
                }
                if (drawerOpen == 1) {
                    this.add.sprite(134, 659, 'atlas', zotState[3]).setOrigin(0, 0);

                } else if (drawerOpen == 2) {
                    this.add.sprite(134, 659, 'atlas', zotState[4]).setOrigin(0, 0);
                } else {
                    this.add.sprite(134, 659, 'atlas', zotState[zotDrawerState]).setOrigin(0, 0);
                    if (haveZot)
                        zotPlaced.setDepth(1);
                    //if (zotDrawerState == 2) { // green, now let it be opened
                    //    zotDrawerMask.setVisible(true); zotDrawerMask.setDepth(1); zotDrawerMask.setInteractive({ cursor: 'pointer' });
                    //}
                }

            }
            if (viewWall == 2) {
                zotDrawerMask.setVisible(true); zotDrawerMask.setDepth(1); zotDrawerMask.setInteractive({ cursor: 'pointer' });
                if (zotDrawerState > 0)
                    this.add.sprite(153, 664, 'atlas', zotStateFlipped[zotDrawerState]).setOrigin(0, 0);
            }

            backFrontButton.setVisible(false);
            topBottomButton.setVisible(false);

            if (viewWall < 4) {
                backFrontButton.setVisible(true); backFrontButton.setDepth(1); backFrontButton.setInteractive({ cursor: 'pointer' });
                topBottomButton.setVisible(true); topBottomButton.setDepth(1); topBottomButton.setInteractive({ cursor: 'pointer' });
            }
            zotBackButton.setVisible(true); zotBackButton.setDepth(1); zotBackButton.setInteractive({ cursor: 'pointer' });

            if (viewWall == 1) {
                if (haveZot)
                    zotPlacedFlipped.setDepth(2);
            }

            zotTopMask.setVisible(false);
            if ((!haveZot) && (viewWall == 0 || viewWall == 1)) {
                zotTopMask.setVisible(true); zotTopMask.setDepth(1); zotTopMask.setInteractive({ cursor: 'pointer' });
            }

            zotBottomMask.setVisible(false);
            if (viewWall == 2 || viewWall == 3) {
                zotBottomMask.setVisible(true); zotBottomMask.setDepth(1); zotBottomMask.setInteractive({ cursor: 'pointer' });
            }
            batteryMask.setVisible(false);
            if (viewWall > 3)
                batteryMask.setVisible(true); batteryMask.setDepth(1); batteryMask.setInteractive({ cursor: 'pointer' });

            plusButton.setVisible(false);
            plusModeButton.setVisible(false);
        }

        this.scene.setVisible(true, "BootGame");
        slots.displaySlots(30005);

        currentWall = viewWall;
        updateWall = false;
    }
}

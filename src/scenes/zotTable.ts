import 'phaser';
import Slots from "../objects/slots"

let viewWall = 0;
let currentWall = -1;
let previousWall = -1;
let updateWall = false;

const walls = new Array();
walls[0] = "zotTableOff";
walls[1] = "zotTableBack";
walls[2] = "zotTableOffFlipped";
walls[3] = "zotTableBackFlipped";

// these regions are so big I suppose won't bother with sprites
walls[4] = "zotBatteryClosed";
walls[5] = "zotBatteryEmpty";
walls[6] = "zotBatteryPlaced";

const zotState = new Array();
zotState[0] = "zotStateOff";
zotState[1] = "zotStateYellow";
zotState[2] = "zotStateGreen";
zotState[3] = "zotStateKey";
zotState[4] = "zotStateEmpty";

const zotStateFlipped = new Array();
zotStateFlipped[0] = "zotStateFlippedGreen";
zotStateFlipped[1] = "zotStateFlippedYellow";
zotStateFlipped[2] = "zotStateFlippedRed";

let zotDrawerState = 0;
let batteryPlaced = false;

let backButton: Phaser.GameObjects.Sprite;
let backFrontButton: Phaser.GameObjects.Sprite;
let topBottomButton: Phaser.GameObjects.Sprite;
let batteryMask: Phaser.GameObjects.Sprite;

let zotPlaced: Phaser.GameObjects.Sprite;
let zotPlacedFlipped: Phaser.GameObjects.Sprite;
let zotTopMask: Phaser.GameObjects.Sprite;

let zot_objectMask: Phaser.GameObjects.Sprite;
var zot_flipIt = false;


let haveZot = false;




let lastKeyDebouncer = "";

var slots: Slots;
var plusButton: Phaser.GameObjects.Sprite;
var plusModeButton: Phaser.GameObjects.Sprite;

export class ZotTable extends Phaser.Scene {
    constructor() {
        super("ZotTable");
    }
    create(data: { fadeIn: boolean, slots: Slots, plusButton: Phaser.GameObjects.Sprite, plusModeButton: Phaser.GameObjects.Sprite }) {
        slots = data.slots;
        plusButton = data.plusButton;
        plusModeButton = data.plusModeButton;

        if (data.fadeIn) {
            console.log("ON")
        }
        console.log("zt create")
        //slots.currentMode = "room";        

        backButton = this.add.sprite(300, 875, 'backButton').setOrigin(0, 0);
        //backButton.setDepth(20001); // TODO here is better!
        backButton.setVisible(true);

        backButton.on('pointerdown', () => {
            console.log("back to " + previousWall);
            slots.currentMode = "room";
            zot_objectMask.setVisible(false);
            if (previousWall == -1) {
                console.log("back to main")
                //this.scene.sendToBack()
                backButton.setVisible(false);

                //this.scene.switch("PlayGame");  // should work!
                //backButton.input.cursor = 'default';
                backButton.removeInteractive(); // fix up the cursor displayed on main scene
                this.scene.moveUp("PlayGame");
                this.scene.sleep();
                this.scene.wake("PlayGame");
            } else if (viewWall > 3) {
                if (previousWall > -1) {
                    viewWall = previousWall;
                    previousWall = -1;
                    updateWall = true;
                } else {
                    throw new Error("I DON'T EVEN"); //TODO take this out
                }
            }
        });


        backFrontButton = this.add.sprite(65, 625, 'backFrontButton'); // forgot setOrigin so fudged this in
        //dictionary.set('backFrontButton', backFrontButton);


        backFrontButton.on('pointerdown', () => {
            console.log("backfront")
            //console.log("view table!")
            if (viewWall == 0)
                viewWall = 1;
            else if (viewWall == 1)
                viewWall = 0;
            else if (viewWall == 2)
                viewWall = 3;
            else if (viewWall == 3)
                viewWall = 2;
        });

        topBottomButton = this.add.sprite(360, 315, 'topBottomButton'); // fudge, forgot setOrigin
        //dictionary.set('topBottomButton', topBottomButton);

        topBottomButton.on('pointerdown', () => {
            console.log("topbottom");
            if (viewWall == 0)
                viewWall = 2;
            else if (viewWall == 2)
                viewWall = 0;
            else if (viewWall == 1)
                viewWall = 3;
            else if (viewWall == 3)
                viewWall = 1;

        });

        zotPlaced = this.add.sprite(302, 483, 'zotPlaced').setOrigin(0, 0);
        zotPlacedFlipped = this.add.sprite(293, 478, 'zotPlacedFlipped').setOrigin(0, 0);
        batteryMask = this.add.sprite(90, 507, 'zotBatteryMask').setOrigin(0, 0);

        zotTopMask = this.add.sprite(298, 450, 'zotTopMask').setOrigin(0, 0);
        zotTopMask.on('pointerdown', () => {
            //console.log("Top mask... well actually it is on the bottom...")
            previousWall = viewWall;
            viewWall = 4;
        });

        batteryMask = this.add.sprite(90, 507, 'zotBatteryMask').setOrigin(0, 0);
        batteryMask.on('pointerdown', () => {
            viewWall++;
            if (viewWall > 6)
                viewWall = 4;
            if (viewWall == 6)
                batteryPlaced = true;
            if (viewWall == 5 && batteryPlaced)
                viewWall = 6;
        });


        zot_objectMask = this.add.sprite(87, 423, 'objectMask').setOrigin(0, 0);


        //dictionary.set('objectMask', objectMask);



        // Flip object over. Need to adjust for key presence if it's the plate. Awkward!
        zot_objectMask.on('pointerdown', () => {
            zot_flipIt = true;
            slots.inventoryViewSwitch = true;
        });


        this.events.on('wake', () => {
            //console.log("zot table awakes!")
            viewWall = 0;
            updateWall = true;
            //backButton.setVisible(true); backButton.setDepth(20001); backButton.setInteractive({ cursor: 'pointer' });
        });


        this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
            if (event.key == lastKeyDebouncer)
                return;
            //console.log("keycode " + event.key)
            lastKeyDebouncer = event.key;
            switch (event.key) {
                case "1":
                    haveZot = !haveZot;
                    updateWall = true;
                    break;
                case "2":
                    zotDrawerState++;
                    if (zotDrawerState > 4)
                        zotDrawerState = 0;
                    updateWall = true;
                    break;
            }

        });

    }

    preload() {

        //walls[0] = "wall1";
        //walls[1] = "wall2";
    }

    update() {
        if (slots.inventoryViewSwitch) {
            //console.log("Zot Item View")
            slots.currentMode = "item"; // so slots object knows we switched


            // Turn off room navigation. If viewing a wall, return to the same wall
            backFrontButton.setVisible(false);
            topBottomButton.setVisible(false);


            if (viewWall < 5) {
                //console.log("will return to " + viewWall)
                previousWall = viewWall;
            }

            // FIRST ROOM IMPLEMENTATION //   
            // put second-specific logic here







            if (currentWall == 5 && zot_flipIt) { // they just clicked the object, show alt view

                // just run without fixing the inteface hints FOR NOW
                //hasSearched = true;


                this.add.image(0, 0, slots.inventoryViewAlt).setOrigin(0, 0);
                viewWall = 6; currentWall = 6;
            } else {
                //console.log("displaying " + slots.inventoryViewObj)
                this.add.image(0, 0, slots.inventoryViewObj).setOrigin(0, 0);
                viewWall = 5; currentWall = 5;
            }
            zot_flipIt = false;

            slots.displayInventoryBar(true);
            slots.inventoryViewSwitch = false;

            backButton.setVisible(true); backButton.setDepth(100); backButton.setInteractive({ cursor: 'pointer' });
            plusButton.setVisible(true); plusButton.setDepth(110); plusButton.setInteractive();


            // turn off all scene masks, and turn on the object alternate view mask
            batteryMask.setVisible(false);
            zotTopMask.setVisible(false);
            zotPlaced.setDepth(-1);
            zotPlacedFlipped.setDepth(-1);

            zot_objectMask.setVisible(true);
            zot_objectMask.setDepth(1);
            zot_objectMask.setInteractive({ cursor: 'pointer' });

            //objectMask.input.cursor = 'url(assets/input/cursors/pen.cur), pointer';














            //            if (viewWall < 5)
            //                previousWall = viewWall; // don't return to alternate view

            /*            
                        if (currentWall == 5 && flipIt) { // they just clicked the object, show alt view
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
            */
            slots.displayInventoryBar(true);
            slots.inventoryViewSwitch = false;



        } else if ((viewWall != currentWall || updateWall)) {
            console.log('view ' + viewWall)
            this.add.image(0, 0, walls[viewWall]).setOrigin(0, 0);
            

            zotPlacedFlipped.setDepth(-1);
            zotPlaced.setDepth(-1);
            if (viewWall == 0) {
                //zotReflectionShim.setDepth(20002); TODO TRASH THIS DID NOT NEED IT
                if (haveZot)
                    zotPlaced.setDepth(1);

                this.add.image(134, 659, zotState[zotDrawerState]).setOrigin(0, 0);
                
            }
            backFrontButton.setVisible(false);
            topBottomButton.setVisible(false);

            if (viewWall < 4) {
                backFrontButton.setVisible(true); backFrontButton.setDepth(1); backFrontButton.setInteractive({ cursor: 'pointer' });
                topBottomButton.setVisible(true); topBottomButton.setDepth(1); topBottomButton.setInteractive({ cursor: 'pointer' });
            }
            backButton.setVisible(true); backButton.setDepth(1); backButton.setInteractive({ cursor: 'pointer' });


            if (viewWall == 1) {
                if (haveZot)
                    zotPlacedFlipped.setDepth(2);
            }

            if (viewWall == 2) {
                this.add.image(153, 664, zotStateFlipped[zotDrawerState]).setOrigin(0, 0);
            }
            // When looking at the bottom of the box...
            zotTopMask.setVisible(false);
            if (viewWall == 2 || viewWall == 3) {
                zotTopMask.setVisible(true); zotTopMask.setDepth(1); zotTopMask.setInteractive({ cursor: 'pointer' });
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

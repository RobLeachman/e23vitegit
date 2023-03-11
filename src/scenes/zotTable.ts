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

let invBar: Phaser.GameObjects.Sprite;
let backButton: Phaser.GameObjects.Sprite;
let backFrontButton: Phaser.GameObjects.Sprite;
let topBottomButton: Phaser.GameObjects.Sprite;
let batteryMask: Phaser.GameObjects.Sprite;

let zotPlaced: Phaser.GameObjects.Sprite;
let zotPlacedFlipped: Phaser.GameObjects.Sprite;
let zotTopMask: Phaser.GameObjects.Sprite;


let haveZot = false;




let lastKeyDebouncer = "";

var slots: Slots;

export class ZotTable extends Phaser.Scene {
    constructor() {
        super("ZotTable");
    }
    create(data: { fadeIn: boolean, slots: Slots }) {
        slots = data.slots;

        if (data.fadeIn) {
            console.log("ON")
        }
        console.log("zt create")
        //slots.currentMode = "room";        

        backButton = this.add.sprite(300, 875, 'backButton').setOrigin(0, 0);
        backButton.setDepth(20001); // TODO here is better!
        backButton.setVisible(true);
        invBar = this.add.sprite(109, 1075, 'inventory').setOrigin(0, 0);
        invBar.setDepth(100)

        backButton.on('pointerdown', () => {
            console.log("back to " + previousWall);
            if (previousWall == -1) {
                console.log("back to main")
                //this.scene.sendToBack()
                backButton.setVisible(false);

                //this.scene.switch("PlayGame");  // should work!
                backButton.input.cursor = 'default';
                backButton.removeInteractive(); // fix up the cursor displayed on main scene
                this.scene.moveUp("PlayGame");
                this.scene.sleep();
                this.scene.wake("PlayGame");
            }
            if (viewWall > 3) {
                if (previousWall > -1) {
                    viewWall = previousWall;
                    previousWall = -1;
                    updateWall = true;
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


        this.events.on('wake', () => {
            backButton.setInteractive({ cursor: 'pointer' });
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
        //console.log("zt update");

        if (slots.inventoryViewSwitch) {
            slots.currentMode = "item"; // so slots object knows we switched

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

            //leftButton.setVisible(false);
            //rightButton.setVisible(false);
            backFrontButton.setVisible(false);
            topBottomButton.setVisible(false);

            /*
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
            */

            backButton.setVisible(true); backButton.setDepth(20001); backButton.setInteractive({ cursor: 'pointer' });
            //plusButton.setVisible(true); plusButton.setDepth(110); plusButton.setInteractive();            

        } else if ((viewWall != currentWall || updateWall)) {
            console.log('view ' + viewWall)
            let zotTable = this.add.image(0, 0, walls[viewWall]).setOrigin(0, 0);
            zotTable.setDepth(20000);

            if (viewWall == 0) {
                //zotReflectionShim.setDepth(20002);
                if (haveZot)
                    zotPlaced.setDepth(20002);
                else
                    zotPlaced.setDepth(-1);
                const zotDrawer = this.add.image(134, 659, zotState[zotDrawerState]).setOrigin(0, 0);
                zotDrawer.setDepth(20000);
            }
            backFrontButton.setVisible(false);
            topBottomButton.setVisible(false);
            backButton.setVisible(false);

            if (viewWall < 4) {
                backFrontButton.setVisible(true); backFrontButton.setDepth(20001); backFrontButton.setInteractive({ cursor: 'pointer' });
                topBottomButton.setVisible(true); topBottomButton.setDepth(20001); topBottomButton.setInteractive({ cursor: 'pointer' });
                backButton.setVisible(true); backButton.setDepth(20001); backButton.setInteractive({ cursor: 'pointer' });
            }


            if (viewWall == 1) {
                if (haveZot)
                    zotPlacedFlipped.setDepth(20002);
                else
                    zotPlacedFlipped.setDepth(-1);
            }

            if (viewWall == 2) {
                const zotFlipped = this.add.image(153, 664, zotStateFlipped[zotDrawerState]).setOrigin(0, 0);
                zotFlipped.setDepth(20000);
            }
            zotTopMask.setVisible(false);
            if (viewWall == 2 || viewWall == 3) {
                zotTopMask.setVisible(true); zotTopMask.setDepth(20002); zotTopMask.setInteractive({ cursor: 'pointer' });
            }
            batteryMask.setVisible(false);
            if (viewWall > 3)
                batteryMask.setVisible(true); batteryMask.setDepth(20002); batteryMask.setInteractive({ cursor: 'pointer' });



        }



        this.scene.setVisible(true, "BootGame");
        slots.displaySlots(30005);

        currentWall = viewWall;
        updateWall = false;



    }
}

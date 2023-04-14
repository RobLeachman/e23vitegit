import Recorder from "./recorder"
import PlayerUI from '../scenes/playerUI';

let myUI: PlayerUI;

class InvItem {
    scene: Phaser.Scene; // do we need to save this?
    iconSprite: Phaser.GameObjects.Sprite;

    index: number;
    name: string;
    selected: boolean;
    allSlots: Slots;
    recorder: Recorder;

    objView: string; // name of image to display when examined
    altObjView: string; // alternate view image

    constructor(scene: Phaser.Scene,
        index: number,
        allSlots: Slots,
        recorder: Recorder) {

        this.scene = scene;
        //this.iconSprite = this.scene.add.sprite(112 + index * 83, 1078, iconSpriteImage).setOrigin(0, 0);
        this.iconSprite = this.scene.add.sprite(112 + index * 83, 1078, 'atlas', 'icon - empty.png').setOrigin(0, 0);
        if (index > 5) {
            this.iconSprite.setX(112 + (index - 6) * 83)
            this.iconSprite.setY(1161)
        }
        this.iconSprite.on('pointerdown', this.clickIt, this);

        this.index = index;
        this.selected = false;
        this.name = "empty";
        this.allSlots = allSlots;
        this.recorder = recorder;
    }

    clickIt() {
        //console.log(this.name);
        //this.recorder.recordIconClick(this.name, this.scene);

        //console.log("RECORD ICON CLICK!! " + this.name);
        let time = this.scene.time.now;
        this.recorder.recordIconClick(this.name, time, this.scene);
        if (this.name == "fake") {
            //console.log("FAKE")
            this.allSlots.fakeClicks++;
            return;
        }

        let prevItem = -1;
        this.allSlots.slotArray.forEach((icon, idx) => {
            if (icon.selected)
                prevItem = idx;
            icon.selected = false;
            //icon.iconSprite.setDepth(1); // do we need this here? probably not          
        });
        //console.log("click index " + this.index + " previous " + prevItem + " combining:" + this.allSlots.combining);
        if (this.allSlots.combining == "trying") {
            let firstItem;
            let secondItem;
            //console.log(`PREVITEM ${prevItem}`)
            if (prevItem < 0) { // no previous selection
                firstItem = "cannot combine";
                secondItem = "nothing was selected"
            } else {
                firstItem = this.allSlots.slotArray[prevItem].objView;
                secondItem = this.allSlots.slotArray[this.index].objView;
            }

            this.allSlots.combining = "bad combine:";
            //console.log(`try to combine ${firstItem} with ${secondItem}`);
            var good1 = "objDonut"; var good2 = "objPlate"; var goodNew = "objDonutPlated";
            if ((firstItem == good1 && secondItem == good2) ||
                (firstItem == good2 && secondItem == good1)) {
                //console.log("replace " + secondItem + " with " + goodNew)
                this.allSlots.combining = "good combine:" + firstItem + ":" + secondItem + ":" + goodNew;
            }
            if (this.allSlots.combining == "bad combine:") { // if the above combinations aren't the thing
                var good1 = "objKeyA"; var good2 = "objKeyB"; var goodNew = "objKeyWhole";
                if ((firstItem == good1 && secondItem == good2) ||
                    (firstItem == good2 && secondItem == good1)) {
                    this.allSlots.combining = "good combine:" + firstItem + ":" + secondItem + ":" + goodNew;
                }
            }
            if (this.allSlots.combining == "bad combine:") { // if the above combinations aren't the thing
                var good1 = "objRedKeyA"; var good2 = "objRedKeyB"; var goodNew = "objRedKey";
                if ((firstItem == good1 && secondItem == good2) ||
                    (firstItem == good2 && secondItem == good1)) {
                    this.allSlots.combining = "good combine:" + firstItem + ":" + secondItem + ":" + goodNew;
                }
            }
            if (this.allSlots.combining == "bad combine:") { // if the above combinations aren't the thing
                var good1 = "objKnife"; var good2 = "objMelonWhole"; var goodNew = "objMelonHalf";
                if ((firstItem == good1 && secondItem == good2)) {
                    this.allSlots.combining = "good combine:" + firstItem + ":" + secondItem + ":" + goodNew;
                }
            }
            if (this.allSlots.combining == "bad combine:" && secondItem != "nothing was selected") {
                //console.log("failed combine")
                // reselect the item since we turned it off above
                this.allSlots.slotArray[prevItem].selected = true;
            }

        } else {
            // Update selection sprite (top or bottom row) and note this item is selected
            //console.log("Click-Select " + this.name)
            // selectItem duplicates this code TODO fix
            this.allSlots.selectedIcon.x = 112 + this.index * 83;
            this.allSlots.selectedIcon.setY(1078);
            if (this.index > 5) {
                this.allSlots.selectedIcon.setX(112 + (this.index - 6) * 83);
                this.allSlots.selectedIcon.setY(1161);
            }
            this.selected = true;
            this.allSlots.selectedIndex = this.index;
            myUI.setEyeTexture('eyeHint'); // add a little reminder hint flair
        }
    }
}

export default class Slots {
    //slotArray: [];
    slotArray: InvItem[] = [];

    inventoryViewSwitch: boolean;
    inventoryViewObj: string;
    inventoryViewAlt: string;
    otherViewObj: string;
    selectedIcon: Phaser.GameObjects.Sprite;
    selected: boolean;
    objView: string;
    altObjView: string;
    index: number;
    selectedIndex: number;
    recorder: Recorder;
    fakeClicks: number = 0;
    combining: string = "";

    hasInspected = false;

    hasSearched = false;
    hasCombined = false;
    scene: Phaser.Scene;
    activeScene: string;

    eyeButtonOn: Phaser.GameObjects.Image;

    // Construct with the active scene, the name of the empty sprite (for testing), and the select boxes 
    constructor(scene: Phaser.Scene,
        selectSprite: Phaser.GameObjects.Sprite,
        recorder: Recorder) {

        this.selectedIcon = selectSprite;
        this.recorder = recorder;

        this.scene = scene;
        myUI = scene.scene.get("PlayerUI") as PlayerUI;

        for (var i = 0; i < 12; i++) {
            let slotItem = new InvItem(scene, i, this, this.recorder); // empty sprite image, or select
            this.slotArray.push(slotItem);
        }
    }

    displaySlots() {
        this.slotArray.forEach((icon) => {
            //console.log(icon.iconSprite.name)
            //icon.iconSprite.setDepth(1); //Test! This doesn't seem to be needed
            icon.iconSprite.setVisible(true);
        });
    }

    hideSlots() {
        this.slotArray.forEach((icon) => {
            //console.log(icon.iconSprite.name)
            //icon.iconSprite.setDepth(1); //Test! This doesn't seem to be needed
            icon.iconSprite.setVisible(false);
        });
    }

    // Recorder uses this to click an icon
    recordedClickIt(iconName: string) {
        //console.log("DO ICON CLICK " + iconName);
        //console.log(this);
        //console.log(this.slotArray[1].iconSprite);
        let clickIndex = -1;
        // @ts-ignore
        // TODO how to just use idx without icon?
        this.slotArray.forEach((icon, idx) => {
            //console.log("  iconsArray " + icon);
            //console.log(icon);
            //if ((this.slotArray[idx].iconSprite as Phaser.GameObjects.Sprite).texture.key == iconName)
            if (this.slotArray[idx].name == iconName)
                clickIndex = idx;
        });
        this.slotArray[clickIndex].iconSprite.emit('pointerdown'); // selects the icon at position
    }

    addIcon(iconSpriteName: string, objectView: string, altObjectView: string, sound?: boolean, spot?: number) {
        //console.log(`Adding icon ${iconSpriteName} ${objectView} ${altObjectView}`)
        if (iconSpriteName == undefined)
            console.log("ERROR undefined icon add")
        // show the clue on the first actual item icon, not the empty fakes
        // only show it the first time
        if (objectView != "fake" && objectView != "objRoach" && !this.hasInspected) {
            myUI.showInspectClue();
        }
        let i = -1;
        this.slotArray.forEach((icon, idx) => {
            if (i == -1 && (icon.iconSprite.name.length == 0)) {
                i = idx;
                //break;
            }
        });
        if (spot !== undefined) {
            //console.log(`Adding icon ${iconSpriteName} to slot ${spot}`)
            i = spot;
        } else
            //console.log(`Adding icon ${iconSpriteName} to free slot`)

            // TODO: throw an exception if not found

            this.slotArray[i].iconSprite.destroy();
        this.slotArray[i].iconSprite =
            this.scene.add.sprite(112 + i * 83, 1078, 'atlas', iconSpriteName).setOrigin(0, 0).setDepth(1);
        if (i > 5) {
            this.slotArray[i].iconSprite.setX(112 + (i - 6) * 83)
            this.slotArray[i].iconSprite.setY(1161)
        }
        this.slotArray[i].iconSprite.name = objectView;
        this.slotArray[i].index = i;
        this.slotArray[i].name = objectView;
        this.slotArray[i].selected = false;
        this.slotArray[i].iconSprite.setInteractive({ cursor: 'pointer' });
        //this.slotArray[i].iconSprite.setDepth(200);
        this.slotArray[i].iconSprite.on('pointerdown', this.slotArray[i].clickIt, this.slotArray[i]);
        this.slotArray[i].objView = objectView;
        this.slotArray[i].altObjView = altObjectView;

        if (sound)
            this.scene.sound.play('sfx', { name: 'niceTone', start: 7, duration: 1 });
    }

    clearSelect() {
        this.selectedIcon.setX(1000);
        this.slotArray.forEach((icon) => {
            icon.selected = false;
        });
    }

    selectItem(objName: string) {
        // Find the selected item
        //console.log("select item: " + objName)
        let k = -1;
        for (k = 0; k < 12; k++) {
            if (this.slotArray[k].iconSprite.name == objName) {
                break;
            }
        }
        if (k == 12)
            return -1;
        this.selectedIcon.setX(112 + k * 83);
        this.selectedIcon.setY(1078);
        if (k > 5) {
            this.selectedIcon.setX(112 + (k - 6) * 83)
            this.selectedIcon.setY(1161)
        }
        this.slotArray[k].selected = true;
        this.selectedIndex = k;
        return this.selectedIndex;
    }


    getSelected() {
        let thing = "";
        let objView;
        let objViewAlt;
        this.slotArray.forEach((icon) => {
            if (icon.selected) {
                thing = icon.name;
                objView = icon.objView;
                objViewAlt = icon.altObjView;

            }
        });
        return { thing, objView, objViewAlt };
    }

    getSelectedIndex() {
        return this.selectedIndex;
    }

    viewSelected() {
        this.hasInspected = true;
        let objView: string = "";
        let objViewAlt: string = "";

        this.slotArray.forEach((icon) => {
            if (icon.selected) {
                objView = icon.objView;
                objViewAlt = icon.altObjView;

            }
        });

        return {
            objectView: objView,
            objectViewAlt: objViewAlt
        }
    }

    clearItem(objName: string) {
        var clearSlot = -1;
        this.slotArray.forEach((icon, idx) => {
            if (icon.name == objName) {
                clearSlot = idx;
            }
        });

        if (clearSlot > -1) {
            this.slotArray[clearSlot].iconSprite.destroy();
            const clearedSprite = this.scene.add.sprite(1000, 1078, 'atlas', 'icon - empty.png').setOrigin(0, 0);
            if (clearSlot > 5) {
                clearedSprite.setX(112 + (clearSlot - 6) * 83)
                clearedSprite.setY(1161)
            }
            clearedSprite.name == "empty"; // TODO ends up to be blank string?!
            this.slotArray[clearSlot].iconSprite = clearedSprite;
        } else {
            throw new Error('Clear item not found ' + objName); //TODO untested
        }
        return clearSlot;
    }

    clearAll() {
        this.slotArray.forEach((icon) => {
            icon.iconSprite.destroy();
        });
        this.selectedIcon.setX(1000);
    }
} 
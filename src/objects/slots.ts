import Recorder from "./recorder"

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
        iconSpriteImage: string,
        allSlots: Slots,
        recorder: Recorder) {

        this.scene = scene;
        this.iconSprite = this.scene.add.sprite(112 + index * 83, 1078, iconSpriteImage).setOrigin(0, 0);
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
        //console.log(this);
        //console.log(this.name);
        //console.log((this.iconSprite as Phaser.GameObjects.Sprite).texture.key)
        //this.recorder.recordIconClick(this.name, this.scene);

        //console.log("ICON CLICK!! " + this.name);
        this.recorder.recordIconClick((this.iconSprite as Phaser.GameObjects.Sprite).texture.key, this.scene);
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
            icon.iconSprite.setDepth(1); // do we need this here? probably not          
        });
        //console.log("click index " + this.index + " previous " + prevItem + " combining:" + this.allSlots.combining);
        if (this.allSlots.combining == "trying") {
            let firstItem = this.allSlots.slotArray[prevItem].objView;
            let secondItem = this.allSlots.slotArray[this.index].objView;

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
                var good1 = "objKnife"; var good2 = "objMelonWhole"; var goodNew = "objMelonHalf";
                if ((firstItem == good1 && secondItem == good2)) {
                    this.allSlots.combining = "good combine:" + firstItem + ":" + secondItem + ":" + goodNew;
                }
            }
            if (this.allSlots.combining == "bad combine:") {
                //console.log("failed combine")
                // reselect the item since we turned it off above
                this.allSlots.slotArray[prevItem].selected = true;
            }


        } else {
            this.selected = true;
            // mark this selected icon
            this.allSlots.selectedIcon.x = 112 + this.index * 83;
            this.allSlots.selectedIcon.setY(1078)
            this.allSlots.selectedIcon.setDepth(1); // ??
            if (this.index > 5) {
                this.allSlots.selectedIcon.setX(112 + (this.index - 6) * 83)
                this.allSlots.selectedIcon.setY(1161)
            }

            // When selected icon is clicked again we need to switch view modes from room to item.
            // When in item view mode if another icon is clicked switch to that item
            if (prevItem == this.index || this.allSlots.currentMode == "item") {
                this.allSlots.inventoryViewSwitch = true;
                this.allSlots.inventoryViewObj = this.objView;
                this.allSlots.inventoryViewAlt = this.altObjView;
            }
        }
    }
}

export default class Slots {
    //slotArray: [];
    slotArray: InvItem[] = [];

    emptySprite: string;
    inventoryViewSwitch: boolean;
    inventoryViewObj: string;
    inventoryViewAlt: string;
    otherViewObj: string;
    selectedIcon: Phaser.GameObjects.Sprite;
    selectedSecondIcon: Phaser.GameObjects.Sprite;
    selected: boolean;
    objView: string;
    altObjView: string;
    index: number;
    currentMode: string;
    recorder: Recorder;
    fakeClicks: number = 0;
    combining: string = "";
    invBar: Phaser.GameObjects.Sprite;

    // Construct with the active scene, the name of the empty sprite (for testing), and the select boxes 
    constructor(scene: Phaser.Scene,
        slotIconSprite: string,
        selectSprite: string,
        selectSecond: string,
        recorder: Recorder,
        invBar: Phaser.GameObjects.Sprite) {

        this.emptySprite = slotIconSprite;
        this.selectedIcon = scene.add.sprite(1000, 1078, selectSprite).setOrigin(0, 0); //??
        this.selectedSecondIcon = scene.add.sprite(1000, 1078, selectSecond).setOrigin(0, 0); //TODO remove second, it is stupid
        this.recorder = recorder;
        this.invBar = invBar;

        for (var i = 0; i < 12; i++) {
            let slotItem = new InvItem(scene, i, slotIconSprite, this, this.recorder); // empty sprite image, or select
            this.slotArray.push(slotItem);


        }
        this.currentMode = "room"; // TODO is this even needed? 
    }

    displayInventoryBar(showBar: boolean) {
        if (showBar)
            this.invBar.setVisible(true)
        else
            this.invBar.setVisible(false)
    }

    displaySlots(depth: number) {
        this.slotArray.forEach((icon) => {
            //console.log(icon.iconSprite.name)
            icon.iconSprite.setDepth(depth);
            icon.iconSprite.setVisible(true);
        });
    }
    //recorder will use this:
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
            if ((this.slotArray[idx].iconSprite as Phaser.GameObjects.Sprite).texture.key == iconName)
                clickIndex = idx;
        });
        this.slotArray[clickIndex].iconSprite.emit('pointerdown'); // selects the icon at position
    }

    addIcon(scene: Phaser.Scene, iconSpriteName: string, objectView: string, altObjectView: string, spot?: number) {
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
            scene.add.sprite(112 + i * 83, 1078, iconSpriteName).setOrigin(0, 0);
        if (i > 5) {
            this.slotArray[i].iconSprite.setX(112 + (i - 6) * 83)
            this.slotArray[i].iconSprite.setY(1161)
        }
        this.slotArray[i].iconSprite.name = objectView;
        this.slotArray[i].index = i;
        this.slotArray[i].name = objectView;
        this.slotArray[i].selected = false;
        this.slotArray[i].iconSprite.setInteractive();
        this.slotArray[i].iconSprite.setDepth(200);
        this.slotArray[i].iconSprite.on('pointerdown', this.slotArray[i].clickIt, this.slotArray[i]);
        this.slotArray[i].objView = objectView;
        this.slotArray[i].altObjView = altObjectView;
    }


    clearSelect() {
        this.selectedIcon.setX(1000);
    }

    selectItem(objName: string) {
        // Find the selected item
        var k = -1;
        for (k = 0; k < 12; k++) {
            if (this.slotArray[k].iconSprite.name == objName) {
                break;
            }
        }
        this.selectedIcon.setX(112 + k * 83);
        if (k > 5) {
            this.selectedIcon.setX(112 + (k - 6) * 83)
            this.selectedIcon.setY(1161)
        }
        this.slotArray[k].selected = true;
        //console.log("selected item=" + k)
        return k;
    }


    getSelected() {
        let selectedThing = "";
        this.slotArray.forEach((icon) => {
            if (icon.selected) {
                selectedThing = icon.name;
            }
        });
        return selectedThing;
    }

    clearItem(scene: Phaser.Scene, objName: string) {
        var clearSlot = -1;
        this.slotArray.forEach((icon, idx) => {
            if (icon.name == objName) {
                clearSlot = idx;
            }
        });

        if (clearSlot > -1) {
            this.slotArray[clearSlot].iconSprite.destroy();
            var clearedSprite = scene.add.sprite(1000, 1078, this.emptySprite);
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
    // @ts-ignore
    // TODO we don't need scene here!!
    clearAll(scene: Phaser.Scene) {
        this.slotArray.forEach((icon) => {
            icon.iconSprite.destroy();
        });
        this.selectedIcon.setX(1000);
        this.selectedSecondIcon.setX(1000);
    }
} 
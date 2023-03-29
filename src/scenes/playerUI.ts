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

var plusButton: Phaser.GameObjects.Sprite;
var plusModeButton: Phaser.GameObjects.Sprite;

/*
viewportPointerClick = this.add.sprite(1000, 0, 'atlas', 'pointerClicked.png');
viewportPointer = this.add.sprite(1000, 0, 'atlas', 'pointer.png').setOrigin(0, 0);

const iconSelected = this.add.sprite(1000, 1078, 'atlas', "icon - selected.png").setOrigin(0, 0);
*/

var slots: Slots;
var recorder: Recorder;

export default class PlayerUI extends Phaser.Scene {
    activeSceneName: string;

    constructor() {
        super("PlayerUI");
    }

    setActiveScene(activeSceneName: string) {
        this.activeSceneName = activeSceneName;
    }

    getActiveScene() {
        return this.activeSceneName;
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
    getIconSelected() {
        return iconSelected;
    }
    getFailed() {
        return failed;
    }
    getPlusButton() {
        return plusButton;
    }
    getPlusModeButton() {
        return plusModeButton;
    }

    getRecorder() {
        return recorder;
    }

    getSlots() {
        return slots;
    }

    // Must preload initial UI sprites -- for the stuff done in BootGame TODO goal is nothing like this
    preload() {
        //console.log("playerUI preload")
        this.load.atlas('atlas', 'assets/graphics/texture.png', 'assets/graphics/texture.json');
        //this.load.atlas('uiatlas', 'assets/graphics/texture.png', 'assets/graphics/texture.json');
    }

    create() {
        //console.log("UI shit goes here")
        invBar = this.add.sprite(109, 1075, 'atlas', 'inventory cells.png').setOrigin(0, 0).setVisible(false);
        interfaceClueFull = this.add.sprite(485, 774, 'atlas', 'interfaceClueSearch.png').setOrigin(0, 0).setVisible(false);
        interfaceClueCombine = this.add.sprite(17, 305, 'atlas', 'interfaceClueCombine.png').setOrigin(0, 0).setVisible(false);
        viewportPointerClick = this.add.sprite(1000, 0, 'atlas', 'pointerClicked.png');
        viewportPointer = this.add.sprite(1000, 0, 'atlas', 'pointer.png').setOrigin(0, 0);
        iconSelected = this.add.sprite(1000, 1078, 'atlas', "icon - selected.png").setOrigin(0, 0);
        failed = this.add.sprite(1000, 950, 'atlas', 'fail.png'); // 640 is displayed
        //interfaceInspect = this.add.sprite(5, 1070, 'atlas', 'interfaceInspect.png').setOrigin(0, 0).setVisible(false);\

        recorder = new Recorder(viewportPointer, viewportPointerClick);
        slots = new Slots(this, iconSelected, recorder);
        
        plusButton = this.add.sprite(80, 950, 'atlas', 'plus - unselected.png').setName("plusButton");
        plusModeButton = this.add.sprite(80, 950, 'atlas', 'plus - selected.png').setName("plusModeButton");
        recorder.addMaskSprite('plusButton', plusButton);
        recorder.addMaskSprite('plusModeButton', plusModeButton);
        plusButton.setVisible(false);
        plusModeButton.setVisible(false);

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



        this.scene.launch("BootGame")
    }

    update() {
        //console.log("UI update")
        //scene.registry.set('replayObject', "zotBackButton:ZotTable");
        //this.add.sprite(109, 1075, 'atlas', 'inventory cells.png').setOrigin(0, 0); //.setVisible(false);        
    }
}

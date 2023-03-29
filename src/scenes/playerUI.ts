import 'phaser';

var invBar: Phaser.GameObjects.Sprite;

export default class PlayerUI extends Phaser.Scene {
    activeSceneName: string;

    constructor() {
        super("PlayerUI");
    }

    setActiveScene(activeSceneName:string) {
        this.activeSceneName = activeSceneName;
    }

    getActiveScene() {
        return this.activeSceneName;
    }

    getFourGraphicPrefix () {
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

    preload() {
        //console.log("playerUI preload")
        this.load.atlas('atlas', 'assets/graphics/texture.png', 'assets/graphics/texture.json');
        //this.load.atlas('uiatlas', 'assets/graphics/texture.png', 'assets/graphics/texture.json');


    }

    create() {
        //console.log("UI shit goes here")
        invBar = this.add.sprite(109, 1075, 'atlas', 'inventory cells.png').setOrigin(0, 0).setVisible(false);

        this.scene.launch("BootGame")
        
    }

    update() {
        //console.log("UI update")
        //scene.registry.set('replayObject', "zotBackButton:ZotTable");
        //this.add.sprite(109, 1075, 'atlas', 'inventory cells.png').setOrigin(0, 0); //.setVisible(false);        
    }
}

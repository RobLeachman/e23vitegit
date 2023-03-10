/* global Phaser */
import { assetsDPR } from '../index';

export class BootGame extends Phaser.Scene{
    constructor(){
        super("BootGame");
    }
    preload(){
        console.log("BOOT")
        //   This one didn't exist... must have been testing PDW
        //this.load.image("bossScreen", "assets/boss.png");

        var fontSize = 16*assetsDPR;
        //this.add.text(10, 10, "Loading...", { font: `${fontSize}px Verdana`, fill: '#00ff00' });
        this.add.text(10, 10, "Loading...", { font: `${fontSize}px Verdana`});

/* load Escape assets here like we did with PDW        
        this.load.multiatlas("bigBackground", `assets/graphics/pdw1A@${assetsDPR}.json`, "assets/graphics");

        this.load.bitmapFont('gameplay-black', 'assets/fonts/gameplay-1987-black.png', 'assets/fonts/gameplay-1987-bw.fnt');
        this.load.bitmapFont('gameplay-white', 'assets/fonts/gameplay-1987-white.png', 'assets/fonts/gameplay-1987-bw.fnt');

        this.load.bitmapFont('xolonium-black', 'assets/fonts/Xolonium-Regular-Black-72.png', 'assets/fonts/Xolonium-Regular-Black-72.fnt');
        this.load.bitmapFont('xolonium-white', 'assets/fonts/Xolonium-Regular-White-72.png', 'assets/fonts/Xolonium-Regular-White-72.fnt');

        this.load.audio('testNoise', 'assets/sound/41525__Jamius__BigLaser_trimmed.wav');
*/        
        //this.add.text(10, 90, "OK! Click to continue...", { font: `${fontSize}px Verdana`, fill: '#00ff00' });
        this.add.text(10, 90, "OK! Click to continue...", { font: `${fontSize}px Verdana`});
    }

    create() {
        console.log("boot create")
        if (false)
            this.scene.start("TestScene");
        else {
            if (true) {
                this.input.on("pointerup", this.handleClick, this);
            } else {
                this.scene.start("PlayGame", { mobile: false })
            }
            //console.log("start recorder...");
            //this.scene.start("Recorder");
        }
    }

    handleClick() {
        console.log("click to start!!!!!!")
        var pointer = this.input.activePointer;
        if (pointer.wasTouch) {
           console.log("TOUCH")
           this.scene.start("PlayGame", { mobile: true })
        }
        else {
           console.log("CLICK");
           this.scene.start("PlayGame", { mobile: false })
        }
        /*
        if (0)
            this.scene.start("TestScene");
        else {
            this.scene.start("PlayGame");
        }
        */
    }
}
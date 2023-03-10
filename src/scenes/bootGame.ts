/* global Phaser */
//import { assetsDPR } from '../index';

export class BootGame extends Phaser.Scene{
    constructor(){
        super("BootGame");
    }
    preload(){
        //console.log("BOOT")


        //   This one didn't exist... must have been testing PDW
        //this.load.image("bossScreen", "assets/boss.png");

        //var fontSize = 16*assetsDPR;
        //this.add.text(10, 10, "Loading...", { font: `${fontSize}px Verdana`, fill: '#00ff00' });
        //this.add.text(10, 10, "Loading...", { font: `${fontSize}px Verdana`});

/* Will need sprite atlas at some point        
        this.load.multiatlas("bigBackground", `assets/graphics/pdw1A@${assetsDPR}.json`, "assets/graphics");

        this.load.bitmapFont('gameplay-black', 'assets/fonts/gameplay-1987-black.png', 'assets/fonts/gameplay-1987-bw.fnt');
        this.load.bitmapFont('gameplay-white', 'assets/fonts/gameplay-1987-white.png', 'assets/fonts/gameplay-1987-bw.fnt');

        this.load.bitmapFont('xolonium-black', 'assets/fonts/Xolonium-Regular-Black-72.png', 'assets/fonts/Xolonium-Regular-Black-72.fnt');
        this.load.bitmapFont('xolonium-white', 'assets/fonts/Xolonium-Regular-White-72.png', 'assets/fonts/Xolonium-Regular-White-72.fnt');

        this.load.audio('testNoise', 'assets/sound/41525__Jamius__BigLaser_trimmed.wav');
*/        
        //this.add.text(10, 90, "OK! Click to continue...", { font: `${fontSize}px Verdana`, fill: '#00ff00' });

        // used XnConvert to switch to webp, nice!
        this.load.image('myViewport', 'assets/backgrounds/viewport.webp');

        this.load.image('wall1', 'assets/backgrounds/invroom - room - empty.webp');
        this.load.image('wall2', 'assets/backgrounds/invroom - room - west.webp');
        this.load.image('wall3', 'assets/backgrounds/invroom - room - south.webp');
        this.load.image('wall4', 'assets/backgrounds/invroom - room - east.webp');
        this.load.image('wallUnlocked', 'assets/backgrounds/invroom - room - unlocked.webp');
        this.load.image('wallWinner', 'assets/backgrounds/invroom - room - winner.webp');
        this.load.image('wallHint', 'assets/backgrounds/invroom - help1 - background.webp');

        this.load.image('objDonut', 'assets/backgrounds/invroom - obj - donut.webp');
        this.load.image('objPlate', 'assets/backgrounds/invroom - obj - plate.webp');
        this.load.image('objKeyA', 'assets/backgrounds/invroom - obj - keyA.webp');
        this.load.image('objKeyB', 'assets/backgrounds/invroom - obj - keyB.webp');
        this.load.image('objKeyWhole', 'assets/backgrounds/invroom - obj - keyWhole.webp');
        this.load.image('objDonutPlated', 'assets/backgrounds/invroom - obj - donutPlated.webp');
        this.load.image('objRoach', 'assets/backgrounds/invroom - obj - roach.webp');

        this.load.image('objMelonWhole', 'assets/backgrounds/invroom - obj - battery.webp');
        this.load.image('objMelonHalf', 'assets/backgrounds/invroom - obj - melonhalf.webp');
        this.load.image('objKnife', 'assets/backgrounds/invroom - obj - zot.webp');

        this.load.image('altobjDonut', 'assets/backgrounds/invroom - altobj - donut.webp');
        this.load.image('altobjPlateKey', 'assets/backgrounds/invroom - altobj - plate key.webp');
        this.load.image('altobjKeyA', 'assets/backgrounds/invroom - altobj - keyA.webp');
        this.load.image('altobjKeyB', 'assets/backgrounds/invroom - altobj - keyB.webp');
        this.load.image('altobjKeyWhole', 'assets/backgrounds/invroom - altobj - keyWhole.webp');
        this.load.image('altobjDonutPlated', 'assets/backgrounds/invroom - altobj - donutPlated.webp');
        this.load.image('altobjRoach', 'assets/backgrounds/invroom - altobj - roach.webp');
        this.load.image('altobjPlateEmpty', 'assets/backgrounds/invroom - altobj - plate empty.webp');

        this.load.image('altobjMelonWhole', 'assets/backgrounds/invroom - altobj - battery.webp');
        this.load.image('altobjMelonHalf', 'assets/backgrounds/invroom - altobj - melonhalf.webp');
        this.load.image('altobjKnife', 'assets/backgrounds/invroom - altobj - zot.webp');

        this.load.image('interfaceClue', 'assets/backgrounds/invroom - interface.webp');
        this.load.image('interfaceCombine', 'assets/backgrounds/invroom - interface - combine.webp');
        this.load.image('table', 'assets/backgrounds/invroom - table - empty.webp');
    
        this.load.image('clckrLoc', 'assets/sprites/pointer.webp');
        this.load.image('clckrClk', 'assets/sprites/pointerClicked.webp');

        this.load.image('right', 'assets/sprites/arrowRight.webp');
        this.load.image('left', 'assets/sprites/arrowLeft.webp');
        this.load.image('down', 'assets/sprites/arrowDown.webp');
        this.load.image('plusButton', 'assets/sprites/plus - unselected.webp');
        this.load.image('plusModeButton', 'assets/sprites/plus - selected.webp');
        this.load.image('fail', 'assets/sprites/fail.webp');
        this.load.image('winnerDonut', 'assets/sprites/winner donutPlated.webp');

        this.load.image('inventory', 'assets/sprites/inventory cells.webp');

        this.load.image('iconEmpty', 'assets/sprites/icon - empty.webp');
        this.load.image('iconSelected', 'assets/sprites/icon - selected.webp');
        this.load.image('iconSelectedSecond', 'assets/sprites/icon - selectedSecond.webp');

        this.load.image('iconDonut', 'assets/sprites/icon - donut.webp');
        this.load.image('iconPlate', 'assets/sprites/icon - plate.webp');
        this.load.image('iconKeyA', 'assets/sprites/icon - keyA.webp');
        this.load.image('iconKeyB', 'assets/sprites/icon - keyB.webp');
        this.load.image('iconKeyWhole', 'assets/sprites/icon - keyWhole.webp');
        this.load.image('iconDonutPlated', 'assets/sprites/icon - donutPlated.webp');
        this.load.image('iconRoach', 'assets/sprites/icon - roach.webp');
        this.load.image('iconFake', 'assets/sprites/icon - empty.webp');

        this.load.image('iconMelonWhole', 'assets/sprites/iconBattery.webp');
        this.load.image('iconMelonHalf', 'assets/sprites/icon - melonHalf.webp');
        this.load.image('iconKnife', 'assets/sprites/iconZot.webp');

        this.load.image('tableDonut', 'assets/sprites/tableDonut.webp');
        this.load.image('tablePlate', 'assets/sprites/tablePlate.webp');
        this.load.image('tableKey', 'assets/sprites/tableKey.webp');
        this.load.image('tableEmpty', 'assets/sprites/tableEmpty.webp');

        this.load.image('melonShown', 'assets/sprites/southMelon.webp');
        this.load.image('melonPicked', 'assets/sprites/southMelonPicked.webp');
        this.load.image('knifeShown', 'assets/sprites/southKnife.webp');
        this.load.image('knifePicked', 'assets/sprites/southKnifePicked.webp');

        this.load.image('closeDonut', 'assets/sprites/closeDonut.webp');
        this.load.image('closePlate', 'assets/sprites/closePlate.webp');
        this.load.image('closeKey', 'assets/sprites/closeKey.webp');
        this.load.image('closeEmpty', 'assets/sprites/closeEmpty.webp');

        this.load.image('tableMask', 'assets/sprites/tableMask.webp');
        this.load.image('takeMask', 'assets/sprites/takeMask.webp');
        this.load.image('objectMask', 'assets/sprites/object-maskB.webp');
        this.load.image('keyMask', 'assets/sprites/keyMask.webp');
        this.load.image('doorMask', 'assets/sprites/doorMask.webp');
        this.load.image('hintMask', 'assets/sprites/hintMask.webp');

        this.load.image('melonMask', 'assets/sprites/melonMask.webp');
        this.load.image('knifeMask', 'assets/sprites/knifeMask.webp');

        // preload pacifier https://gamedevacademy.org/creating-a-preloading-screen-in-phaser-3/
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;

        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        progressBox.fillStyle(0x333333, 0.8);
        progressBox.fillRect(width/2-10-160, height / 2 - 60, 320, 50);        

        var loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 80,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                //fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);
        var percentText = this.make.text({
            x: width / 2,
            y: height / 2-36,
            text: '0%',
            style: {
                font: '18px monospace',
                //fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);        

        //this.add.text(10, 90, "OK! Click to continue...", { font: `${fontSize}px Verdana`});
        var loadDone = this.make.text({
            x: 50,
            y: 50,
            text: 'Click to start',
            style: {
                font: '20px Verdana',
                //fill: '#ffffff'
            }
        });
        loadDone.setX(1000);
        

        this.load.on('progress', function (value:number) {
            
            var myParseIntValue;
            // @ts-ignore
            myParseIntValue = parseInt(value*100,10)
            percentText.setText(myParseIntValue + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width/2-160, height / 2 - 50, 300 * value, 30);
        });
                    
        this.load.on('fileprogress', function () {
            //console.log(file.src);
        });
        this.load.on('complete', function () {
            //console.log('complete');
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy(); 
            percentText.destroy(); 
            loadDone.setX(50);
            
            
            
        });

        
    }

    create() {
        //console.log("boot create")
        if (true)
            this.scene.start("PlayGame");
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
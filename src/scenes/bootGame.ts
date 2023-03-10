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

/* load Escape assets here like we did with PDW        
        this.load.multiatlas("bigBackground", `assets/graphics/pdw1A@${assetsDPR}.json`, "assets/graphics");

        this.load.bitmapFont('gameplay-black', 'assets/fonts/gameplay-1987-black.png', 'assets/fonts/gameplay-1987-bw.fnt');
        this.load.bitmapFont('gameplay-white', 'assets/fonts/gameplay-1987-white.png', 'assets/fonts/gameplay-1987-bw.fnt');

        this.load.bitmapFont('xolonium-black', 'assets/fonts/Xolonium-Regular-Black-72.png', 'assets/fonts/Xolonium-Regular-Black-72.fnt');
        this.load.bitmapFont('xolonium-white', 'assets/fonts/Xolonium-Regular-White-72.png', 'assets/fonts/Xolonium-Regular-White-72.fnt');

        this.load.audio('testNoise', 'assets/sound/41525__Jamius__BigLaser_trimmed.wav');
*/        
        //this.add.text(10, 90, "OK! Click to continue...", { font: `${fontSize}px Verdana`, fill: '#00ff00' });

        this.load.image('myViewport', 'assets/backgrounds/viewport.png');
        this.load.image('clckrLoc', 'assets/sprites/pointer.png');
        this.load.image('clckrClk', 'assets/sprites/pointerClicked.png');

        this.load.image('wall1', 'assets/backgrounds/invroom - room - empty.png');
        this.load.image('wall2', 'assets/backgrounds/invroom - room - west.png');
        this.load.image('wall3', 'assets/backgrounds/invroom - room - south.png');
        this.load.image('wall4', 'assets/backgrounds/invroom - room - east.png');
        this.load.image('wallUnlocked', 'assets/backgrounds/invroom - room - unlocked.png');
        this.load.image('wallWinner', 'assets/backgrounds/invroom - room - winner.png');
        this.load.image('wallHint', 'assets/backgrounds/invroom - help1 - background.png');

        this.load.image('right', 'assets/sprites/arrowRight.png');
        this.load.image('left', 'assets/sprites/arrowLeft.png');
        this.load.image('down', 'assets/sprites/arrowDown.png');
        this.load.image('plusButton', 'assets/sprites/plus - unselected.png');
        this.load.image('plusModeButton', 'assets/sprites/plus - selected.png');
        this.load.image('fail', 'assets/sprites/fail.png');
        this.load.image('winnerDonut', 'assets/sprites/winner donutPlated.png');

        this.load.image('inventory', 'assets/sprites/inventory cells.png');

        this.load.image('iconEmpty', 'assets/sprites/icon - empty.png');
        this.load.image('iconSelected', 'assets/sprites/icon - selected.png');
        this.load.image('iconSelectedSecond', 'assets/sprites/icon - selectedSecond.png');

        this.load.image('iconDonut', 'assets/sprites/icon - donut.png');
        this.load.image('iconPlate', 'assets/sprites/icon - plate.png');
        this.load.image('iconKeyA', 'assets/sprites/icon - keyA.png');
        this.load.image('iconKeyB', 'assets/sprites/icon - keyB.png');
        this.load.image('iconKeyWhole', 'assets/sprites/icon - keyWhole.png');
        this.load.image('iconDonutPlated', 'assets/sprites/icon - donutPlated.png');
        this.load.image('iconRoach', 'assets/sprites/icon - roach.png');
        this.load.image('iconFake', 'assets/sprites/icon - empty.png');

        this.load.image('iconMelonWhole', 'assets/sprites/icon - melonWhole.png');
        this.load.image('iconMelonHalf', 'assets/sprites/icon - melonHalf.png');
        this.load.image('iconKnife', 'assets/sprites/icon - knife.png');

        this.load.image('objDonut', 'assets/backgrounds/invroom - obj - donut.png');
        this.load.image('objPlate', 'assets/backgrounds/invroom - obj - plate.png');
        this.load.image('objKeyA', 'assets/backgrounds/invroom - obj - keyA.png');
        this.load.image('objKeyB', 'assets/backgrounds/invroom - obj - keyB.png');
        this.load.image('objKeyWhole', 'assets/backgrounds/invroom - obj - keyWhole.png');
        this.load.image('objDonutPlated', 'assets/backgrounds/invroom - obj - donutPlated.png');
        this.load.image('objRoach', 'assets/backgrounds/invroom - obj - roach.png');

        this.load.image('objMelonWhole', 'assets/backgrounds/invroom - obj - melonwhole.png');
        this.load.image('objMelonHalf', 'assets/backgrounds/invroom - obj - melonhalf.png');
        this.load.image('objKnife', 'assets/backgrounds/invroom - obj - knife.png');

        this.load.image('altobjDonut', 'assets/backgrounds/invroom - altobj - donut.png');
        this.load.image('altobjPlateKey', 'assets/backgrounds/invroom - altobj - plate key.png');
        this.load.image('altobjKeyA', 'assets/backgrounds/invroom - altobj - keyA.png');
        this.load.image('altobjKeyB', 'assets/backgrounds/invroom - altobj - keyB.png');
        this.load.image('altobjKeyWhole', 'assets/backgrounds/invroom - altobj - keyWhole.png');
        this.load.image('altobjDonutPlated', 'assets/backgrounds/invroom - altobj - donutPlated.png');
        this.load.image('altobjRoach', 'assets/backgrounds/invroom - altobj - roach.png');
        this.load.image('altobjPlateEmpty', 'assets/backgrounds/invroom - altobj - plate empty.png');

        this.load.image('altobjMelonWhole', 'assets/backgrounds/invroom - altobj - melonwhole.png');
        this.load.image('altobjMelonHalf', 'assets/backgrounds/invroom - altobj - melonhalf.png');
        this.load.image('altobjKnife', 'assets/backgrounds/invroom - altobj - knife.png');

        this.load.image('interfaceClue', 'assets/backgrounds/invroom - interface.png');
        this.load.image('interfaceCombine', 'assets/backgrounds/invroom - interface - combine.png');

        this.load.image('table', 'assets/backgrounds/invroom - table - empty.png');
        this.load.image('tableDonut', 'assets/sprites/tableDonut.png');
        this.load.image('tablePlate', 'assets/sprites/tablePlate.png');
        this.load.image('tableKey', 'assets/sprites/tableKey.png');
        this.load.image('tableEmpty', 'assets/sprites/tableEmpty.png');

        this.load.image('melonShown', 'assets/sprites/southMelon.png');
        this.load.image('melonPicked', 'assets/sprites/southMelonPicked.png');
        this.load.image('knifeShown', 'assets/sprites/southKnife.png');
        this.load.image('knifePicked', 'assets/sprites/southKnifePicked.png');

        this.load.image('closeDonut', 'assets/sprites/closeDonut.png');
        this.load.image('closePlate', 'assets/sprites/closePlate.png');
        this.load.image('closeKey', 'assets/sprites/closeKey.png');
        this.load.image('closeEmpty', 'assets/sprites/closeEmpty.png');

        this.load.image('tableMask', 'assets/sprites/tableMask.png');
        this.load.image('takeMask', 'assets/sprites/takeMask.png');
        this.load.image('objectMask', 'assets/sprites/object-maskB.png');
        this.load.image('keyMask', 'assets/sprites/keyMask.png');
        this.load.image('doorMask', 'assets/sprites/doorMask.png');
        this.load.image('hintMask', 'assets/sprites/hintMask.png');

        this.load.image('melonMask', 'assets/sprites/melonMask.png');
        this.load.image('knifeMask', 'assets/sprites/knifeMask.png');

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
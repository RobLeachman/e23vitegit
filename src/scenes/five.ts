import 'phaser';
import PlayerUI from './playerUI';
import Slots from "../objects/slots"
import Recorder from "../objects/recorder"

let myUI: PlayerUI;
let recorder: Recorder;
let slots: Slots;

let seededRNG: Phaser.Math.RandomDataGenerator;

//const graphicPrefix = "pg2"; const youtubeID = 'PBAl9cchQac' // Big Time... so much larger than life
//const graphicPrefix = "pg1a"; const youtubeID = 'feZluC5JheM' // The Court... while the pillars all fall
//const graphicPrefix = "pg3a"; const youtubeID = 'CnVf1ZoCJSo' // Shock the Monkey... cover me when I run        
//const winPhrase = "so much larger than life";
let winPhrase = "cover me when I run";
const winPhrase_bigTime = "so much larger than life"

class WordPanel {
    scene: Phaser.Scene;
    location: number;
    mask: Phaser.GameObjects.Sprite;
    word: Phaser.GameObjects.Text;
    words: string[] = [];
    wordIndex = 0;
    selectedWord: string;

    constructor(scene: Phaser.Scene, loc: number, word: string) {
        this.scene = scene;
        this.location = loc;
        //this.mask = scene.add.sprite(50, 270 + (this.location * 127), maskImage).setOrigin(0, 0);
        this.mask = scene.add.sprite(50, 270 + (this.location * 127), 'atlas', 'fivewordsMask.png').setOrigin(0, 0).setName("fiveWordsMask");
        this.word = this.scene.make.text({
            x: 80,
            y: 265 + this.location * 127,
            text: 'init',
            //style: {
            //    //fill: '#ffffff'
            //}
        });
        this.words[0] = word;
        this.selectedWord = word;
        this.word.setText(this.words[0]);

        this.word.setStyle({ font: '80px Verdana' })

        const width = this.word.getBottomRight().x! - 80;
        this.word.setX((720 - width) / 2);

        // top is 265 (section offset) + location * 127, at 80px final size
        const height = this.word.getBottomRight().y! - (265 + this.location * 127);
        const center = (265 + this.location * 127) + 47;
        this.word.setY(center - height / 2);

        this.mask.setInteractive({ cursor: 'pointer' });
        this.mask.on('pointerdown', () => {

            // Need special recorder hack for panel array
            recorder.recordObjectDown('fivePanelMask@' + this.location, this.scene);
            this.spinPanel();
        });
    }

    spinPanel() {
        this.wordIndex++;
        if (this.wordIndex == this.words.length)
            this.wordIndex = 0;

        this.selectedWord = this.words[this.wordIndex];
        this.word.setText(this.selectedWord);
        this.word.setX(80)
        const width = this.word.getBottomRight().x! - 80;
        this.word.setX((720 - width) / 2);
    }

    addWord(word: string) {
        this.words.push(word)
    }

    getWord() {
        return this.selectedWord + " ";
    }

    winPanelOff() {
        this.mask.setVisible(false);
    }

    shuffle() {
        const x1 = seededRNG.between(1, this.words.length - 1);
        const x2 = seededRNG.between(1, this.words.length - 1);

        const word1 = this.words[x1];
        const word2 = this.words[x2];

        this.words[x1] = word2;
        this.words[x2] = word1;
    }
}

export class Five extends Phaser.Scene {
    fiveBackButton: Phaser.GameObjects.Sprite;
    panels: WordPanel[] = [];
    lastPhrase = "";
    compartmentMask: Phaser.GameObjects.Sprite;
    compartmentOpen: Phaser.GameObjects.Sprite;
    compartmentEmpty: Phaser.GameObjects.Sprite;
    thePlayerName: string;
    slots: Slots;

    constructor() {
        super("Five");
    }

    preload() {
    }

    create(data: { playerName: string, slots: Slots }) {
        this.scene.bringToTop();
        this.scene.bringToTop("PlayerUI");
        myUI = this.scene.get("PlayerUI") as PlayerUI;
        myUI.setActiveScene("Five");
        var camera = this.cameras.main;
        camera.setPosition(0, myUI.getCameraHack());

        this.thePlayerName = data.playerName;

        seededRNG = myUI.getSeededRNG();

        ////////////// RECORDER - CAPTURE //////////////

        slots = data.slots;
        recorder = slots.recorder;
        const thisscene = this;

        this.registry.events.on('changedata', this.registryUpdate, this);

        // @ts-ignore   pointer is unused until we get fancy...
        this.input.on('gameobjectdown', function (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
            //console.log("FIVE mask click " + (gameObject as Phaser.GameObjects.Sprite).name)
            if ((gameObject as Phaser.GameObjects.Sprite).name == "fiveWordsMask") {
                //console.log("special panels handles it")
            } else
                recorder.recordObjectDown((gameObject as Phaser.GameObjects.Sprite).name, thisscene);
        });

        ////////////// SCENE OBJECTS //////////////
        const noClueText = this.make.text({
            x: 260,
            y: 900,
            text: 'You cannot solve this yet',
            style: {
                font: '25px Verdana',
                color: '#ffff00'
            }
        });
        noClueText.setDepth(99);        

        this.add.image(0, 0, 'fiveBackground').setOrigin(0, 0);
        this.compartmentMask = this.add.sprite(53, 886, 'atlas', 'fivewordsCompartmentMask.png').setName('compartmentMask').setOrigin(0, 0);
        recorder.addMaskSprite('compartmentMask', this.compartmentMask);
        this.compartmentMask.on('pointerdown', () => {
            myUI.setFiveState(2);
            this.compartmentOpen.setVisible(false);
            this.compartmentEmpty.setVisible(true);
            this.compartmentMask.setVisible(false);
            for (let i = 0; i < 5; i++) {
                this.panels[i].winPanelOff();
            }
            slots.addIcon("iconBattery.png", "objBattery", "altobjBattery",false);
            this.sound.play('sfx', { name: 'winTone', start: 9, duration: 2 });
            myUI.didGoal('getBattery');
        });
        this.compartmentMask.setVisible(false);
        this.compartmentMask.setInteractive({ cursor: 'pointer' });

        this.compartmentOpen = this.add.sprite(53, 886, 'atlas', 'fivewordsBattery.png').setOrigin(0, 0).setVisible(false);
        this.compartmentEmpty = this.add.sprite(53, 886, 'atlas', 'fivewordsEmpty.png').setOrigin(0, 0).setVisible(false);

        if (this.thePlayerName == "norandom")
            this.panels[0] = new WordPanel(this, 0, 'noshuffle')
        else
            this.panels[0] = new WordPanel(this, 0, 'when')
        this.panels[1] = new WordPanel(this, 1, 'you')
        this.panels[2] = new WordPanel(this, 2, 'know')
        this.panels[3] = new WordPanel(this, 3, 'it')
        this.panels[4] = new WordPanel(this, 4, 'happens')

        if (myUI.getFourWayPuzzle() == "BigTime") {
            winPhrase = winPhrase_bigTime;
        }
        const phrase1words = winPhrase.split(' ');
        phrase1words.forEach((word, idx) => {
            this.panels[idx].addWord(word)
        });

        let moreWords = "we going to the show".split(" ");
        moreWords.forEach((word, idx) => {
            this.panels[idx].addWord(word)
        });

        const playerWords = "thanks for testing this " + this.thePlayerName;
        moreWords = playerWords.split(" ");
        moreWords.forEach((word, idx) => {
            this.panels[idx].addWord(word)
        });

        moreWords = "five words that mean nothing".split(" ");
        moreWords.forEach((word, idx) => {
            this.panels[idx].addWord(word)
        });

        if (this.thePlayerName != "norandom") {
            for (let i = 0; i < 256; i++)
                this.panels[seededRNG.between(0, 4)].shuffle()
        }

        this.fiveBackButton = this.add.sprite(300, 925, 'atlas', 'arrowDown.png').setOrigin(0, 0).setName("fiveBackButton");
        recorder.addMaskSprite('fiveBackButton', this.fiveBackButton);
        this.fiveBackButton.setVisible(true); this.fiveBackButton.setInteractive();

        this.fiveBackButton.on('pointerdown', () => {
            recorder.recordObjectDown(this.fiveBackButton.name, thisscene); // must record, won't be captured by global method
            this.scene.moveUp("PlayGame");
            this.scene.wake("PlayGame");
            this.scene.sleep();
        });

        this.events.on('wake', () => {
            //console.log("Five awakes")
            if (myUI.getFourSolved()) {
                myUI.didGoal('solveFive');
                noClueText.setDepth(-1)
            }
        });

        if (myUI.getFourSolved()) {
            myUI.didGoal('solveFive');
        }

        this.panels[0].shuffle();
    }

    update() {
        let phrase = "";
        for (let i = 0; i < 5; i++) {
            phrase += this.panels[i].getWord();
        }
        if (phrase != this.lastPhrase) {
            this.lastPhrase = phrase;

            if (phrase == winPhrase + ' ') {
                myUI.setFiveState(1);
                this.compartmentOpen.setVisible(true);
                this.compartmentMask.setVisible(true);
                myUI.didGoal('getFourClue');
            }
        }
        if (recorder.getMode() == "record")
            recorder.checkPointer(this);
    }



    ////////////// RECORDER REGISTRY //////////////

    // @ts-ignore no clue what we'd do with parent
    registryUpdate(parent: Phaser.Game, key: string, data: string) {
        // Listen to registry for updates alerting us things on this scene were clicked
        if (key == "replayObject") {
            const spriteName = data.split(':')[0];
            const spriteScene = data.split(':')[1];
            //console.log("FIVE replay=" + spriteName + " on scene " + spriteScene)

            if (spriteScene == "Five") {
                const fivePanelMask = spriteName.split('@'); // special for Five, we need to call panels from an array
                if (fivePanelMask[0] == 'fivePanelMask') {
                    this.panels[parseInt(fivePanelMask[1], 10)].spinPanel()
                } else {
                    let object = recorder.getMaskSprite(spriteName);
                    //console.log("replay five object")
                    object?.emit('pointerdown')
                }
            }
        }
    }
}

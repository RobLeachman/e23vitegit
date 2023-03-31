import 'phaser';
import PlayerUI from './playerUI';

let myUI:PlayerUI;

//const graphicPrefix = "pg2"; const youtubeID = 'PBAl9cchQac' // Big Time... so much larger than life
//const graphicPrefix = "pg1a"; const youtubeID = 'feZluC5JheM' // The Court... while the pillars all fall
//const graphicPrefix = "pg3a"; const youtubeID = 'CnVf1ZoCJSo' // Shock the Monkey... cover me when I run        
const winPhrase = "so much larger than life";

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
        console.log('recorder will be a bastard')
        this.word = this.scene.make.text({
            x: 80,
            y: 265 + (this.location * 127),
            text: 'init',
            style: {
                font: '80px Verdana',
                //fill: '#ffffff'
            }
        });
        this.words[0] = word;
        this.selectedWord = word;
        this.word.setText(this.words[0]);
        const width = this.word.getBottomRight().x - 80;
        this.word.setX((720 - width) / 2);

        this.mask.setInteractive({ cursor: 'pointer' });
        this.mask.on('pointerdown', () => {
            this.wordIndex++;
            if (this.wordIndex == this.words.length)
                this.wordIndex = 0;

            this.selectedWord = this.words[this.wordIndex];
            this.word.setText(this.selectedWord);
            this.word.setX(80)
            const width = this.word.getBottomRight().x - 80;
            this.word.setX((720 - width) / 2);
        });
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
        const x1 = Phaser.Math.Between(1, this.words.length - 1);
        const x2 = Phaser.Math.Between(1, this.words.length - 1);
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

    constructor() {
        super("Five");
    }

    preload() {
    }

    create() {
        this.scene.bringToTop();
        this.scene.bringToTop("PlayerUI");
        myUI = this.scene.get("PlayerUI") as PlayerUI;
        myUI.setActiveScene("Five");

        this.add.image(0, 0, 'fiveBackground').setOrigin(0, 0);
        this.compartmentMask = this.add.sprite(53, 886, 'atlas', 'fivewordsCompartmentMask.png').setOrigin(0, 0);
        this.compartmentMask.on('pointerdown', () => {
            myUI.setFiveState(2);
            this.compartmentOpen.setVisible(false);
            this.compartmentEmpty.setVisible(true);
            this.compartmentMask.setVisible(false);
            for (let i = 0; i < 5; i++) {
                this.panels[i].winPanelOff();
            }
        });
        this.compartmentMask.setVisible(false);
        this.compartmentMask.setInteractive({ cursor: 'pointer' });

        this.compartmentOpen = this.add.sprite(53, 886, 'atlas', 'fivewordsBattery.png').setOrigin(0, 0).setVisible(false);
        this.compartmentEmpty = this.add.sprite(53, 886, 'atlas', 'fivewordsEmpty.png').setOrigin(0, 0).setVisible(false);

        this.panels[0] = new WordPanel(this, 0, 'when')
        this.panels[1] = new WordPanel(this, 1, 'you')
        this.panels[2] = new WordPanel(this, 2, 'know')
        this.panels[3] = new WordPanel(this, 3, 'it')
        this.panels[4] = new WordPanel(this, 4, 'happens')

        const phrase1words = winPhrase.split(' ');
        phrase1words.forEach((word, idx) => {
            this.panels[idx].addWord(word)
        });

        let moreWords = "we going to the show".split(" ");
        moreWords.forEach((word, idx) => {
            this.panels[idx].addWord(word)
        });

        moreWords = "thanks for testing this Friendo".split(" ");
        moreWords.forEach((word, idx) => {
            this.panels[idx].addWord(word)
        });

        moreWords = "five words that mean nothing".split(" ");
        moreWords.forEach((word, idx) => {
            this.panels[idx].addWord(word)
        });

        for (let i = 0; i < 256; i++)
            this.panels[Phaser.Math.Between(0, 4)].shuffle()


        this.fiveBackButton = this.add.sprite(300, 925, 'atlas', 'arrowDown.png').setOrigin(0, 0).setName("fourBackButton");
        this.fiveBackButton.setVisible(true); this.fiveBackButton.setInteractive({ cursor: 'pointer' });

        this.fiveBackButton.on('pointerdown', () => {
            this.scene.moveUp("PlayGame");
            this.scene.wake("PlayGame");
            this.scene.sleep();
        });

        this.events.on('wake', () => {
            console.log("Five awakes")
        });

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
            }
        }
    }
}

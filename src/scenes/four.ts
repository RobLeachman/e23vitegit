import 'phaser';
import PlayerUI from './playerUI';
import Slots from "../objects/slots"
import Recorder from "../objects/recorder"

let myUI: PlayerUI;
var recorder: Recorder;
var slots: Slots;
let seededRNG: Phaser.Math.RandomDataGenerator;

let justReturnedFromHints = false;
let puzzleWasJustSolved = false;
let didPauseMusic = false;

import YoutubePlayer from 'phaser3-rex-plugins/plugins/youtubeplayer.js';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'

let youtubeID = 'CnVf1ZoCJSo' // Shock the Monkey... cover me when I run
const youtubeID_BigTime = 'PBAl9cchQac' // Big Time... so much larger than life
//const youtubeID = 'feZluC5JheM' // The Court... while the pillars all fall
//const youtubeID = 'VjEq-r2agqc' // Don't Give Up... we were wanted all along

let bugz = false; // workaround, perhaps not needed at 3.60?

export class Four extends Phaser.Scene {
    rexUI: RexUIPlugin;
    art: Phaser.GameObjects.Image;
    videoBackground: Phaser.GameObjects.Image;
    artWhole: Phaser.GameObjects.Image;
    frame: Phaser.GameObjects.Sprite;
    selected: Phaser.GameObjects.Sprite;
    selectMask: Phaser.GameObjects.Sprite;
    pieceFrame0: Phaser.GameObjects.Sprite;
    pieceFrame1: Phaser.GameObjects.Sprite;
    pieceFrame2: Phaser.GameObjects.Sprite;
    pieceFrame3: Phaser.GameObjects.Sprite;
    pieceFrame4: Phaser.GameObjects.Sprite;
    spriteNames: string[][] = [];
    swapSelect = { x: 2, y: 2 }
    youtubes: YoutubePlayer;
    thePlayerName: string;
    tileMap = new Map();

    ytPlayButton: Phaser.GameObjects.Sprite;
    fourBackButton: Phaser.GameObjects.Sprite;

    constructor() {
        super("Four");
    }

    preload() {
    }

    // @ts-ignore
    swapTiles(tile1x: number, tile1y: number, tile2x: number, tile2y: number, tileMap) {
        //console.log(`swap ${tile1x},${tile1y} with ${tile2x},${tile2y}`)
        const k = tile1x.toString() + ':' + tile1y.toString();

        const selectedTile = tileMap.get(k);
        const selectX = selectedTile.art.x; const selectY = selectedTile.art.y;

        const k1 = tile2x.toString() + ':' + tile2y.toString();
        const swapTile = tileMap.get(k1);
        const swapX = swapTile.art.x; const swapY = swapTile.art.y;

        const v1 = { art: swapTile.art, origX: swapTile.origX, origY: swapTile.origY };
        tileMap.set(k, v1);
        swapTile.art.setX(selectX); swapTile.art.setY(selectY);

        const v = { art: selectedTile.art, origX: selectedTile.origX, origY: selectedTile.origY };
        tileMap.set(k1, v);
        selectedTile.art.setX(swapX); selectedTile.art.setY(swapY);
    }

    spinTheRecord(autoplay: boolean) {
        let theYoutube = youtubeID;
        if (myUI.getFourWayPuzzle() == "BigTime")
            theYoutube = youtubeID_BigTime

        this.videoBackground.setVisible(true);
        const ytConfig = {
            x: 50, y: 620, // not sure what these do even
            width: undefined,
            height: undefined,
            videoId: theYoutube,
            autoPlay: autoplay,
            controls: false,
            keyboardControl: true,
            modestBranding: false,
            loop: false,
        }
        this.artWhole.setVisible(false);
        var youtubePlayer = new YoutubePlayer(this, 360, 580, 700, 500, ytConfig);
        this.youtubes = this.add.existing(youtubePlayer);
        this.youtubes.setDepth(2)
    }


    create(data: { slots: Slots }) {
        this.scene.bringToTop();
        this.scene.bringToTop("PlayerUI");
        myUI = this.scene.get("PlayerUI") as PlayerUI;
        myUI.setActiveScene("Four");
        var camera = this.cameras.main;
        camera.setPosition(0, myUI.getCameraHack());

        let artWhole = 'fourArtWhole-BigTime'
        if (myUI.getFourWayPuzzle() == "Shock") {
            artWhole = 'fourArtWhole-Shock'
        }

        slots = data.slots;
        recorder = slots.recorder;
        const thisscene = this;

        // copied from five, should all go in recorder...
        this.thePlayerName = recorder.getPlayerName();
        let recordedName = recorder.getRecordedPlayerName();
        if (recordedName != undefined)
            this.thePlayerName = recordedName;



        seededRNG = myUI.getSeededRNG();

        this.registry.events.on('changedata', this.registryUpdate, this);

        this.add.image(0, 0, 'fourBackground').setOrigin(0, 0);
        this.frame = this.add.sprite(13, 250, 'fourFrame').setOrigin(0, 0);
        this.videoBackground = this.add.image(0, 0, 'vid1').setOrigin(0.0).setDepth(2).setVisible(false);
        this.artWhole = this.add.image(13 + 28, 250 + 28, artWhole).setOrigin(0, 0).setDepth(1000).setVisible(false);

        this.tileMap = new Map();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const k = i.toString() + ':' + j.toString();
                //const tileArt = this.add.sprite((13 + 28) + i * 160, (250 + 28) + j * 160, this.spriteNames[j][i]).setOrigin(0, 0)

                const tileArt = this.add.sprite(0, 0, artWhole).setOrigin(0, 0)
                tileArt.setCrop(i * 160, j * 160, 160, 160);
                tileArt.setOrigin(.25 * i, .25 * j);
                tileArt.setX((13 + 28) + i * 160)
                tileArt.setY((250 + 28) + j * 160)

                const v = { art: tileArt, origX: i, origY: j };
                this.tileMap.set(k, v);

                this.add.sprite((13 + 28) + i * 160, (250 + 28) + j * 160, 'atlas2', 'fourPieceFrame.png').setOrigin(0, 0).setDepth(1);
            }
        }
        // Pick and swap two random tiles. Always swap once.
        if (this.thePlayerName != "norandom") {
            for (let z = 0; z < 50; z++) {
                const x1 = seededRNG.between(0, 3); const y1 = seededRNG.between(0, 3);
                const x2 = seededRNG.between(0, 3); const y2 = seededRNG.between(0, 3);
                this.swapTiles(x1, y1, x2, y2, this.tileMap);
            }
        }
        this.swapTiles(2, 3, 3, 3, this.tileMap);

        this.selected = this.add.sprite(13 + 28 + 160 * this.swapSelect.x, 250 + 28 + 160 * this.swapSelect.y, 'atlas2', 'fourPieceSelected.png').setOrigin(0, 0);
        this.selected.x = 1000;

        // cover the whole board and then read the coordinates of the click
        this.selectMask = this.add.sprite(13 + 28, 250 + 28, 'atlas2', 'fourPieceMask.png').setOrigin(0, 0);
        recorder.addMaskSprite('selectMask', this.selectMask);
        this.selectMask.setVisible(true); this.selectMask.setDepth(1); this.selectMask.setInteractive({ cursor: 'pointer' });

        // Recorder one-off, saves object click and also location
        // @ts-ignore pointer is not fancy
        this.selectMask.on('pointerdown', (pointer: Phaser.Input.Pointer, x: number, y: number) => {
            recorder.recordObjectDown('fourSelectMask@' + Math.floor(x) + '@' + Math.floor(y), this);
            this.doTileSelect(this.tileMap, x, y)
        });

        this.fourBackButton = this.add.sprite(300, 930, 'atlas', 'arrowDown.png').setOrigin(0, 0).setName("fourBackButton");
        recorder.addMaskSprite('fourBackButton', this.fourBackButton);
        this.fourBackButton.setVisible(true); this.fourBackButton.setDepth(3); this.fourBackButton.setInteractive({ cursor: 'pointer' });
        this.fourBackButton.on('pointerdown', () => {
            //console.log("Four back");
            recorder.recordObjectDown(this.fourBackButton.name, thisscene); // must record, won't be captured by global method

            if (this.youtubes == undefined) {
                //console.log('save state?')
            } else {
                //this.youtubes.pause();
                this.youtubes.destroy();
                this.videoBackground.setVisible(false);
            }

            //recorder.recordObjectDown(zotfourBackButton.name, thisscene);
            //console.log("exit four")

            this.fourBackButton.setVisible(false);
            this.fourBackButton.removeInteractive(); // fix up the cursor displayed on main scene
            puzzleWasJustSolved = false;

            if (didPauseMusic)
                myUI.resumeMusic();

            this.scene.moveUp("RoomTwo");
            this.scene.sleep();
            this.scene.wake("RoomTwo");
        });

        this.ytPlayButton = this.add.sprite(360, 600, 'atlas', 'ytPlayButton.png').setName("ytPlayButton").setScale(1.1);
        this.ytPlayButton.setVisible(false); this.ytPlayButton.setDepth(1001); this.ytPlayButton.setInteractive({ cursor: 'pointer' });
        this.ytPlayButton.on('pointerdown', () => {
            //console.log("YT PLAY")
            myUI.pauseMusic(true); // temporary
            didPauseMusic = true;
            this.ytPlayButton.setVisible(true);
            this.spinTheRecord(false);
        });


        this.events.on('wake', () => {
            this.scene.bringToTop();
            this.scene.bringToTop("PlayerUI");
            myUI.setActiveScene("Four");

            this.fourBackButton.setVisible(true);
            this.fourBackButton.setInteractive({ cursor: 'pointer' }); //<==== HAS NO EFFECT
            bugz = true;

            if (myUI.getFourSolved()) {
                //console.log(`puzzle was just solved ${puzzleWasJustSolved} just returned from hints ${justReturnedFromHints}`)
                if (!puzzleWasJustSolved)
                    this.artWhole.setVisible(true);
                else
                    this.artWhole.setVisible(!justReturnedFromHints);
                this.add.image(0, 0, 'fourBackground').setOrigin(0, 0);
                this.frame = this.add.sprite(13, 250, 'fourFrame').setOrigin(0, 0);
                this.ytPlayButton.setVisible(true);
                myUI.pauseMusic(true); // temporary
            }
            justReturnedFromHints = false;
        });
    }

    //@ts-ignore
    doTileSelect(tileMap, x: number, y: number) {
        const selection = { x: Math.floor(x / 160), y: Math.floor(y / 160) };

        // If there is an active selection, swap this tile with that one, clear the selection icon and test for win
        if (this.selected.x < 1000) {
            this.swapTiles(selection.x, selection.y, this.swapSelect.x, this.swapSelect.y, tileMap);
            this.selected.setX(1000)
            // chicken dinner?
            let winner = true;
            puzzleWasJustSolved = true;

            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    const k = i.toString() + ':' + j.toString();
                    const tile = tileMap.get(k);
                    //console.log(`dump ${i},${j}  orig ${tile.origX},${tile.origY}`)
                    if (i != tile.origX || j != tile.origY)
                        winner = false;
                }
            }
            if (winner) {
                myUI.setFourSolved(true);
                myUI.didGoal('solveFour');
                this.selectMask.setVisible(false); this.selectMask.setInteractive(false); this.selectMask.setDepth(-1);
                myUI.pauseMusic(true); // temporary
                didPauseMusic = true;
                this.spinTheRecord(false);
            }

        } else {
            // save and indicate the new selection
            this.selected.setX((13 + 28) + selection.x * 160)
            this.selected.setY((13 + 28 + 240) + selection.y * 160)
            this.swapSelect.x = selection.x; this.swapSelect.y = selection.y;
        }

    }

    update() {
        if (bugz) {
            this.fourBackButton.setInteractive({ cursor: 'pointer' });
            bugz = false;
        }
        if (recorder.getMode() == "record")
            recorder.checkPointer(this);
    }

    // @ts-ignore
    // no clue what parent is
    registryUpdate(parent: Phaser.Game, key: string, data: string) {
        //console.log(`Four registry update ${key}`)
        if (key == "replayObject") {
            const spriteName = data.split(':')[0];
            const spriteScene = data.split(':')[1];
            if (spriteScene == "Four") {
                const fourTileMask = spriteName.split('@');
                if (fourTileMask[0] == 'fourSelectMask') {
                    this.doTileSelect(this.tileMap, parseInt(fourTileMask[1], 10), parseInt(fourTileMask[2], 10))

                } else {
                    let object = recorder.getMaskSprite(spriteName);
                    object?.emit('pointerdown')
                }
            }
        }
        if (key == "Four-specialCase") {
            //console.log("yet another special case...")
            justReturnedFromHints = true;
        }
    }
}

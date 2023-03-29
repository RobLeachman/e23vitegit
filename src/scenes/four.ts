import 'phaser';

import PlayerUI from './playerUI';

import YoutubePlayer from 'phaser3-rex-plugins/plugins/youtubeplayer.js';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'

const youtubeID = 'PBAl9cchQac' // Big Time... so much larger than life
//const youtubeID = 'feZluC5JheM' // The Court... while the pillars all fall
//const youtubeID = 'CnVf1ZoCJSo' // Shock the Monkey... cover me when I run

let bugz = false;
let solved = false;

export class Four extends Phaser.Scene {
    rexUI: RexUIPlugin;
    art: Phaser.GameObjects.Image;
    videoBackground: Phaser.GameObjects.Image;
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

    create() {
        this.scene.bringToTop();
        this.scene.bringToTop("PlayerUI");
        const myUI = this.scene.get("PlayerUI") as PlayerUI;
        myUI.setActiveScene("four");

        this.add.image(0, 0, 'fourBackground').setOrigin(0, 0);
        this.frame = this.add.sprite(13, 250, 'fourFrame').setOrigin(0, 0);
        this.videoBackground = this.add.image(0, 0, 'watchTheVideo').setOrigin(0.0).setDepth(2).setVisible(false)

        const tileMap = new Map();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const k = i.toString() + ':' + j.toString();
                //const tileArt = this.add.sprite((13 + 28) + i * 160, (250 + 28) + j * 160, this.spriteNames[j][i]).setOrigin(0, 0)

                const tileArt = this.add.sprite(0, 0, 'fourArtWhole').setOrigin(0, 0)
                tileArt.setCrop(i * 160, j * 160, 160, 160);
                tileArt.setOrigin(.25 * i, .25 * j);
                tileArt.setX((13 + 28) + i * 160)
                tileArt.setY((250 + 28) + j * 160)

                const v = { art: tileArt, origX: i, origY: j };
                tileMap.set(k, v);

                this.add.sprite((13 + 28) + i * 160, (250 + 28) + j * 160, 'atlas', 'fourPieceFrame.png').setOrigin(0, 0).setDepth(1);
            }
        }
        // pick two random tiles and swap
        this.swapTiles(2, 3, 3, 3, tileMap);
        /*
                for (let z = 0; z < 50; z++) {
                    const x1 = Phaser.Math.Between(0, 3); const y1 = Phaser.Math.Between(0, 3);
                    const x2 = Phaser.Math.Between(0, 3); const y2 = Phaser.Math.Between(0, 3);
                    this.swapTiles(x1, y1, x2, y2, tileMap);
                }
        */

        // select box displayed
        //this.selected = this.add.sprite(13 + 28 + 160 * this.swapSelect.x, 250 + 28 + 160 * this.swapSelect.y,
        //    'fourPieceSelected').setOrigin(0, 0);
        this.selected = this.add.sprite(13 + 28 + 160 * this.swapSelect.x, 250 + 28 + 160 * this.swapSelect.y, 'atlas', 'fourPieceSelected.png').setOrigin(0, 0);
        this.selected.x = 1000;

        // cover the whole board and then read the coordinates of the click
        this.selectMask = this.add.sprite(13 + 28, 250 + 28, 'atlas', 'fourPieceMask.png').setOrigin(0, 0);
        //recorder.addMaskSprite('selectMask', selectMask); // don't forget to enable this in the real game!!!!!!

        this.selectMask.setVisible(true); this.selectMask.setDepth(1); this.selectMask.setInteractive({ cursor: 'pointer' });

        // @ts-ignore
        this.selectMask.on('pointerdown', (pointer: Phaser.Input.Pointer, x: number, y: number) => {
            /*
            https://labs.phaser.io/edit.html?src=src/scalemanager/full%20screen%20game.js&v=3.55.2
                        if (this.scale.isFullscreen)
                        {
                            
                            this.scale.stopFullscreen();
                        }
                        else
                        {
                            this.scale.startFullscreen();
                        }
            */


            const selection = { x: Math.floor(x / 160), y: Math.floor(y / 160) };
            //console.log(`selecting ${selection.x},${selection.y}`);

            if (this.selected.x < 1000) {
                //console.log(`swap ${this.swapSelect.x},${this.swapSelect.y} with ${selection.x},${selection.y}`)
                this.swapTiles(selection.x, selection.y, this.swapSelect.x, this.swapSelect.y, tileMap);

                this.selected.setX(1000)

                // chicken dinner?
                let winner = true;

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
                    solved = true;
                    console.log("WINNER!!!!!!!!!!!")

                    this.selectMask.setVisible(false); this.selectMask.setInteractive(false); this.selectMask.setDepth(-1);

                    // Winning art view, which they can't see because the YT instructions must be shown
                    //this.add.sprite(13 + 28, 250 + 28, 'artWhole').setOrigin(0, 0).setDepth(1000);

                    this.videoBackground.setVisible(true)
                    //now play  https://www.youtube.com/watch?v=feZluC5JheM

                    const ytConfig = {
                        x: 50, y: 620, // not sure what these do even
                        width: undefined,
                        height: undefined,
                        videoId: youtubeID,
                        autoPlay: true,
                        controls: false,
                        keyboardControl: true,
                        modestBranding: false,
                        loop: false,
                    }
                    var youtubePlayer = new YoutubePlayer(this, 360, 580, 700, 500, ytConfig);
                    this.youtubes = this.add.existing(youtubePlayer);
                    this.youtubes.setDepth(2)



                    /*
                        var youtubePlayer = this.add.rexYoutubePlayer(0, 0, 600, 450, {
                            videoId: 'feZluC5JheM'
                        })
                            .on('ready', function () {
                                youtubePlayer.setPosition(400, 300);
                            })
                            */


                }

            } else {
                // save and indicate the new selection
                this.selected.setX((13 + 28) + selection.x * 160)
                this.selected.setY((13 + 28 + 240) + selection.y * 160)
                this.swapSelect.x = selection.x; this.swapSelect.y = selection.y;
                //console.log(`next swap ${swapSelect.x},${swapSelect.y}`)
            }
        });

        this.fourBackButton = this.add.sprite(300, 930, 'atlas', 'arrowDown.png').setOrigin(0, 0).setName("fourBackButton");
        this.fourBackButton.setVisible(true); this.fourBackButton.setDepth(3); this.fourBackButton.setInteractive({ cursor: 'pointer' });

        this.fourBackButton.on('pointerdown', () => {
            //console.log("Four back");
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

            this.scene.moveUp("PlayGame");
            this.scene.sleep();
            this.scene.wake("PlayGame");
        });

        this.events.on('wake', () => {
            console.log("Four awakes, solved=" + solved)
            this.scene.bringToTop();
            this.scene.bringToTop("PlayerUI");
            myUI.setActiveScene("four");
            
            this.fourBackButton.setVisible(true);
            this.fourBackButton.setInteractive({ cursor: 'pointer' }); //<==== HAS NO EFFECT
            bugz = true;

            if (solved) {
                this.add.sprite(13 + 28, 250 + 28, 'fourArtWhole').setOrigin(0, 0).setDepth(1000);
                this.add.image(0, 0, 'fourBackground').setOrigin(0, 0);
                this.frame = this.add.sprite(13, 250, 'fourFrame').setOrigin(0, 0);
            }

        });
    }

    update() {
        if (bugz) {
            this.fourBackButton.setInteractive({ cursor: 'pointer' });
            bugz = false;
        }
    }
}

import 'phaser';
import YoutubePlayer from 'phaser3-rex-plugins/plugins/youtubeplayer.js';

// "Just to add more options to the puzzle: you can use a serverless realtime database (gun.js, channable/icepeak, brynbellomy/redwood, rethinkdb, sapphire-db, emitter.io,kuzzle.io, feathersjs, deepstream.io, firebase, supabase.io, etc.)""

const graphicPrefix = "pg2"; const youtubeID = 'PBAl9cchQac' // Big Time... so much larger than life
//const graphicPrefix = "pg1a"; const youtubeID = 'feZluC5JheM' // The Court... while the pillars all fall
//const graphicPrefix = "pg3a"; const youtubeID = 'CnVf1ZoCJSo' // Shock the Monkey... cover me when I run

export class Four extends Phaser.Scene {
    art: Phaser.GameObjects.Image;
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

    backButton: Phaser.GameObjects.Sprite;

    constructor() {
        super("Four");
    }

    preload() {
        var url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexyoutubeplayerplugin.min.js';
        this.load.plugin('rexyoutubeplayerplugin', url, true);

        this.load.image('background', 'assets/backgrounds/four wall.webp');
        this.load.image('watchIt', 'assets/backgrounds/watchTheYoutube.webp');

        this.load.image('artWhole', 'assets/graphics/' + graphicPrefix + '.webp');
        this.load.image('frame', 'assets/backgrounds/4x4 frame1a.webp');
        this.load.image('pieceFrame', 'assets/sprites/4x4 piece frame1a.png');
        this.load.image('pieceSelected', 'assets/sprites/pieceSelected.png');
        this.load.image('selectPieceMask', 'assets/sprites/selectPiecesMask.png');
        this.load.image('backButton', 'assets/sprites/arrowDown.webp');
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
        // this hack cannot abide... TODO need a proper background and placement for the 5x5 puzzle!
        this.add.image(0,-80, 'background').setOrigin(0,0);
        this.frame = this.add.sprite(13, 170, 'frame').setOrigin(0, 0);

        const tileMap = new Map();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const k = i.toString() + ':' + j.toString();
                //const tileArt = this.add.sprite((13 + 28) + i * 160, (170 + 28) + j * 160, this.spriteNames[j][i]).setOrigin(0, 0)

                const tileArt = this.add.sprite(0,0,'artWhole').setOrigin(0, 0)
                tileArt.setCrop(i*160, j*160, 160, 160);
                tileArt.setOrigin(.25*i,.25*j);
                tileArt.setX((13 + 28) + i * 160)
                tileArt.setY((170 + 28) + j * 160)

                const v = { art: tileArt, origX: i, origY: j };
                tileMap.set(k, v);

                this.add.sprite((13 + 28) + i * 160, (170 + 28) + j * 160, 'pieceFrame').setOrigin(0, 0).setDepth(1);
            }
        }
        // pick two random tiles and swap
        this.swapTiles(2,3,3,3, tileMap);

        for (let z = 0; z < 50; z++) {
            const x1 = Phaser.Math.Between(0, 3); const y1 = Phaser.Math.Between(0, 3);
            const x2 = Phaser.Math.Between(0, 3); const y2 = Phaser.Math.Between(0, 3);
            this.swapTiles(x1, y1, x2, y2, tileMap);
        }

        // select box displayed
        this.selected = this.add.sprite(13 + 28 + 160 * this.swapSelect.x, 170 + 28 + 160 * this.swapSelect.y,
            'pieceSelected').setOrigin(0, 0);
        this.selected.x = 1000;

        // cover the whole board and then read the coordinates of the click
        this.selectMask = this.add.sprite(13 + 28, 170 + 28, 'selectPieceMask').setOrigin(0, 0);
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
                        console.log(`dump ${i},${j}  orig ${tile.origX},${tile.origY}`)
                        if (i != tile.origX || j != tile.origY)
                            winner = false;
                    }
                }

                if (winner) {
                    console.log("WINNER!!!!!!!!!!!")


                    this.selectMask.setVisible(false); this.selectMask.setInteractive(false); this.selectMask.setDepth(-1);
                    
                    // Winning art view, which they can't see because the YT instructions must be shown
                    //this.add.sprite(13 + 28, 170 + 28, 'artWhole').setOrigin(0, 0).setDepth(10);

                    this.add.image(0,0,'watchIt').setOrigin(0.0).setDepth(1);                    
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
                this.selected.setY((13 + 28 + 160) + selection.y * 160)
                this.swapSelect.x = selection.x; this.swapSelect.y = selection.y;
                //console.log(`next swap ${swapSelect.x},${swapSelect.y}`)
            }
        });


        this.backButton = this.add.sprite(300, 875, 'backButton').setOrigin(0, 0);
        //this.backButton = this.add.sprite(300, 875, 'atlas', 'arrowDown.png').setOrigin(0, 0).setName("backButton");
        this.backButton.setVisible(true); this.backButton.setDepth(3); this.backButton.setInteractive({ cursor: 'pointer' });

        this.backButton.on('pointerdown', () => {
            console.log("Four back");
            this.youtubes.pause();
        });

        this.events.on('wake', () => {
            console.log("Four awakes")
        });
    }

    update() {
    }
}

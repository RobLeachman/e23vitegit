import 'phaser';
import Slots from "../objects/slots"
import Recorder from "../objects/recorder"
import PlayerUI from './playerUI';

const _SCENENAME = "Settings";
let myUI: PlayerUI;
let slots: Slots;
let recorder: Recorder;

let backgroundImage: Phaser.GameObjects.Image;
let updateWall = true;

let settingsBackButton: Phaser.GameObjects.Sprite;

let soundButton: Phaser.GameObjects.Sprite;
let musicButton: Phaser.GameObjects.Sprite;
let ytWarning: Phaser.GameObjects.Text;


export class Settings extends Phaser.Scene {
    constructor() {
        super(_SCENENAME);
    }

    switchSoundSprites() {
        if (myUI.getSoundEnabled())
            soundButton.setTexture('on')
        else
            soundButton.setTexture('off')
    }

    switchMusicSprites() {
        if (myUI.getMusicEnabled())
            musicButton.setTexture('on')
        else
            musicButton.setTexture('off')
    }

    create() {
        myUI = this.scene.get("PlayerUI") as PlayerUI;
        this.scene.bringToTop();
        this.scene.bringToTop("PlayerUI");
        //myUI.setActiveScene(_SCENENAME);
        var camera = this.cameras.main;
        camera.setPosition(0, myUI.getCameraHack());

        slots = myUI.getSlots();
        recorder = slots.recorder;

        // DONT FORGET TO REGISTER THE NEW SCENE IN RECORDER DumpRecording ParseRecording
        this.registry.events.on('changedata', this.registryUpdate, this);
        this.registry.set('replayObject', "0:init"); // need to seed the function in create, won't work without

        // Record all clicks on this scene
        const thisscene = this;

        // @ts-ignore   pointer is unused until we get fancy...
        this.input.on('gameobjectdown', function (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
            recorder.recordObjectDown((gameObject as Phaser.GameObjects.Sprite).name, thisscene);
        });

        ////////////// SCENE IMPLEMENTATION - CREATE //////////////
        settingsBackButton = this.add.sprite(300, 875, 'atlas', 'arrowDown.png').setOrigin(0, 0).setName("settingsBackButton").setDepth(1);
        recorder.addMaskSprite('settingsBackButton', settingsBackButton);

        settingsBackButton.on('pointerdown', () => {
            recorder.recordObjectDown(settingsBackButton.name, thisscene);

            console.log(`${_SCENENAME} Back!`);
            myUI.showSettingsButton();

            this.scene.moveUp(myUI.getActiveScene());
            this.scene.sleep();
            myUI.restoreUILayer();
            this.scene.wake(myUI.getActiveScene());
        });
        settingsBackButton.setVisible(true); settingsBackButton.setInteractive({ cursor: 'pointer' });

        this.add.sprite(52, 415, 'atlas2', 'sound.png').setOrigin(0, 0).setDepth(1);
        this.add.sprite(55, 566, 'atlas2', 'music.png').setOrigin(0, 0).setDepth(1);
        soundButton = this.add.sprite(309, 416, 'atlas2', 'on.png').setOrigin(0, 0).setName("soundButton").setDepth(1);
        musicButton = this.add.sprite(309, 566, 'atlas2', 'on.png').setOrigin(0, 0).setName("musicButton").setDepth(1);

        recorder.addMaskSprite('soundButton', soundButton);
        soundButton.on('pointerdown', () => {
            ytWarning.setVisible(true);

            if (myUI.getSoundEnabled()) {
                myUI.setSoundSetting(false);
            } else {
                myUI.setSoundSetting(true);                
            }            
            if (!myUI.getSoundEnabled()) {
                myUI.setMusicSetting(false);
                musicButton.removeInteractive();
            }
            else {
                musicButton.setInteractive({ cursor: 'pointer' });
                this.sound.play('sfx', { name: 'niceTone', start: 7, duration: 1 });
            }
            this.switchSoundSprites();
            this.switchMusicSprites();
        });
        soundButton.setVisible(true); soundButton.setInteractive({ cursor: 'pointer' });

        recorder.addMaskSprite('musicButton', musicButton);
        musicButton.on('pointerdown', () => {
            ytWarning.setVisible(true);

            if (myUI.getMusicEnabled()) {
                myUI.setMusicSetting(false);
            } else {
                myUI.setMusicSetting(true);                
            }

            this.switchMusicSprites();
        });
        musicButton.setVisible(true); musicButton.setInteractive({ cursor: 'pointer' });
        if (!myUI.getSoundEnabled()) {
            myUI.setMusicSetting(false);
            musicButton.removeInteractive();
        }

        this.switchMusicSprites();
        this.switchSoundSprites();

        this.add.text(30, 710, 'Enjoy the music, it is "Escape" by Carbon Based Lifeforms', {
            //fontFamily: 'Quicksand',
            //font: '40px Verdana italic',
            fontFamily: 'Helvetica',
            fontSize: '24px',
            color: '#fff',
        })
        this.add.text(30, 750, 'They are super cool and have not told me to take it down. I wanted', {
            //fontFamily: 'Quicksand',
            //font: '40px Verdana italic',
            fontFamily: 'Helvetica',
            fontSize: '20px',
            color: '#fff',
        })
        this.add.text(30, 775, 'to share the track and the band with you. Check them out on YouTube', {
            //fontFamily: 'Quicksand',
            //font: '40px Verdana italic',
            fontFamily: 'Helvetica',
            fontSize: '20px',
            color: '#fff',
        })
        this.add.text(30, 800, 'or better, hit their website www.carbonbasedlifeforms.net', {
            //fontFamily: 'Quicksand',
            //font: '40px Verdana italic',
            fontFamily: 'Helvetica',
            fontSize: '20px',
            color: '#fff',
        })

        ytWarning = this.add.text(30, 1000, 'Note: The YouTube player on 4x4 puzzle is not muted', {
            //fontFamily: 'Quicksand',
            //font: '40px Verdana italic',
            fontFamily: 'Helvetica',
            fontSize: '28px',
            color: '#ff0',
        })
        ytWarning.setVisible(false);
        if (!myUI.getSoundEnabled() || !myUI.getMusicEnabled())
            ytWarning.setVisible(true);



        // start up the background
        updateWall = true;

        this.events.on('wake', () => {
            console.log(`${_SCENENAME} awakes!`)
            this.scene.bringToTop();
            this.scene.bringToTop("PlayerUI")
            //myUI.setActiveScene(_SCENENAME);

            // Scene is room...
            updateWall = true;
        });
    }

    update() {
        ////////////// SCENE IMPLEMENTATION - UPDATE //////////////
        if ((updateWall)) {
            updateWall = false;

            backgroundImage.setVisible(true);
        }

        settingsBackButton.setVisible(true); settingsBackButton.setDepth(1); settingsBackButton.setInteractive({ cursor: 'pointer' });
        // Record any movement or clicks
        if (recorder.getMode() == "record")
            recorder.checkPointer(this);
    }

    preload() {
        // Scene is room...
        backgroundImage = this.add.image(0, 0, "wallHint").setOrigin(0, 0).setVisible(false);
    }

    // @ts-ignore
    registryUpdate(parent: Phaser.Game, key: string, data: any) {
        //console.log(`${_SCENENAME} registry update ${key}`)

        if (key == "replayObject") {
            const spriteName = data.split(':')[0];
            const spriteScene = data.split(':')[1];
            if (spriteScene == _SCENENAME) {
                let object = recorder.getMaskSprite(spriteName);
                object?.emit('pointerdown')
            }
        }
    }
}

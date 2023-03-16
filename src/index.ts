/* global Phaser */
import 'phaser';
import InputText from 'phaser3-rex-plugins/plugins/inputtext.js'

import { BootGame } from './scenes/bootGame';
import { PlayGame } from './scenes/main';
import { ZotTable } from './scenes/zotTable';
import { Four } from './scenes/four';

//import { Recorder } from './scenes/recorder';

//import { TestScene } from './scenes/test';

/*
 * Copied from PDW javascript for use with Escape typescript
 * I went round and round with DPR and such... not required for Escape
 *
*/

// TODO had to fudge this for TS
/* yannick's https://github.com/yandeu/phaser3-optimal-resolution */
//const roundHalf = num => Math.round(num * 2) / 2;

// TODO what was the plan with this? commented out to make TS happy
//const graphicsSettings = { best: 1, medium: 0.75, low: 0.5 };

// we want to scale our window according to the device capabilities...
//const DPR = window.devicePixelRatio * graphicsSettings.best;

// but, for now let's be sure it looks nice while testing!
const DPR = 4; // so it looks nice while testing?

//const { width, height } = window.screen;
//const width = window.innerWidth;
//const height = window.innerHeight;

// base resolution is 640x480 @4
//export const WIDTH = Math.round(Math.max(width, height) * DPR);
//export const HEIGHT = Math.round(Math.min(width, height) * DPR);
export const WIDTH = 640 * DPR;
export const HEIGHT = 480 * DPR;

// will be 1, 1.5, 2, 2.5, 3, 3.5 or 4
//export const assetsDPR = roundHalf(Math.min(Math.max(HEIGHT / 480, 1), 4));
//TODO test this, had to fudge for TS
export const assetsDPR =  Math.round((Math.min(Math.max(HEIGHT / 480, 1), 4) * 2) / 2);

/*
console.log('DPR = ', DPR);
console.log('assetsDPR = ', assetsDPR);
console.log('WIDTH = ', WIDTH);
console.log('HEIGHT = ', HEIGHT);
*/

let gameConfig = {
    type: Phaser.WEBGL,
    //type: Phaser.CANVAS,
    backgroundColor: '#222222',
    scale: {
        mode: Phaser.Scale.FIT,
        width: 720,
        height: 1280,
        parent: 'thegame',
    },
    dom: {
        createContainer: true
    },
    disableContextMenu: true, // ready for right-click if needed
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
    plugins: {
        scene: [{
            key: 'rexInputText',
            plugin: InputText,
            mapping: 'rexText'
        }]
    },
  scene: [BootGame, PlayGame, ZotTable, Four]
};


window.addEventListener('load', () => {
  new Phaser.Game(gameConfig);
});
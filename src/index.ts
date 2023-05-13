/* global Phaser */
import 'phaser';
import InputText from 'phaser3-rex-plugins/plugins/inputtext.js'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'

let testingNewRoom = import.meta.env.VITE_TESTING_SINGLE_ROOM;
if (location.hostname != "localhost") {
    testingNewRoom = "FALSE"
}

import PlayerUI from './scenes/playerUI';
import { Settings } from './scenes/settings';
import { HintBot } from './scenes/hintBot';
import { BootGame } from './scenes/bootGame';
import { PlayGame } from './scenes/main';
import { ZotTable } from './scenes/zotTable';

import { Four } from './scenes/four';
import { Five } from './scenes/five';
import { RoomTwo } from './scenes/roomTwo';
import { Clue2 } from './scenes/clue2';
import { TwoWay } from './scenes/twoWay';


const DPR = 4; // DPR not really used in this game at all...
export const WIDTH = 640 * DPR;
export const HEIGHT = 480 * DPR;
export const assetsDPR = Math.round((Math.min(Math.max(HEIGHT / 480, 1), 4) * 2) / 2);

let gameConfig = {
    type: Phaser.WEBGL,
    backgroundColor: '#333333',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 720,
        height: 1280,
        parent: 'thegame',
    },
    dom: {
        createContainer: true
    },

    disableContextMenu: true, // ready for right-click if needed

    plugins: {
        scene: [{
            key: 'rexInputText',
            plugin: InputText,
            mapping: 'rexText'
        },
        {
            key: 'rexUI',
            plugin: RexUIPlugin,
            mapping: 'rexUI'
        }
        ]
    },

    scene: [PlayerUI, Settings, HintBot, BootGame, PlayGame, ZotTable, Four, Five, RoomTwo, Clue2, TwoWay]
};



if (testingNewRoom == "TRUE") {
    gameConfig = {
        type: Phaser.WEBGL,
        backgroundColor: '#333333',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 720,
            height: 1280,
            parent: 'thegame',
        },
        dom: {
            createContainer: true
        },

        disableContextMenu: true, // ready for right-click if needed
        plugins: {
            scene: [{
                key: 'rexInputText',
                plugin: InputText,
                mapping: 'rexText'
            },
            {
                key: 'rexUI',
                plugin: RexUIPlugin,
                mapping: 'rexUI'
            }
            ]
        },
        scene: [PlayerUI, BootGame, Settings]
    };
}

window.addEventListener('load', () => {
    new Phaser.Game(gameConfig);
});
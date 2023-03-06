// Nothing to compress...
//import { stringify } from 'zipson';

import { setCookie, getCookie } from "../utils/cookie";

export default class Recorder {
    pointer: Phaser.Input.Pointer;
    pointerSprite: Phaser.GameObjects.Sprite;
    clickSprite: Phaser.GameObjects.Sprite;
    prevClickX: number;
    prevClickY: number;
    oldPointerDown: boolean;
    oldPointerTime: number;
    oldPointerX: number; oldPointerY: number;
    recordPointerX: number; recordPointerY: number;

    clickers: Phaser.GameObjects.Sprite[] = [];

    recording: string;
    recordingSize: number;
    recorderMode: string; // try everything

    constructor(pointer: Phaser.Input.Pointer,
        pointerSprite: Phaser.GameObjects.Sprite,
        clickSprite: Phaser.GameObjects.Sprite) {
        this.pointer = pointer;
        this.pointerSprite = pointerSprite;
        this.clickSprite = clickSprite;
        this.oldPointerX = 0; this.oldPointerY = 0;
        this.recording = "";
    }

    setMode(mode: string) {
        //console.log("MODE: " + mode);
        this.recorderMode = mode;
        setCookie("escapeRecorderMode", mode, 7); // bake for a week
    };

    getMode() {
        let mode = getCookie("escapeRecorderMode");
        if (mode == undefined || mode.length == 0) {
            mode = "init";
        }
        this.recorderMode = mode;
        return mode;
    }

    getSize() {
        let size = -1;
        if (this.recordingSize)
            size = this.recordingSize
        return size;
    }

    // This is terrible, but I don't know how to fix it. Need to update the pointer on mobile,
    // but we don't know what it is until update fires and they click?
    fixPointer(pointer: Phaser.Input.Pointer) {
        //console.log("OOF need to fix it");
        this.pointer = pointer;
    }

    // called once per update, tracks pointer movement and clicks
    checkPointer(scene: Phaser.Scene) {
        let pointerClicked: Boolean = false;

        this.fadeClick(scene);

        if (this.oldPointerDown != this.pointer.isDown) {
            this.oldPointerDown = this.pointer.isDown;
            if (this.oldPointerDown) {
                pointerClicked = true;
            }
        }
        // RIGHT CLICK CHECK
        //if (pointerClicked && this.pointer.rightButtonDown()) {
        //    this.getRecording();
        //    return;
        //}

        let pointerTime = scene.time.now - this.oldPointerTime;
        if (this.oldPointerX != this.pointer.worldX || this.oldPointerY != this.pointer.worldY || pointerTime > 1000 || pointerClicked) {
            let distanceX = Math.abs(this.pointer.worldX - this.oldPointerX);
            let distanceY = Math.abs(this.pointer.worldY - this.oldPointerY);
            // 500 resolution is sufficient?
            if ((distanceX + distanceY > 100) || (pointerTime > 1200) || pointerClicked) {
                this.oldPointerX = this.pointer.worldX;
                this.oldPointerY = this.pointer.worldY;
                this.pointerSprite.setX(this.pointer.worldX);
                this.pointerSprite.setY(this.pointer.worldY);
                this.oldPointerTime = scene.time.now;

                if (this.recordPointerX != this.oldPointerX || this.recordPointerY != this.oldPointerY) {
                    this.recordPointerX = this.oldPointerX;
                    this.recordPointerY = this.oldPointerY;
                    this.recordAction(scene, "mousemove");
                }
            }
        }

        if (pointerClicked) {
            this.recordAction(scene, "mouseclick");
            this.showClick(scene, this.pointer.x, this.pointer.y);
            pointerClicked = false;
            this.dumpRecording();
        }
    }

    recordAction(scene: Phaser.Scene, action: string) {
        // @ts-ignore
        // we don't need scene if we're not using actionTime
        const actionTime = scene.time.now;
        //console.log(`RECORDER ${action} ${Math.floor(this.pointer.x)}, ${Math.floor(this.pointer.y)} @ ${scene.time.now}`)
        this.recording = this.recording.concat(`${action},${Math.floor(this.pointer.x)},${Math.floor(this.pointer.y)},${scene.time.now}:`);
    }
    // everything would be so much easier if we had a scene here!! NO SHIT I GOT IT
    recordObjectDown(object: string, scene: Phaser.Scene) {
        //console.log(`RECORDER OBJECT ${object}`);
        //console.log(scene.time.now);
        this.recording = this.recording.concat(`object=${object},${Math.floor(this.pointer.x)},${Math.floor(this.pointer.y)},${scene.time.now}:`);
    }
    recordIconClick(object: string, scene: Phaser.Scene) {
        //console.log(`RECORDER ICON CLICK ${object}`);
        this.recording = this.recording.concat(`icon=${object},${Math.floor(this.pointer.x)},${Math.floor(this.pointer.y)},${scene.time.now}:`);
        //console.log(this.recording);

    }

    getRecording() {
        let cookieNumber = -1;
        let eof = "";
        let recordingIn = "";
        while (eof == "") {
            cookieNumber++;
            let cookie = getCookie("test" + cookieNumber);
            recordingIn += cookie.split('|')[0];;
            eof = cookie.split('|')[1];
        }
        //console.log(recordingIn);
        let recInCheck = recordingIn.split('?')[0];
        // @ts-ignore
        // with luck will need version checking later
        let recInVersion = recordingIn.split('?')[2];
        let recIn = recordingIn.split('?')[1];
        let re = /mousemove,/g; recIn = recIn.replace(re, "#");
        re = /#/g; recIn = recIn.replace(re, "mousemove,");
        re = /!/g; recIn = recIn.replace(re, "mouseclick,");
        re = /=/g; recIn = recIn.replace(re, "object=");
        re = /\-/g; recIn = recIn.replace(re, "icon=");

        if (recInCheck == this.checksum(recIn)) {
            //console.log("Good recording " + recIn);
        } else {
            throw new Error('recording cksum error');
        }
        return recIn;
    }

    getFormattedRecording(maxLineLength: number) {
        let recIn = this.getRecording();
        let recOut = "";

        let re = /mousemove,/g; recOut = recIn.replace(re, "#");
        re = /mouseclick,/g; recOut = recOut.replace(re, "!");
        re = /object=/g; recOut = recOut.replace(re, "=");
        re = /icon=/g; recOut = recOut.replace(re, "\-");

        let inStr = recOut;
        let out: string = "";

        while (inStr.length > 0) {
            if (inStr.length == recOut.length) {
                out = out + inStr.substring(0, maxLineLength - 9) + "\n";
                inStr = inStr.substring(maxLineLength - 15,);
            } else {
                out = out + inStr.substring(0, maxLineLength) + "\n";
                inStr = inStr.substring(maxLineLength,);
            }
        }

        recOut = "\n\n\n\n\n\n____________\n" + this.checksum(recIn) + "?" + out + "?v1\n___________";

        return recOut;
    }

    dumpRecording() {
        const rec = this.recording.split(":");
        let recOut = "";
        //console.log("ACTION COUNT " + rec.length);
        // struggling with TS arrays https://dpericich.medium.com/how-to-build-multi-type-multidimensional-arrays-in-typescript-a9550c9a688e
        let actions: [string, number, number, number][] = [["BOJ", 0, 0, 0]];

        //console.log(rec);
        // @ts-ignore
        // TODO how to use index without action? easy stuff probably, just now trying to build
        rec.forEach((action, idx) => {
            let thisActionRec = rec[idx];
            //console.log("RAW " + thisActionRec);
            let nextActionRec = rec[idx + 1] ?? "";   //Typescript check undefined and fix it up
            const secondLookahead = rec[idx + 2] ?? "";

            if (nextActionRec.length == 0) {
                nextActionRec = "OOF,0,0,0"
            }
            if (thisActionRec.length == 0) {
                thisActionRec = "EOF,0,0,0"
            }
            //console.log(`\nthis ${thisActionRec} next ${nextActionRec}`)
            const thisAction = thisActionRec.split(',')[0];
            let nextActionTime = nextActionRec.split(",")[3];
            if (nextActionTime === undefined)
                nextActionTime = secondLookahead.split(",")[3];

            // fix up clicks recorded with no time
            //console.log(`action ${thisAction}`)
            const complexAction = thisAction.split('=');
            if (complexAction.length > 1) {
                //console.log(`action complex!!! ${complexAction[0]} ${nextActionTime}`)
                thisActionRec = `${thisActionRec},${nextActionTime}`
                //console.log(`  ${thisActionRec}`)
            } else {
                //console.log(`  ${thisActionRec}`)
            }
            if (thisActionRec.includes("object=icon") || thisActionRec.includes("EOF,")) { // we need the icon click not the mask click
                //console.log("SKIP:")
            } else {
                //console.log(`  ${thisActionRec}`)
                //recOut += thisActionRec + ":";
                const splitAction = thisActionRec.split(',');

                actions.push([splitAction[0], parseInt(splitAction[1], 10), parseInt(splitAction[2], 10), parseInt(splitAction[3], 10)]);
            }
        });

        // Must throw out redundant stuff. Find these and mark time as 0.
        // Perhaps could clean up the input recorded actions but let's just fix them here
        // It's a big mess that calls for a do-over on all of this but for now it is what it is
        actions.forEach((action, idx) => {
            //console.log("ACT " + action);
            if (idx < actions.length - 1) {
                const nextAction = actions[idx + 1];
                //console.log(action[3] + " " + nextAction[3])
                const complexAction = action[0].split('=');
                if (complexAction.length > 1) {
                    if (action[3] == nextAction[3]) {
                        nextAction[3] = 0;
                        if (idx < actions.length - 2)
                            actions[idx + 2][3] = 0;
                    }
                } else if (action[3] == nextAction[3]) // move then click, skip the move
                    action[3] = 0;
            }
        });

        // calculate elapsed time for non-redundant events and we're done, build the output string
        let prevTime = 0;
        let elapsed = 0;
        actions.forEach((action) => {
            //console.log(`ActionIn ${action}  time ${action[3]}`);
            if (action[3] > 0) {
                elapsed = action[3] - prevTime;
                prevTime = action[3];
                //console.log(`>> ${action}  time ${action[3]}  elapsed ${elapsed}`);
                recOut = recOut.concat(`${action[0]},${action[1]},${action[2]},${elapsed}:`);
            }
        });

        const recording = recOut;
        //console.log("Save: " + recOut);
        let re = /mousemove,/g; recOut = recording.replace(re, "#");
        re = /mouseclick,/g; recOut = recOut.replace(re, "!");
        re = /object=/g; recOut = recOut.replace(re, "=");
        re = /icon=/g; recOut = recOut.replace(re, "\-");
        recOut = this.checksum(recording) + "?" + recOut + "?v1";
        //console.log("OUT " + recOut);
        this.saveCookies(recOut);
    }

    saveCookies(data: string) {
        this.recordingSize = data.length;
        const cookieName = "test";
        // must split if too big
        let chunked = this.chunkString(data, 4080); // max 4096
        // @ts-ignore FIX THIS TOO
        chunked!.forEach((chunk, idx) => {
            chunked![idx] += "|"
        });
        chunked![chunked!.length - 1] += "EOF"; // https://timmousk.com/blog/typescript-object-is-possibly-null/
        //console.log(chunked);
        chunked!.forEach((chunk, idx) => {
            let cookieNameOut = cookieName + idx;
            //console.log("COOKIEOUT " + cookieNameOut + ":" + chunk);
            setCookie(cookieNameOut, chunk, 7); // bake for a week
        });


    }

    chunkString(str: string, length: number) {
        return str.match(new RegExp('.{1,' + length + '}', 'g'));
    }

    // https://stackoverflow.com/questions/811195/fast-open-source-checksum-for-small-strings
    checksum(s: string) {
        var chk = 0x12345678;
        var len = s.length;
        for (var i = 0; i < len; i++) {
            chk += (s.charCodeAt(i) * (i + 1));
        }

        return (chk & 0xffffffff).toString(16);
    }

    showClick(scene: Phaser.Scene, x: number, y: number) {
        const config = {
            key: 'clckrClk',
            scale: 3
        };

        var newSprite = scene.make.sprite(config);
        newSprite.setX(x); newSprite.setY(y);
        if (x == this.prevClickX && y == this.prevClickY) {
            newSprite.setScale(5);
        }
        this.clickers.push(newSprite);
        //console.log("CLICKERCOUNT " + this.clickers.length)
        this.prevClickX = x; this.prevClickY = y;
        newSprite.setDepth(3000);
    }
    // @ts-ignore DONT NEED SCENE
    fadeClick(scene: Phaser.Scene) {
        this.clickers.forEach((clicked, idx) => {
            if (clicked.alpha > 0) {
                clicked.setScale(clicked.scale * .8);
                clicked.setAlpha(clicked.alpha - .01);
            } else {
                this.clickers.splice(idx, 1);
            }
        });
    }
}
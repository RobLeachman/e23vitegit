//import { stringify, parse } from 'zipson';
import { getCookie, setCookie } from './cookie';

// Simulator from a previous game.
// Featured game state save, I think?


//TODO: fix the horror that is scoping in this object
export default class Simulator {
  mode:string;
  recordedActions = [];
  recording: string;

  constructor() {

    this.recordedActions = [];
    this.mode = getCookie("mode");
    if (this.mode.length == 0) {
      this.mode = "idle";
      setCookie("mode", this.mode, 7);
    }
    console.log(`Simulator mode: ${this.mode}`);
  }

  getMode() {
    return this.mode;
  }

  setMode(newMode:string) {
    setCookie("mode", newMode, 7);
  }

/* not sure how this worked...  
  record(time, code) {
    console.log(`simulator recorded ${code} at ${time}`);
    var action = {
      time: time,
      code: code
    }
    this.recordedActions.push(action);
  }
*/  

  reset() {
    this.recordedActions = [];
    this.save();
    this.setMode("idle");
  }

  save() {
    for (var i=0;i<this.recordedActions.length;i++) {
      var action = this.recordedActions[i];
      //console.log(`save: ${action.code} at ${action.time}`);
    }
    // //this.list();  //no clue what this ever did

    // zipson fallback
    //this.recording = stringify(this.recordedActions);
    this.recording = JSON.stringify(this.recordedActions);

    //console.log(this.recording);
    return this.recording;
  }

  load(recording:string) {
    //console.log("recording:");
    //console.log(recording);
    try {
      //this.recordedActions = parse(recording);
      this.recordedActions = JSON.parse(recording);
    } catch (err) {
      console.log("invalid recording!");
      //this.recordedActions = null;
    }
    //this.list();
    return this.recordedActions;
  }

  /* clearly this listed all the actions to console... neat
  list() {
    //console.log("sim current recording:");
    //console.log(this.recordedActions);
    if (this.recordedActions.length < 1) {
      console.log("no recording");
      return;
    }

    var start = this.recordedActions[0].time;
    console.log(`start at ${start}`);
    for (var i=0;i<this.recordedActions.length;i++) {
      var action = this.recordedActions[i];
      console.log(`${action.code} at ${action.time-start}`);
    }
  }
  */

  /* can't remember anything about how this worked...
  getRecording(skipToZero:boolean) {
    this.load(getCookie("test1"));
    if (this.recordedActions.length < 1)
        return this.recordedActions;

    if (skipToZero) {
      var zeroRecordedActions = [];
      var start = this.recordedActions[0].time;
      //console.log(`zero start at ${start}`);
      for (var i=0;i<this.recordedActions.length;i++) {
        var action = this.recordedActions[i];
        //console.log(`${action.code} at ${action.time-start}`);
        var zeroAction = {
            code: action.code,
            time: action.time - start
        }
        zeroRecordedActions.push(zeroAction);
      }
      this.recordedActions = zeroRecordedActions;
      return this.recordedActions;
    } else {
      return this.recordedActions;
    }
  }
  */

  putRecording() {
    setCookie("test1",this.save(),7);
  }
}

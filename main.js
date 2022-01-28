// Declare variables

const textInput = document.getElementById('input-text');
const display1 = document.getElementById('text-1');
const display2 = document.getElementById('text-2');
const display3 = document.getElementById('text-3');
const display4 = document.getElementById('text-4');
const display5 = document.getElementById('text-5');
const startStop = document.getElementById('start-stop');
const parseText = document.getElementById('parse');
const hideTextButton = document.getElementById('hide-text');
const hideControlsButton = document.getElementById('hide-controls');
let intervalHandle = null;
let textArray = [];
let wordArray = [];
let chunkArray = [];
let chunkSize = 16;
let wpm = 500;
let delay = 500;
let state = "stopped";
let s = 0;
let i = 0;

// Object literal list of functions

const Action = {
    start() {
        if (state != "running" && state != "backwards") {
            intervalHandle = setInterval(Action.output, delay);
        }
        state = "running";
        console.log(state);
    },

    pause() {
        clearInterval(intervalHandle);
        state = "paused";
        console.log(state);
    },

    blink() {
        if (state == "running") {
            Action.pause();
            state = "blink";
        }
    },

    unblink() {
        if (state == "blink") {
            Action.start();
            state = "running";
        }
    },

    last() {
        if (s > 0) {
            s--;
            i = 0;
            Action.start();
            console.log("last");
        }
    },

    skip() {
        if (s + 1 < chunkArray.length) {
            s++;
            i = 0;
            Action.start();
            console.log("skip");
        }
    },

    back() {
        state = "backwards"
    },

    forwards() {
        // Action.pause();
        // i = i + 5;
        // Action.output();
        // console.log("forwards 5");
    },

    toggleStartStop() {
        if (state == "stopped") {
            s = 0;
            i = 0;
            getText();
            Action.start();
        } else if (state == "paused") {
            Action.start();
        } else if (state == "running") {
            Action.pause();
        } else {
            alert("Unknown Error");
        }
    },

    slower() {
        if (wpm >= 100) {
            wpm -= 20;
            calcDelay();
            document.getElementById('speed').innerHTML = wpm;
            clearInterval(intervalHandle);
            if (state == "running") {
                intervalHandle = setInterval(Action.output, delay);
            }
            console.log(delay);
        }
    },

    faster() {
        if (wpm <= 2000) {
            wpm += 20;
            calcDelay();
            document.getElementById('speed').innerHTML = wpm;
            clearInterval(intervalHandle);
            if (state == "running") {
                intervalHandle = setInterval(Action.output, delay);
            }
            console.log(delay);
        }
    },

    smaller() {
        if (chunkSize > 5) {
            chunkSize -= 2;
            getText();
            calcDelay();
            i = 0;
            document.getElementById('size').innerHTML = chunkSize;
            document.getElementById('display-box').style.width=("calc(40vh + " + chunkSize + "vw)");
            clearInterval(intervalHandle);
            if (state == "running") {
                intervalHandle = setInterval(Action.output, delay);
            }
            console.log(chunkSize);
        }
    },

    bigger() {
        if (chunkSize < 40) {
            chunkSize += 2;
            getText();
            calcDelay();
            i = 0;
            document.getElementById('size').innerHTML = chunkSize;
            document.getElementById('display-box').style.width=("calc(40vh + " + chunkSize + "vw)");
            clearInterval(intervalHandle);
            if (state == "running") {
                intervalHandle = setInterval(Action.output, delay);
            }
            console.log(chunkSize);
        }
    },

    output() {
        console.log("state");
        if (s < chunkArray.length) {
            if (state == "backwards") {
                i -= 2;
            }
            display1.textContent = chunkArray[s][i-2];
            display2.textContent = chunkArray[s][i-1];
            display3.textContent = chunkArray[s][i];
            display4.textContent = chunkArray[s][i+1];
            display5.textContent = chunkArray[s][i+2];
            i++;
            if (i >= chunkArray[s].length) {
                s++;
                i = 0;
            }
        } else {
            clearInterval(intervalHandle);
            state = "stopped";
            console.log(state);
        }
    },

    hideText() {
        document.getElementById('text-area').style.display=("none");
        document.getElementById('display-area').style.height=("calc(100vh - 150px)");
    },

    hideControls() {
        document.getElementById('controls-area').style.display=("none");
        document.getElementById('display-area').style.height=("calc(100vh - 50px)");
    }
}

const keyAction = {
    Control: { keydown: Action.blink, keyup: Action.unblink },
    a: { keydown: Action.last },
    s: { keydown: Action.skip },
    z: { keydown: Action.back, keyup: Action.start },
    x: { keydown: Action.forwards, keyup: Action.start },
    " ": { keydown: Action.toggleStartStop },
    ArrowUp: { keydown: Action.faster },
    ArrowDown: { keydown: Action.slower },
    ArrowLeft: { keydown: Action.smaller },
    ArrowRight: { keydown: Action.bigger }
}

const keyHandler = (ev) => {
    if (ev.repeat) return;                             
    if (!(ev.key in keyAction) || !(ev.type in keyAction[ev.key])) return;
    keyAction[ev.key][ev.type]();
  };
  
  ['keydown', 'keyup'].forEach((evType) => {
    document.body.addEventListener(evType, keyHandler);
  });

function getText() {
    sentenceArray =  textInput.value.match(/[^\.\!\?]*[\.\!\?]/ig);
    for (let j = 0; j < sentenceArray.length; j++) {
        wordArray[j] = sentenceArray[j].match(/\S+/ig);
        let l = 0;
        chunkArray[j] = [];
        chunkArray[j][l] = wordArray[j][0];
        for (let k = 1; k < wordArray[j].length; k++) {
            if (chunkArray[j][l].length + wordArray[j][k].length <= chunkSize) {
                chunkArray[j][l] = chunkArray[j][l] + " " + wordArray[j][k];
            } else {
                chunkArray[j].push(wordArray[j][k]);
                l++;
            }
        }
    }
}

function calcDelay() {
    getText();
    let wordCount = textInput.value.match(/\S+/ig).length;
    console.log(wordCount + " words");
    let chunkCount = 0;
    for (let m = 0; m  < chunkArray.length; m++) {
        chunkCount += chunkArray[m].length;
    }
    console.log(chunkCount + " chunks");
    let totalSeconds = wordCount / wpm * 60;
    console.log(totalSeconds + " seconds");
    delay = totalSeconds / chunkCount * 1000;
    console.log("Delay " + delay)
}

// textInput.addEventListener('keyup', getText);
document.addEventListener("DOMContentLoaded", getText);
hideControlsButton.addEventListener('click', Action.hideControls);
hideTextButton.addEventListener('click', Action.hideText);
parseText.addEventListener('click', getText);
startStop.addEventListener('click', Action.toggleStartStop);
// window.addEventListener('keyup', toggleStartStop);

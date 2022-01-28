// Declare variables

const textInput = document.getElementById('input-text');
const display1 = document.getElementById('text-1');
const display2 = document.getElementById('text-2');
const display3 = document.getElementById('text-3');
const display4 = document.getElementById('text-4');
const display5 = document.getElementById('text-5');
const hideTextButton = document.getElementById('hide-text');
const hideControlsButton = document.getElementById('hide-controls');
const backButton = document.getElementById('back');
const forwardsButton = document.getElementById('forwards');
const parseButton = document.getElementById('parse');
const startStopButton = document.getElementById('start-stop');
const fasterButton = document.getElementById('faster');
const slowerButton = document.getElementById('slower');
const smallerButton = document.getElementById('smaller');
const biggerButton = document.getElementById('bigger');
let textHidden = false;
let controlsHidden = false;
let intervalHandle = null;
let textArray = [];
let wordArray = [];
let chunkArray = [];
let chunkSize = 16;
let wpm = 500;
let delay = 325;
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
        document.getElementById('text-1').style.color="rgba(0, 0, 0, 0.03)";
        document.getElementById('text-2').style.color="rgba(0, 0, 0, 0.05)";
        document.getElementById('text-4').style.color="rgba(0, 0, 0, 0.05)";
        document.getElementById('text-5').style.color="rgba(0, 0, 0, 0.03)";
    },

    pause() {
        clearInterval(intervalHandle);
        state = "paused";
        document.getElementById('text-1').removeAttribute("style");
        document.getElementById('text-2').removeAttribute("style");
        document.getElementById('text-4').removeAttribute("style");
        document.getElementById('text-5').removeAttribute("style");
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
        }
    },

    skip() {
        if (s + 1 < chunkArray.length) {
            s++;
            i = 0;
            Action.start();
        }
    },

    back() {
        state = "backwards";
        document.getElementById('text-1').removeAttribute("style");
        document.getElementById('text-2').removeAttribute("style");
        document.getElementById('text-4').removeAttribute("style");
        document.getElementById('text-5').removeAttribute("style");
    },

    forwards() {
        i++;
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
        }
    },

    faster() {
        if (wpm < 2000) {
            wpm += 20;
            calcDelay();
            document.getElementById('speed').innerHTML = wpm;
            clearInterval(intervalHandle);
            if (state == "running") {
                intervalHandle = setInterval(Action.output, delay);
            }
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
            } else {
                Action.output();
                i--;
            }
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
            } else {
                Action.output();
                i--;
            }
        }
    },

    parse() {
        Action.pause();
        getText();
        s = 0;
        i = 0;
        Action.output();
    },

    output() {
        console.log(s + ", " + i);
        console.log(delay + "ms");
        console.log(wpm + "wpm");
        if (s < chunkArray.length) {
            if (state == "backwards") {
                if (i <= 0 && s > 0) {
                    s--;
                    i = chunkArray[s].length - 2;
                } else {
                    i -= 2;
                }
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

    toggleText() {
        if (textHidden == false && controlsHidden == false) {
            document.getElementById('text-area').style.display=("none");
            document.getElementById('display-area').style.height=("calc(100vh - 150px)");
            textHidden = true;
        } else if (textHidden == false && controlsHidden == true) {
            document.getElementById('text-area').style.display=("none");
            document.getElementById('display-area').style.height=("calc(100vh - 50px)");
            textHidden = true;
        } else if (textHidden == true && controlsHidden == false) {
            document.getElementById('text-area').removeAttribute("style");
            document.getElementById('display-area').style.height=("calc(60vh - 100px)");
            textHidden = false;
        } else {
            document.getElementById('text-area').removeAttribute("style");
            document.getElementById('display-area').style.height=("calc(60vh)");
            textHidden = false;
        }
    },

    toggleControls() {
        if (controlsHidden == false && textHidden == false) {
            document.getElementById('controls-area').style.display=("none");
            document.getElementById('display-area').style.height=("calc(60vh)");
            controlsHidden = true;
        } else if (controlsHidden == false && textHidden == true) {
            document.getElementById('controls-area').style.display=("none");
            document.getElementById('display-area').style.height=("calc(100vh - 50px)");
            controlsHidden = true;
        } else if (controlsHidden == true && textHidden == false) {
            document.getElementById('controls-area').removeAttribute("style");
            document.getElementById('display-area').style.height=("calc(60vh - 100px)");
            controlsHidden = false;
        } else {
            document.getElementById('controls-area').removeAttribute("style");
            document.getElementById('display-area').style.height=("calc(100vh - 150px)");
            controlsHidden = false;
        }
    }
}

// Object literal list of keys and functions to apply to them

const keyAction = {
    Control: { keydown: Action.blink, keyup: Action.unblink },
    a: { keydown: Action.last },
    s: { keydown: Action.skip },
    z: { keydown: Action.back, keyup: Action.start },
    x: { keydown: Action.forwards },
    " ": { keydown: Action.toggleStartStop },
    ArrowUp: { keydown: Action.faster },
    ArrowDown: { keydown: Action.slower },
    ArrowLeft: { keydown: Action.smaller },
    ArrowRight: { keydown: Action.bigger },
    Enter: { keydown: Action.parse }
}

// KeyHandler - maps keyup/down events to functions

const keyHandler = (ev) => {
    // if (ev.repeat) return;        // disables hold down                     
    if (!(ev.key in keyAction) || !(ev.type in keyAction[ev.key])) return;
    keyAction[ev.key][ev.type]();
  };
  
  ['keydown', 'keyup'].forEach((evType) => {
    document.body.addEventListener(evType, keyHandler);
  });

// Parse text from input and split into sentences and chunks depending on chunk size

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

// calculate delay interval using given wpm and number of words and chunks depending on chunk size

function calcDelay() {
    getText();
    let wordCount = textInput.value.match(/\S+/ig).length;
    let chunkCount = 0;
    for (let m = 0; m  < chunkArray.length; m++) {
        chunkCount += chunkArray[m].length;
    }
    let totalSeconds = wordCount / wpm * 60;
    delay = totalSeconds / chunkCount * 1000;
}

// Remove focus from all buttons 

document.querySelectorAll("button").forEach( function(item) {
    item.addEventListener('focus', function() {
        this.blur();
    })
})

// Event listeners

hideControlsButton.addEventListener('click', Action.toggleControls);
hideTextButton.addEventListener('click', Action.toggleText);
backButton.addEventListener('mousedown', Action.back);
backButton.addEventListener('mouseup', Action.start);
forwardsButton.addEventListener('mousedown', Action.forwards);
parseButton.addEventListener('click', Action.parse);
startStopButton.addEventListener('click', Action.toggleStartStop);
fasterButton.addEventListener('click', Action.faster);
slowerButton.addEventListener('click', Action.slower);
smallerButton.addEventListener('click', Action.smaller);
biggerButton.addEventListener('click', Action.bigger);




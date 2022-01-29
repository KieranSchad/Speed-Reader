// Declare variables

const textInput = document.getElementById('input-text');
const display1 = document.getElementById('text-1');
const display2 = document.getElementById('text-2');
const display3 = document.getElementById('text-3');
const display4 = document.getElementById('text-4');
const display5 = document.getElementById('text-5');
const hideTextButton = document.getElementById('hide-text');
const hideControlsButton = document.getElementById('hide-controls');
const blinkButton = document.getElementById('blink');
const lastButton = document.getElementById('last');
const skipButton = document.getElementById('skip');
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
let backwards = false;
let fastForwards = false;
let s = 0;
let i = 0;

// Object literal list of functions

const Action = {
    start() {
        if (state != "running") {
            intervalHandle = setInterval(Action.output, delay);
        }
        state = "running";
        Action.dimText();
    },

    pause() {
        clearInterval(intervalHandle);
        state = "paused";
        Action.brightText();
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
        if (s > 0 && i == 0) {
            s -= 2;
        } else if (s > 0) {
            s--;
            i = 0;
        } else {
            i = 0;
        }
        Action.output();
    },

    skip() {
        if (s < chunkArray.length - 1) {
            s++;
            i = 0;
            Action.output();
        }
    },

    back() {
        backwards = true;
        Action.brightText();
        if (state == "running") {
            state = "wasRunning";
            clearInterval(intervalHandle);
            i--;
            delay = 50;
            Action.output();
            intervalHandle = setInterval(Action.output, delay);
        } else if (state == "paused") {
            state = "wasPaused";
            i--;
            delay = 50;
            Action.output();
            intervalHandle = setInterval(Action.output, delay);
        } else if (state == "stopped") {
            state = "wasStopped";
            s--;
            i = chunkArray[s].length - 1;
            delay = 50;
            Action.output();
            intervalHandle = setInterval(Action.output, delay);
        }
    },

    endBack() {
        backwards = false;
        i++;
        clearInterval(intervalHandle);
        calcDelay();
        if (state == "wasRunning") {
            state = "running"
            Action.dimText();
            Action.output();
            intervalHandle = setInterval(Action.output, delay);
        } else if (state == "wasPaused") {
            state = "paused";
            clearInterval(intervalHandle);
        } else if (state == "wasStopped") {
            state = "paused"
            clearInterval(intervalHandle);
        }
    },

    forwards() {
        Action.brightText();
        if (state == "running") {
            state = "wasRunning";
            clearInterval(intervalHandle);
            delay = 50;
            Action.output();
            intervalHandle = setInterval(Action.output, delay);
        } else if (state == "paused") {
            state = "wasPaused";
            delay = 50;
            Action.output();
            intervalHandle = setInterval(Action.output, delay);
        }
    },

    endForwards() {
        clearInterval(intervalHandle);
        calcDelay();
        if (state == "wasRunning") {
            state = "running";
            intervalHandle = setInterval(Action.output, delay);
            Action.dimText();
        } else if (state == "wasPaused") {
            state = "paused";
            clearInterval(intervalHandle);
        }
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
            document.getElementById('display-box').style.width=("calc(40vh + " + (1.5 * chunkSize) + "vw)");
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
        if (chunkSize < 36) {
            chunkSize += 2;
            getText();
            calcDelay();
            i = 0;
            document.getElementById('size').innerHTML = chunkSize;
            document.getElementById('display-box').style.width=("calc(40vh + " + (1.5 * chunkSize) + "vw)");
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
        state = "paused";
    },

    dimText() {
        document.getElementById('text-1').style.color="rgba(0, 0, 0, 0.03)";
        document.getElementById('text-2').style.color="rgba(0, 0, 0, 0.05)";
        document.getElementById('text-4').style.color="rgba(0, 0, 0, 0.05)";
        document.getElementById('text-5').style.color="rgba(0, 0, 0, 0.03)";
    },

    brightText() {
        document.getElementById('text-1').removeAttribute("style");
        document.getElementById('text-2').removeAttribute("style");
        document.getElementById('text-4').removeAttribute("style");
        document.getElementById('text-5').removeAttribute("style");
    },

    output() {
        // console.log(s + ", " + i);
        // console.log(delay + "ms");
        // console.log(wpm + "wpm");

        if (s < chunkArray.length) {                  // if it's not past the end
            display1.textContent = chunkArray[s][i-2];
            display2.textContent = chunkArray[s][i-1];
            display3.textContent = chunkArray[s][i];
            display4.textContent = chunkArray[s][i+1];
            display5.textContent = chunkArray[s][i+2];
            if (backwards == true) {                  // if it's going backwards
                if (i <= 0 && s > 0) {                // if it's gone back to the first word of a sentance but not the very first sentence
                    s--;                              // go back one sentence
                    i = chunkArray[s].length - 1;     // go to the last word in the sentence
                } else {                              // if it's going backwards not at the beginning of a sentence
                    i--;                              // go back one word
                }
            } else {                                  // if it's going forwards normally
                i++;                                  // add one
            }
        if (i >= chunkArray[s].length) {              // if it's at the end of a sentence
            s++;                                      // go to the next sentence
            i = 0;                                    // go to the beginning of the sentence
            }
        } else {                                      // if it is past the end (after increasing s)
            clearInterval(intervalHandle);            // stop
            Action.brightText();
            state = "stopped";
            // console.log(state);
        }
    },

    toggleText() {
        if (textHidden == false && controlsHidden == false) {
            document.getElementById('text-area').style.display=("none");
            document.getElementById('display-area').style.height=("calc(100vh - 150px)");
            document.getElementById('body').style.width=("100%");
            Action.changeFontSize("7vh");
            textHidden = true;
            document.getElementById('hide-text').innerHTML = "Show Text";
        } else if (textHidden == false && controlsHidden == true) {
            document.getElementById('text-area').style.display=("none");
            document.getElementById('display-area').style.height=("calc(100vh - 50px)");
            Action.changeFontSize("7vh");
            textHidden = true;
            document.getElementById('hide-text').innerHTML = "Show Text";
        } else if (textHidden == true && controlsHidden == false) {
            document.getElementById('text-area').removeAttribute("style");
            document.getElementById('display-area').style.height=("calc(60vh - 100px)");
            Action.changeFontSize("6vh");
            textHidden = false;
            document.getElementById('hide-text').innerHTML = "Hide Text";
        } else {
            document.getElementById('text-area').removeAttribute("style");
            document.getElementById('display-area').style.height=("calc(60vh)");
            Action.changeFontSize("6vh");
            textHidden = false;
            document.getElementById('hide-text').innerHTML = "Hide Text";
        }
    },

    toggleControls() {
        if (controlsHidden == false && textHidden == false) {
            document.getElementById('controls-area').style.display=("none");
            document.getElementById('display-area').style.height=("calc(60vh)");
            controlsHidden = true;
            document.getElementById('hide-controls').innerHTML = "Show Controls";
        } else if (controlsHidden == false && textHidden == true) {
            document.getElementById('controls-area').style.display=("none");
            document.getElementById('display-area').style.height=("calc(100vh - 50px)");
            controlsHidden = true;
            document.getElementById('hide-controls').innerHTML = "Show Controls";
        } else if (controlsHidden == true && textHidden == false) {
            document.getElementById('controls-area').removeAttribute("style");
            document.getElementById('display-area').style.height=("calc(60vh - 100px)");
            controlsHidden = false;
            document.getElementById('hide-controls').innerHTML = "Hide Controls";
        } else {
            document.getElementById('controls-area').removeAttribute("style");
            document.getElementById('display-area').style.height=("calc(100vh - 150px)");
            controlsHidden = false;
            document.getElementById('hide-controls').innerHTML = "Hide Controls";
        }
    },

    changeFontSize(h1Size) {
        document.getElementById('text-1').style.fontSize = h1Size;
        document.getElementById('text-2').style.fontSize = h1Size;
        document.getElementById('text-3').style.fontSize = h1Size;
        document.getElementById('text-4').style.fontSize = h1Size;
        document.getElementById('text-5').style.fontSize = h1Size;
    },

    color0() {
        document.getElementById('html').removeAttribute("style");
    },
    color1() {
        document.getElementById('html').style.background = ("linear-gradient(90deg, rgba(65,20,0,1) 0%, rgba(189,59,1,1) 50%, rgba(65,20,0,1) 100%)");
    },
    color2() {
        document.getElementById('html').style.background = ("linear-gradient(90deg, rgba(75,57,0,1) 0%, rgba(189,143,1,1) 50%, rgba(75,57,0,1) 100%)");
    },
    color3() {
        document.getElementById('html').style.background = ("linear-gradient(90deg, rgba(134,127,110,1) 0%, rgba(186,177,155,1) 50%, rgba(134,127,110,1) 100%)");
    },
    color4() {
        document.getElementById('html').style.background = ("linear-gradient(90deg, rgba(110,121,134,1) 0%, rgba(160,179,202,1) 50%, rgba(110,121,134,1) 100%)");
    },
    color5() {
        document.getElementById('html').style.background = ("linear-gradient(90deg, rgba(42,94,154,1) 0%, rgba(68,144,235,1) 50%, rgba(42,94,154,1) 100%)");
    },
    color6() {
        document.getElementById('html').style.background = ("linear-gradient(90deg, rgba(11,40,123,1) 0%, rgba(61,100,213,1) 50%, rgba(11,40,123,1) 100%)");
    },
    color7() {
        document.getElementById('html').style.background = ("linear-gradient(90deg, rgba(15,20,133,1) 0%, rgba(120,58,195,1) 50%, rgba(15,20,133,1) 100%)");
    },
    color8() {
        document.getElementById('html').style.background = ("linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(35,35,35,1) 50%, rgba(0,0,0,1) 100%)");
    },
    color9() {
        document.getElementById('html').style.background = ("linear-gradient(90deg, rgba(209,209,209,1) 0%, rgba(233,233,233,1) 50%, rgba(209,209,209,1) 100%)");
    }
    
}

// Object literal list of keys and functions to apply to them

const keyAction = {
    Control: { keydown: Action.blink, keyup: Action.unblink },
    a: { keydown: Action.last },
    s: { keydown: Action.skip },
    z: { keydown: Action.back, keyup: Action.endBack },
    x: { keydown: Action.forwards, keyup: Action.endForwards },
    " ": { keydown: Action.toggleStartStop },
    ArrowUp: { keydown: Action.faster },
    ArrowDown: { keydown: Action.slower },
    ArrowLeft: { keydown: Action.smaller },
    ArrowRight: { keydown: Action.bigger },
    Enter: { keydown: Action.parse },
    1: { keydown: Action.color1 },
    2: { keydown: Action.color2 },
    3: { keydown: Action.color3 },
    4: { keydown: Action.color4 },
    5: { keydown: Action.color5 },
    6: { keydown: Action.color6 },
    7: { keydown: Action.color7 },
    8: { keydown: Action.color8 },
    9: { keydown: Action.color9 },
    0: { keydown: Action.color0 }
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
blinkButton.addEventListener('mousedown', Action.blink);
blinkButton.addEventListener('mouseup', Action.unblink);
lastButton.addEventListener('click', Action.last);
skipButton.addEventListener('click', Action.skip);
backButton.addEventListener('mousedown', Action.back);
backButton.addEventListener('mouseup', Action.endBack);
forwardsButton.addEventListener('mousedown', Action.forwards);
forwardsButton.addEventListener('mouseup', Action.endForwards);
parseButton.addEventListener('click', Action.parse);
startStopButton.addEventListener('click', Action.toggleStartStop);
fasterButton.addEventListener('click', Action.faster);
slowerButton.addEventListener('click', Action.slower);
smallerButton.addEventListener('click', Action.smaller);
biggerButton.addEventListener('click', Action.bigger);




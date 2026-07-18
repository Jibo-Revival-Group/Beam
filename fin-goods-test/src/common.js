let jibo = require('jibo');


function getListenerWrapper(callback) {
    return (ev) => {
        callback();
        ev.preventDefault();
        ev.stopImmediatePropagation();
        return false;
    };
}

export default {
    /**
     * Helper method to set robot to 0-position and clear out the LED
     **/
    centerRobot() {
        // index position
        let animUtils = jibo.animate.centerRobot();
        this.resetLED();
    },

    resetLED() {
        jibo.animate.setLEDColor([0,0,0]);
    },

    setLED(rbgArray) {
        jibo.animate.setLEDColor(rbgArray);
    },

    //function to neatly set test label 1,2,3 text
    _setScreenText(mess1, mess2 = "", mess3 = "", mess4 = ""){
        document.getElementById('test-label1').innerHTML = mess1;
        document.getElementById('test-label2').innerHTML = mess2;
        document.getElementById('test-label3').innerHTML = mess3;
        document.getElementById('test-label4').innerHTML = mess4;
    },

    //remove a button from a screen quickly
    _clearButtonFromScreen(buttonArr){
        for (var i = 0; i < buttonArr.length; i++) {
            if(buttonArr[i] != null){
                let button = document.getElementById(buttonArr[i]);
                button.style.display = 'none';
                //clear listeners
                button.onmousedown = button.ontouchstart = null;
            }
        }
    },

    //set button on screen with location, touch callback, and optionally text
    _showButton(button, mR, mT, callback, content = null){
        let temp = document.getElementById(button);
        temp.style.display = 'block';
        temp.style.marginRight = mR;
        temp.style.marginTop = mT;
        if (callback)
            temp.onmousedown = temp.ontouchstart = getListenerWrapper(callback);
        if (content != null)
            temp.innerHTML = content;
    },

    _addButtonListener(button, callback) {
        let temp = document.getElementById(button);
        temp.onmousedown = temp.ontouchstart = getListenerWrapper(callback);
    },

    _removeButtonListener(button) {
        let temp = document.getElementById(button);
        temp.onmousedown = temp.ontouchstart = null;
    },

    //function to neatly set background to test images or clear background
    _setShowBackground(show, source) {
        let bkg = document.getElementById('background');
        bkg.src = source;
        bkg.style.visibility = (show ? 'visible' : 'hidden');
    },

    _setPassFailButtons(pB, fB, mode){
        pB.classList.remove('success', 'failure', 'clear');
        fB.classList.remove('success', 'failure', 'clear');
        //'success', 'failure', and 'clear' are all recognized classes in the CSS
        pB.classList.add(mode);
        fB.classList.add(mode);
    },

    _setBodySegIndex(body){
        var index = -1;
        if(body == 'neck'){
            index = 0;
        }
        else if(body == 'torso'){
            index = 1;
        }
        else if(body == 'pelvis'){
            index = 2;
        }
        return index
    }
}

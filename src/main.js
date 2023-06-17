import { NOTE } from "./note.js";
import { CON } from "./constraints.js";
import { GUI } from "./gui.js";
import { CTRL } from "./control.js";

window.onload = () => { MAIN.startup(); };  // entry point

const MAIN = {
    startup: () => {
        CON.build();
        CTRL.initialize()
        NOTE.end();
    },

};

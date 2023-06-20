import { NOTE } from "./flat_folder/note.js";
import { CON } from "./flat_folder/constraints.js";
import { CTRL } from "./control.js";

window.onload = () => { MAIN.startup(); };  // entry point

const MAIN = {
    startup: () => {
        CON.build();
        CTRL.initialize()
        NOTE.end();
    },

};

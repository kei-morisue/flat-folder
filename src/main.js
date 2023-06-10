import { NOTE } from "./note.js";
import { CON } from "./constraints.js";
import { GUI } from "./gui.js";
import { CTRL } from "./control.js";
import { IO } from "./io.js";

import { CP } from "./cp.js";
import { F } from "./fold.js";
window.onload = () => { MAIN.startup(); };  // entry point

const MAIN = {
    startup: () => {
        NOTE.clear_log();
        NOTE.start("*** Starting Flat-Folder ***");
        NOTE.time("Initializing interface");
        GUI.initiate_canvas(document.getElementById("main"), ["flat", "cell", "fold"])
        CTRL.initialize()

        MAIN.sandbox()

        NOTE.time("Computing constraint implication maps");
        CON.build();
        NOTE.end();
    },

    sandbox: () => {
        const FOLD = IO.doc_type_2_FOLD(CP.testopx1, "opx", "+")
        F.compute_flat(FOLD)

    }

};

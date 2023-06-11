import { NOTE } from "./note.js";
import { IO } from "./io.js";

import { F } from "./fold.js";
import { D } from "./distortion.js";


import { CP } from "./cp.js";
import { X } from "./conversion.js";
export const CTRL = {
    sandbox: (Y = D.Id, A0 = D.Id) => {

        const $flat = document.getElementById("flat")
        const $cell = document.getElementById("cell")
        const FOLD = IO.doc_type_2_FOLD(CP.testopx0, "opx", "+")
        const CELL = X.FOLD_2_CELL(FOLD)
        const DIST = D.make_akitaya_dist(FOLD, Y, A0)
        //const DIST = D.make_dist(FOLD, Y, A0)
        const CELLd = X.FOLD_2_CELL(DIST)

        F.compute_flat(DIST, $flat, $cell)
        F.compute_cells($cell, DIST, CELLd)

    },
    initialize: () => {
        CTRL.initialize_sliders()
        CTRL.initialize_import()
        CTRL.initialize_limit()
        CTRL.initialize_side()
        CTRL.sandbox()
    },
    initialize_sliders: (f) => {
        const event_type = "input"
        const sliders = [0, 1, 2, 3, 4, 5].map((i) => document.getElementById("slider" + i));
        for (const j in [0, 1, 2, 3, 4, 5]) {
            sliders[j].addEventListener(event_type, (e) => {
                const vs = []
                for (const i in [0, 1, 2, 3, 4, 5]) {
                    vs[i] = sliders[i].value * Math.PI
                    document.getElementById("p" + i).innerText = vs[i]
                }
                const X_input = D.X(vs[4], Math.cos(vs[5]), 1, 0)
                const A0_input = D.A0(vs[0], vs[1], vs[2], vs[3])
                CTRL.sandbox(X_input, A0_input)
            })
            const resetbutton = document.createElement("button")
            resetbutton.innerHTML = "reset"
            const ini = sliders[j].value
            resetbutton.onclick = (e) => {
                sliders[j].value = ini
                sliders[j].dispatchEvent(new Event(event_type))
            }
            sliders[j].parentNode.appendChild(resetbutton)
        }
    },
    initialize_limit: () => {
        const limit_select = document.getElementById("limit_select");
        for (const val of ["all", 1000, 100, 10, 1]) {
            const el = document.createElement("option");
            el.setAttribute("value", val);
            el.textContent = val;
            limit_select.appendChild(el);
        }

    },

    initialize_import: () => {
        document.getElementById("import").onchange = (e) => {
            if (e.target.files.length > 0) {
                const file_reader = new FileReader();
                file_reader.onload = CTRL.import_file;
                file_reader.readAsText(e.target.files[0]);
            }
        };

    },

    initialize_side: () => {
        document.getElementById("side").onclick = (e) => {
            const side = ((e.target.value == "+") ? "-" : "+");
            e.target.setAttribute("value", side);
        };
    },

    import_file: (e) => {
        NOTE.clear_log();
        NOTE.start("*** Starting File Import ***");
        const doc = e.target.result;
        const file_name = document.getElementById("import").value;
        const parts = file_name.split(".");
        const type = parts[parts.length - 1].toLowerCase();
        NOTE.time(`Importing from file ${file_name}`);
        const FOLD = IO.doc_type_2_FOLD(
            doc,
            type,
            document.getElementById("side").value)
        return F.compute_flat(document.getElementById("flat"), FOLD);
    },
}
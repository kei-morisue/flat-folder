import { NOTE } from "./note.js";
import { IO } from "./io.js";
import { F } from "./fold.js";
import { CP } from "./cp.js";
import { GUI } from "./gui.js";
import { SB } from "./sandbox.js"

export const CTRL = {
    initialize: () => {
        CTRL.initialize_canvas()
        CTRL.initialize_cp_select()
        CTRL.initialize_sliders()
        CTRL.initialize_import()
        CTRL.initialize_limit()
        CTRL.initialize_side()
        SB.sandbox()
    },

    initialize_canvas: () => {
        GUI.initiate_canvas(
            document.getElementById("main"),
            ["flat", "cell", "fold"])
        GUI.initiate_canvas(
            document.getElementById("nondist"),
            ["flatn", "celln", "foldn"])
    },

    initialize_cp_select: () => {
        const sel = document.getElementById("cpselect")
        for (const k in CP) {
            const el = document.createElement("option");
            el.setAttribute("value", k);
            el.textContent = k;
            sel.appendChild(el);
        }
        sel.onchange = (e) => {
            SB.sandbox()
        };
    },


    initialize_sliders: (f) => {
        const event_type = "input"
        const sliders = [0, 1, 2, 3, 4, 5].map((i) => document.getElementById("slider" + i));
        sliders.map((slider) => {
            slider.addEventListener(event_type, (e) => {
                SB.sandbox()
            })
            const resetbutton = document.createElement("button")
            resetbutton.innerHTML = "reset"
            const ini = slider.value
            resetbutton.onclick = (e) => {
                slider.value = ini
                slider.dispatchEvent(new Event(event_type))
            }
            slider.parentNode.prepend(resetbutton)
        })
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
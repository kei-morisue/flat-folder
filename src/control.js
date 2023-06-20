import { IO } from "./flat_folder/io.js";
import { F } from "./fold.js";
import { CP } from "./cp.js";
import { GUI } from "./flat_folder/gui.js";
import { SB } from "./sandbox.js"

export const CTRL = {
    initialize: () => {
        CTRL.initialize_canvas()
        CTRL.initialize_cp_select()
        CTRL.initialize_import()
        CTRL.initialize_limit()
        CTRL.initialize_side()
        SB.sandbox()
    },

    initialize_canvas: () => {
        GUI.initiate_canvas(
            document.getElementById("distortion"),
            ["flat_dist", "cell_dist", "fold_dist", "fold"])
        GUI.initiate_canvas(
            document.getElementById("cutting"),
            ["flat_cut", "fold_cut"])
    },

    initialize_cp_select: () => {
        const sel = document.getElementById("cpselect")
        for (const k in CP) {
            const el = document.createElement("option");
            el.setAttribute("value", k);
            el.textContent = k;
            sel.appendChild(el);
        }
        sel.value = "testcp"
        sel.onchange = (e) => {
            SB.sandbox()
        };
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
        const doc = e.target.result;
        const file_name = document.getElementById("import").value;
        const parts = file_name.split(".");
        const type = parts[parts.length - 1].toLowerCase();
        const FOLD = IO.doc_type_2_FOLD(
            doc,
            type,
            document.getElementById("side").value)
        return F.compute_flat(document.getElementById("flat"), FOLD);
    },
}
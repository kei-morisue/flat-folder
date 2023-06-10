import { NOTE } from "./note.js";
import { IO } from "./io.js";

import { F } from "./fold.js";

export const CTRL = {
    initialize: () => {
        CTRL.initialize_import()
        CTRL.initialize_limit()
        CTRL.initialize_side()
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
        return F.compute_flat(FOLD);
    },
}
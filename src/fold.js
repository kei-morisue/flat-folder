import { NOTE } from "./flat_folder/note.js";
import { SVG } from "./flat_folder/svg.js";
import { X } from "./flat_folder/conversion.js";
import { GUI } from "./flat_folder/gui.js";
import { SOLVER } from "./flat_folder/solver.js";


export const F = {


    set_text: (svg_flat, svg_cell, FOLD, CELL) => {
        document.getElementById("text").onchange = (e) => {
            GUI.update_text_flat(svg_flat, FOLD)
            GUI.update_text_cell(svg_cell, CELL)
        };
    },



    get_state_limit: () => {
        const val = document.getElementById("limit_select").value;
        return (val == "all") ? Infinity : +val;
    },


    initialize_state_control: ($fold, FOLD, CELL, BF, GB, GA, $cell) => {
        const { Ff } = FOLD;
        const { CF } = CELL;
        const n = (GA == undefined) ? 0 : GA.reduce((s, A) => {
            return s * BigInt(A.length);
        }, BigInt(1));
        NOTE.time("Solve completed");
        NOTE.count(n, "folded states");
        NOTE.lap();

        const num_states = document.getElementById("num_states");
        num_states.textContent = `(Found ${n} state${(n == 1) ? "" : "s"})`;
        if (n == 0) {
            return
        }
        const GI = GB.map(() => 0);
        NOTE.time("Computing state");
        const edges = X.BF_GB_GA_GI_2_edges(BF, GB, GA, GI);
        FOLD.FO = X.edges_Ff_2_FO(edges, Ff);
        CELL.CD = X.CF_edges_flip_2_CD(CF, edges);
        const comp_select = SVG.clear("component_select");
        for (const opt of ["none", "all"]) {
            const el = document.createElement("option");
            el.setAttribute("value", opt);
            el.textContent = opt;
            comp_select.appendChild(el);
        }
        for (const [i, _] of GB.entries()) {
            const el = document.createElement("option");
            el.setAttribute("value", `${i}`);
            el.textContent = `${i}`;
            comp_select.appendChild(el);
        }
        comp_select.onchange = (e) => {
            NOTE.start("Changing component");
            GUI.update_component($fold, FOLD, CELL, BF, GB, GA, GI, $cell);
        };
        const id = $fold.getAttribute("id")
        const flip = GUI.get_flip(document.getElementById("flip" + id).checked)
        GUI.update_fold($fold, FOLD, CELL, flip);
        GUI.update_component($fold, FOLD, CELL, BF, GB, GA, GI, $cell);
    },

}
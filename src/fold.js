import { M } from "./math.js";
import { NOTE } from "./note.js";
import { CON } from "./constraints.js";
import { SVG } from "./svg.js";
import { IO } from "./io.js";
import { X } from "./conversion.js";
import { GUI } from "./gui.js";



export const F = {
    activate_controls: (FOLD) => {
        document.getElementById("fold_controls").style.display = "inline";
        document.getElementById("num_states").innerHTML = "";
        document.getElementById("state_controls").style.display = "none";
        document.getElementById("state_config").style.display = "none";
        document.getElementById("export_button").style.display = "inline";
        document.getElementById("export_button").onclick = () => IO.write(FOLD);
    },
    compute_flat: (FOLD, $flat, $cell) => {
        if (FOLD == undefined) { return; }
        SVG.clear("export");
        SVG.clear_element($flat)
        GUI.update_flat([$flat, $cell], FOLD);
        GUI.update_cell([$flat, $cell], FOLD);
        SVG.clear("fold");
        F.activate_controls(FOLD)
        document.getElementById("text").onchange = () => {
            GUI.update_text([$flat, $cell], FOLD);
        };
        document.getElementById("fold_button").onclick = () => {
            const CELL = X.FOLD_2_CELL(FOLD)
            F.compute_cells($flat, $cell, FOLD, CELL);
        };
    },



    compute_cells: ($flat, $cell, $fold, FOLD, CELL) => {
        SVG.clear("export");
        GUI.update_cell([$flat, $cell], FOLD, CELL);
        document.getElementById("text").onchange = (e) => {
            GUI.update_text([$flat, $cell], FOLD, CELL);
        };
        window.setTimeout(F.compute_constraints, 0,
            $flat, $cell, $fold, FOLD, CELL);
    },

    get_state_limit: () => {
        const val = document.getElementById("limit_select").value;
        return (val == "all") ? Infinity : +val;
    },
    compute_constraints: ($flat, $cell, $fold, FOLD, CELL) => {
        const [BF, BT] = X.FOLD_CELL_2_CONSTRAINTS(FOLD, CELL)
        GUI.update_cell_face_listeners($flat, $cell, FOLD, CELL, BF, BT);
        const sol = X.FOLD_CELL_BF_BT_2_GB_GA(
            $flat, $cell, FOLD, CELL, BF, BT, F.get_state_limit());
        if (sol == undefined) {
            return
        }
        const [GB, GA] = sol
        console.log("GB", GB)
        console.log("GA", GA)
        F.compute_states($cell, $fold, FOLD, CELL, BF, GB, GA)
    },
    compute_states: ($cell, $fold, FOLD, CELL, BF, GB, GA) => {
        const n = (GA == undefined) ? 0 : GA.reduce((s, A) => {
            return s * BigInt(A.length);
        }, BigInt(1));
        NOTE.time("Solve completed");
        NOTE.count(n, "folded states");
        NOTE.lap();
        F.update_state_control(n, $cell, $fold, FOLD, CELL, BF, GB, GA)
        NOTE.lap();
        stop = Date.now();
        NOTE.end();
    },

    update_state_control: (n, $cell, $fold, FOLD, CELL, BF, GB, GA) => {
        const { Ff } = FOLD;
        const { CF } = CELL;
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
        document.getElementById("state_controls").style.display = "inline";
        document.getElementById("flip").onchange = (e) => {
            NOTE.start("Flipping model");
            GUI.update_fold($fold, FOLD, CELL);
            NOTE.end();
        };
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
            GUI.update_component($cell, $fold, FOLD, CELL, BF, GB, GA, GI);
            NOTE.end();
        };
        GUI.update_fold($fold, FOLD, CELL);
        GUI.update_component($cell, $fold, FOLD, CELL, BF, GB, GA, GI);
    },

}
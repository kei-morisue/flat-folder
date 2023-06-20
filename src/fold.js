import { NOTE } from "./flat_folder/note.js";
import { SVG } from "./flat_folder/svg.js";
import { X } from "./flat_folder/conversion.js";
import { GUI } from "./flat_folder/gui.js";
import { SOLVER } from "./flat_folder/solver.js";


export const F = {


    compute_flat: (svg, FOLD) => {
        if (FOLD == undefined) { return; }
        SVG.clear("export");
        SVG.clear_element(svg)
        GUI.update_flat(svg, FOLD);
        document.getElementById("text").onchange = () => {
            GUI.update_text_flat(svg, FOLD);
        };
    },

    set_text: (svg_flat, svg_cell, FOLD, CELL) => {
        document.getElementById("text").onchange = (e) => {
            GUI.update_text_flat(svg_flat, FOLD)
            GUI.update_text_cell(svg_cell, CELL)
        };
    },

    compute_constraints_distorted: ($fold, DIST, CELL, BA0, edges) => {
        const [BF, BT] = X.FOLD_CELL_2_BF_BT(DIST, CELL)
        //GUI.update_cell_face_listeners($flat, $cell, DIST, CELL, BF, BT);

        const sol = SOLVER.solve(BF, BT, BA0, 100124);
        /*const sol = X.FOLD_BF_BT_2_sol(DIST, BF, BT, F.get_state_limit());
        if (sol.length == 3) {
            const [type, F, E] = sol;
            //GUI.update_error($flat, $cell, F, E, BF, FC);
            return { BF, BT, sol };
        }
        const [GB, GA] = sol
        const GI = GB.map(() => 0)
        //F.compute_states($cell, $fold, DIST, CELL, BF, GB, GA, flip)
        const edges_cell = X.BF_GB_GA_GI_2_edges(BF, GB, GA, GI);
         */
        DIST.FO = X.edges_Ff_2_FO(edges, DIST.Ff);
        CELL.CD = X.CF_edges_flip_2_CD(CELL.CF, edges);
        GUI.update_fold($fold, DIST, CELL);
        return { BF, BT, sol }
    },

    get_state_limit: () => {
        const val = document.getElementById("limit_select").value;
        return (val == "all") ? Infinity : +val;
    },
    compute_constraints: (FOLD, CELL) => {
        const [BF, BT] = X.FOLD_CELL_2_BF_BT(FOLD, CELL)
        //GUI.update_cell_face_listeners($flat, $cell, FOLD, CELL, BF, BT);
        const sol = X.FOLD_BF_BT_2_sol(FOLD, BF, BT, F.get_state_limit());
        if (sol == undefined) {
            return
        }
        const [GB, GA] = sol
        return { BF, BT, GB, GA }
    },

    update_state_control: ($fold, FOLD, CELL, BF, GB, GA, $cell) => {
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
            const C = GUI.update_component($fold, FOLD, CELL, BF, GB, GA, GI, $cell);
            NOTE.end();
        };
        GUI.update_fold($fold, FOLD, CELL);
        GUI.update_component($fold, FOLD, CELL, BF, GB, GA, GI, $cell);
    },

}
import { NOTE } from "./note.js";
import { SVG } from "./svg.js";
import { X } from "./conversion.js";
import { GUI } from "./gui.js";
import { SOLVER } from "./solver.js";


export const F = {


    compute_flat: (FOLD, $flat, $cell, $fold) => {
        if (FOLD == undefined) { return; }
        SVG.clear("export");
        SVG.clear_element($flat)
        GUI.update_flat([$flat, $cell], FOLD);
        GUI.update_cell([$flat, $cell], FOLD);
        SVG.clear_element($fold);
        document.getElementById("text").onchange = () => {
            GUI.update_text([$flat, $cell], FOLD);
        };
    },



    compute_cells: ($flat, $cell, $fold, FOLD, CELL) => {
        SVG.clear("export");
        GUI.update_cell([$flat, $cell], FOLD, CELL);
        document.getElementById("text").onchange = (e) => {
            GUI.update_text([$flat, $cell], FOLD, CELL);
        };
        return F.compute_constraints($flat, $cell, $fold, FOLD, CELL);
    },

    compute_distorted_cells: ($flat, $cell, $fold, DIST, CELL, BA0) => {
        SVG.clear("export");
        GUI.update_cell([$flat, $cell], DIST, CELL);
        const [BF, BT] = X.FOLD_CELL_2_BF_BT(DIST, CELL)
        //GUI.update_cell_face_listeners($flat, $cell, DIST, CELL, BF, BT);

        const sol = SOLVER.solve(BF, BT, BA0, 100124);
        if (sol.length == 3) {
            const [type, F, E] = sol;
            //GUI.update_error($flat, $cell, F, E, BF, FC);
            return { BF, BT, GB: undefined, GA: undefined };
        }
        const [GB, GA] = sol
        const GI = GB.map(() => 0)
        //F.compute_states($cell, $fold, DIST, CELL, BF, GB, GA, flip)
        const edges = X.BF_GB_GA_GI_2_edges(BF, GB, GA, GI);
        DIST.FO = X.edges_Ff_2_FO(edges, DIST.Ff);
        CELL.CD = X.CF_edges_flip_2_CD(CELL.CF, edges);
        GUI.update_fold($fold, DIST, CELL);
        return { BF, BT, GB, GA }
    },

    get_state_limit: () => {
        const val = document.getElementById("limit_select").value;
        return (val == "all") ? Infinity : +val;
    },
    compute_constraints: ($flat, $cell, $fold, FOLD, CELL) => {
        const [BF, BT] = X.FOLD_CELL_2_BF_BT(FOLD, CELL)
        GUI.update_cell_face_listeners($flat, $cell, FOLD, CELL, BF, BT);
        const sol = X.FOLD_CELL_BF_BT_2_GB_GA(
            $flat, $cell, FOLD, CELL, BF, BT, F.get_state_limit());
        if (sol == undefined) {
            return
        }
        const [GB, GA] = sol
        F.compute_states($cell, $fold, FOLD, CELL, BF, GB, GA)
        return { BF, BT, GB, GA }
    },
    compute_states: ($cell, $fold, FOLD, CELL, BF, GB, GA, flip) => {
        F.update_state_control($cell, $fold, FOLD, CELL, BF, GB, GA)
        NOTE.lap();
        stop = Date.now();
        NOTE.end();
    },

    update_state_control: ($cell, $fold, FOLD, CELL, BF, GB, GA) => {
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
            GUI.update_component($cell, $fold, FOLD, CELL, BF, GB, GA, GI);
            NOTE.end();
        };
        GUI.update_fold($fold, FOLD, CELL);
        GUI.update_component($cell, $fold, FOLD, CELL, BF, GB, GA, GI);
    },

}
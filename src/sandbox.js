import { NOTE } from "./flat_folder/note.js";
import { IO } from "./flat_folder/io.js";

import { F } from "./fold.js";
import { D } from "./distortion.js";


import { CP } from "./cp.js";
import { X } from "./flat_folder/conversion.js";
import { GUI } from "./flat_folder/gui.js";

import { M } from "./flat_folder/math.js";



export const SB = {
    initialize_sliders: (FOLD, BF, GB, GA) => {
        const event_type = "input"
        const sliders = [0, 1, 2, 3, 4, 5].map((i) => document.getElementById("slider" + i));

        for (const slider_template of sliders) {
            const base_name = slider_template.getAttribute("id")
            const old_slider = document.getElementById(base_name + "instance")
            const old_reset = document.getElementById(base_name + "reset")
            if (old_slider != undefined) {
                old_slider.remove()
                old_reset.remove()
            }
            const slider = slider_template.cloneNode(false)
            slider.setAttribute("id", base_name + "instance")
            slider.addEventListener(event_type, (e) => {
                SB.GI_2_DIST(FOLD, BF, GB, GA)
            })
            const resetbutton = document.createElement("button")
            resetbutton.setAttribute("id", base_name + "reset")
            resetbutton.innerHTML = "reset"
            const ini = slider_template.value
            resetbutton.onclick = (e) => {
                slider.value = ini
                slider.dispatchEvent(new Event(event_type))
            }
            const node = slider_template.parentNode
            node.appendChild(slider)
            node.prepend(resetbutton)
            slider.style.display = "inline"
            slider_template.style.display = "none"
        }
    },

    get_parameters: (range = 0.1) => {
        const sliders = [0, 1, 2, 3, 4, 5].map((i) => document.getElementById("slider" + i + "instance"));
        const vs = sliders.map((s) => s.value * Math.PI)
        const X_input = D.X(vs[4], Math.cos(vs[5]), 1, 0)
        const A0_input = D.A0(vs[0], vs[1], vs[2], vs[3], range)

        return [X_input, A0_input,]
    },
    sandbox: () => {
        //const $flat = document.getElementById("flat")
        //const $cell = document.getElementById("cell")
        const $fold = document.getElementById("fold")

        // FOLD
        const FOLD = IO.doc_type_2_FOLD(
            CP[document.getElementById("cpselect").value],
            "cp",
            document.getElementById("side").value)
        const CELL = X.FOLD_2_CELL(FOLD)
        SB.set_flip_check_box("flipfold", $fold, FOLD, CELL)


        //constraint
        //F.compute_flat(FOLD, $flat, $cell, $fold)
        const { BF, GB, GA } = F.compute_constraints(FOLD, CELL)
        SB.initialize_sliders(FOLD, BF, GB, GA)

        F.update_state_control($fold, FOLD, CELL, BF, GB, GA)

        //distortion
        SB.GI_2_DIST(FOLD, BF, GB, GA)

    },

    GI_2_DIST: (FOLD, BF, GB, GA) => {
        const GI = GUI.STORE_GI
        const $foldn = document.getElementById("fold_dist")
        // inferred face oders
        const BA0 = SB.BF_GB_GA_GI_2_BA0(BF, GB, GA, GI)

        const edges = X.BF_GB_GA_GI_2_edges(BF, GB, GA, GI)
        const { FOLD_d, CELL_d } = SB.dist($foldn, FOLD, BA0, edges)
        SB.set_flip_check_box("flipfold_dist", $foldn, FOLD_d, CELL_d)
    },
    dist: ($fold, FOLD, BA0, edges) => {
        const svg_flat = document.getElementById("flat_dist")
        const $cell = document.getElementById("cell_dist")
        const min_length = M.min_line_length(X.FOLD_2_Lf(FOLD));
        const [Y, A0] = SB.get_parameters(min_length)
        const DIST = D.make_dist(FOLD, Y, A0)
        F.compute_flat(svg_flat, DIST)


        const CELLd = X.FOLD_2_CELL(DIST)
        SB.set_flip_check_box("flipfold_dist", $fold, DIST, CELLd)

        GUI.update_cell($cell, CELLd)
        const { BF, BT, sol } = F.compute_constraints_distorted($fold, DIST, CELLd, BA0, edges)
        F.set_text(svg_flat, $cell, FOLD, CELLd)
        GUI.update_cell_face_listeners(svg_flat, $cell, DIST, CELLd, BF, BT, sol);
        return { FOLD_d: DIST, CELL_d: CELLd }
    },

    set_flip_check_box: (id, $fold, FOLD, CELL) => {
        document.getElementById(id).onchange = (e) => {
            GUI.update_fold($fold, FOLD, CELL);
        };
    },

    BF_GB_GA_GI_2_BA0: (BF, GB, GA, GI) => {
        NOTE.start_check("group", GB);
        const BI_map = new Map();
        for (const [i, k] of BF.entries()) {
            BI_map.set(k, i);
        }
        const BA0 = BF.map(() => 0);
        for (const [i, B] of GB.entries()) {
            const orders = M.bit_decode(GA[i][GI[i]], B.length);
            for (const [j, variable_index] of B.entries()) {
                BA0[variable_index] = orders[j]
            }
        }
        return BA0;
    },
}
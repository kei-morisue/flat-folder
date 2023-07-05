import { IO } from "./flat_folder/io.js";

import { F } from "./fold.js";
import { D } from "./distortion.js";
import { CP } from "./cp.js";
import { X } from "./flat_folder/conversion.js";
import { M } from "./flat_folder/math.js";
import { GUI } from "./flat_folder/gui.js";

import { C } from "./cut.js";
import { RAY } from "./ray.js";

import { CGUI } from "./c_gui.js";
import { CTRL } from "./control.js";



export const SB = {
    initialize_sliders: (FOLD, BF, GB, GA) => {
        const sliders = [0, 1, 2, 3, 4, 5].map((i) => document.getElementById("slider" + i));
        const handler = () => {
            D.GI_2_DIST(FOLD, BF, GB, GA)
        }
        for (const slider of sliders) {
            const base_name = slider.getAttribute("id")
            slider.oninput = handler
            const resetbutton = document.getElementById(base_name + "reset")
            resetbutton.onclick = (e) => {
                slider.value = 0.5
                slider.dispatchEvent(new Event("input"))
            }
        }
    },


    sandbox: () => {
        // FOLD
        const FOLD = IO.doc_type_2_FOLD(
            CP[document.getElementById("cpselect").value],
            "cp",
            document.getElementById("side").value)
        const CELL = X.FOLD_2_CELL(FOLD)
        const svg_fold = document.getElementById("fold")

        CTRL.set_flip_check_box("flipfold", svg_fold, FOLD, CELL)

        //constraint
        //F.compute_flat(FOLD, $flat, $cell, $fold)
        const { BF, GB, GA } = F.compute_constraints(FOLD, CELL)
        SB.initialize_sliders(FOLD, BF, GB, GA)

        F.update_state_control(svg_fold, FOLD, CELL, BF, GB, GA)

        //distortion
        const edges = D.GI_2_DIST(FOLD, BF, GB, GA)
        FOLD.edges = edges
        //ray
        RAY.init(FOLD, CELL)
        //cutting
        const CC = C.cut(FOLD, CELL)
        CGUI.update_cut(CC.CUT, CC.CELL)

    },

}
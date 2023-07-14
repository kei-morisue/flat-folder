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
        const limit = F.get_state_limit()
        const { BF, GB, GA } = X.FOLD_CELL_2_BF_BT_GB_GA(FOLD, CELL, limit)
        D.initialize_sliders(FOLD, BF, GB, GA)

        F.initialize_state_control(svg_fold, FOLD, CELL, BF, GB, GA)

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
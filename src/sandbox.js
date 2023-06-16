import { NOTE } from "./note.js";
import { IO } from "./io.js";

import { F } from "./fold.js";
import { D } from "./distortion.js";


import { CP } from "./cp.js";
import { X } from "./conversion.js";
import { GUI } from "./gui.js";

import { M } from "./math.js";
export const SB = {
    get_parameters: () => {
        const sliders = [0, 1, 2, 3, 4, 5].map((i) => document.getElementById("slider" + i));
        const vs = sliders.map((s) => s.value * Math.PI)
        const X_input = D.X(vs[4], Math.cos(vs[5]), 1, 0)
        const A0_input = D.A0(vs[0], vs[1], vs[2], vs[3])

        return [X_input, A0_input,]
    },
    sandbox: () => {
        const $flat = document.getElementById("flat")
        const $cell = document.getElementById("cell")
        const $fold = document.getElementById("fold")
        const $flatn = document.getElementById("flatn")
        const $celln = document.getElementById("celln")
        const $foldn = document.getElementById("foldn")
        const FOLD = IO.doc_type_2_FOLD(
            CP[document.getElementById("cpselect").value],
            "cp",
            document.getElementById("side").value)
        const CELL = X.FOLD_2_CELL(FOLD)

        //distortion
        const [Y, A0] = SB.get_parameters()
        const DIST = D.make_dist(FOLD, Y, A0)
        const CELLd = X.FOLD_2_CELL(DIST)

        const d_cp = M.normalize_points(D.distort_cp(FOLD.V, A0))
        const FOLD_VD = {
            V: d_cp,
            Vf_norm: d_cp,
            VK: FOLD.VK,
            VK: FOLD.EV,
            EA: FOLD.EA,
            EV: FOLD.EV,
            FV: FOLD.FV,
        }
        //GUI.update_flat([$flatn, $celln], FOLD_VD)
        //GUI.update_cell([$flatn, $celln], FOLD, CELL)


        F.compute_flat(DIST, $flat, $cell)
        F.compute_cells($flat, $cell, $fold, DIST, CELLd)

    },
}
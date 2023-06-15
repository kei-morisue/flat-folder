import { NOTE } from "./note.js";
import { IO } from "./io.js";

import { F } from "./fold.js";
import { D } from "./distortion.js";


import { CP } from "./cp.js";
import { X } from "./conversion.js";
import { GUI } from "./gui.js";

import { M } from "./math.js";
export const SB = {
    sandbox: (Y = D.Id, A0 = D.Id) => {
        const $flat = document.getElementById("flat")
        const $cell = document.getElementById("cell")
        const $flatn = document.getElementById("flatn")
        const $celln = document.getElementById("celln")


        console.log("rot", document.getElementById("slider0").value)
        const FOLD = IO.doc_type_2_FOLD(
            CP[document.getElementById("cpselect").value],
            "cp",
            document.getElementById("side").value)
        const CELL = X.FOLD_2_CELL(FOLD)


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
        //GUI.update_flat($flatn, FOLD_VD)
        //GUI.update_cell($celln, FOLD, CELL)


        F.compute_flat(DIST, $flat, $cell)
        F.compute_cells($flat, $cell, DIST, CELLd)

    },
}
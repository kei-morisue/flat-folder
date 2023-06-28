import { IO } from "./flat_folder/io.js";

import { F } from "./fold.js";
import { D } from "./distortion.js";


import { CP } from "./cp.js";
import { X } from "./flat_folder/conversion.js";
import { GUI } from "./flat_folder/gui.js";
import { CGUI } from "./c_gui.js";

import { M } from "./flat_folder/math.js";

import { SVG } from "./flat_folder/svg.js";
import { XCUT } from "./x_cut.js";
import { CTRL } from "./control.js";


export const C = {
    cut: (FOLD, CELL) => {

        // srub cut ray
        const p = [0.5, 10]
        const q = [0.5, -10]
        const ray = [p, q]
        const svg_cut = document.getElementById("flat_cut")
        const svg_ray = document.getElementById("fold_ray")
        const svg_fold_cut = document.getElementById("fold_cut")

        // rendering
        CGUI.update_ray(svg_ray, FOLD, CELL, ray, false)


        // building CUT
        const CUT = C.FOLD_2_CUT(FOLD, ray);


        const sel = document.getElementById("cutselect").value
        const side = document.getElementById("cutside").checked
        CGUI.update_flat(svg_cut, CUT, CUT.sG[side ? 1 : 0][sel])
        return CUT
    },

    FOLD_2_CUT: (FOLD, ray) => {
        const L = XCUT.FOLD_ray_2_L(FOLD, ray)
        const [V, EV, EL] = X.L_2_V_EV_EL(L, FOLD.eps);
        const EA = EL.map(l => L[l[0]][2]);
        const [VV, FV] = X.V_EV_2_VV_FV(V, EV);
        const [EF, FE] = X.EV_FV_2_EF_FE(EV, FV);
        const [VK, Vf, Ff, Vf_norm] = X.V_VV_EV_EA_2_f(V, VV, EV, EA, FV)
        //grouping the faces
        const FG = XCUT.FV_EA_FE_EF_2_FG(FV, EA, FE, EF)
        //trimming unnnecessary cut
        const EA_trim = XCUT.CUT_FOLD_2_EAnew(EF, EA, FG, FOLD)
        const Fs = XCUT.EF_EA_FG_FE_2_Fs(EF, EA_trim, FG, FE)
        const sG = XCUT.Fs_FG_2_sG(Fs, FG)
        console.log(sG)

        return {
            FOLD,
            V: M.normalize_points(V), EV, EA: EA_trim, EF, FV, FE, VK, Vf, Ff,
            FG, Fs, sG
        }
    },


}



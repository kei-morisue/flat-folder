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
        //const svg_cut = document.getElementById("flat_cut")
        const svg_ray = document.getElementById("fold_ray")
        const svg_fold_cut = document.getElementById("fold_cut")

        // rendering
        const box = document.getElementById("flipfold_ray");
        const flip = box.checked
        CGUI.update_ray(svg_ray, FOLD, CELL, ray, flip)


        // building CUT
        const CUT = C.FOLD_2_CUT(FOLD, ray);
        const CELL_c = X.FOLD_2_CELL(CUT)

        CELL_c.CD = X.CF_edges_flip_2_CD(
            CELL_c.CF,
            CUT.edges);
        return { CUT, CELL: CELL_c }
    },

    FOLD_2_CUT: (FOLD, ray) => {
        const EA0 = FOLD.EA
        const L = XCUT.FOLD_ray_2_L(FOLD, ray)
        const [V, EV, EL] = X.L_2_V_EV_EL(L, FOLD.eps);
        const V_norm = M.normalize_points(V)
        const EA = EL.map(l => L[l[0]][2]);
        const [VV, FV] = X.V_EV_2_VV_FV(V, EV);
        const FF = XCUT.FV_V_2_FF(FV, V_norm, FOLD)
        const [EF, FE] = X.EV_FV_2_EF_FE(EV, FV);
        let [VK, Vf, Ff, Vf_norm] = X.V_VV_EV_EA_2_f(V, VV, EV,
            XCUT.EAc_2_EAf(EA, EA0),
            FV)
        //aligning base faces
        const [Ff_new, Vf_new] = XCUT.FF_Ff_Vf_2_Ff_Vf(FF, Ff, Vf_norm)
        //grouping the faces
        const FG = XCUT.FV_EA_FE_EF_2_FG(FV, EA, FE, EF)
        const GF = XCUT.FG_2_GF(FG)
        //trimming unnnecessary cut
        const EA_trim = XCUT.CUT_FOLD_2_EAnew(EF, EA, FG, FOLD)

        //determining group sides
        const Fs = XCUT.EF_EA_FG_FE_2_Fs(EF, EA_trim, FG, FE, FOLD)
        const sG = XCUT.Fs_FG_2_sG(Fs, FG)
        const GE = XCUT.GF_FE_EA_2_GE(GF, FE, EA_trim)


        //for inferring face orders from original FOLD
        const edges = XCUT.FF_FOLD_2_egdes(FF, FOLD)
        return {
            EA0,
            V: V_norm, EV, EA: EA_trim, EF, FV, FE, VK, Vf: Vf_new, Ff: Ff_new,
            FG, GF, GE, Fs, sG, edges
        }
    },


}



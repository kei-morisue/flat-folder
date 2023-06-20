import { IO } from "./flat_folder/io.js";

import { F } from "./fold.js";
import { D } from "./distortion.js";


import { CP } from "./cp.js";
import { X } from "./flat_folder/conversion.js";
import { GUI } from "./flat_folder/gui.js";

import { M } from "./flat_folder/math.js";

import { SVG } from "./flat_folder/svg.js";


export const CUT = {
    cut: (FOLD, CELL) => {
        const p = [0.5, 10]
        const q = [0.5, -10]
        const seg = [p, q]
        const svg_flat = document.getElementById("flat_cut")
        const svg_fold = document.getElementById("fold_cut")
        GUI.update_flat(svg_flat, FOLD)
        GUI.update_fold(svg_fold, FOLD, CELL, false)


        SVG.draw_segments(svg_fold, [seg], {
            id: "fold_s_crease", stroke: "magenta",
            stroke_width: 10
        });

        const { V, Vf_norm, FV } = FOLD
        const FI = CUT.FV_V_Vf_2_FI(FV, V, Vf_norm, seg, FOLD.eps)
        console.log(FI)

        const L_flat = []
        for (const v of FI) {
            if (v == undefined) {
                continue
            }
            L_flat.push([v[0][0], v[1][0]])
        }
        SVG.draw_segments(svg_flat, L_flat, {
            id: "flat_s_crease", stroke: "magenta",
            stroke_width: 10
        });
    },

    internal_division_ratio0: ([p0, p1], p) => {
        const d0 = M.sub(p, p0)
        const d = M.sub(p1, p0)
        return M.mag(d0) / M.mag(d)
    },

    internal_division0: ([p0, p1], r) => {
        const d = M.sub(p1, p0)
        return M.add(M.mul(d, r), p0)
    },

    FV_V_Vf_2_FI: (FV, V, Vf, [p, q], eps) => {
        return FV.map((i_vs, i_f) => {
            const IX = []//intersections
            let i_v0 = i_vs[i_vs.length - 1]
            for (const i_v of i_vs) {
                const v0f = Vf[i_v0]
                const vf = Vf[i_v]
                const v0 = V[i_v0]
                const v = V[i_v]
                if (M.on_segment(p, q, v0f, eps)) {
                    IX.push([v0, v0f])
                    i_v0 = i_v
                    continue
                }
                if (M.on_segment(p, q, vf, eps)) {
                    i_v0 = i_v

                    continue;
                }
                const rf = M.intersect([v0f, vf], [p, q], eps)
                if (rf == undefined) {
                    i_v0 = i_v

                    continue
                }
                const ratio = CUT.internal_division_ratio0([v0f, vf], rf)
                const r = CUT.internal_division0([v0, v], ratio);
                IX.push([r, rf])
                i_v0 = i_v
            }
            if (IX.length != 2) {
                return
            }
            return IX
        })

    }
}
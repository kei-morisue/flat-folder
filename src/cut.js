import { IO } from "./flat_folder/io.js";

import { F } from "./fold.js";
import { D } from "./distortion.js";


import { CP } from "./cp.js";
import { X } from "./flat_folder/conversion.js";
import { GUI } from "./flat_folder/gui.js";

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
        const svg_flat = document.getElementById("flat_cut")
        const svg_cut = document.getElementById("flat_cut_faces")
        const svg_fold = document.getElementById("fold_cut")
        const svg_fold_cut = document.getElementById("fold_cut_faces")

        // rendering
        GUI.update_flat(svg_flat, FOLD)
        GUI.update_fold(svg_fold, FOLD, CELL, false)


        SVG.draw_segments(svg_fold, [ray], {
            id: "fold_s_crease", stroke: "magenta",
            stroke_width: 10
        });

        // building cut edges
        const { V, Vf_norm, FV } = FOLD
        const FI = XCUT.FV_V_Vf_2_FI(FV, V, Vf_norm, ray, FOLD.eps)
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

        // building cut faces
        const CUT = C.FOLD_2_CUT(FOLD, L_flat);
        const faces = CUT.FV.map((i_vs) => {
            return M.expand(i_vs, CUT.V)
        })
        //grouping the faces
        const FG = XCUT.CUT_2_FG(CUT)
        //trimming unnnecessary cut
        const EA_new = XCUT.CUT_FOLD_2_EAnew(CUT, FOLD)
        const Fs = XCUT.CuF_2_Fs(CUT)
        //rendering the cut faces
        // stub cutting side
        const side = false
        const group = 0
        const colors = FG.map((g, i) => {
            return (Fs[i] == side && g == group) ? "lightgray" : "white"
        })
        SVG.draw_polygons(svg_cut, faces, {
            id: "fold_cut_f", fill: colors, stroke: colors
        });



        //draw creases
        const creases = CUT.EV.map((ps) => M.expand(ps, CUT.V));
        const stroke = CUT.EA.map((a) => {
            return GUI.COLORS.edge[a]
        })
        SVG.draw_segments(svg_cut, creases, {
            id: "fold_s_crease",
            stroke: stroke,
            stroke_width: GUI.WIDTH.creases,
            filter: (i) => CUT.EA[i] != "C"
        });

        SVG.draw_segments(svg_cut, creases, {
            id: "fold_s_crease",
            stroke: CUT.EA.map(p => "magenta"),
            stroke_width: 10,
            filter: (i) => CUT.EA[i] == "C"
        });
    },


    FOLD_2_CUT: (FOLD, L_x) => {
        let L = FOLD.EV.map(([i_v1, i_v2], i_e) => {
            return [FOLD.V[i_v1], FOLD.V[i_v2], FOLD.EA[i_e]];
        });
        const L_f = L_x.map((v) => {
            return [v[0], v[1], "C"]
        })
        //L.push(...L_f);

        const eps = M.min_line_length(L) / M.EPS;
        const Lf_map = XCUT.find_from(L_f, L, eps)

        for (const [i_f, lf] of L_f.entries()) {
            if (Lf_map[i_f] == undefined) {
                L.push(lf)
            }
            else {
                L[Lf_map[i_f]][2] = "C"
            }
        }
        const [V, EV, EL] = X.L_2_V_EV_EL(L, eps);
        const EA = EL.map(l => L[l[0]][2]);
        const [VV, FV] = X.V_EV_2_VV_FV(V, EV);
        const [EF, FE] = X.EV_FV_2_EF_FE(EV, FV);
        return { V: M.normalize_points(V), EV, EA, EF, FV, FE }
    },


}



import { M } from "./flat_folder/math.js";
import { GUI } from "./flat_folder/gui.js";
import { CTRL } from "./control.js";
import { LIN } from "./linear.js";
import { X } from "./flat_folder/conversion.js";
import { F } from "./fold.js";

export const D = {
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

    X: (theta, x, y, phi) => {
        const s = LIN.shear(x, y, phi)
        return LIN.mmlt(LIN.rot(theta), s)
    },
    A0: (theta, phi_sx, phi_sy, phi, range) => {
        const sx = 1 + range * Math.sin(2 * phi_sx - Math.PI)
        const sy = sx * (1 + range * Math.sin(2 * phi_sy - Math.PI))
        return D.X(
            (2 * theta - Math.PI) * range,
            sx,
            sy,
            phi
        )
    },

    distort: (V, Vf, A0) => {
        const vd = [];
        const Vd_cp = D.dv(V, A0)
        for (const [i, vf] of Vf.entries()) {
            vd[i] = M.add(Vd_cp[i], vf);
        }
        return vd;
    },

    dv: (V, A0) => {
        const d_cp = D.distort_cp(V, A0)
        return V.map((v, i) => M.sub(d_cp[i], v))
    },

    distort_cp: (V, A0) => {
        return V.map(v => LIN.apply(A0, v))
    },

    make_dist: (FOLD, X, A0) => {
        const { V, Vf } = FOLD
        const vd = D.distort(V, Vf, A0)
        return {
            V: FOLD.V,
            Vf: vd.map((v) => LIN.apply(X, v)),
            Vf_norm: M.normalize_points(FOLD.Vf),
            VK: FOLD.VK,
            EV: FOLD.EV,
            EA: FOLD.EA,
            EF: FOLD.EF,
            FV: FOLD.FV,
            FE: FOLD.FE,
            Ff: FOLD.Ff
        }
    },

    get_parameters: (range = 0.1) => {
        const sliders = [0, 1, 2, 3, 4, 5].map((i) => document.getElementById("slider" + i));
        const vs = sliders.map((s) => s.value * Math.PI)
        const X_input = D.X(vs[4], Math.cos(vs[5]), 1, 0)
        const A0_input = D.A0(vs[0], vs[1], vs[2], vs[3], range)

        return [X_input, A0_input,]
    },
    GI_2_DIST: (FOLD, BF, GB, GA) => {
        const GI = FOLD.GI
        const $foldn = document.getElementById("fold_dist")
        // inferred face oders
        const BA0 = D.BF_GB_GA_GI_2_BA0(BF, GB, GA, GI)

        const edges = X.BF_GB_GA_GI_2_edges(BF, GB, GA, GI)
        const { FOLD_d, CELL_d } = D.dist($foldn, FOLD, BA0, edges)
        CTRL.set_flip_check_box("flipfold_dist", $foldn, FOLD_d, CELL_d)
        return edges
    },
    dist: ($fold, FOLD, BA0, edges) => {
        const svg_flat = document.getElementById("flat_dist")
        const $cell = document.getElementById("cell_dist")
        const min_length = M.min_line_length(X.FOLD_2_Lf(FOLD));
        const [Y, A0] = D.get_parameters(0.1 * Math.pow(min_length, 0.3))
        const DIST = D.make_dist(FOLD, Y, A0)
        GUI.update_flat(svg_flat, DIST)

        const CELLd = X.FOLD_2_CELL(DIST)
        CTRL.set_flip_check_box("flipfold_dist", $fold, DIST, CELLd)

        GUI.update_cell($cell, CELLd)
        const { BF, BT, sol } = D.compute_constraints_distorted($fold, DIST, CELLd, BA0, edges)
        F.set_text(svg_flat, $cell, FOLD, CELLd)

        //GUI.update_cell_face_listeners(svg_flat, $cell, DIST, CELLd, BF, BT, sol);
        return { FOLD_d: DIST, CELL_d: CELLd }
    },

    compute_constraints_distorted: ($fold, DIST, CELL, BA0, edges) => {
        const [BF, BT] = X.FOLD_CELL_2_BF_BT(DIST, CELL)

        DIST.FO = X.edges_Ff_2_FO(edges, DIST.Ff);
        CELL.CD = X.CF_edges_flip_2_CD(CELL.CF, edges);

        const id = $fold.getAttribute("id")
        const flip = GUI.get_flip(document.getElementById("flip" + id).checked)
        GUI.update_fold($fold, DIST, CELL, flip);
        return { BF, BT }
    },

    BF_GB_GA_GI_2_BA0: (BF, GB, GA, GI) => {
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
import { IO } from "./flat_folder/io.js";

import { F } from "./fold.js";
import { D } from "./distortion.js";


import { CP } from "./cp.js";
import { X } from "./flat_folder/conversion.js";
import { GUI } from "./flat_folder/gui.js";

import { M } from "./flat_folder/math.js";

import { SVG } from "./flat_folder/svg.js";


export const XCUT = {
    internal_division_ratio0: ([p0, p1], p) => {
        const d0 = M.sub(p, p0)
        const d = M.sub(p1, p0)
        return M.mag(d0) / M.mag(d)
    },


    internal_division0: ([p0, p1], r) => {
        const d = M.sub(p1, p0)
        return M.add(M.mul(d, r), p0)
    },


    FOLD_ray_2_L: (FOLD, [p, q]) => {
        const { FV, V, Vf_norm, EV, EA, eps } = FOLD

        //intersecting 2 vertices on each face
        const Fx = FV.map((i_vs, i_f) => {
            const IX = []//intersections
            let i_v0 = i_vs[i_vs.length - 1]
            for (const i_v of i_vs) {
                const v0f = Vf_norm[i_v0]
                const vf = Vf_norm[i_v]
                const v0 = V[i_v0]
                const v = V[i_v]
                i_v0 = i_v

                if (M.on_segment(p, q, v0f, eps)) {
                    IX.push([v0, v0f])
                    continue
                }
                if (M.on_segment(p, q, vf, eps)) {
                    continue;
                }
                const rf = M.intersect([v0f, vf], [p, q], eps)
                if (rf == undefined) {
                    continue
                }
                const ratio = XCUT.internal_division_ratio0([v0f, vf], rf)
                const r = XCUT.internal_division0([v0, v], ratio);
                IX.push([r, rf])
            }
            if (IX.length != 2) {
                return
            }
            return IX
        })
        const L_c = []
        for (const v of Fx) {
            if (v == undefined) {
                continue
            }
            L_c.push([v[0][0], v[1][0], "C"])
        }

        const L_f = EV.map(([i_v1, i_v2], i_e) => {
            return [V[i_v1], V[i_v2], EA[i_e]];
        });

        return XCUT.marge_Lcut_2_Lfold(L_c, L_f, eps)
    },



    marge_Lcut_2_Lfold: (L1, L2, eps) => {
        const epssq = eps * eps
        for (const [i_f, lf] of L1.entries()) {
            const p1 = lf[0]
            const q1 = lf[1]
            let found = false
            for (const [i_2, l2] of L2.entries()) {
                const p2 = l2[0]
                const q2 = l2[1]
                if (M.distsq(p1, p2) < epssq && M.distsq(q1, q2) < epssq ||
                    M.distsq(p1, q2) < epssq && M.distsq(q1, p2) < epssq) {
                    l2[2] = "C"
                    found = true
                    break
                }
            }
            if (found) {
                continue
            }
            L2.push(lf)
        }
        return L2

    },

    FV_EA_FE_EF_2_FG: (FV, EA, FE, EF) => {
        const seen = new Set();
        const FG = new Array(FV.length)
        let i_group = 0
        for (const [i_f, i_vs] of FV.entries()) {
            if (seen.has(i_f)) {
                continue
            }
            const queue = [[i_f, i_group]]
            let next = 0
            seen.add(i_f)
            while (next < queue.length) {
                const [i_fq, i_group] = queue[next]
                FG[i_fq] = i_group
                next += 1
                seen.add(i_fq)
                for (const i_e of FE[i_fq]) {
                    if (EA[i_e] == "C") {
                        continue
                    }
                    const [i_f1, i_f2] = EF[i_e]
                    if (i_f1 == i_fq && i_f2 != undefined && !seen.has(i_f2)) {
                        queue.push([i_f2, i_group])
                        seen.add(i_f2)
                        continue
                    }
                    if (i_f2 == i_fq && i_f1 != undefined && !seen.has(i_f1)) {
                        queue.push([i_f1, i_group])
                        seen.add(i_f1)
                        continue
                    }
                }
            }
            i_group += 1

        }
        return FG
    },


    EF_EA_FG_FE_2_Fs: (EF, EA, FG, FE) => {
        const Fs = new Array(FG.length);

        const seen = new Set();
        let next = 0
        const queue = [[0, true]]
        seen.add(0)
        while (next < queue.length) {
            const [i_fq, side] = queue[next]
            Fs[i_fq] = !side
            next += 1
            seen.add(i_fq)
            for (const i_e of FE[i_fq]) {
                const assign = EA[i_e]
                const [i_f1, i_f2] = EF[i_e]
                const queue_side = assign == "C" ? !side : side;
                if (i_f1 == i_fq && i_f2 != undefined && !seen.has(i_f2)) {
                    queue.push([i_f2, queue_side])
                    seen.add(i_f2)
                    continue
                }
                if (i_f2 == i_fq && i_f1 != undefined && !seen.has(i_f1)) {
                    queue.push([i_f1, queue_side])
                    seen.add(i_f1)
                    continue
                }
            }
        }
        return Fs;
    },

    CUT_FOLD_2_EAnew: (EF, EA, FG, FOLD) => {
        const EA_c = FOLD.EA
        const EA_new = EA.map(v => v)
        for (const [i_e, [i_f0, i_f1]] of EF.entries()) {
            const assign = EA[i_e]
            if (assign != "C") {
                continue
            }
            const g0 = FG[i_f0]
            const g1 = FG[i_f1]

            if (g0 != g1) {
                continue
            }
            const assign0 = EA_c[i_e]
            if (assign0 == undefined) { debugger }
            EA_new[i_e] = assign0
        }
        return EA_new
    },
    Fs_FG_2_sG: (Fs, FG) => {
        const G0 = new Set()
        const G1 = new Set()
        for (const [i_f, g] of FG.entries()) {
            const side = Fs[i_f]
            side ? G1.add(g) : G0.add(g)
        }
        return [Array.from(G0), Array.from(G1)]
    },


}
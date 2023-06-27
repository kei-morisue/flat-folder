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


    FV_V_Vf_2_FI: (FV, V, Vf, [p, q], eps) => {
        return FV.map((i_vs, i_f) => {
            const IX = []//intersections
            let i_v0 = i_vs[i_vs.length - 1]
            for (const i_v of i_vs) {
                const v0f = Vf[i_v0]
                const vf = Vf[i_v]
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

    },



    find_from: (L1, L2, eps) => {
        const epssq = eps * eps
        return L1.map((l1) => {
            const p1 = l1[0]
            const q1 = l1[1]
            for (const [i_2, l2] of L2.entries()) {
                const p2 = l2[0]
                const q2 = l2[1]
                if (M.distsq(p1, p2) < epssq && M.distsq(q1, q2) < epssq ||
                    M.distsq(p1, q2) < epssq && M.distsq(q1, p2) < epssq) {
                    return i_2
                }
            }
            return
        })

    },

    CUT_2_FG: (CUT) => {
        const { FV, EA, FE, EF } = CUT
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
        CUT.FG = FG
        return FG
    },


    CuF_2_Fs: (cut_faces) => {
        const { EF, EA, FG, FV, FE } = cut_faces
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

    CUT_FOLD_2_EAnew: (CUT, FOLD) => {
        const { EF, EA, FG } = CUT
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
        CUT.EA = EA_new
        return EA_new
    },
    EV_EA_2_VA: (EV, EA) => {
        const EA_map = new Map();
        for (const [i, vs] of EV.entries()) {
            EA_map.set(M.encode_order_pair(vs), EA[i]);
        }
        return EA_map
    },

    FV_2_VF: (FV) => {
        const EF_map = new Map();
        for (const [i, F] of FV.entries()) {
            for (const [j, v1] of F.entries()) {
                const v2 = F[(j + 1) % F.length];
                EF_map.set(M.encode([v2, v1]), i);
            }
        }
        return EF_map
    },


}
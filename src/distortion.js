import { M } from "./math.js";

import { LIN } from "./linear.js";

export const D = {
    X: (theta, x, y, phi) => {
        const s = LIN.shear(x, y, phi)
        return LIN.mmlt(LIN.rot(theta), s)
    },
    A0: (theta, phi_sx, phi_sy, phi) => {
        const lev = 0.1
        return D.X(
            theta * lev,
            1 + lev * Math.sin(2 * phi_sx - Math.PI),
            1 + lev * Math.sin(2 * phi_sy - Math.PI),
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
        const { V, Vf, FV, Ff, Vf_norm } = FOLD
        //const vd = D.distort(V, Vf, A0)
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


}
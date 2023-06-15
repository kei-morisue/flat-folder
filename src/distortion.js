import { M } from "./math.js";


export const D = {
    Id: [[1, 0], [0, 1]]
    ,
    X: (theta, x, y, phi) => {
        const s = D.shear(x, y, phi)
        return D.mmlt(D.rot(theta), s)
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
    rot: (theta) => {
        const c = Math.cos(theta)
        const s = Math.sin(theta)
        return [[c, -s], [s, c]]
    },
    shear: (sx, sy, phi) => {
        return D.mmlt(D.mmlt(D.rot(phi), [[sx, 0], [0, sy]]), D.rot(-phi));
    },
    sub: ([a, b], [c, d]) => {
        return [M.sub(a, c), M.sub(b, d)]
    },
    apply: ([a, b], x) => {
        return [M.dot(a, x), M.dot(b, x)]
    },
    det: ([[a, b], [c, d]]) => {
        return a * d - b * c
    },
    mmlt: ([x, y], [[a, b], [c, d]]) => {
        const T = [[a, c], [b, d]]
        return [D.apply(T, x), D.apply(T, y)]
    },
    distort: (V, Vf, X, A0) => {
        const vd = [];
        const Vd_cp = D.dv(V, A0)
        for (const [i, vf] of Vf.entries()) {
            vd[i] = D.apply(X, M.add(Vd_cp[i], vf));
        }
        return M.normalize_points(vd);
    },

    dv: (V, A0) => {
        const d_cp = D.distort_cp(V, A0)
        return V.map((v, i) => M.sub(d_cp[i], v))
    },

    distort_cp: (V, A0) => {
        return V.map(v => D.apply(A0, v))
    },

    make_dist: (FOLD, X, A0) => {
        const { V, Vf, Vf_norm } = FOLD
        FOLD.Vf = D.distort(V, Vf, X, A0)
        FOLD.Vf_norm = D.distort(V, Vf_norm, X, A0)
        return FOLD
    },

    make_akitaya_dist: (FOLD, X, A0) => {
        const { V, Vf, Vf_norm, FV } = FOLD
        FOLD.Vf = D.akitaya_distort(V, Vf, FV, A0)
        FOLD.Vf_norm = D.akitaya_distort(V, Vf_norm, FV, A0)
        return FOLD
    },

    //STUB
    akitaya_distort: (V, Vf, FV, A0) => {
        const p = [A0[0][1], A0[1][0]]
        let vz = V.map((v) => { return [0, 0] });
        for (const [face_idx, v_idxs] of FV.entries()) {
            for (const v_idx of v_idxs) {
                const x = V[v_idx][0]
                const y = V[v_idx][1]
                if (M.close(x, y, M.FLOAT_EPS)) {
                    vz[v_idx][0] = 2
                    vz[v_idx][1] = 1

                }
                else {
                    vz[v_idx][0] = 1
                    if (x > y) {
                        vz[v_idx][1] = 0
                    }
                    else {
                        vz[v_idx][1] = 1
                    }

                }

            }
        }
        vz = vz.map((v) => { return v[1] / v[0] })
        const zmax = Math.max(...vz)

        vz = vz.map((v) => { return v / zmax })
        const vd = []
        for (const [i, v] of Vf.entries()) {
            vd[i] = M.add(v, M.mul(p, vz[i]))
        }

        return M.normalize_points(vd);
    }
}
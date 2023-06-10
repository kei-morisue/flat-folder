import { M } from "./math.js";


export const D = {
    X: (theta, x, y, phi) => {
        const s = D.shear(x, y, phi)
        return D.mmlt(D.rot(theta), s)
    },
    A0: (theta, phi_sx, phi_sy, phi) => {
        const lev = 0.1

        return D.X(
            theta,
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
        for (const [i, vf] of Vf.entries()) {
            const vcp = D.apply(A0, V[i])
            vd[i] = D.apply(X, M.add(M.sub(vcp, V[i]), vf));
        }
        return M.normalize_points(vd);
    },

    make_dist: (FOLD, X, A0) => {
        const { V, Vf, VK, EV, EA, EF, FV, Ff } = FOLD
        const Vd = D.distort(V, Vf, X, A0)
        return { V, Vf: Vd, VK, EV, EA, EF, FV, Ff }
    }
}
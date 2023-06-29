import { M } from "./flat_folder/math.js";


export const LIN = {
    Id: [[1, 0], [0, 1]],

    rot: (theta) => {
        const c = Math.cos(theta)
        const s = Math.sin(theta)
        return [[c, -s], [s, c]]
    },
    shear: (sx, sy, phi) => {
        return LIN.mmlt(LIN.mmlt(LIN.rot(phi), [[sx, 0], [0, sy]]), LIN.rot(-phi));
    },
    sub: ([a, b], [c, d]) => {
        return [M.sub(a, c), M.sub(b, d)]
    },
    apply: ([a, b], x) => {
        return [M.dot(a, x), M.dot(b, x)]
    },
    scale: ([a, b], c) => {
        return [M.mul(a, c), M.mul(b, c)]
    },
    det: ([[a, b], [c, d]]) => {
        return a * d - b * c
    },
    mmlt: ([x, y], [[a, b], [c, d]]) => {
        const T = [[a, c], [b, d]]
        return [LIN.apply(T, x), LIN.apply(T, y)]
    },
    outer: (x, [c, d]) => {
        return [M.mul(x, c), M.mul(x, d)]
    }
}
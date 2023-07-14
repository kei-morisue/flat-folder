import { IO } from "./flat_folder/io.js";

import { F } from "./fold.js";
import { D } from "./distortion.js";


import { CP } from "./cp.js";
import { X } from "./flat_folder/conversion.js";
import { GUI } from "./flat_folder/gui.js";
import { M } from "./flat_folder/math.js";

import { CGUI } from "./c_gui.js";



import { SVG } from "./flat_folder/svg.js";
import { XCUT } from "./x_cut.js";
import { CTRL } from "./control.js";


export const OP = {
    CUTOPS: ["none", "M", "V", "osink(V)", "osink(M)", "csink(TBD)"],

    operating: (CUT, groups, operations, options) => {

        i_s_flip = CUT.sG[0].includes(groups[0]) > 0 ? CUT.sG[0] : CUT.sG[1]
        i_s_stay = i_s_flip == 1 ? 0 : 1

    },

    EA_2_OPNG: (EA, V, EV, CUT) => {
        const L = EA.map((a, i_e) => {
            let assign = a
            if (a == "FC") {
                assign = "FC"
            }
            if (a == "MC") {
                assign = "M"
            }
            if (a == "VC") {
                assign = "V"
            }
            return [V[EV[i_e][0]], V[EV[i_e][1]], assign]
        })
        const FOLD = X.L_2_FOLD(L)
        const FF = XCUT.FV_V_2_FF(FOLD.FV, FOLD.V, CUT)
        const [Ff_new, Vf_new] = XCUT.FF_Ff_Vf_2_Ff_Vf(FF, FOLD.Ff, FOLD.Vf_norm, CUT)
        FOLD.Ff = Ff_new
        FOLD.Vf = Vf_new
        FOLD.Vf_norm = Vf_new
        const CELL = X.FOLD_2_CELL(FOLD)
        const [BF, BT] = X.FOLD_CELL_2_BF_BT(FOLD, CELL)
        const sol = X.FOLD_BF_BT_2_GB_GA(FOLD, BF, BT, Infinity)
        if (sol.length == 3) {
            debugger
            return [FOLD, CELL]
        }
        const [GB, GA] = sol
        const GI = GB.map(() => 0)
        const edges = X.BF_GB_GA_GI_2_edges(BF, GB, GA, GI)
        CELL.CD = X.CF_edges_flip_2_CD(CELL.CF, edges)
        return [FOLD, CELL]
    },

    ASGN: { M: -1, V: 1, C: 0 },
    EO_EA0_2_EA: (EC, EA0, EO) => {
        return EC.map((a, i_e) => {
            const eo = EO[i_e]
            const a0 = EA0[i_e]
            if (eo.length == 0) {
                return a0
            }
            if (a == "M" || a == "V") {
                return a == "M" ? "VC" : "MC"
            }
            let b = OP.ASGN[a0]
            for (const o of eo) {
                b += OP.ASGN[o]
            }
            if (b == 0) { return "FC" }
            if (b == -1) { return "MC" }
            if (b == 1) { return "VC" }
            debugger
            return undefined
        })
    },

    GE_2_EO: (groups, ops, CUT) => {
        const { GE, EA, EA0, Ff, EF, FG } = CUT
        const EO = EA0.map(p => [])
        groups.map((g, i) => {
            const i_es = GE[g]
            switch (ops[i]) {
                case 2:
                    OP.CMVB_2_CMVA1(
                        g, i_es,
                        EO, Ff, EF, FG, EA, true)
                    break
                default:
                    OP.CMVB_2_CMVA1(
                        g, i_es,
                        EO, Ff, EF, FG, EA, false)
                    break
            }
        })
        return EO
    },


    //1:pure fold
    //is_mv: true:valley on top side
    CMVB_2_CMVA1: (g, i_es, EO, Ff, EF, FG, EC, is_mv) => {
        for (const i_e of i_es) {
            const a = EC[i_e]
            if (a == "C") {
                const [i_f1, i_f2] = EF[i_e]
                const i_f = FG[i_f1] == g ? i_f1 : i_f2
                const isflip = Ff[i_f]
                EO[i_e].push(isflip ^ is_mv ? "M" : "V")
            }

        }
    },
    //1:open sink
    //side: true:valley on top side
    CMVB_2_CMVA2: (CMV, EA, EA0, side) => {
        const { C, M, V, B } = CMV
        const CA = C.map(([i_e, i_f]) => {
            const assign0 = EA0[i_e]
            if (assign0 == "B") {
                return "B"
            }
            if (assign0 == "M" || assign0 == "V")
                return "F"
            return side ? "M" : "V"

        })
        //always switches inside the contour
        const MA = V.map(i_e => EA[i_e])
        const VA = M.map(i_e => EA[i_e])
        const BA = V.map(i_e => EA[i_e])
        return { C: CA, M: MA, V: VA, B: BA }

    },
}
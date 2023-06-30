import { M } from "./flat_folder/math.js";
import { NOTE } from "./flat_folder/note.js";
import { X } from "./flat_folder/conversion.js";
import { SVG } from "./flat_folder/svg.js";
import { D } from "./distortion.js";
import { GUI } from "./flat_folder/gui.js";

import { CON } from "./flat_folder/constraints.js";
import { C } from "./cut.js";
import { XCUT } from "./x_cut.js";

export const CGUI = {
    update_ray: (svg, FOLD, CELL, ray, flip) => {
        GUI.update_fold(svg, FOLD, CELL, flip)


        SVG.draw_segments(svg, [ray], {
            id: "fold_ray_crease", stroke: "magenta",
            stroke_width: 10
        });
    },
    update_cut: (CUT, CELL) => {
        CGUI.update_cut_select(CUT, CELL)
        CGUI.update_ff(CUT, CELL)
    },
    update_ff: (CUT, CELL) => {
        const svg = document.getElementById("flat_cut")
        const svg_fold_cut = document.getElementById("fold_cut")
        CGUI.update_flat(svg, CUT)
        const flip = document.getElementById("flipfold_ray").checked
        CGUI.update_fold(svg_fold_cut, CUT, CELL, flip)
    },
    update_flat: (svg, CUT) => {
        const Fs = CUT.Fs
        const FG = CUT.FG
        SVG.clear_element(svg)
        let groups = CGUI.get_groups(CUT);
        //rendering the flat cut
        const faces = CUT.FV.map((i_vs) => {
            return M.expand(i_vs, CUT.V)
        })
        const colors = FG.map((g, i) => {
            return (groups.includes(g)) ? "lightgray" : "white"
        })
        SVG.draw_polygons(svg, faces, {
            id: "fold_cut_f", fill: colors, stroke: colors
        });
        //draw creases
        const creases = CUT.EV.map((ps) => M.expand(ps, CUT.V));
        const stroke = CUT.EA.map((a) => {
            return GUI.COLORS.edge[a]
        })
        SVG.draw_segments(svg, creases, {
            id: "fold_s_crease",
            stroke: stroke,
            stroke_width: GUI.WIDTH.creases,
            filter: (i) => CUT.EA[i] != "C"
        });

        //stub pure folding cp
        const side = true
        groups.map(g => {
            const CMV = CUT.GE[g]
            const CMVA0 = XCUT.CMV_2_CMVA0(CMV, CUT.EA, CUT.Ff, CUT.EA0, side)
            const segs = CMV.C.map(([i_e, i_f]) => M.expand(CUT.EV[i_e], CUT.V))
            SVG.draw_segments(svg, segs, {
                id: "fold_c_crease",
                stroke: CMVA0.C.map(a => a == "M" ? "red" : "blue"),
                stroke_width: 5,
                stroke_dasharray: "2,10,4"
            });
        }
        )

    },

    update_fold: (svg, CUT, CELL, flip) => {
        const groups = CGUI.get_groups(CUT);
        SVG.clear_element(svg)
        const { EF, Ff, FG } = CUT;
        const { P_norm, SP, SE, CP, SC, CF, CD } = CELL;
        const tops = CD.map(S => flip ? S[0] : S[S.length - 1]);
        const SD = X.EF_SE_SC_CF_CD_2_SD(EF, SE, SC, CF, tops);
        const m = [0.5, 0.5];
        const Q = P_norm.map(p => (flip ? M.add(M.refX(M.sub(p, m)), m) : p));
        const cells = CP.map(V => M.expand(V, Q));
        const colors = tops.map(d => {
            if (d == undefined) { return undefined; }
            const cut = groups.includes(FG[d])
            if (Ff[d] != flip) {
                return cut ? "darkgray" : GUI.COLORS.face.top;
            }
            else { return cut ? "lightgray" : GUI.COLORS.face.bottom; }
        });
        SVG.draw_polygons(svg, cells, {
            id: "fold_c", fill: colors, stroke: colors
        });
        const lines = SP.map((ps) => M.expand(ps, Q));
        SVG.draw_segments(svg, lines, {
            id: "fold_s_crease", stroke: "magenta",
            stroke_width: GUI.WIDTH.CREASE,
            filter: (i) => SD[i] == "C"
        });
        SVG.draw_segments(svg, lines, {
            id: "fold_s_edge", stroke: GUI.COLORS.edge.B,
            stroke_width: GUI.WIDTH.BOLD,
            filter: (i) => SD[i] == "B"
        });
    },

    update_cut_select: (CUT, CELL) => {
        const sG = CUT.sG
        const sel = document.getElementById("cutselect")
        const side = document.getElementById("cutside")
        SVG.clear_element(sel)
        for (const k in sG[side.value == "+" ? 1 : 0]) {
            const box = document.createElement("input");
            box.setAttribute("type", "checkbox");
            box.setAttribute("id", "cutoption" + k);
            const num = document.createElement("label");
            num.setAttribute("for", "cutoption" + k);
            num.textContent = k;
            sel.appendChild(num);
            sel.appendChild(box);
            if (k == 0) {
                box.checked = true
            }
        }
        sel.onchange = (e) => {
            CGUI.update_ff(CUT, CELL)
        };
        side.onclick = (e) => {
            const side = ((e.target.value == "+") ? "-" : "+");
            e.target.setAttribute("value", side);
            SVG.clear_element(sel)
            CGUI.update_cut(CUT, CELL)
        };
    },
    get_groups: (CUT) => {
        const side = document.getElementById("cutside").value == "+";
        let groups = [];
        const G = CUT.sG[side ? 1 : 0];
        for (const k in G) {
            const opt = document.getElementById("cutoption" + k).checked;
            if (opt) {
                groups.push(G[k]);
            }

        }
        return groups;
    },

}


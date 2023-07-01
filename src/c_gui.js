import { M } from "./flat_folder/math.js";
import { NOTE } from "./flat_folder/note.js";
import { X } from "./flat_folder/conversion.js";
import { SVG } from "./flat_folder/svg.js";
import { D } from "./distortion.js";
import { GUI } from "./flat_folder/gui.js";

import { CON } from "./flat_folder/constraints.js";
import { C } from "./cut.js";
import { XCUT } from "./x_cut.js";
import { OP } from "./operation.js";

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
        let [groups, ops] = CGUI.get_groups(CUT);
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



        const creases = CUT.EV.map((ps) => M.expand(ps, CUT.V));

        const EO = OP.GE_2_EO(groups, ops, CUT)
        const EA = OP.EO_EA0_2_EA(CUT.EA, CUT.EA0, EO)
        const stroke = EA.map((a) => {
            return CGUI.COLORS[a]
        })
        const dashes = EA.map((a) => {
            return CGUI.DASHES[a]
        })
        SVG.draw_segments(svg, creases, {
            id: "fold_s_crease",
            stroke: stroke,
            stroke_width: 3,
            stroke_dasharray: dashes
        });



    },

    COLORS: { M: "blue", V: "red", B: "black", MC: "blue", VC: "red", FC: "green" },
    DASHES: { M: 0, V: 0, B: 0, MC: "10,10", VC: "20,20", FC: "20,10" },
    update_fold: (svg, CUT, CELL, flip) => {
        const groups = CGUI.get_groups(CUT)[0];
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
            stroke_width: 5,
            filter: (i) => SD[i] == "C"
        });
        SVG.draw_segments(svg, lines, {
            id: "fold_s_edge", stroke: GUI.COLORS.edge.B,
            stroke_width: GUI.WIDTH.BOLD,
            filter: (i) => SD[i] == "B"
        });
    },

    create_operation_select: (k) => {
        const form = document.createElement("form")
        const name = "cutoption" + k
        form.setAttribute("id", name)
        for (const [i, o] of OP.CUTOPS.entries()) {
            const id = name + o
            const box = document.createElement("input");
            box.setAttribute("type", "radio");
            box.setAttribute("id", id);
            box.setAttribute("name", name);
            box.setAttribute("value", o);
            if (i == 0 || k == 0 && i == 1) {
                box.checked = true
            }
            const label = document.createElement("label");
            label.textContent = o;
            label.setAttribute("for", id);
            form.appendChild(label)
            form.appendChild(box)
        }
        return form

    },

    create_cutselect: (k) => {
        const num = document.createElement("label");
        num.setAttribute("for", "cutoption" + k);
        num.textContent = k + ": ";
        const div = document.createElement("div")
        div.appendChild(num)
        div.setAttribute("class", "operations")
        const form = CGUI.create_operation_select(k)
        div.appendChild(form)
        return div
    },

    update_cut_select: (CUT, CELL) => {
        const sG = CUT.sG
        const sel = document.getElementById("cutselect")
        const side = document.getElementById("cutside")
        SVG.clear_element(sel)
        for (const k in sG[side.value == "+" ? 1 : 0]) {
            sel.append(CGUI.create_cutselect(k))

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
        let ops = []
        const G = CUT.sG[side ? 1 : 0];
        for (const k in G) {
            const form = document.getElementById("cutoption" + k)
            const op = form.elements["cutoption" + k].value
            if (op != "none") {
                groups.push(G[k]);
                ops.push(OP.CUTOPS.indexOf(op))
            }

        }
        return [groups, ops];
    },

}


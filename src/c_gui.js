import { M } from "./flat_folder/math.js";
import { NOTE } from "./flat_folder/note.js";
import { X } from "./flat_folder/conversion.js";
import { SVG } from "./flat_folder/svg.js";
import { D } from "./distortion.js";
import { GUI } from "./flat_folder/gui.js";

import { CON } from "./flat_folder/constraints.js";
import { C } from "./cut.js";

export const CGUI = {
    update_ray: (svg, FOLD, CELL, ray, flip) => {
        GUI.update_fold(svg, FOLD, CELL, flip)


        SVG.draw_segments(svg, [ray], {
            id: "fold_ray_crease", stroke: "magenta",
            stroke_width: 10
        });
    },

    update_flat: (svg, CUT, group) => {
        const Fs = CUT.Fs
        const FG = CUT.FG

        //rendering the flat cut
        const faces = CUT.FV.map((i_vs) => {
            return M.expand(i_vs, CUT.V)
        })
        const colors = FG.map((g, i) => {
            return (g == group) ? "lightgray" : "white"
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

        SVG.draw_segments(svg, creases, {
            id: "fold_s_crease",
            stroke: CUT.EA.map(p => "magenta"),
            stroke_width: 10,
            filter: (i) => CUT.EA[i] == "C"
        });
    },

    update_cut_select: (FOLD, CELL, sG) => {
        const sel = document.getElementById("cutselect")
        const side = document.getElementById("cutside")
        SVG.clear_element(sel)
        for (const k in sG[side.checked ? 1 : 0]) {
            const el = document.createElement("option");
            el.setAttribute("value", k);
            el.textContent = k;
            sel.appendChild(el);
        }
        sel.value = "0"
        sel.onchange = (e) => {
            C.cut(FOLD, CELL)
        };
        side.onchange = (e) => {
            SVG.clear_element(sel)
            CGUI.update_cut_select(FOLD, CELL, sG)
            C.cut(FOLD, CELL)
        };
    },
}
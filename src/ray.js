import { X } from "./flat_folder/conversion.js";
import { GUI } from "./flat_folder/gui.js";
import { SVG } from "./flat_folder/svg.js";

import { CGUI } from "./c_gui.js";

import { M } from "./flat_folder/math.js";

import { XCUT } from "./x_cut.js";
import { C } from "./cut.js";

import { CTRL } from "./control.js";
import { XRAY } from "./x_ray.js";


export const RAY = {
    init: (FOLD, CELL) => {
        const svg_ray = document.getElementById("fold_ray")

        // rendering
        RAY.update_fold(svg_ray, FOLD, CELL, false)

    },
    update_fold: (svg, FOLD, CELL, flip) => {
        SVG.clear_element(svg);
        const id_base = svg.getAttribute("id")
        const { EF, Ff, eps } = FOLD;
        const { P_norm, SP, SE, PP, CP, SC, CF, CD } = CELL;
        const tops = CD.map(S => flip ? S[0] : S[S.length - 1]);
        const SD = X.EF_SE_SC_CF_CD_2_SD(EF, SE, SC, CF, tops);
        const m = [0.5, 0.5];
        const Q = P_norm.map(p => (flip ? M.add(M.refX(M.sub(p, m)), m) : p));
        const cells = CP.map(V => M.expand(V, Q));
        const colors = tops.map(d => {
            if (d == undefined) { return undefined; }
            if (Ff[d] != flip) { return GUI.COLORS.face.top; }
            else { return GUI.COLORS.face.bottom; }
        });
        CELL.Ctop = tops;
        CELL.Ccolor = colors;
        const visible = XRAY.PP_Ctop_CP_SC_2_visible(Q, PP, tops, CP, SC);
        SVG.draw_polygons(svg, cells, {
            id: id_base + "_c", fill: colors, stroke: colors
        });
        const lines = SP.map((ps) => M.expand(ps, Q));
        SVG.draw_segments(svg, lines, {
            id: id_base + "_s_crease", stroke: GUI.COLORS.edge.F,
            filter: (i) => SD[i] == "C"
        });
        SVG.draw_segments(svg, lines, {
            id: id_base + "_s_edge", stroke: GUI.COLORS.edge.B,
            filter: (i) => SD[i] == "B"
        });
        const Lsvg = SVG.append("g", svg, { id: id_base + "lines" });
        SVG.draw_points(svg, Q, {
            id: id_base + "_p", filter: (i) => visible[i],
            fill: GUI.COLORS.point.normal, r: GUI.RADIUS.select,
            opacity: GUI.COLORS.point.opacity.normal,
        });
        const clicked = new Map();
        for (let i = 0; i < Q.length; ++i) {
            const el = document.getElementById(id_base + `_p${i}`);
            if (el != undefined) {
                el.onmouseover = () => RAY.point_over(el);
                el.onmouseout = () => RAY.point_out(i, el, clicked);
                el.onclick = () => RAY.point_click(i, el, clicked, svg, Q, FOLD, CELL, Lsvg)
            }
        }
    },
    point_over: (el) => {
        el.setAttribute("fill", GUI.COLORS.point.select);
        el.setAttribute("r", GUI.RADIUS.select);
        el.setAttribute("opacity", GUI.COLORS.point.opacity.hover);
    },
    point_out: (i, el, clicked) => {
        const unclicked = (clicked.get(i) == undefined);
        el.setAttribute("r", unclicked
            ? GUI.RADIUS.select
            : GUI.RADIUS.hover);
        el.setAttribute("opacity", unclicked
            ? GUI.COLORS.point.opacity.normal
            : GUI.COLORS.point.opacity.hover
        );
        el.setAttribute("fill", unclicked
            ? GUI.COLORS.point.normal
            : GUI.COLORS.point.active
        );
    },
    point_click: (i, el, clicked, svg, Q, FOLD, CELL, Lsvg) => {
        const id_base = svg.getAttribute("id")

        if (clicked.size > 1) {
            clicked.clear()
            Q.map((v, i) => {
                RAY.point_out(i, document.getElementById(id_base + "_p" + i), clicked)
            })
        }

        clicked.set(i, el);
        RAY.point_out(i, el, clicked)
        if (clicked.size == 2) {
            let ray0 = []
            for (const [i, k] of clicked.entries()) {
                ray0.push(Q[i])
            }
            const [p0, q0] = ray0
            const dir = M.mul(M.sub(q0, p0), 10)
            const ray = [M.sub(p0, dir), M.add(dir, q0)]
            SVG.clear_element(Lsvg)
            SVG.draw_segments(Lsvg, [ray], { stroke: "magenta", stroke_width: 10 })
            const CC = C.cut(FOLD, CELL, ray)
            CGUI.update_cut(CC.CUT, CC.CELL)
        }
    },
}
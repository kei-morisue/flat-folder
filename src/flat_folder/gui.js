import { M } from "./math.js";
import { NOTE } from "./note.js";
import { X } from "./conversion.js";
import { SVG } from "./svg.js";
import { SB } from "../sandbox.js";
import { CON } from "./constraints.js";

import { LIN } from "../linear.js";
export const GUI = {   // INTERFACE
    BOUNDARY: 50,
    WIDTH: {
        BOLD: 3,
        CREASE: 1,
        DEFAULT: 1,

    },
    COLORS: {
        background: "lightgreen",
        active: "yellow",
        B: "lightskyblue",
        TE: ["green", "red", "orange", "cyan"],
        TF: ["lightgreen", "lightpink", "lightorange", "lightskyblue"],
        edge: {
            U: "black",
            F: "black",
            M: "blue",  // crease pattern is
            V: "red",   // rendered white-side up
            B: "black",
        },
        face: {
            top: "gray",
            bottom: "white",
        },
        rand: ["lime", "red", "blue", "green", "aqua", "orange", "pink",
            "purple", "brown", "darkviolet", "teal", "olivedrab", "fuchsia",
            "deepskyblue", "orangered", "maroon", "yellow"],
        error: ["yellow", "lightskyblue", "lightpink", "lightgreen"],
    },

    initiate_canvas: (parent, ids, is_vertical = false) => {
        const [boundary, scale] = [GUI.BOUNDARY, SVG.SCALE];
        const base = SVG.draw_viewbox(
            parent,
            is_vertical ? [0, 0, scale, ids.length * scale] : [0, 0, ids.length * scale, scale],
            GUI.COLORS.background)
        for (const [i, id] of ids.entries()) {
            SVG.draw_canvas(
                base,
                is_vertical ? [0, i * scale, scale, scale] : [i * scale, 0, scale, scale],
                [-boundary, -boundary, scale + 2 * boundary, scale + 2 * boundary]
            ).setAttribute("id", id)
        }
    },
    update_text: ([$flat, $cell], FOLD, CELL) => {
        SVG.clear("export");

        const pre_flat = $flat.getAttribute("id")
        const pre_cell = $cell.getAttribute("id")
        SVG.clear(pre_flat + "flat_shrunk");
        SVG.clear(pre_flat + "flat_text");
        if (CELL != undefined) {
            SVG.clear(pre_cell + "cell_text");
        }
        const visible = document.getElementById("text").checked;
        if (visible) {
            const flat_text = document.getElementById(pre_flat + "flat_text");
            const flat_shrunk = document.getElementById(pre_flat + "flat_shrunk");
            const { V, EV, EA, FV } = FOLD;
            const F = FV.map(f => M.expand(f, V));
            const shrunk = F.map(f => {
                const c = M.centroid(f);
                return f.map(p => M.add(M.mul(M.sub(p, c), 0.5), c));
            });
            SVG.draw_polygons(flat_shrunk, shrunk, {
                text: true, id: pre_flat + "f_text", opacity: 0.2
            });
            const line_centers = EV.map(l => M.centroid(M.expand(l, V)));
            const colors = EA.map(a => GUI.COLORS.edge[a]);
            SVG.draw_points(flat_text, line_centers, {
                text: true, id: pre_flat + "e_text", fill: colors
            });
            SVG.draw_points(flat_text, V, {
                text: true, id: pre_flat + "v_text", fill: "green"
            });
            if (CELL != undefined) {
                const { P_norm, SP, CP } = CELL;
                const cell_text = document.getElementById(pre_cell + "cell_text");
                const cell_centers = CP.map(f => M.interior_point(M.expand(f, P_norm)));
                const seg_centers = SP.map(l => M.centroid(M.expand(l, P_norm)));
                SVG.draw_points(cell_text, cell_centers, {
                    text: true, id: pre_cell + "c_text"
                });
                SVG.draw_points(cell_text, seg_centers, {
                    text: true, id: pre_cell + "s_text"
                });
                SVG.draw_points(cell_text, P_norm, {
                    text: true, id: pre_cell + "p_text", fill: "green"
                });
            }
        }
    },

    update_text_cell: ($cell, CELL) => {
        SVG.clear("export");
        const pre_cell = $cell.getAttribute("id")
        SVG.clear(pre_cell + "cell_text");
        const visible = document.getElementById("text").checked;
        if (visible) {
            const { P_norm, SP, CP } = CELL;
            const cell_text = document.getElementById(pre_cell + "cell_text");
            const cell_centers = CP.map(f => M.interior_point(M.expand(f, P_norm)));
            const seg_centers = SP.map(l => M.centroid(M.expand(l, P_norm)));
            SVG.draw_points(cell_text, cell_centers, {
                text: true, id: pre_cell + "c_text"
            });
            SVG.draw_points(cell_text, seg_centers, {
                text: true, id: pre_cell + "s_text"
            });
            SVG.draw_points(cell_text, P_norm, {
                text: true, id: pre_cell + "p_text", fill: "green"
            });
        }
    },
    update_text_flat: ($flat, FOLD) => {
        SVG.clear("export");
        const pre_flat = $flat.getAttribute("id")
        SVG.clear(pre_flat + "flat_shrunk");
        SVG.clear(pre_flat + "flat_text");
        const visible = document.getElementById("text").checked;
        if (visible) {
            const flat_text = document.getElementById(pre_flat + "flat_text");
            const flat_shrunk = document.getElementById(pre_flat + "flat_shrunk");
            const { V, EV, EA, FV } = FOLD;
            const F = FV.map(f => M.expand(f, V));
            const shrunk = F.map(f => {
                const c = M.centroid(f);
                return f.map(p => M.add(M.mul(M.sub(p, c), 0.5), c));
            });
            SVG.draw_polygons(flat_shrunk, shrunk, {
                text: true, id: pre_flat + "f_text", opacity: 0.2
            });
            const line_centers = EV.map(l => M.centroid(M.expand(l, V)));
            const colors = EA.map(a => GUI.COLORS.edge[a]);
            SVG.draw_points(flat_text, line_centers, {
                text: true, id: pre_flat + "e_text", fill: colors
            });
            SVG.draw_points(flat_text, V, {
                text: true, id: pre_flat + "v_text", fill: "green"
            });
        }
    },
    update_flat: ($flat, FOLD) => {
        SVG.clear_element($flat)
        const prefix = $flat.getAttribute("id")
        const { V, VK, EV, EA, FV } = FOLD;
        const F = FV.map(f => M.expand(f, V));
        SVG.draw_polygons($flat, F, { id: prefix + "flat_f", fill: GUI.COLORS.face.bottom });
        SVG.append("g", $flat, { id: prefix + "flat_shrunk" });
        const K = [];
        const eps = 1 / M.EPS;
        for (const [i, k] of VK.entries()) {
            if (k > eps) { K.push(V[i]); }
        }
        SVG.draw_points($flat, K, { id: prefix + "flat_check", fill: "red", r: 10 });
        const lines = EV.map(l => M.expand(l, V));
        const colors = EA.map(a => GUI.COLORS.edge[a]);
        SVG.draw_segments($flat, lines, {
            id: prefix + "flat_e_flat", stroke: colors,
            stroke_width: GUI.WIDTH.BOLD, filter: (i) => (EA[i] != "F")
        });
        SVG.draw_segments($flat, lines, {
            id: prefix + "flat_e_folded", stroke: colors,
            stroke_width: GUI.WIDTH.CREASE, filter: (i) => (EA[i] == "F")
        });
        SVG.append("g", $flat, { id: prefix + "flat_text" });
        SVG.append("g", $flat, { id: prefix + "flat_notes" });
        GUI.update_text_flat($flat, FOLD);
    },
    update_cell_lazy: ($cell, FOLD) => {
        const id_cell = $cell.getAttribute("id")
        SVG.clear_element($cell)
        const F = FOLD.FV.map(f => M.expand(f, FOLD.Vf_norm));
        SVG.draw_polygons(
            $cell,
            F,
            { id: id_cell + "cell_f", opacity: 0.05 });
        SVG.append("g", $cell, { id: id_cell + "cell_text" });
        SVG.append("g", $cell, { id: id_cell + "cell_notes" });
        SVG.append("g", $cell, { id: id_cell + "component_notes" });
    },
    update_cell: ($cell, CELL) => {
        const id_cell = $cell.getAttribute("id")
        SVG.clear_element($cell)

        const { P_norm, SP, SE, CP, SC, CF, FC } = CELL;
        const cells = CP.map(f => M.expand(f, P_norm));
        const lines = SP.map(l => M.expand(l, P_norm));
        const Ccolors = GUI.CF_2_Cbw(CF);
        SVG.draw_polygons(
            $cell,
            cells,
            { fill: Ccolors, id: id_cell + "cell_c" });
        SVG.draw_segments(
            $cell,
            lines,
            { id: id_cell + "cell_s", stroke: "black", stroke_width: GUI.WIDTH.DEFAULT });

        SVG.append("g", $cell, { id: id_cell + "cell_text" });
        SVG.append("g", $cell, { id: id_cell + "cell_notes" });
        SVG.append("g", $cell, { id: id_cell + "component_notes" });
        GUI.update_text_cell($cell, CELL);
    },
    CF_2_Ccolors: (CF) => {
        return GUI.CF_2_Clayer(CF).map(l => `hsl(${Math.ceil((2 + l) * 120)}, 100%, 50%)`);
    },
    CF_2_Cbw: (CF) => {
        return GUI.CF_2_Clayer(CF).map(l => {
            if (l == 0) {
                return "hsla(0, 0%, 0%, 0.0)";
            }
            return `hsl(0, 0%, ${Math.ceil((1 - l * 0.8) * 100)}%)`;
        });
    },
    CF_2_Clayer: (CF) => {
        let max_layers = 0;
        for (const F of CF) {
            if (max_layers < F.length) {
                max_layers = F.length;
            }
        }
        return CF.map(F => F.length / max_layers);
    },
    update_fold: (svg_fold, FOLD, CELL, flip) => {
        SVG.clear("export");
        SVG.clear_element(svg_fold)
        const { EF, Ff } = FOLD;
        const { P_norm, SP, SE, CP, SC, CF, CD } = CELL;
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
        SVG.draw_polygons(svg_fold, cells, {
            id: "fold_c", fill: colors, stroke: colors
        });
        const lines = SP.map((ps) => M.expand(ps, Q));
        SVG.draw_segments(svg_fold, lines, {
            id: "fold_s_crease", stroke: GUI.COLORS.edge.F,
            stroke_width: GUI.WIDTH.CREASE,
            filter: (i) => SD[i] == "C"
        });
        SVG.draw_segments(svg_fold, lines, {
            id: "fold_s_edge", stroke: GUI.COLORS.edge.B,
            stroke_width: GUI.WIDTH.BOLD,
            filter: (i) => SD[i] == "B"
        });
    },

    STORE_GI: undefined,

    get_flip: (checked) => {
        const [Y] = SB.get_parameters(0)
        const is_transform_flip = LIN.det(Y) < 0
        return checked ^ is_transform_flip
    },
    update_component: ($fold, FOLD, CELL, BF, GB, GA, GI, $cell = undefined) => {
        SVG.clear("export");
        GUI.STORE_GI = GI

        const comp_select = document.getElementById("component_select");
        const c = comp_select.value;
        document.getElementById("state_config").style.display = "none";
        comp_select.style.background = "white";
        const C = [];
        if (c == "none") {
        } else if (c == "all") {
            for (const [i, _] of GA.entries()) {
                C.push(i);
            }
        } else {
            C.push(c);
            const n = GA[c].length;
            comp_select.style.background = GUI.COLORS.rand[c % GUI.COLORS.rand.length];
            document.getElementById("state_config").style.display = "inline";
            const state_label = document.getElementById("state_label");
            const state_select = document.getElementById("state_select");
            state_label.innerHTML = `${n} State${(n == 1) ? "" : "s"}`;
            state_select.setAttribute("min", 1);
            state_select.setAttribute("max", n);
            state_select.value = GI[c] + 1;
            state_select.onchange = (e) => {
                NOTE.start("Computing new state");
                let j = +e.target.value;
                if (j < 1) { j = 1; }
                if (j > n) { j = n; }
                state_select.value = j;
                GI[c] = j - 1;
                const edges = X.BF_GB_GA_GI_2_edges(BF, GB, GA, GI);
                FOLD.FO = X.edges_Ff_2_FO(edges, GUI.STORE_FOLD.Ff);
                CELL.CD = X.CF_edges_flip_2_CD(CELL.CF, edges);
                const id = $fold.getAttribute("id")
                const flip = GUI.get_flip(document.getElementById("flip" + id).checked)
                GUI.update_fold($fold, FOLD, CELL, flip);
                GUI.STORE_GI = GI
                SB.GI_2_DIST(FOLD, GI, BF, GB, GA)
                NOTE.end();
            };
        }
        if ($cell != undefined) {
            GUI.update_cell_component_notes($cell, BF, GB, C)
        }
    },

    update_cell_component_notes: ($cell, BF, GB, C) => {
        const id_cell = $cell.getAttribute("id")
        const g = SVG.clear(id_cell + "component_notes");
        const { Vf_norm, FV } = FOLD;
        for (const comp of C) {
            const lines = GB[comp].map(b => {
                const [f1, f2] = M.decode(BF[b]);
                const p1 = M.centroid(M.expand(FV[f1], Vf_norm));
                const p2 = M.centroid(M.expand(FV[f2], Vf_norm));
                return [p1, p2];
            });
            const stroke = GUI.COLORS.rand[comp % GUI.COLORS.rand.length];
            SVG.draw_segments(g, lines, {
                id: id_cell + "cell_comp",
                "stroke": stroke, "stroke_width": 2
            });
        }
    },

    update_cell_face_listeners: ($flat, $cell, FOLD, CELL, BF, BT, sol) => {
        const { V, EV, FV, FE } = FOLD;
        const { P_norm, SP, CP, CS, CF, FC, SE } = CELL;
        const ES_map = new Map();
        for (const [i, E] of SE.entries()) {
            for (const e of E) {
                const k = M.encode(EV[e]);
                const A = ES_map.get(k);
                if (A == undefined) {
                    ES_map.set(k, [i]);
                } else {
                    A.push(i);
                }
            }
        }
        const SE_map = new Map();
        for (const [i, E] of SE.entries()) {
            SE_map.set(M.encode(SP[i]), E);
        }
        const FM = FV.map(F => M.centroid(M.expand(F, V)));
        const FB_map = new Map();
        for (const [i, F] of BF.entries()) {
            FB_map.set(F, i);
        }
        const FB = FC.map(() => []);
        for (const k of BF) {
            const [f1, f2] = M.decode(k);
            FB[f1].push(f2);
            FB[f2].push(f1);
        }
        const id_flat = $flat.getAttribute("id")
        const id_cell = $cell.getAttribute("id")
        const active = [];
        const flat_notes = document.getElementById(id_flat + "flat_notes");
        const cell_notes = document.getElementById(id_cell + "cell_notes");
        for (const [i, C] of FC.entries()) {
            const face = document.getElementById(id_flat + `flat_f${i}`);
            face.onclick = () => {
                const color = face.getAttribute("fill");
                GUI.clear_notes($flat, $cell, CF, FC, true);
                if (active.length == 1) {
                    if (color != GUI.COLORS.B) {
                        active.pop();
                        return;
                    }
                    active.push(i);
                    const [f1, f2] = active;
                    const ti = FB_map.get(M.encode_order_pair([f1, f2]));
                    const T = BT[ti];
                    const SL = [];
                    for (const j of [0, 1, 2]) {
                        const Ti = T[j];
                        SL.push(Ti.map((t) => `[${t.join(",")}]`));
                    }
                    SL.push(Array.from(T[3]).map(x => M.decode(x)));
                    for (const j of [3, 1]) {
                        const Tj = (j == 1) ? T[j] : M.decode(T[j]);
                        for (const F of Tj) {
                            const f3 = (j == 1) ? F[2] : F;
                            const el = document.getElementById(id_flat + `flat_f${f3}`);
                            el.setAttribute("fill", GUI.COLORS.TF[j]);
                        }
                    }
                    const L = [new Set(), new Set(), new Set()];
                    for (const j of [0, 1, 2]) {
                        for (const [a, b, c, d] of T[j]) {
                            L[j].add(M.encode([a, b]));
                            if (j != 1) {
                                L[j].add(M.encode_order_pair([c, d]));
                            }
                        }
                    }
                    for (const j of [0, 1, 2]) {
                        L[j] = Array.from(L[j]).map(
                            k => M.decode(k).map(x => FM[x])
                        );
                    }
                    for (const j of [1, 2, 0]) {
                        SVG.draw_segments(flat_notes, L[j], {
                            id: "flat_cons",
                            stroke: GUI.COLORS.TE[j], stroke_width: 5
                        });
                    }
                    for (const f of [f1, f2]) {
                        for (const c of FC[f]) {
                            const el = document.getElementById(id_cell + `cell_c${c}`);
                            el.setAttribute("fill", GUI.COLORS.active);
                        }
                    }
                    const C1 = new Set(FC[f1]);
                    for (const c of FC[f2]) {
                        if (C1.has(c)) {
                            const el = document.getElementById(id_cell + `cell_c${c}`);
                            el.setAttribute("fill", GUI.COLORS.TF[3]);
                        }
                    }
                    for (const f of active) {
                        const el = document.getElementById(id_flat + `flat_f${f}`);
                        el.setAttribute("fill", GUI.COLORS.active);
                    }
                } else {
                    while (active.length > 0) { active.pop(); }
                    if (color != GUI.COLORS.face.bottom) {
                        return;
                    }
                    active.push(i);
                    for (const f of FB[i]) {
                        const el = document.getElementById(id_flat + `flat_f${f}`);
                        el.setAttribute("fill", GUI.COLORS.B);
                    }
                    const S = [];
                    const Scolors = [];
                    const Lcolors = [];
                    const L = FV[i].map((v1, j) => {
                        const v2 = FV[i][(j + 1) % FV[i].length];
                        const k = M.encode_order_pair([v1, v2]);
                        const color = GUI.COLORS.rand[j % GUI.COLORS.rand.length];
                        for (const s of ES_map.get(k)) {
                            S.push(SP[s].map(p => P_norm[p]));
                            Scolors.push(color);
                        }
                        Lcolors.push(color);
                        return [v1, v2].map(p => V[p]);
                    });
                    SVG.draw_segments(flat_notes, L, {
                        id: "flat_f_bounds", stroke: Lcolors, stroke_width: 5
                    });
                    SVG.draw_segments(cell_notes, S, {
                        id: "cell_f_bounds", stroke: Scolors, stroke_width: 5
                    });
                    GUI.add_active(face, C, id_cell + "cell_c");
                }
            };
        }
        for (const [i, F] of CF.entries()) {
            const cell = document.getElementById(id_cell + `cell_c${i}`);
            cell.onclick = () => {
                const active = (cell.getAttribute("fill") == GUI.COLORS.active);
                GUI.clear_notes($flat, $cell, CF, FC, !active);
                if (active) {
                    return;
                }
                GUI.add_active(cell, F, id_flat + "flat_f");
                const L = [];
                const Lcolors = [];
                const Scolors = [];
                const S = CP[i].map((p1, j) => {
                    const p2 = CP[i][(j + 1) % CP[i].length];
                    const k = M.encode_order_pair([p1, p2]);
                    const color = GUI.COLORS.rand[j % GUI.COLORS.rand.length];
                    for (const e of SE_map.get(k)) {
                        L.push(EV[e].map(p => V[p]));
                        Lcolors.push(color);
                    }
                    Scolors.push(color);
                    return [p1, p2].map(p => P_norm[p]);
                });
                SVG.draw_segments(flat_notes, L, {
                    id: "flat_c_bounds", stroke: Lcolors, stroke_width: 5
                });
                SVG.draw_segments(cell_notes, S, {
                    id: "cell_c_bounds", stroke: Scolors, stroke_width: 5
                });
            };
        }
        if (sol.length == 3) { // solve found unsatisfiable constraint
            const [type, F, E] = sol;
            const str = `Unable to resolve ${CON.names[type]} on faces [${F}]`;
            const num_states = document.getElementById("num_states");
            num_states.textContent = `(Found 0 states) ${str}`;
            return sol;
        }
    },
    clear_notes: ($flat, $cell, CF, FC, active) => {
        const id_flat = $flat.getAttribute("id")
        const id_cell = $cell.getAttribute("id")
        SVG.clear(id_flat + "flat_notes");
        SVG.clear(id_cell + "cell_notes");
        SVG.clear("export");
        for (const [i, C] of FC.entries()) {
            const f = document.getElementById(id_flat + `flat_f${i}`);
            f.setAttribute("fill", GUI.COLORS.face.bottom);
        }
        const Ccolors = active ? GUI.CF_2_Cbw(CF) : GUI.CF_2_Cbw(CF);
        for (const [i, F] of CF.entries()) {
            const c = document.getElementById(id_cell + `cell_c${i}`);
            c.setAttribute("fill", Ccolors[i]);
        }
    },
    add_active: (svg, A, id) => {
        svg.setAttribute("fill", GUI.COLORS.active);
        for (const a of A) {
            const el = document.getElementById(`${id}${a}`);
            el.setAttribute("fill", GUI.COLORS.active);
        }
    },
    update_error: ($flat, $cell, F, E, BF, FC) => {
        const id_flat = $flat.getAttribute("id")
        const id_cell = $cell.getAttribute("id")
        for (const i of E) {
            const f = document.getElementById(id_flat + `flat_f${i}`);
            f.setAttribute("opacity", 0.2);
        }
        const CFnum = new Map();
        for (const i of F) {
            const f = document.getElementById(id_flat + `flat_f${i}`);
            f.setAttribute("fill", "red");
            for (const j of FC[i]) {
                const val = CFnum.get(j);
                CFnum.set(j, (val == undefined) ? 0 : val + 1);
            }
        }
        for (const [i, val] of CFnum) {
            const c = document.getElementById(id_cell + `cell_c${i}`);
            c.setAttribute("fill", GUI.COLORS.error[val]);
        }
    },
};

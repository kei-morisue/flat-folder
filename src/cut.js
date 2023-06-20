import { IO } from "./flat_folder/io.js";

import { F } from "./fold.js";
import { D } from "./distortion.js";


import { CP } from "./cp.js";
import { X } from "./flat_folder/conversion.js";
import { GUI } from "./flat_folder/gui.js";

import { M } from "./flat_folder/math.js";

import { SVG } from "./flat_folder/svg.js";


export const CUT = {
    cut: (FOLD, CELL) => {

        const seg = [[0.5, 1], [0.5, 0]]
        const svg_flat = document.getElementById("flat_cut")
        const svg_fold = document.getElementById("fold_cut")
        GUI.update_flat(svg_flat, FOLD)
        GUI.update_fold(svg_fold, FOLD, CELL, false)


        SVG.draw_segments(svg_fold, [seg], {
            id: "fold_s_crease", stroke: "magenta",
            stroke_width: 10
        });
    },
}
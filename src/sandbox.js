import { IO } from "./flat_folder/io.js";

import { F } from "./fold.js";
import { D } from "./distortion.js";
import { CP } from "./cp.js";
import { X } from "./flat_folder/conversion.js";
import { M } from "./flat_folder/math.js";
import { C } from "./cut.js";
import { CGUI } from "./c_gui.js";
import { CTRL } from "./control.js";



export const SB = {
    initialize_sliders: (FOLD, BF, GB, GA) => {
        const event_type = "input"
        const sliders = [0, 1, 2, 3, 4, 5].map((i) => document.getElementById("slider" + i));
        const handler = () => {
            D.GI_2_DIST(FOLD, BF, GB, GA)
        }
        for (const slider_template of sliders) {
            const base_name = slider_template.getAttribute("id")
            const old_slider = document.getElementById(base_name + "instance")
            const old_reset = document.getElementById(base_name + "reset")
            if (old_slider != undefined) {
                old_slider.remove()
                old_reset.remove()
            }


            const slider = slider_template.cloneNode(false)
            slider.setAttribute("id", base_name + "instance")
            slider.oninput = handler


            const resetbutton = document.createElement("button")
            resetbutton.setAttribute("id", base_name + "reset")
            resetbutton.innerHTML = "reset"
            const ini = slider_template.value
            resetbutton.onclick = (e) => {
                slider.value = ini
                slider.dispatchEvent(new Event(event_type))
            }
            const node = slider_template.parentNode
            node.appendChild(slider)
            node.prepend(resetbutton)
            slider.style.display = "inline"
            slider_template.style.display = "none"
        }
    },


    sandbox: () => {
        // FOLD
        const FOLD = IO.doc_type_2_FOLD(
            CP[document.getElementById("cpselect").value],
            "cp",
            document.getElementById("side").value)
        const CELL = X.FOLD_2_CELL(FOLD)
        const svg_fold = document.getElementById("fold")

        CTRL.set_flip_check_box("flipfold", svg_fold, FOLD, CELL)

        //constraint
        //F.compute_flat(FOLD, $flat, $cell, $fold)
        const { BF, GB, GA } = F.compute_constraints(FOLD, CELL)
        SB.initialize_sliders(FOLD, BF, GB, GA)

        F.update_state_control(svg_fold, FOLD, CELL, BF, GB, GA)

        //distortion
        const edges = D.GI_2_DIST(FOLD, BF, GB, GA)
        FOLD.edges = edges
        //cutting
        const box = document.getElementById("flipfold_ray");
        box.onchange = () => {
            const CC = C.cut(FOLD, CELL)
            CGUI.update_cut(CC.CUT, CC.CELL)
        }
        const CC = C.cut(FOLD, CELL)
        CGUI.update_cut(CC.CUT, CC.CELL)
    },

}
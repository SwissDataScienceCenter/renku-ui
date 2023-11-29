/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState } from "react";
import templateJuliaGraphic from "../Graphics/templateJulia.png";
import templatePythonGraphic from "../Graphics/templatePython.png";
import templateRStudioGraphic from "../Graphics/templateRstudio.png";
import styles from "./TemplateSlider.module.scss";

import btnJulia from "../Graphics/btnJulia-min.png";
import btnJuliaSelected from "../Graphics/btnJuliaSelected-min.png";
import btnPython from "../Graphics/btnPython-min.png";
import btnPythonSelected from "../Graphics/btnPythonSelected-min.png";
import btnRStudio from "../Graphics/btnRStudio-min.png";
import btnRStudioSelected from "../Graphics/btnRstudioSelected-min.png";

export default function TemplateSlider() {
  const [templateSelected, setTemplateSelected] = useState<
    "python" | "rStudio" | "julia"
  >("python");
  return (
    <div className={styles.templateSlideContainer}>
      <div className={styles.templateSliderImages}>
        <img
          src={templatePythonGraphic}
          alt="Template Renku"
          loading="lazy"
          hidden={templateSelected !== "python"}
        />
        <img
          src={templateRStudioGraphic}
          alt="Template Renku"
          loading="lazy"
          hidden={templateSelected !== "rStudio"}
        />
        <img
          src={templateJuliaGraphic}
          alt="Template Renku"
          loading="lazy"
          hidden={templateSelected !== "julia"}
        />
      </div>
      <div className={styles.templateSliderBtn}>
        <img
          src={templateSelected === "python" ? btnPythonSelected : btnPython}
          alt="Button Python"
          loading="lazy"
          onClick={() => setTemplateSelected("python")}
        />
        <img
          src={templateSelected === "rStudio" ? btnRStudioSelected : btnRStudio}
          alt="Button RStudio"
          loading="lazy"
          onClick={() => setTemplateSelected("rStudio")}
        />
        <img
          src={templateSelected === "julia" ? btnJuliaSelected : btnJulia}
          alt="Button Julia"
          loading="lazy"
          onClick={() => setTemplateSelected("julia")}
        />
      </div>
    </div>
  );
}

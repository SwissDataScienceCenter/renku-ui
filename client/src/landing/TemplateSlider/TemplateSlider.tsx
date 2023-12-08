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

import cx from "classnames";
import { clamp } from "lodash";
import { DateTime, Duration } from "luxon";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "reactstrap";

import btnJulia from "../Graphics/btnJulia-min.png";
import btnJuliaSelected from "../Graphics/btnJuliaSelected-min.png";
import btnPython from "../Graphics/btnPython-min.png";
import btnPythonSelected from "../Graphics/btnPythonSelected-min.png";
import btnRStudio from "../Graphics/btnRStudio-min.png";
import btnRStudioSelected from "../Graphics/btnRstudioSelected-min.png";
import templateJuliaGraphic from "../Graphics/templateJulia.png";
import templatePythonGraphic from "../Graphics/templatePython.png";
import templateRStudioGraphic from "../Graphics/templateRstudio.png";

import styles from "./TemplateSlider.module.scss";

const AUTO_CHANGE_TEMPLATE_DURATION_MS = Duration.fromObject({
  seconds: 5,
  // eslint-disable-next-line spellcheck/spell-checker
}).toMillis();

export default function TemplateSlider() {
  const [{ templateSelected, lastSelection }, setState] = useState<State>({
    templateSelected: "python",
    lastSelection: null,
  });

  const onSelectTemplate = useCallback(
    (templateSelected: State["templateSelected"]) => () => {
      setState({ templateSelected, lastSelection: DateTime.now() });
    },
    []
  );

  const progressRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<DOMHighResTimeStamp | null>(null);

  // Show the next template 5 seconds after the last change
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setState(({ templateSelected }) => ({
        templateSelected:
          templateSelected === "python"
            ? "rStudio"
            : templateSelected === "rStudio"
            ? "julia"
            : "python",
        lastSelection: DateTime.now(),
      }));
    }, AUTO_CHANGE_TEMPLATE_DURATION_MS);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [lastSelection]);

  // Animate progress
  useEffect(() => {
    startRef.current = null;
    const animation = (timeStamp: DOMHighResTimeStamp) => {
      if (startRef.current == null) {
        startRef.current = timeStamp;
      }
      const start = startRef.current ?? timeStamp;
      const elapsedMs = timeStamp - start;
      const progress =
        clamp(elapsedMs / AUTO_CHANGE_TEMPLATE_DURATION_MS, 0, 1) * 100;
      if (progressRef.current != null) {
        progressRef.current.style.width = `${progress}%`;
      }
      if (elapsedMs < AUTO_CHANGE_TEMPLATE_DURATION_MS) {
        rafRef.current = window.requestAnimationFrame(animation);
      }
    };
    const raf = window.requestAnimationFrame(animation);
    rafRef.current = raf;

    const progressBar = progressRef.current;
    return () => {
      if (progressBar != null) {
        progressBar.style.width = `0%`;
      }
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [lastSelection]);

  const progressBar = (
    <div
      className={cx(
        styles.templateSliderProgress,
        "progress",
        "position-absolute",
        "bottom-0",
        "start-0",
        "end-0",
        "bg-transparent",
        "opacity-50",
        "align-items-end"
      )}
      // eslint-disable-next-line spellcheck/spell-checker
      role="progressbar"
    >
      <div
        className={cx(
          styles.templateSliderProgressBar,
          "progress-bar",
          "bg-rk-green"
        )}
        ref={progressRef}
      ></div>
    </div>
  );

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
        <Button
          className={cx("border-0", "bg-transparent", "p-0")}
          onClick={onSelectTemplate("python")}
          type="button"
          role="button"
        >
          <div className="position-relative">
            {templateSelected === "python" && progressBar}
            <img
              src={
                templateSelected === "python" ? btnPythonSelected : btnPython
              }
              alt="Button Python"
              loading="lazy"
            />
          </div>
        </Button>
        <Button
          className={cx("border-0", "bg-transparent", "p-0")}
          onClick={onSelectTemplate("rStudio")}
          type="button"
          role="button"
        >
          <div className="position-relative">
            {templateSelected === "rStudio" && progressBar}
            <img
              src={
                templateSelected === "rStudio" ? btnRStudioSelected : btnRStudio
              }
              alt="Button RStudio"
              loading="lazy"
            />
          </div>
        </Button>
        <Button
          className={cx("border-0", "bg-transparent", "p-0")}
          onClick={onSelectTemplate("julia")}
          type="button"
          role="button"
        >
          <div className="position-relative">
            {templateSelected === "julia" && progressBar}
            <img
              src={templateSelected === "julia" ? btnJuliaSelected : btnJulia}
              alt="Button Julia"
              loading="lazy"
            />
          </div>
        </Button>
      </div>
    </div>
  );
}

interface State {
  templateSelected: "python" | "rStudio" | "julia";
  lastSelection: DateTime | null;
}

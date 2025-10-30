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
import { clamp } from "lodash-es";
import { DateTime, Duration } from "luxon";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "reactstrap";

import btnPython from "../../assets/btnJupyter.png";
import btnPythonSelected from "../../assets/btnJupyterSelected.png";
import btnRStudio from "../../assets/btnR.png";
import btnRStudioSelected from "../../assets/btnRSelected.png";
import btnVS from "../../assets/btnVS.png";
import btnVSSelected from "../../assets/btnVSSelected.png";
import templatePythonGraphic from "../../assets/templateJupyter.png";
import templateRStudioGraphic from "../../assets/templateR.png";
import templateVSGraphic from "../../assets/templateVS.png";

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
            ? "vs"
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
          className="w-100"
        />
        <img
          src={templateRStudioGraphic}
          alt="Template Renku"
          loading="lazy"
          hidden={templateSelected !== "rStudio"}
          className="w-100"
        />
        <img
          src={templateVSGraphic}
          alt="Template Renku"
          loading="lazy"
          hidden={templateSelected !== "vs"}
          className="w-100"
        />
      </div>
      <div className={styles.templateSliderBtn}>
        <Button
          className={cx("border-0", "bg-transparent", "p-0", "shadow-none")}
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
              width={68}
              height={68}
            />
          </div>
        </Button>
        <Button
          className={cx("border-0", "bg-transparent", "p-0", "shadow-none")}
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
              width={68}
              height={68}
            />
          </div>
        </Button>
        <Button
          className={cx("border-0", "bg-transparent", "p-0", "shadow-none")}
          onClick={onSelectTemplate("vs")}
          type="button"
          role="button"
        >
          <div className="position-relative">
            {templateSelected === "vs" && progressBar}
            <img
              src={templateSelected === "vs" ? btnVSSelected : btnVS}
              alt="Button Julia"
              loading="lazy"
              width={68}
              height={68}
            />
          </div>
        </Button>
      </div>
    </div>
  );
}

interface State {
  templateSelected: "python" | "rStudio" | "vs";
  lastSelection: DateTime | null;
}

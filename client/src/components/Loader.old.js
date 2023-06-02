/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

/**
 *  renku-ui
 *
 *  Loader.js
 *  Loader code and presentation.
 */

import React, { useEffect, useRef } from "react";

function LoaderSpinner(props) {
  const size = props.size || 120;
  const d = `${size}px`;
  // Inspired from https://www.w3schools.com/howto/howto_css_loader.asp
  const border = `${size / 10}px solid #f3f3f3`;
  const borderTop = `${size / 10}px solid #01192D`; // Use Renku Blue
  const borderRight = borderTop; // Added a borderRight to make a half-circle
  const borderRadius = "50%";
  const animation = "spin 2s linear infinite";
  const left = props.inline ? "" : "40%",
    right = left;
  const display = props.inline ? "inline-block" : "";
  const verticalAlign = props.inline ? "middle" : "";
  const margin = `m-${props.margin ? props.margin : 0}`;

  const ref = useRef(null);

  useEffect(() => {
    // const existingSpinner = document.querySelector(".rk-spinner");
    // if (existingSpinner === ref.current) {
    //   console.log("base is ref");
    // }
    // if (!existingSpinner || existingSpinner === ref.current) {
    //   return;
    // }
    // console.log({ existingSpinner, ref: ref.current });
    // const currentAnimation = ref.current.getAnimations().find(() => true);
    // const baseAnimation = existingSpinner.getAnimations().find(() => true);
    // if (currentAnimation == null || baseAnimation == null) {
    //   return;
    // }
    // console.log([currentAnimation.startTime, baseAnimation.startTime]);
    // currentAnimation.startTime = baseAnimation.startTime;

    const existingSpinners = [...document.querySelectorAll(".rk-spinner")];
    const baseSpinner = existingSpinners.find(
      (spinner) => spinner !== ref.current
    );
    console.log({ baseSpinner });
    if (!baseSpinner) {
      return;
    }
    const currentAnimation = ref.current.getAnimations().find(() => true);
    const baseAnimation = baseSpinner.getAnimations().find(() => true);
    console.log([
      !!currentAnimation,
      currentAnimation.startTime,
      !!baseAnimation,
      baseAnimation.startTime,
    ]);
    if (
      currentAnimation == null ||
      // currentAnimation.startTime == null ||
      baseAnimation == null ||
      baseAnimation.startTime == null
    ) {
      return;
    }
    currentAnimation.startTime = baseAnimation.startTime;
    // console.log({ baseSpinner });
  }, []);

  return (
    <div
      ref={ref}
      className={`rk-spinner ${margin} ${props.className}`}
      style={{
        width: d,
        height: d,
        border,
        borderTop,
        borderRight,
        borderRadius,
        animation,
        left,
        right,
        display,
        verticalAlign,
        position: "relative",
      }}
    ></div>
  );
}

function LoaderBouncer(props) {
  return (
    <div className={`bouncer ${props.className}`}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}

function Loader(props) {
  const size = props.size || 120;
  const inline = props.inline;
  return inline || size < 100 ? LoaderSpinner(props) : LoaderBouncer(props);
}

export { Loader };

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
import React from "react";

/**
 *  renku-ui
 *
 *  Loader.js
 *  Loader code and presentation.
 */

function LoaderSpinner(props) {
  const size = props.size || 120;
  const d = `${size}px`;
  // Inspired from https://www.w3schools.com/howto/howto_css_loader.asp
  const border = `${size / 10}px solid #f3f3f3`;
  const borderTop = `${size / 10}px solid #01192D`; // Use Renku Blue
  const borderRight = borderTop; // Added a borderRight to make a half-circle
  const borderRadius = "50%";
  const animation = "spin 2s linear infinite";
  const left = props.inline ? "" : "40%", right = left;
  const display = props.inline ? "inline-block" : "";
  const verticalAlign = props.inline ? "middle" : "";
  const margin = `m-${props.margin ? props.margin : 0}`;
  return <div
    className={`${margin} ${props.className}`}
    style = {{
      width: d, height: d,
      border, borderTop, borderRight, borderRadius, animation, left, right, display, verticalAlign,
      position: "relative" }}>
  </div>;
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
  return (inline || size < 100) ? LoaderSpinner(props) : LoaderBouncer(props);
}

export { Loader };

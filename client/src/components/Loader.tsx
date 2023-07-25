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

import React, { useEffect, useRef } from "react";
import cx from "classnames";
import styles from "./Loader.module.scss";

interface LoaderProps {
  className?: string;
  // color?: string;
  inline?: boolean;
  // margin?: 0 | 1 | 2 | 3 | 4 | 5 | "auto";
  size?: number;
}

export const Loader = ({ inline, size = 120, ...rest }: LoaderProps) => {
  return inline || size < 100 ? (
    <LoaderSpinnerV2 inline={inline} size={size} {...rest} />
  ) : (
    <LoaderBouncer {...rest} />
  );
};

function LoaderSpinnerV2({
  className,
  // color = "#01192D", // Renku blue
  inline,
  // margin,
  size,
}: LoaderSpinnerProps) {
  const borderSize = size / 8;

  const ref = useRef<HTMLDivElement>(null);

  // Synchronizes all spinners
  useEffect(() => {
    const existingSpinners = [
      ...document.querySelectorAll(`.${styles.spinner}`),
    ];
    const baseSpinner = existingSpinners.find(
      (spinner) =>
        spinner !== ref.current &&
        spinner.getAnimations?.().at(0)?.startTime != null
    );
    if (!baseSpinner) {
      return;
    }
    const currentAnimation = ref?.current?.getAnimations?.().at(0);
    const baseAnimation = baseSpinner.getAnimations?.().at(0);
    if (
      currentAnimation == null ||
      baseAnimation == null ||
      baseAnimation.startTime == null
    ) {
      return;
    }
    currentAnimation.startTime = baseAnimation.startTime;
  }, []);

  return (
    <div
      className={className}
      style={{
        display: "inline-block",
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: `${size}px`,
            height: `${size}px`,
            borderColor: "currentcolor",
            borderWidth: `${borderSize}px`,
            borderStyle: "solid",
            borderRadius: "50%",
            opacity: 0.25,
          }}
        ></div>
        <div
          className={styles.spinner}
          ref={ref}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: `${size}px`,
            height: `${size}px`,
            borderColor: "transparent",
            borderTopColor: "currentcolor",
            borderWidth: `${borderSize}px`,
            borderStyle: "solid",
            borderRadius: "50%",
            opacity: 1,
          }}
        ></div>
      </div>
    </div>
  );
}

type LoaderSpinnerProps = LoaderProps & Required<Pick<LoaderProps, "size">>;

export const LoaderSpinner = ({
  className,
  color = "#01192D", // Renku blue
  inline,
  margin,
  size,
}: LoaderSpinnerProps & {
  color?: string;
  margin?: 0 | 1 | 2 | 3 | 4 | 5 | "auto";
}) => {
  const d = `${size}px`;
  // Inspired from https://www.w3schools.com/howto/howto_css_loader.asp
  const border = `${size / 10}px solid transparent`;
  const borderTop = `${size / 10}px solid ${color}`;
  const borderRight = borderTop; // Added a borderRight to make a half-circle
  const borderRadius = "50%";
  const animation = "spin 2s linear infinite";
  const left = inline ? "" : "40%";
  const right = left;
  const display = inline ? "inline-block" : "";
  const verticalAlign = inline ? "middle" : "";
  const marginClassName = margin ? `m-${margin}` : `m-0`;

  const ref = useRef<HTMLDivElement>(null);

  // Synchronizes all spinners
  useEffect(() => {
    const existingSpinners = [...document.querySelectorAll(".rk-spinner")];
    const baseSpinner = existingSpinners.find(
      (spinner) =>
        spinner !== ref.current &&
        spinner.getAnimations?.().at(0)?.startTime != null
    );
    if (!baseSpinner) {
      return;
    }
    const currentAnimation = ref?.current?.getAnimations?.().at(0);
    const baseAnimation = baseSpinner.getAnimations?.().at(0);
    if (
      currentAnimation == null ||
      baseAnimation == null ||
      baseAnimation.startTime == null
    ) {
      return;
    }
    currentAnimation.startTime = baseAnimation.startTime;
  }, []);

  return (
    <div
      ref={ref}
      className={cx("rk-spinner", marginClassName, className)}
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
};

const LoaderBouncer = ({ className }: LoaderProps) => {
  return (
    <div className={cx("bouncer", className)}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};

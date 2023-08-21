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

import { useEffect, useRef } from "react";
import cx from "classnames";
import styles from "./Loader.module.scss";

interface LoaderProps {
  className?: string;
  inline?: boolean;
  size?: number;
}

export const Loader = ({ inline, size = 120, ...rest }: LoaderProps) => {
  return inline || size < 100 ? (
    <LoaderSpinner inline={inline} size={size} {...rest} />
  ) : (
    <LoaderBouncer {...rest} />
  );
};

type LoaderSpinnerProps = LoaderProps & Required<Pick<LoaderProps, "size">>;

function LoaderSpinner({ className, inline, size }: LoaderSpinnerProps) {
  const Tag = inline ? "span" : "div";
  const borderSize = size / 8;
  const style = {
    width: `${size}px`,
    height: `${size}px`,
  };
  // This makes the spinner fit nicely with text of the same size when `inline=true`
  const containerStyle = {
    ...style,
    ...(inline ? { verticalAlign: `-${borderSize}px` } : {}),
  };
  const trackStyle = {
    ...style,
    // eslint-disable-next-line spellcheck/spell-checker
    borderColor: "currentcolor",
    borderWidth: `${borderSize}px`,
    borderStyle: "solid",
    borderRadius: "50%",
  };
  const spinnerStyle = {
    ...trackStyle,
    borderColor: "transparent",
    // eslint-disable-next-line spellcheck/spell-checker
    borderTopColor: "currentcolor",
  };

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
    <Tag
      className={cx(className, inline && "d-inline-block")}
      style={containerStyle}
    >
      <Tag
        className={cx("position-relative", inline && "d-inline-block")}
        style={style}
      >
        <Tag
          className={cx(
            "position-absolute",
            "top-0",
            "start-0",
            "opacity-25",
            inline && "d-inline-block"
          )}
          style={trackStyle}
        ></Tag>
        <Tag
          className={cx(
            styles.spinner,
            "position-absolute",
            "top-0",
            "start-0",
            "opacity-100",
            inline && "d-inline-block"
          )}
          ref={ref}
          style={spinnerStyle}
        ></Tag>
      </Tag>
    </Tag>
  );
}

function LoaderBouncer({ className }: LoaderProps) {
  return (
    <div className={cx("bouncer", className)}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}

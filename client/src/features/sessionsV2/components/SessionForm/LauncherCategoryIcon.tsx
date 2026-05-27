/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import { SvgIconProps } from "~/features/sessionsV2/sessionsV2.types.ts";

function JobIconSvg({ className, style }: SvgIconProps) {
  return (
    <svg
      aria-hidden
      className={className}
      focusable={false}
      role="img"
      width="125"
      height="109"
      fill="currentColor"
      viewBox="0 0 125 109"
      style={style}
    >
      <g clipPath="url(#clip0_543_978)">
        <path
          d="M91.78 45.48C91.78 61.98 78.4 75.36 61.9 75.36C45.4 75.36 32.02 61.98 32.02 45.48C32.02 28.98 45.4 15.6 61.9 15.6C78.4 15.6 91.78 28.98 91.78 45.48Z"
          fill="none"
        />
        <path
          d="M61.9 77.74C44.11 77.74 29.64 63.27 29.64 45.48C29.64 27.69 44.11 13.22 61.9 13.22C79.69 13.22 94.16 27.69 94.16 45.48C94.16 63.27 79.69 77.74 61.9 77.74ZM61.9 17.98C46.73 17.98 34.4 30.32 34.4 45.48C34.4 60.64 46.74 72.98 61.9 72.98C77.06 72.98 89.4 60.64 89.4 45.48C89.4 30.32 77.06 17.98 61.9 17.98Z"
          fill="currentColor"
        />
        <path
          d="M54.43 39V54.82C54.43 55.85 55.27 56.69 56.3 56.69C56.69 56.69 57.07 56.57 57.38 56.34L70.45 47C71.29 46.4 71.48 45.23 70.89 44.4C70.77 44.23 70.62 44.08 70.45 43.96L57.38 34.62C56.54 34.02 55.37 34.22 54.78 35.06C54.56 35.38 54.43 35.75 54.43 36.14V38.99"
          fill="currentColor"
        />
        <path
          d="M111.7 90.96H12.1C8.61 90.96 5.78 88.13 5.78 84.64V6.32C5.78 2.84 8.61 0 12.1 0H111.71C115.2 0 118.03 2.84 118.03 6.32V84.64C118.03 88.12 115.2 90.96 111.71 90.96H111.7ZM12.1 5C11.37 5 10.78 5.59 10.78 6.32V84.64C10.78 85.37 11.37 85.96 12.1 85.96H111.71C112.44 85.96 113.03 85.37 113.03 84.64V6.32C113.03 5.59 112.44 5 111.71 5H12.1Z"
          fill="currentColor"
        />
        <path
          d="M0 96.39H124.19C124.19 102.82 118.98 108.03 112.55 108.03H11.64C5.21 108.03 0 102.82 0 96.39Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_543_978">
          <rect width="124.19" height="108.03" fill="none" />
        </clipPath>
      </defs>
    </svg>
  );
}

function SessionIconSvg({ className, style }: SvgIconProps) {
  return (
    <svg
      aria-hidden
      className={className}
      focusable={false}
      role="img"
      width="125"
      height="109"
      fill="currentColor"
      viewBox="0 0 125 109"
      style={style}
    >
      <g clipPath="url(#clip0_543_978)">
        <path
          d="M91.78 45.48C91.78 61.98 78.4 75.36 61.9 75.36C45.4 75.36 32.02 61.98 32.02 45.48C32.02 28.98 45.4 15.6 61.9 15.6C78.4 15.6 91.78 28.98 91.78 45.48Z"
          fill="none"
        />
        <path
          d="M61.9 77.74C44.11 77.74 29.64 63.27 29.64 45.48C29.64 27.69 44.11 13.22 61.9 13.22C79.69 13.22 94.16 27.69 94.16 45.48C94.16 63.27 79.69 77.74 61.9 77.74ZM61.9 17.98C46.73 17.98 34.4 30.32 34.4 45.48C34.4 60.64 46.74 72.98 61.9 72.98C77.06 72.98 89.4 60.64 89.4 45.48C89.4 30.32 77.06 17.98 61.9 17.98Z"
          fill="currentColor"
        />
        <path
          d="M54.43 39V54.82C54.43 55.85 55.27 56.69 56.3 56.69C56.69 56.69 57.07 56.57 57.38 56.34L70.45 47C71.29 46.4 71.48 45.23 70.89 44.4C70.77 44.23 70.62 44.08 70.45 43.96L57.38 34.62C56.54 34.02 55.37 34.22 54.78 35.06C54.56 35.38 54.43 35.75 54.43 36.14V38.99"
          fill="currentColor"
        />
        <path
          d="M111.7 90.96H12.1C8.61 90.96 5.78 88.13 5.78 84.64V6.32C5.78 2.84 8.61 0 12.1 0H111.71C115.2 0 118.03 2.84 118.03 6.32V84.64C118.03 88.12 115.2 90.96 111.71 90.96H111.7ZM12.1 5C11.37 5 10.78 5.59 10.78 6.32V84.64C10.78 85.37 11.37 85.96 12.1 85.96H111.71C112.44 85.96 113.03 85.37 113.03 84.64V6.32C113.03 5.59 112.44 5 111.71 5H12.1Z"
          fill="currentColor"
        />
        <path
          d="M0 96.39H124.19C124.19 102.82 118.98 108.03 112.55 108.03H11.64C5.21 108.03 0 102.82 0 96.39Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_543_978">
          <rect width="124.19" height="108.03" fill="none" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function LauncherCategoryIcon({
  size = 112,
  className,
  type,
}: {
  size?: number;
  className?: string;
  type: "session" | "job";
}) {
  const iconMap = {
    session: SessionIconSvg,
    job: JobIconSvg,
  };

  const Icon = iconMap[type];

  return (
    <Icon
      className={cx("bi", className)}
      style={{ width: size, height: size }}
    />
  );
}

/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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
import { CSSProperties } from "react";

import { SessionLauncher } from "../../api/sessionLaunchersV2.generated-api";

export function LauncherEnvironmentIcon({
  launcher,
  className,
}: {
  launcher: SessionLauncher;
  className?: string;
}) {
  const currentEnvironment = launcher.environment;
  return currentEnvironment?.environment_kind === "GLOBAL" ? (
    <EnvironmentIcon type="global" size={16} className={className ?? "me-2"} />
  ) : currentEnvironment?.environment_image_source === "build" ? (
    <EnvironmentIcon
      type="codeBased"
      size={16}
      className={className ?? "me-2"}
    />
  ) : currentEnvironment?.environment_kind === "CUSTOM" ? (
    <EnvironmentIcon type="custom" size={16} className={className ?? "me-2"} />
  ) : null;
}

interface SvgIconProps {
  className?: string;
  style?: CSSProperties;
}

function CustomIconSvg({ className, style }: SvgIconProps) {
  return (
    <svg
      aria-hidden
      className={className}
      focusable={false}
      role="img"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
      style={style}
    >
      <g>
        <path
          d="M2.95 0.4C3.14 0.15 3.44 0 3.75 0H12.25C12.56 0 12.86 0.15 13.05 0.4L15.9 3.2C15.96 3.29 16 3.39 16 3.5V15C16 15.55 15.55 16 15 16H1C0.45 16 0 15.55 0 15V3.5C0 3.39 0.04 3.29 0.1 3.2L2.95 0.4ZM7.5 1H3.75L1.5 3H7.5V1ZM8.5 1V3H14.5L12.25 1H8.5ZM15 4H1V15H15V4Z"
          fill="currentColor"
        />
        <path
          d="M5.15991 8.81992L3.97991 9.99992C2.96991 11.0099 2.96991 12.6499 3.97991 13.6599C4.98991 14.6699 6.62991 14.6699 7.63991 13.6599L9.21991 12.0799C10.2299 11.0699 10.2299 9.42992 9.21991 8.41992C9.00991 8.20992 8.76991 8.03992 8.50991 7.91992L7.99991 8.42992C7.94991 8.47992 7.89991 8.53992 7.86991 8.59992C8.78991 8.85992 9.30991 9.81992 9.04991 10.7299C8.96991 11.0099 8.81991 11.2699 8.60991 11.4699L7.02991 13.0499C6.35991 13.7199 5.25991 13.7199 4.58991 13.0499C3.91991 12.3799 3.91991 11.2799 4.58991 10.6099L5.26991 9.92992C5.16991 9.56992 5.13991 9.18992 5.15991 8.81992Z"
          fill="currentColor"
        />
        <path
          d="M6.76995 7.21006C5.75995 8.22006 5.75995 9.86006 6.76995 10.8701C6.97995 11.0801 7.21995 11.2501 7.47995 11.3701L8.14995 10.7001C7.22995 10.4501 6.67995 9.51006 6.92995 8.59006C7.00995 8.30006 7.15995 8.03006 7.37995 7.82006L8.95995 6.24006C9.62995 5.57006 10.73 5.57006 11.4 6.24006C12.07 6.91006 12.07 8.01006 11.4 8.68006L10.72 9.36006C10.82 9.72006 10.85 10.1001 10.83 10.4701L12.01 9.29006C13.02 8.28006 13.02 6.64006 12.01 5.63006C11 4.62006 9.35995 4.62006 8.34995 5.63006L6.76995 7.21006Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_53_278">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function GlobalIconSvg({ className, style }: SvgIconProps) {
  return (
    <svg
      aria-hidden
      className={className}
      focusable={false}
      role="img"
      width="20"
      height="20"
      fill="currentColor"
      viewBox="0 0 16 16"
      style={style}
    >
      <g>
        <path
          d="M2.95 0.4C3.14 0.15 3.44 0 3.75 0H12.25C12.56 0 12.86 0.15 13.05 0.4L15.9 3.2C15.96 3.29 16 3.39 16 3.5V15C16 15.55 15.55 16 15 16H1C0.45 16 0 15.55 0 15V3.5C0 3.39 0.04 3.29 0.1 3.2L2.95 0.4ZM7.5 1H3.75L1.5 3H7.5V1ZM8.5 1V3H14.5L12.25 1H8.5ZM15 4H1V15H15V4Z"
          fill="currentColor"
        />
        <path
          d="M3.15991 9.52996C3.15991 6.86996 5.31991 4.70996 7.97991 4.70996C10.6399 4.70996 12.7999 6.86996 12.7999 9.52996C12.7999 12.19 10.6399 14.35 7.97991 14.35C5.31991 14.35 3.15991 12.19 3.15991 9.52996ZM7.67991 5.34996C7.27991 5.46996 6.87991 5.83996 6.53991 6.46996C6.42991 6.67996 6.33991 6.88996 6.25991 7.10996H7.67991V5.34996ZM5.61991 7.10996C5.71991 6.78996 5.84991 6.47996 6.00991 6.17996C6.10991 5.97996 6.23991 5.79996 6.36991 5.61996C5.61991 5.92996 4.97991 6.44996 4.51991 7.10996H5.62991H5.61991ZM5.26991 9.21996C5.28991 8.68996 5.34991 8.17996 5.45991 7.70996H4.16991C3.94991 8.17996 3.80991 8.68996 3.76991 9.21996H5.26991ZM6.07991 7.71996C5.95991 8.20996 5.88991 8.71996 5.87991 9.22996H7.67991V7.71996H6.07991ZM8.27991 7.71996V9.22996H10.0799C10.0599 8.71996 9.99991 8.21996 9.87991 7.71996H8.27991ZM5.87991 9.82996C5.89991 10.34 5.95991 10.84 6.07991 11.34H7.67991V9.82996H5.87991ZM8.27991 9.82996V11.34H9.87991C9.98991 10.88 10.0599 10.37 10.0799 9.82996H8.27991ZM6.25991 11.94C6.33991 12.17 6.43991 12.39 6.53991 12.58C6.86991 13.2 7.26991 13.57 7.67991 13.7V11.94H6.25991ZM6.36991 13.43C6.23991 13.25 6.10991 13.06 6.00991 12.87C5.84991 12.57 5.71991 12.26 5.61991 11.94H4.50991C4.96991 12.6 5.60991 13.12 6.35991 13.43M5.45991 11.34C5.34991 10.84 5.28991 10.34 5.26991 9.82996H3.76991C3.80991 10.37 3.94991 10.87 4.16991 11.34H5.45991ZM9.58991 13.43C10.3399 13.12 10.9799 12.6 11.4399 11.94H10.3299C10.2299 12.26 10.0999 12.57 9.93991 12.87C9.83991 13.07 9.70991 13.25 9.57991 13.43M8.27991 11.94V13.7C8.67991 13.58 9.07991 13.21 9.41991 12.58C9.51991 12.38 9.61991 12.17 9.69991 11.94H8.27991ZM10.4999 11.34H11.7899C12.0099 10.88 12.1499 10.37 12.1899 9.82996H10.6899C10.6699 10.34 10.6099 10.84 10.4999 11.34ZM12.1899 9.21996C12.1499 8.69996 12.0199 8.18996 11.7899 7.70996H10.4999C10.5999 8.17996 10.6699 8.68996 10.6899 9.21996H12.1899ZM9.94991 6.18996C10.0999 6.46996 10.2299 6.77996 10.3399 7.11996H11.4499C10.9899 6.45996 10.3499 5.93996 9.59991 5.62996C9.72991 5.79996 9.84991 5.98996 9.95991 6.18996M9.69991 7.10996C9.61991 6.88996 9.52991 6.66996 9.41991 6.46996C9.08991 5.84996 8.68991 5.47996 8.27991 5.34996V7.10996H9.69991Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_53_274">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function CodeBasedIconSvg({ className, style }: SvgIconProps) {
  return (
    <svg
      aria-hidden
      className={className}
      focusable={false}
      role="img"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
      style={style}
    >
      <g>
        <path
          d="M2.95 0.4C3.14 0.15 3.44 0 3.75 0H12.25C12.56 0 12.86 0.15 13.05 0.4L15.9 3.2C15.96 3.29 16 3.39 16 3.5V15C16 15.55 15.55 16 15 16H1C0.45 16 0 15.55 0 15V3.5C0 3.39 0.04 3.29 0.1 3.2L2.95 0.4ZM7.5 1H3.75L1.5 3H7.5V1ZM8.5 1V3H14.5L12.25 1H8.5ZM15 4H1V15H15V4Z"
          fill="currentColor"
        />
        <path
          d="M6.09994 6.76006C6.26994 6.59006 6.26994 6.31006 6.09994 6.13006C5.92994 5.95006 5.64994 5.96006 5.46994 6.13006L2.37994 9.22006C2.20994 9.39006 2.20994 9.67006 2.37994 9.85006L5.46994 12.9401C5.63994 13.1101 5.91994 13.1101 6.09994 12.9401C6.27994 12.7701 6.26994 12.4901 6.09994 12.3101L3.31994 9.53006L6.09994 6.75006V6.76006ZM9.89994 6.76006C9.72994 6.59006 9.72994 6.31006 9.89994 6.13006C10.0699 5.95006 10.3499 5.96006 10.5299 6.13006L13.6199 9.22006C13.7899 9.39006 13.7899 9.67006 13.6199 9.85006L10.5299 12.9401C10.3599 13.1101 10.0799 13.1101 9.89994 12.9401C9.71994 12.7701 9.72994 12.4901 9.89994 12.3101L12.6799 9.53006L9.89994 6.75006V6.76006Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_53_270">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function EnvironmentIconSvg({ className, style }: SvgIconProps) {
  return (
    <svg
      aria-hidden
      className={className}
      focusable={false}
      role="img"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
      style={style}
    >
      <g>
        <path
          d="M2.95 0.4C3.14 0.15 3.44 0 3.75 0H12.25C12.56 0 12.86 0.15 13.05 0.4L15.9 3.2C15.96 3.29 16 3.39 16 3.5V15C16 15.55 15.55 16 15 16H1C0.45 16 0 15.55 0 15V3.5C0 3.39 0.04 3.29 0.1 3.2L2.95 0.4ZM7.5 1H3.75L1.5 3H7.5V1ZM8.5 1V3H14.5L12.25 1H8.5ZM15 4H1V15H15V4Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_53_267">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function EnvironmentIcon({
  size = 16,
  className,
  type,
}: {
  size?: number;
  className?: string;
  type: "custom" | "codeBased" | "global" | "default";
}) {
  const iconMap = {
    custom: CustomIconSvg,
    codeBased: CodeBasedIconSvg,
    global: GlobalIconSvg,
    default: EnvironmentIconSvg,
  };

  const Icon = iconMap[type];

  return (
    <Icon
      className={cx("bi", className)}
      style={{ width: size, height: size }}
    />
  );
}

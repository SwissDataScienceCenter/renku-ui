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

interface SessionPausedIconProps {
  className?: string;
  size: number;
}

export default function SessionPausedIcon({
  className,
  size,
}: SessionPausedIconProps) {
  return (
    <svg
      aria-hidden
      className={className}
      focusable={false}
      role="img"
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0.5"
        y="0.5"
        width="19"
        height="19"
        rx="3.5"
        fill="none"
        stroke="currentColor"
      />
      <rect
        x="4"
        y="3.5"
        width="4.2"
        height="13.5"
        rx="1"
        fill="currentColor"
      />
      <rect
        x="12"
        y="3.5"
        width="4.2"
        height="13.5"
        rx="1"
        fill="currentColor"
      />
    </svg>
  );
}

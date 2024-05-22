/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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

interface AlertIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export function WarningIcon({ className, width, height }: AlertIconProps) {
  return (
    <svg
      aria-hidden
      className={className}
      focusable={false}
      role="img"
      width={width || "75"}
      height={height || "58"}
      viewBox={`0 0 75 58`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        id="Group_13189"
        data-name="Group 13189"
        transform="translate(-512.82 -503.733)"
      >
        <path
          id="Path_16307"
          data-name="Path 16307"
          d="M577.64,553l-26.664-46.183a6.158,6.158,0,0,0-10.666,0L513.646,553a6.159,6.159,0,0,0,5.333,9.237h53.328A6.159,6.159,0,0,0,577.64,553ZM545.681,555.4a4.491,4.491,0,1,1,4.492-4.491A4.491,4.491,0,0,1,545.681,555.4Zm2.371-11.891h-4.87l-2.394-24.6h10.143Z"
          fill="currentColor"
        />
        <circle
          id="Ellipse_13332"
          data-name="Ellipse 13332"
          cx="4.492"
          cy="4.492"
          r="4.492"
          transform="translate(541.19 546.419)"
          fill="#fff"
        />
        <path
          id="Path_16308"
          data-name="Path 16308"
          d="M565.507,555.628h4.87l2.88-24.6H563.113Z"
          transform="translate(-22.325 -12.118)"
          fill="#fff"
        />
      </g>
    </svg>
  );
}

export function DangerIcon({ className, width, height }: AlertIconProps) {
  return (
    <svg
      aria-hidden
      className={className}
      focusable={false}
      role="img"
      width={width || "75"}
      height={height || "58"}
      viewBox={`0 0 75 58`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        id="Group_13125"
        data-name="Group 13125"
        transform="translate(-926.669 -503.733)"
      >
        <path
          id="Path_16252"
          data-name="Path 16252"
          d="M932.828,562.233A6.159,6.159,0,0,1,927.495,553l26.664-46.183a6.158,6.158,0,0,1,10.666,0L991.488,553a6.159,6.159,0,0,1-5.333,9.237Z"
          transform="translate(0 0)"
          fill="currentColor"
        />
        <circle
          id="Ellipse_13327"
          data-name="Ellipse 13327"
          cx="4.492"
          cy="4.492"
          r="4.492"
          transform="translate(955.038 546.419)"
          fill="#f5f5f5"
        />
        <path
          id="Path_16253"
          data-name="Path 16253"
          d="M984.225,555.628h-4.87l-2.394-24.6H987.1Z"
          transform="translate(-22.324 -12.118)"
          fill="#f5f5f5"
        />
      </g>
    </svg>
  );
}

export function SuccessIcon({ className, width, height }: AlertIconProps) {
  return (
    <svg
      aria-hidden
      className={className}
      focusable={false}
      role="img"
      width={width || "59"}
      height={height || "59"}
      viewBox={`0 0 59 59`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        id="Group_13204"
        data-name="Group 13204"
        transform="translate(-777.389 -217.218)"
      >
        <path
          id="Path_16327"
          data-name="Path 16327"
          d="M832.286,246.968l4.6-7.971-7.971-4.6v-9.2h-9.2l-4.6-7.971-7.971,4.6-7.971-4.6-4.6,7.971h-9.2v9.2l-7.971,4.6,4.6,7.971-4.6,7.971,7.971,4.6v9.2h9.2l4.6,7.971,7.971-4.6,7.971,4.6,4.6-7.971h9.2v-9.2l7.971-4.6Z"
          transform="translate(0)"
          fill="currentColor"
        />
        <path
          id="Path_16328"
          data-name="Path 16328"
          d="M817.767,274.616l-13.72-7.921,2.48-4.295,9.425,5.441,14.138-24.488,4.295,2.48Z"
          transform="translate(-12.847 -12.595)"
          fill="#f5f5f5"
        />
      </g>
    </svg>
  );
}

export function InfoIcon({ className, width, height }: AlertIconProps) {
  return (
    <svg
      aria-hidden
      className={className}
      focusable={false}
      role="img"
      width={width || "60"}
      height={height || "58"}
      viewBox={`0 0 60 58`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        id="Group_13199"
        data-name="Group 13199"
        transform="translate(-659.255 -56.144)"
      >
        <circle
          id="Ellipse_13333"
          data-name="Ellipse 13333"
          cx="29.25"
          cy="29.25"
          r="29.25"
          transform="translate(659.255 56.144)"
          fill="currentColor"
        />
        <circle
          id="Ellipse_13334"
          data-name="Ellipse 13334"
          cx="4.492"
          cy="4.492"
          r="4.492"
          transform="translate(684.013 64.507)"
          fill="#f5f5f5"
        />
        <rect
          id="Rectangle_495"
          data-name="Rectangle 495"
          width="6.305"
          height="27.852"
          transform="translate(685.353 78.981)"
          fill="#f5f5f5"
        />
      </g>
    </svg>
  );
}

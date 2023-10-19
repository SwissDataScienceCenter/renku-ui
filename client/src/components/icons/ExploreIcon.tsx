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

interface ExploreIconProps {
  className?: string;
  size: number;
}

export default function ExploreIcon({ className, size }: ExploreIconProps) {
  return (
    <svg
      aria-hidden
      className={className}
      focusable={false}
      role="img"
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 17 19"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_495_1853)">
        <path
          d="M13.1227 2.61237C10.2593 -0.203146 5.61401 -0.203146 2.75059 2.61237C-0.112827 5.42788 -0.112827 9.99549 2.75059 12.811C5.61401 15.6265 10.2593 15.6265 13.1227 12.811C15.9862 9.99549 15.9862 5.42788 13.1227 2.61237ZM3.36188 12.2124C0.835046 9.72781 0.835046 5.69799 3.36188 3.21343C5.88872 0.728869 9.9871 0.728869 12.5139 3.21343C15.0408 5.69799 15.0408 9.72781 12.5139 12.2124C9.9871 14.6969 5.88872 14.6969 3.36188 12.2124V12.2124Z"
          fill="currentColor"
        />
        <path
          d="M13.1227 2.61237C10.2593 -0.203146 5.61401 -0.203146 2.75059 2.61237C-0.112827 5.42788 -0.112827 9.99549 2.75059 12.811C5.61401 15.6265 10.2593 15.6265 13.1227 12.811C15.9862 9.99549 15.9862 5.42788 13.1227 2.61237ZM3.35198 12.2221C0.820197 9.73267 0.820197 5.69313 3.35198 3.2037C5.88377 0.714268 9.99204 0.714268 12.5238 3.2037C15.0556 5.69313 15.0556 9.73267 12.5238 12.2221C9.99204 14.7115 5.88377 14.7115 3.35198 12.2221Z"
          fill="currentColor"
        />
        <path
          d="M12.4321 12.3461C12.6251 12.1563 12.989 12.2001 13.2389 12.4459L16.382 15.5364C16.632 15.7821 16.6765 16.1399 16.4835 16.3297L16.4315 16.3808C16.2385 16.5706 15.8746 16.5268 15.6247 16.281L12.4816 13.1905C12.2316 12.9447 12.1871 12.587 12.3801 12.3972L12.4321 12.3461V12.3461Z"
          fill="currentColor"
        />
        <path
          d="M12.4321 12.3461C12.6251 12.1563 12.989 12.2001 13.2389 12.4459L16.382 15.5364C16.632 15.7821 16.6765 16.1399 16.4835 16.3297L16.4315 16.3808C16.2385 16.5706 15.8746 16.5268 15.6247 16.281L12.4816 13.1905C12.2316 12.9447 12.1871 12.587 12.3801 12.3972L12.4321 12.3461V12.3461Z"
          fill="currentColor"
        />
        <path
          d="M1.92383 7.81255C1.92383 7.81255 7.93775 0.998859 13.9492 7.81255C13.9492 7.81255 8.56142 14.0592 1.92383 7.81255Z"
          fill="currentColor"
        />
        <path
          d="M8.03178 9.31399C8.93116 9.31399 9.66024 8.5971 9.66024 7.71277C9.66024 6.82845 8.93116 6.11156 8.03178 6.11156C7.13241 6.11156 6.40332 6.82845 6.40332 7.71277C6.40332 8.5971 7.13241 9.31399 8.03178 9.31399Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_495_1853">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(0.602295 0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

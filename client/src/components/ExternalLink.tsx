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
import { AnchorHTMLAttributes, ReactNode } from "react";
import { BoxArrowUpRight } from "react-bootstrap-icons";

const DEFAULT_EXTERNAL_LINK_ICON = (
  <BoxArrowUpRight className={cx("bi", "ms-1")} />
);
const DEFAULT_EXTERNAL_LINK_REL = "noreferrer noopener";
const DEFAULT_EXTERNAL_LINK_TARGET = "_blank";

// Note: we want to make the "href" attribute required
type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  Required<Pick<AnchorHTMLAttributes<HTMLAnchorElement>, "href">>;

interface ExternalLinkProps extends AnchorProps {
  icon?: ReactNode;
}

/**
 * Usage:
 *
 * Simple external link:
 * ```tsx
 * <ExternalLink href={href}>link text</ExternalLink>
 * ```
 *
 * Without the icon:
 * ```tsx
 * <ExternalLink icon={null} href={href}>link text</ExternalLink>
 * ```
 *
 * With additional props:
 * ```tsx
 * <ExternalLink className="text-danger" data-cy="my-link" href={href}>link text</ExternalLink>
 * ```
 */
export default function ExternalLink({
  icon: icon_,
  rel: rel_,
  target: target_,
  children,
  ...props
}: ExternalLinkProps) {
  const icon = icon_ === undefined ? DEFAULT_EXTERNAL_LINK_ICON : icon_;
  const rel =
    rel_ === undefined
      ? DEFAULT_EXTERNAL_LINK_REL
      : rel_ === ""
      ? undefined
      : rel_;
  const target =
    target_ === undefined
      ? DEFAULT_EXTERNAL_LINK_TARGET
      : target_ === ""
      ? undefined
      : target_;
  return (
    <a rel={rel} target={target} {...props}>
      {children}
      {icon}
    </a>
  );
}

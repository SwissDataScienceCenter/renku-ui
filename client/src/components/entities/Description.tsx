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

import { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import cx from "classnames";

import { RenkuMarkdown } from "../markdown/RenkuMarkdown";

export interface EntityDescriptionProps {
  className?: string;
  description: string | ReactNode;
  hasDevAccess?: boolean;
  isHeightFixed: boolean;
  loading?: boolean | undefined;
  numberLines?: number;
  showSuggestion: boolean;
  unavailable?: string;
  urlChangeDescription?: string;
}

export default function EntityDescription({
  className,
  description,
  hasDevAccess,
  isHeightFixed = true,
  loading = false,
  numberLines = 3,
  showSuggestion,
  unavailable,
  urlChangeDescription,
}: EntityDescriptionProps) {
  const content =
    description && typeof description === "string" ? (
      <>
        <RenkuMarkdown
          markdownText={description}
          singleLine={numberLines === 1}
        />
        <span className="ms-1">
          {description.includes("\n") ? " [...]" : ""}
        </span>
      </>
    ) : description ? (
      <span>{description}</span>
    ) : loading ? (
      <small className="card-text text-rk-text-light">
        <i>Loading description...</i>
      </small>
    ) : unavailable ? (
      <small className="card-text text-rk-text-light">
        <i>(Description unavailable: {unavailable})</i>
      </small>
    ) : showSuggestion && hasDevAccess && urlChangeDescription ? (
      <i>
        (This project has no description. You can provide one{" "}
        <Link to={urlChangeDescription}>here</Link>.)
      </i>
    ) : null;

  return (
    <EntityDescriptionContainer
      className={className}
      isHeightFixed={isHeightFixed}
      numberLines={numberLines}
    >
      {content}
    </EntityDescriptionContainer>
  );
}

interface EntityDescriptionContainerProps {
  children: React.ReactNode;
  className?: string;
  isHeightFixed: boolean;
  numberLines: number;
}

function EntityDescriptionContainer({
  children,
  className,
  isHeightFixed,
  numberLines,
}: EntityDescriptionContainerProps) {
  const style: CSSProperties = {
    display: "-webkit-box",
    height: isHeightFixed ? `${25 * numberLines}px` : undefined,
    lineClamp: isHeightFixed ? numberLines : undefined,
    margin: "12px 0 0 0",
    minHeight: isHeightFixed ? `${25 * numberLines}px` : undefined,
    overflow: "hidden",
    textOverflow: "ellipsis",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: isHeightFixed ? numberLines : undefined,
  };

  return (
    <div
      className={cx("card-text", className)}
      style={style}
      data-cy="entity-description"
    >
      {children}
    </div>
  );
}

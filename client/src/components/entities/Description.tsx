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

/**
 *  renku-ui
 *
 *  Entity Description.tsx
 *  Entity Description component
 */

import React, { CSSProperties, ReactNode } from "react";
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
  urlChangeDescription?: string;
}

function EntityDescription({
  className,
  description,
  hasDevAccess,
  isHeightFixed = true,
  loading = false,
  numberLines = 3,
  showSuggestion,
  urlChangeDescription,
}: EntityDescriptionProps) {
  const descriptionStyles: CSSProperties = {
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box", // eslint-disable-line
    lineClamp: isHeightFixed ? numberLines : undefined,
    WebkitLineClamp: isHeightFixed ? numberLines : undefined, // eslint-disable-line
    WebkitBoxOrient: "vertical", // eslint-disable-line
    minHeight: isHeightFixed ? `${25 * numberLines}px` : undefined,
    height: isHeightFixed ? `${25 * numberLines}px` : undefined,
  };

  const markdownDescription =
    description && typeof description === "string" ? (
      <>
        <RenkuMarkdown
          markdownText={description}
          singleLine={numberLines === 1}
          style={descriptionStyles}
        />
        <span className="ms-1">
          {description.includes("\n") ? " [...]" : ""}
        </span>
      </>
    ) : (
      description
    );

  return (
    <div
      className={cx("card-text", className)}
      style={{ ...descriptionStyles, margin: "12px 0 0 0" }}
      data-cy="entity-description"
    >
      {loading ? (
        <small className="card-text text-rk-text-light">
          <i>Loading description...</i>
        </small>
      ) : description ? (
        markdownDescription
      ) : showSuggestion && hasDevAccess && urlChangeDescription ? (
        <i>
          (This project has no description. You can provide one{" "}
          <Link to={urlChangeDescription}>here</Link>.)
        </i>
      ) : null}
    </div>
  );
}

export default EntityDescription;

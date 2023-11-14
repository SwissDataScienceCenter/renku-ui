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

import cx from "classnames";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";

import { stylesByItemType } from "../../utils/helpers/HelperFunctions";
import { TimeCaption } from "../TimeCaption";
import { EntityButton } from "../entities/Buttons";
import EntityCreators from "../entities/Creators";
import EntityDescription from "../entities/Description";
import EntityLabel from "../entities/Label";
import Slug from "../entities/Slug";
import EntityTags from "../entities/Tags";
import VisibilityIcon from "../entities/VisibilityIcon";
import PinnedBadge from "./PinnedBadge";
import { ListElementProps } from "./list.types";

import "./ListCard.css";

function ListCard({
  creators,
  description,
  imageUrl,
  itemType,
  labelCaption,
  path,
  slug,
  tagList,
  timeCaption,
  title,
  url,
  visibility,
  animated = false,
}: ListElementProps) {
  const imageStyles: CSSProperties = imageUrl
    ? { backgroundImage: `url("${imageUrl}")` }
    : {};
  const colorByType = stylesByItemType(itemType);

  return (
    <div
      data-cy="list-card"
      className="col text-decoration-none p-2 rk-search-result-card"
    >
      <div className="col text-decoration-none">
        <div className={cx("card", "card-entity", "position-relative")}>
          <PinnedBadge
            entityType={itemType}
            //! This really should be `slug` but we do not get the real slug
            //! in search cards.
            slug={path ?? ""}
          />
          <Link
            className={cx(
              "card-header-entity",
              !imageUrl && `card-header-entity--${itemType}`,
              "d-block",
              "text-decoration-none"
            )}
            style={imageStyles}
            to={url}
          >
            {!imageUrl && (
              <div className={cx("card-bg-title", "user-select-none")}>
                {title}
              </div>
            )}
          </Link>
          <EntityButton type={itemType} slug={path ?? ""} animated={animated} />
          <Link
            className={cx("card-body", "d-block", "text-decoration-none")}
            to={url}
          >
            <div
              className="card-title text-truncate lh-sm"
              data-cy="list-card-title"
            >
              {title}
            </div>
            <Slug multiline={false} slug={slug} />
            <EntityCreators
              display="list"
              creators={creators}
              itemType={itemType}
            />
            <EntityDescription
              description={description}
              isHeightFixed={true}
              showSuggestion={false}
              className="text-rk-text-light"
            />
            <EntityTags
              tagList={tagList}
              multiline={false}
              hideEmptyTags={false}
            />
            <div className="d-flex align-items-center gap-3 card-small-text">
              <EntityLabel type={itemType} workflowType={null} />
              <VisibilityIcon
                visibility={visibility}
                className={colorByType.colorText}
              />
            </div>
            <p className="card-text my-1">
              <TimeCaption
                className="text-rk-text-light"
                datetime={timeCaption}
                prefix={labelCaption || "Updated"}
              />
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ListCard;

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
import * as React from "react";
import { TimeCaption } from "../TimeCaption";
import { ListElementProps } from "./List.d";
import "./ListCard.css";
import EntityLabel from "../entities/Label";
import Slug from "../entities/Slug";
import EntityCreators from "../entities/Creators";
import EntityDescription from "../entities/Description";
import EntityTags from "../entities/Tags";
import VisibilityIcon from "../entities/VisibilityIcon";
import { EntityButton } from "../entities/Buttons";
import { stylesByItemType } from "../../helpers/HelperFunctions";

const Link = require("react-router-dom").Link;

function ListCard(
  {
    url,
    title,
    description,
    tagList,
    timeCaption,
    labelCaption,
    creators,
    slug,
    itemType,
    visibility,
    imageUrl
  }: ListElementProps) {

  const imageStyles = imageUrl ? { backgroundImage: `url("${imageUrl}")` } : {};
  const colorByType = stylesByItemType(itemType);
  return (
    <div data-cy="list-card" className="col text-decoration-none p-2 rk-search-result-card">
      <Link to={url} className="col text-decoration-none">
        <div className="card card-entity">
          <div style={imageStyles}
            className={`card-header-entity ${!imageUrl ? `card-header-entity--${itemType}` : ""}`}>
            {!imageUrl ? <div className="card-bg-title">{title}</div> : null}
          </div>
          <EntityButton type={itemType} slug={url} />
          <div className="card-body">
            <div className="card-title text-truncate lh-sm" data-cy="list-card-title">
              {title}
            </div>
            <Slug multiline={false} slug={slug} />
            <EntityCreators display="list" creators={creators} itemType={itemType} />
            <EntityDescription
              description={description} isHeightFixed={true} showSuggestion={false} className="text-rk-text-light" />
            <EntityTags tagList={tagList} multiline={false} />
            <div className="d-flex align-items-center gap-3 card-small-text">
              <EntityLabel type={itemType} workflowType={null} />
              <VisibilityIcon visibility={visibility} className={colorByType.colorText} />
            </div>
            <p className="card-text my-1">
              <TimeCaption caption={labelCaption || "Updated"} time={timeCaption} className="text-rk-text-light"/>
            </p>
          </div>
        </div>
      </Link>
    </div>
  );

}

export default ListCard;

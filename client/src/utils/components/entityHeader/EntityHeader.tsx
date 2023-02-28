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
 *  EntityHeader.tsx
 *  Entity Header component
 */
import * as React from "react";

import Creators, { EntityCreator } from "../entities/Creators";
import EntityDescription from "../entities/Description";
import EntityTags from "../entities/Tags";
import EntityLabel from "../entities/Label";
import LinkedEntitiesByItemType, { EntityLinksHeader } from "../entities/LinkedEntitiesByItemType";
import Slug from "../entities/Slug";
import VisibilityIcon from "../entities/VisibilityIcon";
import { EntityType } from "../entities/Entities";
import { StartSessionButton } from "../../../project/Project.present";
import { TimeCaption } from "../TimeCaption";

import "./EntityHeader.scss";
import { stylesByItemType } from "../../helpers/HelperFunctions";

export interface EntityHeaderProps {
  client?: any;
  creators: EntityCreator[];
  description: string;
  devAccess: boolean;
  email?: string;
  fullPath?: string;
  gitUrl?: string;
  hideEmptyTags?: boolean;
  itemType: EntityType;
  labelCaption: string;
  links?: EntityLinksHeader;
  otherButtons?: React.ReactNode[];
  showFullHeader?: boolean;
  slug?: string | React.ReactNode;
  statusButton?: React.ReactNode;
  tagList: string[];
  timeCaption: string;
  title: string;
  url: string;
  visibility?: "public" | "internal" | "private";
  imageUrl?: string;
}

function EntityHeader({
  creators, description, devAccess, fullPath, gitUrl, hideEmptyTags = false, imageUrl, itemType,
  labelCaption, links, otherButtons, showFullHeader = true, slug, statusButton, tagList, timeCaption,
  title, url, visibility
}: EntityHeaderProps) {
  const mainButton = fullPath && gitUrl ?
    (<StartSessionButton fullPath={fullPath} gitUrl={gitUrl} />) :
    null;

  const imageStyles = imageUrl ? { backgroundImage: `url("${imageUrl}")` } : {};
  const colorByType = stylesByItemType(itemType);

  return (
    <div className={`container-entity-header ${!showFullHeader ? "container-entity-header-incomplete" : ""}`}
      data-cy={`header-${itemType}`}>
      <div className="entity-image">
        <div style={imageStyles}
          className={`header-entity-image ${!imageUrl ? `card-header-entity--${itemType}` : ""}`}>
          {!imageUrl ? <div className="card-bg-title card-bg-title--small">{title}</div> : null}
        </div>
      </div>
      <div className="entity-time-tags">
        <TimeCaption
          caption={labelCaption || "Updated"}
          showTooltip={true}
          time={timeCaption}
          className="text-rk-text-light"/>
        <EntityTags tagList={tagList} multiline={true} hideEmptyTags={hideEmptyTags} />
      </div>
      <div className="entity-action d-flex align-items-baseline gap-1">
        {mainButton}
        {otherButtons}
      </div>
      <div className="entity-type-visibility align-items-baseline">
        <EntityLabel type={itemType} workflowType={null} />
        { visibility ? (<VisibilityIcon visibility={visibility} className={colorByType.colorText} />) : null }
      </div>
      <div className="entity-title" data-cy={`${itemType}-title`}>
        <div className="card-title lh-sm d-flex align-items-baseline" data-cy="list-card-title" >
          {statusButton}{title}
        </div>
      </div>
      <div className="entity-other-links">
        <LinkedEntitiesByItemType itemType={itemType} links={links} devAccess={devAccess} url={url} />
      </div>
      <div className="entity-metadata">
        <Creators display="list" creators={creators} itemType={itemType} includeIcon={true} />
        <Slug multiline={true} slug={slug ?? ""} />
        <EntityDescription
          description={description} isHeightFixed={false}
          showSuggestion={true} hasDevAccess={devAccess}
          urlChangeDescription={`${url}/settings`}
          className="text-rk-dark"
        />
      </div>
    </div>
  );
}

export default EntityHeader;

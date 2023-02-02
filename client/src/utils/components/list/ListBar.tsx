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
import { useHistory } from "react-router-dom";

import { TimeCaption } from "../TimeCaption";
import { ListElementProps } from "./List.d";
import "./ListBar.scss";
import VisibilityIcon from "../entities/VisibilityIcon";
import { StartSessionButton } from "../../../project/Project.present";
import { stylesByItemType } from "../../helpers/HelperFunctions";
import EntityCreators from "../entities/Creators";
import EntityDescription from "../entities/Description";
import EntityLabel from "../entities/Label";
import { useCallback } from "react";
import { EntityType } from "../../../features/kgSearch";

export function getMainActionByEntity(entityType: EntityType, slug: string) {
  const sessionAutostartUrl = `/projects/${slug}/sessions/new?autostart=1`;
  const launchNotebookUrl = `/projects/${slug}/sessions/new`;
  switch (entityType) {
    case EntityType.Project:
      return launchNotebookUrl && sessionAutostartUrl ?
        <StartSessionButton launchNotebookUrl={launchNotebookUrl} sessionAutostartUrl={sessionAutostartUrl} /> : null;
    case EntityType.Dataset:
      return null;
    default:
      return null;
  }
}

function ListBar(
  { url,
    title,
    description,
    timeCaption,
    labelCaption,
    creators,
    slug,
    itemType,
    visibility,
    imageUrl
  }: ListElementProps) {

  const history = useHistory();
  const handleClick = useCallback((e: any) => {
    e.preventDefault();
    history.push(url);
  }, [url]); //eslint-disable-line

  const imageStyles = imageUrl ? { backgroundImage: `url("${imageUrl}")` } : {};
  const colorByType = stylesByItemType(itemType);
  const mainButton = getMainActionByEntity(itemType, slug);

  return (
    <div className="container-entity-listBar">
      <div className="entity-image">
        <div style={imageStyles} onClick={handleClick}
          className={`cursor-pointer listBar-entity-image ${!imageUrl ? `card-header-entity--${itemType}` : ""}`}>
          {!imageUrl ? <div className="card-bg-title card-bg-title--small">{title}</div> : null}
        </div>
      </div>
      <div className="entity-title text-truncate cursor-pointer" onClick={handleClick} data-cy={`${itemType}-title`}>
        <div className="listBar-title text-truncate">
          <span className="card-title text-truncate" data-cy="list-card-title">{title}</span>
          <span className="entity-title--slug text-truncate">{slug}</span>
        </div>
      </div>
      <div className="entity-description cursor-pointer" onClick={handleClick}>
        <EntityDescription
          description={description} isHeightFixed={true}
          showSuggestion={false}
          urlChangeDescription={`${url}/settings`}
          className="text-rk-dark m-0"
          numberLines={1}
        />
      </div>
      <div className="entity-type-visibility align-items-baseline">
        <EntityLabel type={itemType} workflowType={null} />
        { visibility ? (<VisibilityIcon visibility={visibility} className={colorByType.colorText} />) : null }
      </div>
      <div className="entity-creators align-items-baseline text-truncate">
        <EntityCreators display="list" creators={creators} itemType={itemType}
          includeIcon={true} className="listBar-entity-creators" />
      </div>
      <div className="entity-date listBar-entity-date">
        <TimeCaption
          caption={labelCaption || "Updated"}
          showTooltip={true}
          time={timeCaption}
          className="text-rk-text-light text-truncate"/>
      </div>
      <div className={`entity-action d-flex align-items-baseline gap-1 ${!mainButton ? "d-none" : ""}`}>
        {mainButton}
      </div>
    </div>);
}

export default ListBar;

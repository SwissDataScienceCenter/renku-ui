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
import {
  Col,
} from "../../ts-wrappers";

import "./EntityHeader.css";
import { TimeCaption } from "../TimeCaption";
import { StartSessionButton } from "../../../project/Project.present";
import Creators, { EntityCreator } from "../entities/Creators";
import VisibilityIcon from "../entities/VisibilityIcon";
import Slug from "../entities/Slug";
import EntityDescription from "../entities/Description";
import EntityTags from "../entities/Tags";
import { EntityType } from "../entities/Entities";
import EntityLabel from "../entities/Label";
import LinkedEntitiesByItemType, { EntityLinksHeader } from "../entities/LinkedEntitiesByItemType";

export interface EntityHeaderProps {
  title: string;
  visibility?: "public" | "internal" | "private";
  description: string;
  itemType: EntityType;
  slug?: string | React.ReactNode;
  tagList: string[];
  creators: EntityCreator[];
  labelCaption: string;
  timeCaption: string;
  launchNotebookUrl: string;
  sessionAutostartUrl: string;
  devAccess: boolean;
  email?: string;
  url: string;
  links?: EntityLinksHeader;
  statusButton?: React.ReactNode;
  otherButtons?: React.ReactNode[];
  showFullHeader?: boolean;
}

function EntityHeader(
  { title, visibility, itemType, slug, tagList, creators, labelCaption, timeCaption, description,
    launchNotebookUrl, sessionAutostartUrl, devAccess, url, links, statusButton, otherButtons, showFullHeader = true }
    : EntityHeaderProps) {

  const mainButton = launchNotebookUrl && sessionAutostartUrl ?
    <StartSessionButton launchNotebookUrl={launchNotebookUrl} sessionAutostartUrl={sessionAutostartUrl} /> : null;

  const projectDetails = (
    <div className="card card-entity--large">
      <div className={`card-header-entity--large card-header-entity--${itemType}-large`}>
        <div className="card-bg-title card-bg-title--large" data-cy={`${itemType}-title`}>{title}</div>
        <div className="d-flex justify-content-between align-items-center m-3">
          <EntityLabel type={itemType} workflowType={null} />
          { visibility ? (<VisibilityIcon visibility={visibility} className="" />) : null }
        </div>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-12 col-sm-12 col-md-12 col-lg-9 col-xl-9 d-grid">
            <div className="card-title text-truncate lh-sm" data-cy="list-card-title">
              {statusButton}{title}
            </div>
          </div>
          <div
            className="buttons-header-entity col-12 col-sm-12 col-md-12 col-lg-3 col-xl-3 d-flex gap-2
                align-items-center justify-content-start justify-content-lg-end my-2 my-lg-0">
            {otherButtons}
            {mainButton}
          </div>
        </div>
        <Slug display="list" slug={slug ?? ""} />
        <Creators display="list" creators={creators} itemType={itemType} />
        <EntityDescription
          description={description} isHeightFixed={false}
          showSuggestion={true} hasDevAccess={devAccess}
          urlChangeDescription={`${url}/settings`}
        />
        <div className="row">
          <div className="col-12 col-sm-12 col-md-12 col-lg-9 col-xl-9 d-grid">
            <EntityTags tagList={tagList} multiline={true} />
          </div>
          <div
            className="col-12 col-sm-12 col-md-12 col-lg-3 col-xl-3 d-flex
                justify-content-start justify-content-lg-end">
            <TimeCaption
              caption={labelCaption || "Updated"}
              showTooltip={true}
              time={timeCaption}
              className="text-rk-text-light"/>
          </div>
        </div>
      </div>
    </div>
  );

  if (!showFullHeader)
    return projectDetails;

  return (
    <div className="entity-card-large row" data-cy={`header-${itemType}`}>
      <Col
        className="d-flex align-items-start flex-column col-12 col-sm-12 col-md-12 col-lg-9 col-xl-9 overflow-hidden">
        {projectDetails}
      </Col>
      <Col
        className="align-items-start flex-column col-12 col-sm-12 col-md-12 col-lg-3 col-xl-3 overflow-hidden
        d-sm-none d-md-none d-lg-flex d-xl-flex">
        <LinkedEntitiesByItemType itemType={itemType} links={links} devAccess={devAccess} url={url} />
      </Col>
    </div>
  );
}

export default EntityHeader;


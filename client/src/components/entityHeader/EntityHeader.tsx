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

import { useDispatch, useSelector, RootStateOrAny } from "react-redux";

import Creators, { EntityCreator } from "../entities/Creators";
import EntityDescription from "../entities/Description";
import EntityTags from "../entities/Tags";
import EntityLabel from "../entities/Label";
import LinkedEntitiesByItemType, {
  EntityLinksHeader,
} from "../entities/LinkedEntitiesByItemType";
import Slug from "../entities/Slug";
import VisibilityIcon from "../entities/VisibilityIcon";
import { EntityType } from "../entities/Entities";
import {
  StartSessionDropdownButton,
  SessionButton,
} from "../../features/session/components/SessionButtons";
import { TimeCaption } from "../TimeCaption";
import { EnvironmentLogs } from "../Logs";
import { displaySlice, useDisplaySelector } from "../../features/display";
import { getSessionRunning } from "../../utils/helpers/SessionFunctions";
import { Url } from "../../utils/helpers/url";

import "./EntityHeader.scss";
import { stylesByItemType } from "../../utils/helpers/HelperFunctions";

export interface EntityHeaderProps {
  client?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  creators: EntityCreator[];
  description?: { isLoading?: boolean; unavailable?: string; value: string };
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
  creators,
  description,
  devAccess,
  fullPath,
  gitUrl,
  hideEmptyTags = false,
  imageUrl,
  itemType,
  labelCaption,
  links,
  otherButtons,
  showFullHeader = true,
  slug,
  statusButton,
  tagList,
  timeCaption,
  title,
  url,
  visibility,
}: EntityHeaderProps) {
  // Find sessions
  const dispatch = useDispatch();
  const sessions = useSelector(
    (state: RootStateOrAny) => state.stateModel.notebooks?.notebooks
  );
  const projectData = { namespace: "", path: fullPath };
  const sessionAutostartUrl = Url.get(
    Url.pages.project.session.autostart,
    projectData
  );
  const notebook =
    sessions.fetched && sessions.all
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (getSessionRunning(sessions.all, sessionAutostartUrl) as any)
      : false;

  // Set the main button based on running sessions
  let mainButton = null;
  if (fullPath && gitUrl) {
    if (!notebook) {
      const loading = !sessions.fetched && sessions.fetching ? true : false;
      mainButton = (
        <StartSessionDropdownButton
          fullPath={fullPath}
          gitUrl={gitUrl}
          loading={loading}
        />
      );
    } else {
      const showLogs = () => {
        dispatch(
          displaySlice.actions.showSessionLogsModal({
            targetServer: notebook.name,
          })
        );
      };
      mainButton = (
        <SessionButton
          fullPath={fullPath}
          gitUrl={gitUrl}
          notebook={notebook}
          showLogs={showLogs}
        />
      );
    }
  }

  // Set up support for logs modal
  const displayModal = useDisplaySelector((state) => state.modals.sessionLogs);
  const envLogs =
    itemType === "project" ? (
      <EnvironmentLogs
        name={displayModal.targetServer}
        annotations={notebook?.annotations ?? {}}
      />
    ) : null;
  const imageStyles = imageUrl ? { backgroundImage: `url("${imageUrl}")` } : {};
  const colorByType = stylesByItemType(itemType);

  return (
    <>
      <div
        className={`container-entity-header ${
          !showFullHeader ? "container-entity-header-incomplete" : ""
        }`}
        data-cy={`header-${itemType}`}
      >
        <div className="entity-image">
          <div
            style={imageStyles}
            className={`header-entity-image ${
              !imageUrl ? `card-header-entity--${itemType}` : ""
            }`}
          >
            {!imageUrl ? (
              <div className="card-bg-title card-bg-title--small user-select-none">
                {title}
              </div>
            ) : null}
          </div>
        </div>
        <div className="entity-time-tags">
          <TimeCaption
            className="text-rk-text-light"
            enableTooltip
            datetime={timeCaption}
            prefix={labelCaption || "Updated"}
          />
          <EntityTags
            tagList={tagList}
            multiline={true}
            hideEmptyTags={hideEmptyTags}
          />
        </div>
        <div className="entity-action d-flex align-items-baseline gap-1">
          {mainButton}
          {otherButtons}
        </div>
        <div className="entity-type-visibility align-items-baseline">
          <EntityLabel type={itemType} workflowType={null} />
          {visibility ? (
            <VisibilityIcon
              visibility={visibility}
              className={colorByType.colorText}
            />
          ) : null}
        </div>
        <div className="entity-title" data-cy={`${itemType}-title`}>
          <div
            className="card-title lh-sm d-flex align-items-baseline"
            data-cy="list-card-title"
          >
            {statusButton}
            {title}
          </div>
        </div>
        <div className="entity-other-links">
          <LinkedEntitiesByItemType
            itemType={itemType}
            links={links}
            devAccess={devAccess}
            url={url}
          />
        </div>
        <div className="entity-metadata">
          <Creators
            display="list"
            creators={creators}
            itemType={itemType}
            includeIcon={true}
          />
          <Slug multiline={true} slug={slug ?? ""} />
          <EntityDescription
            className="text-rk-dark"
            description={description?.value}
            hasDevAccess={devAccess}
            isHeightFixed={false}
            loading={description?.isLoading}
            showSuggestion={true}
            unavailable={description?.unavailable}
            urlChangeDescription={`${url}/settings`}
          />
        </div>
      </div>
      {envLogs}
    </>
  );
}

export default EntityHeader;

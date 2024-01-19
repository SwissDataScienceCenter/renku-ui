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

import cx from "classnames";

import SessionButton from "../../features/session/components/SessionButton";
import { useGetSessionsQuery } from "../../features/session/sessions.api";
import { getRunningSession } from "../../features/session/sessions.utils";
import useAppSelector from "../../utils/customHooks/useAppSelector.hook";
import { stylesByItemType } from "../../utils/helpers/HelperFunctions";
import { Url } from "../../utils/helpers/url";
import { EnvironmentLogs } from "../Logs";
import { TimeCaption } from "../TimeCaption";
import Creators, { EntityCreator } from "../entities/Creators";
import EntityDescription from "../entities/Description";
import { EntityType } from "../entities/entities.types";
import EntityLabel from "../entities/Label";
import LinkedEntitiesByItemType, {
  EntityLinksHeader,
} from "../entities/LinkedEntitiesByItemType";
import Slug from "../entities/Slug";
import EntityTags from "../entities/Tags";
import VisibilityIcon from "../entities/VisibilityIcon";
import PinnedBadge from "../list/PinnedBadge";

import "./EntityHeader.scss";

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
  const { data: sessions } = useGetSessionsQuery();

  const projectData = { namespace: "", path: fullPath };
  const sessionAutostartUrl = Url.get(
    Url.pages.project.session.autostart,
    projectData
  );

  const runningSession = sessions
    ? getRunningSession({ autostartUrl: sessionAutostartUrl, sessions })
    : null;

  // Set the main button based on running sessions
  const mainButton =
    fullPath && gitUrl ? (
      <SessionButton fullPath={fullPath} gitUrl={gitUrl} />
    ) : null;

  // Set up support for logs modal
  const displayModal = useAppSelector(
    ({ display }) => display.modals.sessionLogs
  );
  const envLogs =
    itemType === "project" ? (
      <EnvironmentLogs
        name={displayModal.targetServer}
        annotations={runningSession?.annotations ?? {}}
      />
    ) : null;
  const imageStyles = imageUrl ? { backgroundImage: `url("${imageUrl}")` } : {};
  const colorByType = stylesByItemType(itemType);

  return (
    <>
      <div
        className={cx(
          "container-entity-header",
          !showFullHeader && "container-entity-header-incomplete"
        )}
        data-cy={`header-${itemType}`}
      >
        <div className={cx("entity-image", "position-relative")}>
          {fullPath && <PinnedBadge entityType={itemType} slug={fullPath} />}
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
        {showFullHeader ? (
          <div className="entity-action d-flex align-items-baseline gap-1">
            {mainButton}
            {otherButtons}
          </div>
        ) : null}
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

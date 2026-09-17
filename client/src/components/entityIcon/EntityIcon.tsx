/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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
import { Database, Folder, People, type Icon } from "react-bootstrap-icons";

import UserAvatar from "~/features/usersV2/show/UserAvatar";

import styles from "./EntityIcon.module.scss";

export type EntityIconType = "project" | "group" | "user" | "dataConnector";

type GlyphEntityIconType = Exclude<EntityIconType, "user">;

type EntityIconShape = "card" | "circle";

interface EntityIconBaseProps {
  className?: string;
  "data-cy"?: string;
}

export type EntityIconProps = EntityIconBaseProps &
  ({ type: GlyphEntityIconType } | { type: "user"; namespace: string });

const ENTITY_ICON_LABELS: Record<EntityIconType, string> = {
  project: "Project",
  group: "Group",
  user: "User",
  dataConnector: "Data",
};

const ENTITY_ICON_SHAPES: Record<EntityIconType, EntityIconShape> = {
  project: "card",
  dataConnector: "card",
  group: "circle",
  user: "circle",
};

const ENTITY_ICON_GLYPHS: Record<GlyphEntityIconType, Icon> = {
  project: Folder,
  group: People,
  dataConnector: Database,
};

export default function EntityIcon(props: EntityIconProps) {
  const { className, "data-cy": dataCy, type } = props;
  const shape = ENTITY_ICON_SHAPES[type];

  return (
    <div className={cx(styles.entityIcon, className)} data-cy={dataCy}>
      <span
        className={cx(
          "align-items-center",
          "d-inline-flex",
          "flex-md-column",
          "flex-row",
          "gap-2",
          "gap-md-0",
          "mw-100",
          "rounded-3",
          "text-white",
          "px-3",
          props.type === "user" ? "py-1" : "py-2",
          "px-md-0",
          "py-md-0",
          styles.layout,
          shape === "card" ? styles.card : styles.circle,
        )}
      >
        {props.type === "user" ? (
          <AvatarBadge namespace={props.namespace} />
        ) : (
          <GlyphBadge type={props.type} />
        )}
        <span
          className={cx(
            "fw-semibold",
            "lh-sm",
            "mw-100",
            "position-relative",
            "px-md-2",
            "py-md-1",
            "small",
            "text-truncate",
            shape === "circle" && "rounded-pill",
            styles.label,
          )}
        >
          {ENTITY_ICON_LABELS[type]}
        </span>
      </span>
    </div>
  );
}

function GlyphBadge({ type }: { type: GlyphEntityIconType }) {
  const Glyph = ENTITY_ICON_GLYPHS[type];

  return (
    <span
      className={cx(
        "align-items-center",
        "d-inline-flex",
        "flex-shrink-0",
        "justify-content-center",
        styles.entityBadge,
      )}
    >
      <Glyph aria-hidden="true" className={cx("bi", styles.glyph)} />
    </span>
  );
}

function AvatarBadge({ namespace }: { namespace: string }) {
  return <UserAvatar className={styles.userAvatar} namespace={namespace} />;
}

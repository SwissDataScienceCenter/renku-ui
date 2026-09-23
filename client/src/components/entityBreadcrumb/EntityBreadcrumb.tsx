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
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import cx from "classnames";
import type { CSSProperties, ReactNode } from "react";
import {
  Database,
  Folder,
  Journals,
  People,
  Person,
} from "react-bootstrap-icons";
import { Link } from "react-router";

import { Clipboard } from "~/components/clipboard/Clipboard";
import ExternalLink from "~/components/ExternalLink";
import { Loader } from "~/components/Loader";
import type {
  BreadcrumbEntityType,
  BreadcrumbLevel,
} from "./entityBreadcrumb.utils";
import {
  useEntityBreadcrumb,
  type EntityBreadcrumbProps,
} from "./useEntityBreadcrumb.hook";

import styles from "./entityBreadcrumb.module.scss";

const LINK_CLASS_NAME = cx(
  styles.link,
  "align-items-center",
  "d-inline-flex",
  "min-w-0",
  "text-primary",
);

const BREADCRUMB_STYLE = {
  ["--bs-breadcrumb-divider"]: "'›'",
} as CSSProperties;

function BreadcrumbIcon({
  type,
  isPreviousPath,
}: {
  type?: BreadcrumbEntityType;
  isPreviousPath: boolean;
}) {
  if (type == null) return null;
  const className = cx(
    "me-1",
    "flex-shrink-0",
    !isPreviousPath && ["d-none", "d-md-inline"],
  );
  switch (type) {
    case "group":
      return <People className={className} />;
    case "user":
      return <Person className={className} />;
    case "project":
      return <Folder className={className} />;
    case "dataConnector":
      return <Database className={className} />;
    case "source":
      return <Journals className={className} />;
  }
}

function isExternalHref(to: string): boolean {
  return /^https?:\/\//.test(to);
}

function AncestorLink({
  children,
  isPreviousPath,
  level,
}: {
  children: ReactNode;
  isPreviousPath: boolean;
  level: BreadcrumbLevel;
}) {
  if (!level.to) return children;
  const ariaLabel = isPreviousPath ? undefined : level.label;
  if (isExternalHref(level.to)) {
    return (
      <ExternalLink
        aria-label={ariaLabel}
        className={LINK_CLASS_NAME}
        href={level.to}
        icon={null}
      >
        {children}
      </ExternalLink>
    );
  }
  return (
    <Link aria-label={ariaLabel} className={LINK_CLASS_NAME} to={level.to}>
      {children}
    </Link>
  );
}

function AncestorBreadcrumbLevel({
  isPreviousPath,
  level,
}: {
  isPreviousPath: boolean;
  level: BreadcrumbLevel;
}) {
  const visibilityClass = isPreviousPath
    ? ["min-w-0", "text-truncate"]
    : ["d-none", "d-md-inline"];
  const ellipsisClass = isPreviousPath ? "d-none" : ["d-inline", "d-md-none"];

  return (
    <li
      className={cx(
        "align-items-center",
        "breadcrumb-item",
        "d-flex",
        "text-primary",
        isPreviousPath ? styles.previousPath : ["flex-shrink-0", "text-nowrap"],
      )}
    >
      <AncestorLink isPreviousPath={isPreviousPath} level={level}>
        <BreadcrumbIcon type={level.type} isPreviousPath={isPreviousPath} />
        {level.to ? (
          <>
            <span
              className={cx(visibilityClass)}
              title={isPreviousPath ? level.label : undefined}
            >
              {level.label}
            </span>
            <span aria-hidden="true" className={cx(ellipsisClass)}>
              ...
            </span>
          </>
        ) : (
          <span
            className={cx(isPreviousPath && ["min-w-0", "text-truncate"])}
            title={isPreviousPath ? level.label : undefined}
          >
            {level.label}
          </span>
        )}
      </AncestorLink>
    </li>
  );
}

function CurrentBreadcrumbLevel({
  clipboardText,
  level,
}: {
  clipboardText: string;
  level: BreadcrumbLevel;
}) {
  return (
    <li
      aria-current="page"
      className={cx(
        "active",
        "align-items-center",
        "breadcrumb-item",
        "d-flex",
        "flex-nowrap",
        "min-w-0",
        "text-muted",
      )}
    >
      <BreadcrumbIcon type={level.type} isPreviousPath={false} />
      <span className={cx("min-w-0", "text-truncate", "me-1")}>
        {level.label}
      </span>
      <Clipboard
        className={cx(
          "border-0",
          "btn",
          "flex-shrink-0",
          "p-0",
          "shadow-none",
          "text-muted",
          "ms-2",
        )}
        clipboardText={clipboardText}
        tooltip="Copy identifier to clipboard"
      />
    </li>
  );
}

function EntityBreadcrumbTrail({
  clipboardText,
  levels,
}: {
  clipboardText: string;
  levels: BreadcrumbLevel[];
}) {
  const lastIndex = levels.length - 1;
  const previousPath = levels.length - 2;
  return (
    <ol
      className={cx(
        "align-items-center",
        "breadcrumb",
        "d-flex",
        "flex-nowrap",
        "m-0",
        "min-w-0",
        "w-100",
      )}
    >
      {levels.map((level, index) =>
        index === lastIndex ? (
          <CurrentBreadcrumbLevel
            clipboardText={clipboardText}
            key={`${level.type}-${level.label}`}
            level={level}
          />
        ) : (
          <AncestorBreadcrumbLevel
            key={`${level.type}-${level.label}`}
            level={level}
            isPreviousPath={index === previousPath}
          />
        ),
      )}
    </ol>
  );
}

interface EntityBreadcrumbViewProps {
  clipboardText: string;
  isReady: boolean;
  levels: BreadcrumbLevel[];
}

export function EntityBreadcrumbView({
  clipboardText,
  isReady,
  levels,
}: EntityBreadcrumbViewProps) {
  return (
    <nav
      aria-busy={!isReady}
      aria-label="breadcrumb"
      className={cx(styles.nav, "min-w-0", "w-100")}
      data-cy="entity-breadcrumb"
      style={BREADCRUMB_STYLE}
    >
      {isReady ? (
        <EntityBreadcrumbTrail clipboardText={clipboardText} levels={levels} />
      ) : (
        <>
          <Loader inline size={16} />
          <span className="visually-hidden">Loading</span>
        </>
      )}
    </nav>
  );
}

export default function EntityBreadcrumb(props: EntityBreadcrumbProps) {
  const viewProps = useEntityBreadcrumb(props);
  return <EntityBreadcrumbView {...viewProps} />;
}
